import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sheets } from './anguilla.ts';

/**
 * Reads the Statistics Department of Montserrat's climate tables (from the Meteorological Service at John A. Osborne
 * Airport): the minimum and maximum average temperature and the rainfall, each month of each year from 2005. Kept as
 * each sheet's cells as the workbook gives them, with each workbook's hash, and the airport's place and height from
 * NOAA NCEI's Integrated Surface Database station history (its line for TRPG), the tables not giving them; the date read.
 */
export const WORKBOOKS = {
  temperature: 'https://statistics.gov.ms/wp-content/uploads/2026/08/Minimum-and-Maximum-Average-Temperture-C-2005-Jun-2026-by-Month.xlsx',
  rain: 'https://statistics.gov.ms/wp-content/uploads/2026/04/Rain-Data-monthly-2005-to-2026.xlsx',
} as const;
export const ISD = 'https://www.ncei.noaa.gov/pub/data/noaa/isd-history.csv';
export const ICAO = 'TRPG';
export const OUTPUT = 'research/sources/montserrat-climate.json';

async function get(url: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt += 1) {
    const body = await fetch(url, { signal: AbortSignal.timeout(120_000) })
      .then(async (res) => (res.ok ? Buffer.from(await res.arrayBuffer()) : undefined))
      .catch(() => undefined);
    if (body !== undefined) return body;
    if (attempt === 4) throw new Error(`${url}: no answer`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.dirname, 'montserrat.ts')) {
  const read = new Date().toISOString().slice(0, 10);
  const workbooks: Record<string, { url: string; sha256: string; sheets: Record<string, string[][]> }> = {};
  for (const [name, url] of Object.entries(WORKBOOKS)) {
    const xlsx = await get(url);
    workbooks[name] = { url, sha256: createHash('sha256').update(xlsx).digest('hex'), sheets: Object.fromEntries(sheets(xlsx)) };
  }
  const station = (await get(ISD)).toString('utf8').split('\n').find((l) => l.includes(`"${ICAO}"`));
  if (station === undefined) throw new Error(`${ISD} has no ${ICAO}`);
  const root = resolve(import.meta.dirname, '../..');
  writeFileSync(join(root, OUTPUT), `${JSON.stringify({ source: 'Statistics Department Montserrat, climate tables (source: John A. Osborne Airport)', isd: ISD, read, workbooks, station: station.trim() })}\n`);
  console.log(`${Object.keys(workbooks).length} workbooks -> ${OUTPUT}`);
}
