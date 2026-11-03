import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

/**
 * Reads Météo-France's daily climatological base (données climatologiques de base quotidiennes, on data.gouv.fr) for
 * the department of Guadeloupe, Saint-Martin and Saint-Barthélemy (971), for Saint-Martin's stations: each day of 1991
 * to 2020 as "date;precipitation;its quality code;minimum;its code;maximum;its code" as the file gives them, with each
 * station's name, place and height from its rows, the hash of the file read (gzipped, as served) and the date read.
 */
export const URL = 'https://object.files.data.gouv.fr/meteofrance/data/synchro_ftp/BASE/QUOT/Q_971_previous-1950-2024_RR-T-Vent.csv.gz';
export const STATIONS = ['97127002', '97127004'] as const;
export const FROM = '19910101';
export const TO = '20201231';
export const COLUMNS = ['AAAAMMJJ', 'RR', 'QRR', 'TN', 'QTN', 'TX', 'QTX'] as const;
export const OUTPUT = 'research/sources/meteofrance-daily.json';

async function get(url: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt += 1) {
    const body = await fetch(url, { signal: AbortSignal.timeout(300_000) })
      .then(async (res) => (res.ok ? Buffer.from(await res.arrayBuffer()) : undefined))
      .catch(() => undefined);
    if (body !== undefined) return body;
    if (attempt === 4) throw new Error(`${url}: no answer`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.dirname, 'meteofrance-daily.ts')) {
  const read = new Date().toISOString().slice(0, 10);
  const gz = await get(URL);
  const [head, ...lines] = gunzipSync(gz).toString('utf8').split('\n');
  const names = (head as string).split(';');
  const at = (row: string[], c: string) => (row[names.indexOf(c)] ?? '').trim();
  const stations = STATIONS.map((id) => {
    const rows = lines.map((l) => l.split(';')).filter((r) => r[0] === id && at(r, 'AAAAMMJJ') >= FROM && at(r, 'AAAAMMJJ') <= TO);
    const first = rows[0] as string[];
    return { id, name: at(first, 'NOM_USUEL'), latitude: Number(at(first, 'LAT')), longitude: Number(at(first, 'LON')), elevation: Number(at(first, 'ALTI')), days: rows.map((r) => COLUMNS.map((c) => at(r, c)).join(';')).join('\n') };
  });
  const root = resolve(import.meta.dirname, '../..');
  writeFileSync(join(root, OUTPUT), `${JSON.stringify({ source: 'Météo-France, données climatologiques de base quotidiennes (971)', url: URL, read, sha256: createHash('sha256').update(gz).digest('hex'), from: FROM, to: TO, columns: COLUMNS, stations })}\n`);
  console.log(`${stations.length} stations -> ${OUTPUT}`);
}
