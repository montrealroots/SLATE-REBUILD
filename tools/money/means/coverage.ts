import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NO_PLACES, type Row } from '../../papers/passports/coverage.ts';

/**
 * The family means' coverage matrix (coverage/means-countries.json), from the compiled means and the register: a country
 * compiled is researched, citing its own file (money.means.<code>), and where its income isn't scaled by a national
 * accounts' ratio (from 2026-11-03), held also by the test that shows the player told so; one not compiled is blocked where the register holds
 * its blocker (money.means.blocked.<code>), else pending; a country with no place of its own is proven by the
 * gazetteer's test that it has none.
 */
export const COVERAGE = 'coverage/means-countries.json';

const T = 'tests/money/means/means.test.ts';
export const TESTS = [`${T}::means > give each family's first morning, from its band of the country's adults`, 'tests/money/means/means.places.test.ts::means > for every place on the map'];
/** And a blocked row's: the test that shows the player told its families' means aren't known. */
export const TOLD = `${T}::means > tell the player what the game doesn't know`;
/** And an unscaled country's: the test that shows the player told its families' income counts public spending. */
export const PUBLIC = `${T}::means > tell the player where a family's income counts public spending`;

export function meansCoverage(countries: readonly string[], withPlaces: ReadonlySet<string>, compiled: ReadonlySet<string>, unscaled: ReadonlySet<string>, facts: ReadonlyMap<string, string>): Row[] {
  return countries.map((key): Row => {
    if (!withPlaces.has(key)) return { key, status: 'proven', tests: [NO_PLACES] };
    const own = facts.get(`money.means.${key}`);
    if (compiled.has(key) && own !== undefined) return { key, status: 'researched', register: [own], tests: unscaled.has(key) ? [...TESTS, PUBLIC] : TESTS };
    const blocker = facts.get(`money.means.blocked.${key}`);
    return blocker === undefined ? { key, status: 'pending' } : { key, status: 'blocked', register: [blocker], tests: [...TESTS, TOLD] };
  });
}

export const serializeCoverage = (rows: readonly Row[]) => `${JSON.stringify({ engine: 'money.means', axis: 'country', rows }, null, 1)}\n`;

/** The means' coverage from the compiled means, the gazetteer's countries and places, and the register's facts. */
export function coverageOf(root: string): string {
  const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8')) as unknown;
  const countries = Object.keys(read('src/world/gazetteer/countries.json') as object);
  const withPlaces = new Set(readdirSync(join(root, 'src/world/gazetteer/places')).map((f) => f.slice(0, 2)));
  const means = read('src/money/means/means.json') as { countries: Record<string, { includesPublic?: true }> };
  const facts = new Map((read('research/register.json') as { entries: { id: string; fact: string }[] }).entries.map((e) => [e.fact, e.id] as const));
  const unscaled = new Set(Object.entries(means.countries).flatMap(([k, m]) => (m.includesPublic === true ? [k] : [])));
  return serializeCoverage(meansCoverage(countries, withPlaces, new Set(Object.keys(means.countries)), unscaled, facts));
}
