import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BASE, STATIONS as LIST } from './dwd.ts';

/**
 * Reads the Deutscher Wetterdienst's monthly CLIMAT values for stations worldwide (its Climate Data Center,
 * observations_global/CLIMAT/monthly/qc, version qcV002: each national service's own monthly CLIMAT reports,
 * quality-checked by DWD): for each station, the mean daily maximum and minimum temperature, the days of at least 1 mm
 * and the sunshine, each as the latest historical file (a row a year, a column a month), kept whole with its hash, and
 * the station's place and height from DWD's station list. The recent files begin in 2024, after the years read.
 */
export const STATIONS = [
  { wmo: '88889', country: 'FK' },
  { wmo: '88903', country: 'GS' },
] as const;
export const ELEMENTS = {
  tmax: 'air_temperature_mean_of_daily_max',
  tmin: 'air_temperature_mean_of_daily_min',
  wet: 'precipGE1mm_days',
  sun: 'sunshine_duration',
} as const;
export const dirUrl = (element: string) => `${BASE}/observations_global/CLIMAT/monthly/qc/${element}/historical/`;
export const OUTPUT = 'research/sources/dwd-climat-monthly.json';

async function get(url: string): Promise<string> {
  for (let attempt = 0; ; attempt += 1) {
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) }).catch(() => undefined);
    if (res?.ok === true) return new TextDecoder('latin1').decode(await res.arrayBuffer());
    if (attempt === 4) throw new Error(`${url}: no answer`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.dirname, 'climat.ts')) {
  const read = new Date().toISOString().slice(0, 10);
  const list = (await get(LIST)).split('\n');
  const stations = [];
  for (const { wmo, country } of STATIONS) {
    const [, name, latitude, longitude, elevation] = (list.find((l) => l.startsWith(`${wmo};`)) ?? '').split(';').map((f) => f.trim());
    if (name === undefined) throw new Error(`${wmo} isn't in ${LIST}`);
    const files: Record<string, { url: string; sha256: string; text: string }> = {};
    for (const [param, element] of Object.entries(ELEMENTS)) {
      const names = [...(await get(dirUrl(element))).matchAll(new RegExp(`href="(${wmo}_\\d{6}_\\d{6}\\.txt)"`, 'g'))].map((m) => m[1] as string).sort();
      const last = names.at(-1);
      if (last === undefined) continue;
      const url = `${dirUrl(element)}${last}`;
      const text = await get(url);
      files[param] = { url, sha256: createHash('sha256').update(text, 'latin1').digest('hex'), text };
    }
    stations.push({ wmo, country, name, latitude: Number(latitude), longitude: Number(longitude), elevation: Number(elevation), files });
  }
  const root = resolve(import.meta.dirname, '../..');
  writeFileSync(join(root, OUTPUT), `${JSON.stringify({ source: 'Deutscher Wetterdienst, Climate Data Center: monthly CLIMAT values for stations worldwide (qcV002)', stationsUrl: LIST, read, stations })}\n`);
  console.log(`${stations.length} stations -> ${OUTPUT}`);
}
