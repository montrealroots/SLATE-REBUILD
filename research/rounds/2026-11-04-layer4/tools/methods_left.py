"""Reports, for the methods round (briefs/16-methods-round.md), what each m<n>.todo.json still lacks in its
m<n>.result.json: a producer blocker's missing method with no attempt by it, a stage item (7, 8, 9) with a method
neither attempted there nor named as an earlier attempt. Run from the repository's root:
python3 -I research/rounds/2026-11-04-layer4/tools/methods_left.py"""
import json, glob, os
D = 'research/rounds/2026-11-04-layer4/results/tvstage'
M = ['web-search', 'institution', 'official-register', 'trade-press', 'archive']
total = 0
for todo in sorted(glob.glob(f'{D}/m*.todo.json'), key=lambda p: int(os.path.basename(p)[1:].split('.')[0])):
    n = os.path.basename(todo).split('.')[0]
    res = f'{D}/{n}.result.json'
    if not os.path.exists(res):
        print(n, 'no result file: run it whole'); total += 1; continue
    t, r = json.load(open(todo)), json.load(open(res))
    left = []
    for cc, job in t.items():
        got = r.get(cc, {})
        text = json.dumps(got)
        if 'producer' in job:
            have = {a.get('method') for a in (got.get('producer') or {}).get('attempts', [])}
            miss = [m for m in job['producer']['missing'] if m not in have]
            if miss: left.append(f"{cc} producer {job['producer']['blocker']}: {','.join(miss)}")
        for item in (job.get('stage') or {}).get('items', []):
            att = (got.get('stage') or {}).get(str(item), [])
            have = {a.get('method') for a in att}
            miss = [m for m in M if m not in have and m not in text]
            if miss: left.append(f'{cc} stage {item}: {",".join(miss)}')
    total += len(left)
    print(n, 'complete' if not left else f'{len(left)} short: ' + '; '.join(left[:12]))
print('short in all:', total)
