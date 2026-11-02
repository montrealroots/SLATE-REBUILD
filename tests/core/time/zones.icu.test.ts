import { describe, expect, it } from 'vitest';
import tzdb from '../../../src/core/time/tzdb.json';
import type { TzData } from '../../../src/core/time/tzdb-types.ts';
import { zoneHistory } from '../../../src/core/time/zones.ts';

/**
 * A second, independent oracle: the ICU time zones built into Node (tz 2026e in Node 22.23.4), at every transition and
 * every 37 days from 1970 to 2037. ICU's data is older than the release the engine reads, so the zones IANA has changed
 * since 2026e differ, each for the reason its release notes give (register R-0005); every other zone must agree. (SLATE
 * ran on tz 2025b, and ten zones differed then; Node's 2026e holds all ten of those changes, and 2026f's Brazil change
 * falls before 1970.)
 */
const data = tzdb as TzData;
export const CHANGED_SINCE_ICU: Record<string, string> = {
  'America/Havana': '2026f: Cuba stays on -04 through 2027-11-07, not falling back on 2026-11-01',
};

const formats = new Map<string, Intl.DateTimeFormat>();
function icuOffset(zone: string, t: number): number {
  let f = formats.get(zone);
  if (f === undefined) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    formats.set(zone, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(t * 1000)).map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p['year'] as number, (p['month'] as number) - 1, p['day'] as number, p['hour'] as number, p['minute'] as number, p['second'] as number) / 1000 - t;
}

const LO = Date.UTC(1970, 0, 1) / 1000;
const HI = Date.UTC(2038, 0, 1) / 1000;

describe('every zone, against the ICU time zones in Node', () => {
  it('runs on the ICU data the exceptions were read against', () => {
    expect(process.versions.tz).toBe('2026e');
  });
  it.each(Object.keys(data.zones))('%s', (zone) => {
    const h = zoneHistory(data, data.zones[zone] as TzData['zones'][string]);
    const offsetAt = (t: number) => h.transitions.filter((x) => x.at <= t).at(-1)?.utoff ?? h.initial.utoff;
    const points = new Set([LO]);
    for (const x of h.transitions) if (x.at >= LO && x.at < HI) points.add(x.at).add(x.at - 1);
    for (let t = LO; t < HI; t += 37 * 86_400) points.add(t);
    const differs = [...points].some((t) => offsetAt(t) !== icuOffset(zone, t));
    expect(differs).toBe(zone in CHANGED_SINCE_ICU);
  });
});
