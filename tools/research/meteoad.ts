import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sheets } from './anguilla.ts';

/**
 * Reads the Servei Meteorològic Nacional d'Andorra's open climate data (its Climatologia page's monthly summaries):
 * Roc St. Pere's daily values, each month of 1991 to 2020 as the workbook the page gives (listxls), and the station's
 * own page for its place and height. Kept for each month: its days' maximum (06-06), minimum (18-18), precipitation
 * (06-06), sunshine (00-24, as "5h 38") and global irradiation (00-24, J/cm²), each cell as the workbook gives it, the
 * columns found by their headings, with the hash of each workbook read and the date read.
 */
export const STATION = '99130005';
export const PAGE = `https://www.meteo.ad/estacions/${STATION}`;
export const fileUrl = (month: number, year: number) => `https://www.meteo.ad/climatologia/listxls?estacio=${STATION}&mes=${month}&any=${year}`;
export const YEARS = [1991, 2020] as const;
/** The columns kept, each by its heading and the line under it ('' where there's none). */
export const COLUMNS = [
  ['Temperatura (ºC)', 'màx 06-06'],
  ['Temperatura (ºC)', 'mín 18-18'],
  ['Precipitació 06-06 (mm)', ''],
  ['Insolació 00-24 (h)', ''],
  ['Irradiació 00-24 (J/cm²)', ''],
] as const;
export const OUTPUT = 'research/sources/meteoad-daily.json';

async function get(url: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt += 1) {
    const body = await fetch(url, { signal: AbortSignal.timeout(60_000) })
      .then(async (res) => (res.ok ? Buffer.from(await res.arrayBuffer()) : undefined))
      .catch(() => undefined);
    if (body !== undefined) return body;
    if (attempt === 4) throw new Error(`${url}: no answer`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.dirname, 'meteoad.ts')) {
  const read = new Date().toISOString().slice(0, 10);
  const page = (await get(PAGE)).toString('utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const place = /Coordenades [^/]*\/ (-?\d+,\d+) º, (-?\d+,\d+) º/.exec(page);
  const height = /Altitud (\d+) m/.exec(page);
  if (place === null || height === null) throw new Error(`${PAGE}: no place or height`);
  const months = [];
  for (let year = YEARS[0]; year <= YEARS[1]; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const xlsx = await get(fileUrl(month, year));
      const rows = [...sheets(xlsx).values()][0] as string[][];
      const head = rows.findIndex((r) => r[0] === 'dia');
      const cols = COLUMNS.map(([h, sub]) => (rows[head + 1] as string[]).findIndex((x, i) => x === h && (rows[head + 2]?.[i] ?? '') === sub));
      if (cols.includes(-1)) throw new Error(`${fileUrl(month, year)}: a column isn't where its heading says`);
      const days = rows.filter((r) => /^\d+$/.test(r[0] ?? '')).map((r) => [r[0], ...cols.map((c) => r[c] ?? '')].join(';'));
      months.push({ year, month, sha256: createHash('sha256').update(xlsx).digest('hex'), days: days.join('\n') });
    }
  }
  const root = resolve(import.meta.dirname, '../..');
  writeFileSync(
    join(root, OUTPUT),
    `${JSON.stringify({ source: "Servei Meteorològic Nacional d'Andorra, Climatologia: Roc St. Pere's daily values", url: fileUrl(0, 0).replace('mes=0&any=0', 'mes={month}&any={year}'), page: PAGE, read, station: { id: STATION, name: 'Roc St. Pere', latitude: Number((place[1] as string).replace(',', '.')), longitude: Number((place[2] as string).replace(',', '.')), elevation: Number(height[1]) }, columns: ['dia', ...COLUMNS.map((c) => c.join(' ').trim())], months })}\n`,
  );
  console.log(`${months.length} months -> ${OUTPUT}`);
}
