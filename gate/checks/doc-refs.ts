import { result, type CheckResult } from '../lib/types.ts';
import type { Repo } from '../lib/repo.ts';

/**
 * Every file a doc names has to be there: 1221's `tools/doc-refs.mjs`, brought over with its rules (CLAUDE.md, Part
 * 1). In 1221 three entries of STYLE.md named tools that had been deleted, so a section that read as a guarantee was
 * partly fiction; and a handoff that has drifted from the tree sends the next session to rebuild what exists.
 *
 * As 1221 did, only a backticked path with a file's extension under a directory this repository keeps at its root is
 * held; a doc may name `node_modules/x` freely. Two things 1221 didn't have: the owner's documents (CLAUDE.md and
 * `docs/`) are the owner's words, locked, and name 1221's and SLATE's files, so they are not held here; and a path
 * after a backticked `montrealroots/<repository>` on its line is that repository's, not this one's.
 */
export const DOCS = { files: ['HANDOFF.md', 'README.md'], dirs: ['.claude/rules', 'tools'] } as const;
/** The root directories a named path is expected to resolve inside. */
export const OURS: ReadonlySet<string> = new Set(['.claude', '.githooks', '.github', 'coverage', 'docs', 'gate', 'matrix', 'registry', 'research', 'src', 'tests', 'tools', 'vendor']);

const PATH = /`([A-Za-z0-9_.\-/]+\.(?:ts|tsx|mjs|js|json|md|css|sh|yml))`/g;
const ELSEWHERE = /`montrealroots\/[A-Za-z0-9_.-]+`/;

export function checkDocRefs(repo: Repo): CheckResult {
  const r = result('doc-refs');
  const docs = [...DOCS.files.filter((f) => repo.exists(f)), ...DOCS.dirs.flatMap((d) => repo.files(d).filter((f) => f.endsWith('.md')))];
  let named = 0;
  for (const doc of docs) {
    // Stryker disable next-line StringLiteral: every doc listed was just found, so it reads.
    (repo.read(doc) ?? '').split('\n').forEach((line, i) => {
      const other = ELSEWHERE.exec(line)?.index ?? Infinity;
      for (const m of line.matchAll(PATH)) {
        const path = m[1] as string;
        if (m.index > other || !OURS.has(path.split('/')[0] as string)) continue;
        named += 1;
        if (repo.read(path) === undefined) r.red(`the doc names ${path}, which isn't here`, `${doc}:${i + 1}`);
      }
    });
  }
  r.note(`${named} files named across ${docs.length} docs`);
  return r;
}
