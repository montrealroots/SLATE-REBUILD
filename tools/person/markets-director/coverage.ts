import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { METHODS } from '../../../gate/checks/register.ts';
import { BLOCKED, COUNTRIES, FACT, OUTPUT, STAGE, type Markets } from './compile.ts';

/**
 * The director's markets' coverage matrix (coverage/markets-director-countries.json), a row for every country and
 * territory of the map (the gazetteer's 252). The US is the DGA's, the engine's own terms (R-4613). Elsewhere, a market
 * whose research the register cites (person.markets.director.<code>) with nothing blocked is researched; one with
 * blockers (person.markets.director.blocked.<code>) is blocked, citing them and its research, the player told what
 * isn't known; a country with neither, or with no market compiled, is pending.
 *
 * From 2026-11-04 a market's row covers its stage director's minimum too: a market whose research holds none, and no
 * blocker of its own, is pending, since the research of that day on a play in every market found it in a few and
 * recorded what it tried elsewhere by fewer than every method, so no blocker stands for it yet; one whose research
 * holds it stays researched. The US's row cites its SDC terms (person.markets.director.US) beside the DGA's. From the
 * methods round of that day, a market whose stage director's minimum is unknown is blocked only where its blocker records
 * an attempt on it ("not found: … stage") by every method the register names; short of one it is pending. Until then
 * any blocker made the row blocked, though none recorded what was tried for the stage.
 */
export const COVERAGE = 'coverage/markets-director-countries.json';
export { COUNTRIES };
/** The US's terms: the DGA's, which the engine keeps (R-4613), held by its own tests. */
export const HOME = 'US';
export const DGA = 'person.work.director.calibration';

const T = 'tests/person/directing/markets.test.ts';
export const TESTS = [`${T}::the director's markets > are each country's own, every fee and period as the research gives it`, `${T}::a film in a market > is paid its agreement's minimum, by form, tier, date and the days it works`];
/** And a blocked row's: the test that shows the player told what of the market isn't known. */
export const TOLD = `${T}::a film in a market > tells the player what of a market isn't known`;
/** And a market's play: the tests that hold its stage director's minimum (from 2026-11-04). */
export const STAGE_TESTS = [`${T}::a play in a market > is paid its stage agreement's minimum, by the production, the month or a stated multiple, on the day prep starts`];
const D = "tests/person/directing/directing.test.ts::the DGA terms > ";
export const HOME_TESTS = [`${D}set a feature by its budget: pay, prep and the Director's Cut at every level's edge`, `${D}set an episode by the show: the network program rate, the guaranteed prep and shoot, the episode's cut`];

export type Row = { key: string; status: 'researched' | 'blocked'; register: string[]; tests: string[] } | { key: string; status: 'pending' };

/** The methods each blocker tried the stage director's minimum by: its attempts whose result names the stage among what wasn't found. */
export function stageTried(entries: readonly { fact: string; attempts?: readonly { method?: string; result?: string }[] }[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  // Stryker disable next-line ArrayDeclaration: a blocker with no attempts, read as any list of things that aren't attempts, records no method either way.
  for (const { fact, attempts } of entries) for (const a of attempts ?? []) if (/^not found: (.+, )?stage(, .+)?$/.test(String(a.result))) out.set(fact, (out.get(fact) ?? new Set()).add(String(a.method)));
  return out;
}

/**
 * A row for every country: the US's from the DGA's and the SDC's, each market's from its register entries, pending where
 * it has no market or no entry, or no stage director's minimum and no blocker that tried it by every method.
 */
export function marketsCoverage(countries: readonly string[], markets: Markets['markets'], facts: ReadonlyMap<string, string>, tried: ReadonlyMap<string, ReadonlySet<string>>): Row[] {
  return countries.map((key): Row => {
    if (key === HOME) {
      const [dga, stage] = [facts.get(DGA), facts.get(`${FACT}${key}`)];
      return dga === undefined || stage === undefined ? { key, status: 'pending' } : { key, status: 'researched', register: [dga, stage], tests: [...HOME_TESTS, ...STAGE_TESTS] };
    }
    const [own, blocker] = [facts.get(`${FACT}${key}`), facts.get(`${BLOCKED}${key}`)];
    if (!Object.hasOwn(markets, key)) return { key, status: 'pending' };
    const stage = (markets[key] as Markets['markets'][string]).unknown.includes(STAGE);
    if (blocker !== undefined) return stage && !METHODS.every((m) => tried.get(`${BLOCKED}${key}`)?.has(m)) ? { key, status: 'pending' } : { key, status: 'blocked', register: [blocker, own].filter((id): id is string => id !== undefined), tests: [...TESTS, TOLD] };
    return own === undefined || stage ? { key, status: 'pending' } : { key, status: 'researched', register: [own], tests: [...TESTS, ...STAGE_TESTS] };
  });
}

export const serializeCoverage = (rows: readonly Row[]) => `${JSON.stringify({ engine: 'person.directing', axis: 'country', rows }, null, 1)}\n`;

/** The coverage from the map's countries, the compiled markets and the register's facts. */
export function coverageOf(root: string): string {
  const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8')) as unknown;
  const countries = Object.keys(read(COUNTRIES) as Record<string, unknown>);
  const markets = (read(OUTPUT) as Markets).markets;
  const entries = (read('research/register.json') as { entries: { id: string; fact: string; attempts?: { method?: string; result?: string }[] }[] }).entries;
  return serializeCoverage(marketsCoverage(countries, markets, new Map(entries.map((e) => [e.fact, e.id] as const)), stageTried(entries)));
}
