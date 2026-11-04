"""Common Crawl lookup by HTTP range requests (index.commoncrawl.org is unreachable here).
usage: cc.py list CRAWL SURT_PREFIX        -> cdx lines whose key starts with prefix
       cc.py get FILENAME OFFSET LENGTH OUT -> write the record's HTTP body to OUT
"""
import gzip, json, subprocess, sys, zlib

BASE = 'https://data.commoncrawl.org/'


def rng(path, a, b):
    import time
    # The data host refuses bursts (2026-11-04): back off between tries rather than fail at the fifth in a second.
    for i in range(8):
        if i:
            time.sleep(min(30, 2 ** i))
        p = subprocess.run(['curl', '-sS', '--max-time', '120', '-r', f'{a}-{b}', BASE + path], capture_output=True)
        # An error page (CloudFront's, served with a small length) was read as an empty index until 2026-11-03.
        if p.returncode == 0 and len(p.stdout) > 0 and not p.stdout.lstrip()[:15].lower().startswith((b'<!doctype', b'<html', b'<?xml')) \
                and (len(p.stdout) == b - a + 1 or 'cluster.idx' in path):
            return p.stdout
    raise SystemExit('fetch failed ' + path)


def idx_lines(crawl, a, b):
    return rng(f'cc-index/collections/{crawl}/indexes/cluster.idx', a, b).decode('utf-8', 'replace').split('\n')[:-1]


def find(crawl, prefix):
    path = f'cc-index/collections/{crawl}/indexes/cluster.idx'
    size = int(subprocess.run(['curl', '-sSI', '--max-time', '60', BASE + path], capture_output=True, text=True).stdout
               .lower().split('content-length:')[-1].split()[0])
    if size < 1_000_000:
        raise RuntimeError(f'cluster.idx size {size}: an error page, not the index')
    lo, hi = 0, size
    # binary search for the last line whose key < prefix
    while hi - lo > 200_000:
        mid = (lo + hi) // 2
        ls = idx_lines(crawl, mid, mid + 4000)
        key = ls[1].split(' ')[0]
        if key < prefix:
            lo = mid
        else:
            hi = mid
    blocks = []
    lines = idx_lines(crawl, lo, hi + 4000)[1:]
    if sum(ln.count('\t') >= 4 for ln in lines) < 10:
        raise RuntimeError('index window held no index lines')
    for ln in lines:
        if ln.count('\t') < 4:
            continue
        key = ln.split(' ')[0]
        f = ln.split('\t')
        blocks.append((key, f[1], int(f[2]), int(f[3])))
    # blocks whose range could contain prefix: the last with key < prefix, and all with key starting with prefix
    sel = []
    for i, b in enumerate(blocks):
        if b[0] >= prefix and not b[0].startswith(prefix):
            if i > 0:
                sel.append(blocks[i - 1])
            break
        if b[0].startswith(prefix):
            if i > 0 and blocks[i - 1] not in sel:
                sel.append(blocks[i - 1])
            sel.append(b)
    out = []
    for key, fn, off, ln in dict.fromkeys(sel):
        data = zlib.decompress(rng(f'cc-index/collections/{crawl}/indexes/{fn}', off, off + ln - 1), 31)
        for line in data.decode('utf-8', 'replace').split('\n'):
            if line.startswith(prefix):
                out.append(line)
    return out


def get(fn, off, ln, out):
    raw = gzip.decompress(rng(fn, off, off + ln - 1))
    # WARC headers \r\n\r\n HTTP headers \r\n\r\n body
    parts = raw.split(b'\r\n\r\n', 2)
    open(out, 'wb').write(parts[2] if len(parts) == 3 else raw)
    print(parts[1][:400].decode('latin1'))


if __name__ == '__main__':
    if sys.argv[1] == 'list':
        for attempt in range(4):
            try:
                res = find(sys.argv[2], sys.argv[3]); break
            except Exception as e:
                res = None; err = e
        if res is None: raise SystemExit(f'lookup failed: {err}')
        for l in res:
            k, ts, j = l.split(' ', 2)
            d = json.loads(j)
            print(ts, d.get('status'), d.get('mime'), d['url'], d['filename'], d['offset'], d['length'])
    else:
        get(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
