import { describe, expect, it } from 'vitest';
import { DOCS, OURS, checkDocRefs } from '../checks/doc-refs.ts';
import { all, fixture } from './fixture.ts';

const here = { 'gate/run.ts': 'x', 'docs/STYLE.md': 'x', 'tools/setup/verify.sh': 'x' };
const check = (files: Record<string, string>) => checkDocRefs(fixture({ ...here, ...files }).repo);

describe('the doc-refs check', () => {
  it('reads the handoff, the README, the rules and the tools\' docs, and knows the root directories', () => {
    expect(DOCS).toEqual({ files: ['HANDOFF.md', 'README.md'], dirs: ['.claude/rules', 'tools'] });
    expect([...OURS]).toEqual(['.claude', '.githooks', '.github', 'coverage', 'docs', 'gate', 'matrix', 'registry', 'research', 'src', 'tests', 'tools', 'vendor']);
  });
  it('passes every file named that is here, and notes how many', () => {
    const r = check({ 'HANDOFF.md': 'See `gate/run.ts` and `docs/STYLE.md`.\n', 'README.md': 'Run `tools/setup/verify.sh`.\n' });
    expect(all(r)).toEqual([]);
    expect(r.check).toBe('doc-refs');
    expect(r.notes).toEqual(['3 files named across 2 docs']);
  });
  it('fails a named file that is gone, at its doc and line, in every doc it reads', () => {
    expect(all(check({
      'HANDOFF.md': 'ok\n`gate/gone.ts`\n',
      'README.md': '`registry/x.json` and `src/a/b.tsx`',
      '.claude/rules/r.md': '`tests/t.mjs`, `matrix/M.md`, `coverage/c.css`, `research/r.js`',
      'tools/setup/README.md': '`.github/w.yml` `.githooks/h.sh` `vendor/v.ts` `.claude/c.md`',
    }))).toEqual([
      'red HANDOFF.md:2 | the doc names gate/gone.ts, which isn\'t here',
      'red README.md:1 | the doc names registry/x.json, which isn\'t here',
      'red README.md:1 | the doc names src/a/b.tsx, which isn\'t here',
      'red .claude/rules/r.md:1 | the doc names tests/t.mjs, which isn\'t here',
      'red .claude/rules/r.md:1 | the doc names matrix/M.md, which isn\'t here',
      'red .claude/rules/r.md:1 | the doc names coverage/c.css, which isn\'t here',
      'red .claude/rules/r.md:1 | the doc names research/r.js, which isn\'t here',
      'red tools/setup/README.md:1 | the doc names .github/w.yml, which isn\'t here',
      'red tools/setup/README.md:1 | the doc names .githooks/h.sh, which isn\'t here',
      'red tools/setup/README.md:1 | the doc names vendor/v.ts, which isn\'t here',
      'red tools/setup/README.md:1 | the doc names .claude/c.md, which isn\'t here',
    ]);
  });
  it('holds a directory, a path outside the repository\'s roots, and a bare word to nothing', () => {
    expect(all(check({ 'HANDOFF.md': '`gate` `gate/` `node_modules/x.js` `other/x.ts` `x.ts` `gate/x.txt` gate/gone.ts `gate/a b.ts`\n' }))).toEqual([]);
  });
  it('holds a path after another repository\'s name on its line to that repository, and one before it to this one', () => {
    expect(all(check({ 'HANDOFF.md': '`gate/gone.ts` is ours; `montrealroots/SLATE`\'s `src/core/x.ts` is not.\n`src/y.ts`\n' }))).toEqual([
      'red HANDOFF.md:1 | the doc names gate/gone.ts, which isn\'t here',
      'red HANDOFF.md:2 | the doc names src/y.ts, which isn\'t here',
    ]);
  });
  it('reads only Markdown under the directories, and the two files only when they are there', () => {
    expect(all(check({ 'tools/x/notes.txt': '`gate/gone.ts`', 'tools/x/y.md': '`gate/run.ts`' }))).toEqual([]);
    expect(check({}).notes).toEqual(['0 files named across 0 docs']);
  });
  it('fails a directory named as a file, and a file named as a directory', () => {
    expect(all(check({ 'HANDOFF.md': '`gate/dir.md` `docs/STYLE.md/x.md`\n', 'gate/dir.md/inner.ts': 'x' }))).toEqual([
      'red HANDOFF.md:1 | the doc names gate/dir.md, which isn\'t here',
      'red HANDOFF.md:1 | the doc names docs/STYLE.md/x.md, which isn\'t here',
    ]);
  });
});
