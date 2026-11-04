"""Merges layer 3's integration patches into research/register.json (run from the repository root).

New ids (R-NEW-n, per group) are numbered from the register's highest up; deletions drop a replaced blocker. Prints
the renames, and every file outside the register that still names an R-NEW id, for the lead to number by hand.
"""
import json, sys, glob, os, subprocess
R = sys.argv[1]
p = 'research/register.json'
reg = json.load(open(p)); entries = reg['entries']
by = {e['id']: i for i, e in enumerate(entries)}
top = max(int(e['id'][2:]) for e in entries)
renames = {}; patched = set()
for f in sorted(glob.glob(os.path.join(R, '*.register-patch.json'))):
    g = os.path.basename(f).split('.')[0]
    for e in json.load(open(f)):
        if e['id'].startswith('R-NEW'):
            top += 1; new = f'R-{top:04d}'; renames[f'{g}:{e["id"]}'] = new; e['id'] = new
            entries.append(e); by[new] = len(entries) - 1
        else:
            entries[by[e['id']]] = e
        patched.add(e['id'])
    print(f, 'applied')
gone = set()
for f in sorted(glob.glob(os.path.join(R, '*.register-delete.json'))):
    gone |= set(json.load(open(f)))
entries[:] = [e for e in entries if e['id'] not in gone]
entries.sort(key=lambda e: int(e['id'][2:]))
open(p, 'w').write(json.dumps(reg, indent=2, ensure_ascii=False) + '\n')
json.dump(renames, open(os.path.join(R, 'renames.json'), 'w'), indent=1)
print('patched', len(patched), 'deleted', sorted(gone), 'renames', renames)
left = subprocess.run(['grep', '-rlE', 'R-NEW-[0-9]+', 'src', 'tools', 'tests', 'coverage', 'research', 'registry'], capture_output=True, text=True).stdout.split()
print('files still naming R-NEW:', left)
