import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fromMajor, type CurrencyCode } from '../../../src/core/money/money.ts';
import { t } from '../../../src/core/text/text.ts';
import {
  aboutCountry,
  aboutMarket,
  countryOf,
  FEES,
  KEPT,
  kindOf,
  languagesOf,
  MARKETS,
  marketOf,
  minimumOf,
  MISSING,
  UNKEPT_LINE,
  type Fee,
  type Work,
} from '../../../src/person/work/career.ts';
import { COUNTRY_CODES, countryName } from '../../../src/world/gazetteer/gazetteer.ts';
import type { Form } from '../../../src/person/work/work.ts';
import compiled from '../../../src/person/work/markets.json' with { type: 'json' };

const money = (c: CurrencyCode, n: string) => fromMajor(c, n);
const terms = (agreement: string, budget: number | null = null, minutes: number | null = null) => ({ agreement, budget, minutes });
const fee = (agreement: string, form: Form, date: string, budget: number | null = null, minutes: number | null = null, work: Work | null = null) => minimumOf(terms(agreement, budget, minutes), form, date, work);
/** Each country's writer research, as the compile reads it (its blockers' items). */
const SOURCES = resolve(import.meta.dirname, '../../../research/sources/person/markets');
const RESEARCH = Object.fromEntries(
  readdirSync(SOURCES)
    .filter((f) => f.startsWith('writer-'))
    .map((f) => [f.slice(7, -5), JSON.parse(readFileSync(join(SOURCES, f), 'utf8')) as { blockers: { item: string }[] }]),
);

/** Every minimum as the research gives it (read from each country's writer file, 2026-11-01): forms, tiers, unit, from, amount, its share of the budget and ceiling, what waits for photography. */
const EXPECTED: Record<string, string[]> = {
  'ca-ipa': [
    'feature budget0-82000 - 2023-05-22 negotiated',
    'feature budget82001- script 2023-05-22 62998',
    'feature budget82001- script 2024-05-22 66148',
    'feature budget82001- script 2025-03-15 68794',
    'feature budget82001- script 2026-02-01 71202',
    'pilot/episode minutes1-15 script 2026-02-01 5271',
    'pilot/episode minutes16-30 script 2026-02-01 10546',
    'pilot/episode minutes31-60 script 2026-02-01 21088',
    'pilot/episode minutes61-90 script 2026-02-01 31629',
  ],
  'ca-sartec': ['feature - script 2019-03-01 49063', 'feature - script 2021-11-28 50535'],
  'de-netflix': ['feature budget0-5000000 script 2026-01-01 80000', 'feature budget5000001-7500000 script 2026-01-01 95000', 'feature budget7500001-10000000 script 2026-01-01 110000'],
  'de-ard': ['pilot/episode minutes1-30 script 2025-09-01 20064', 'pilot/episode minutes31-45 script 2025-09-01 33410', 'pilot/episode minutes46-60 script 2025-09-01 44500'],
  'de-ard-early': ['pilot/episode minutes1-30 script 2025-09-01 17160', 'pilot/episode minutes31-45 script 2025-09-01 28512', 'pilot/episode minutes46-60 script 2025-09-01 38016'],
  'de-zdf': ['pilot/episode minutes1-45 script 2025-07-01 27580.8'],
  'de-rtl': [
    'pilot/episode minutes1-22 budget350000-574999 script 2026-02-15 16750 held 0.4',
    'pilot/episode minutes1-22 budget575000-899999 script 2026-02-15 17500 held 0.4',
    'pilot/episode minutes1-22 budget900000- script 2026-02-15 20000 held 0.4',
    'pilot/episode minutes23-45 budget600000-1149999 script 2026-02-15 33500 held 0.4',
    'pilot/episode minutes23-45 budget1150000-1899999 script 2026-02-15 35000 held 0.4',
    'pilot/episode minutes23-45 budget1900000- script 2026-02-15 40000 held 0.4',
  ],
  'de-p7s1': ['pilot/episode minutes1-45 script 2014-06-03 30500 held 0.5'],
  'dk-feature': ['feature - script 2026-01-01 598836'],
  'fr-film': ['feature - script 2026-01-15 17000'],
  'fr-tv': ['pilot/episode hourly0-599999 - 2023-07-01 negotiated', 'pilot/episode hourly600000- hour 2023-07-01 27550 share 0.03 cap 1200000'],
  'gb-pact-film': ['feature budget0-749999 script 1990-10-01 14000', 'feature budget750000-2000000 script 1990-10-01 14000', 'feature budget2000001- script 1990-10-01 23200 held £4800'],
  'gb-bbc': ['pilot/episode - minute 2025-12-15 220'],
  'gb-itv': ['pilot/episode - hour 2026-10-19 12882'],
  'gb-pact-tv': ['pilot/episode - hour 2016-10-01 10570'],
  'no-film': ['feature - script 2026-05-01 535106'],
  'no-nrk': ['pilot/episode - minute 2026-05-01 3022'],
  'se-svt': ['pilot/episode minutes1-19 minute 2025-01-01 2898', 'pilot/episode minutes20-29 minute 2025-01-01 4456', 'pilot/episode minutes30-60 minute 2025-01-01 4551', 'pilot/episode minutes61- minute 2025-01-01 3945'],
  'se-producers': ['pilot/episode minutes1-19 minute 2023-08-30 2674', 'pilot/episode minutes20-29 minute 2023-08-30 4113', 'pilot/episode minutes30-60 minute 2023-08-30 4200', 'pilot/episode minutes61- minute 2023-08-30 3642'],
  // Andorra's artists' statute: the minimum wage a day of 8 hours, from 1 July 2026, for each day the script was written.
  ad: ['feature/pilot/episode/short - day 2026-07-01 72.4'],
  // Azerbaijan's minimum author fees for films made to state order (new wording of 10 January 2025), an original screenplay.
  'az-state': [
    'feature fiction - script 2025-01-10 10000',
    'feature documentary - script 2025-01-10 4000',
    'feature animation - script 2025-01-10 4000',
    'pilot/episode/short fiction - script 2025-01-10 1200',
    'pilot/episode/short documentary - script 2025-01-10 1200',
    'pilot/episode/short animation - script 2025-01-10 1200',
  ],
  // Switzerland's ARF/FDS agreement with GARP, IG and SFP from 5 August 2025: a fiction feature's screenplay; no agreed minimum for a documentary.
  'ch-film': ['feature fiction - script 2025-08-05 75000', 'feature documentary - - 2025-08-05 negotiated'],
};

const ALL: Form[] = ['feature', 'pilot', 'episode', 'short'];
const TV: Form[] = ['pilot', 'episode'];
/** Each agreement's country, languages, currency, forms, and how it pays (none, unknown, or its minimums), and its option. */
const AGREEMENTS: Record<string, [string, string[], string | null, Form[], 'none' | 'unknown' | 'fees', unknown]> = {
  'au-awg': ['AU', ['en'], null, ALL, 'unknown', null],
  br: ['BR', ['pt'], null, ALL, 'none', 'negotiated'],
  'ca-ipa': ['CA', ['en'], 'CAD', ['feature', 'pilot', 'episode'], 'fees', [{ forms: ['feature'], share: '0.05', base: null }, { forms: TV, share: '0.1', base: null }]],
  'ca-sartec': ['CA', ['fr'], 'CAD', ['feature'], 'fees', 'negotiated'],
  'de-cinema': ['DE', ['de'], null, ['feature'], 'none', null],
  'de-netflix': ['DE', ['de'], 'EUR', ['feature'], 'fees', null],
  'de-ard': ['DE', ['de'], 'EUR', TV, 'fees', null],
  'de-ard-early': ['DE', ['de'], 'EUR', TV, 'fees', null],
  'de-zdf': ['DE', ['de'], 'EUR', TV, 'fees', null],
  'de-rtl': ['DE', ['de'], 'EUR', TV, 'fees', null],
  'de-p7s1': ['DE', ['de'], 'EUR', TV, 'fees', null],
  'dk-feature': ['DK', ['da'], 'DKK', ['feature'], 'fees', null],
  'dk-dr': ['DK', ['da'], null, TV, 'none', null],
  es: ['ES', ['es'], null, ALL, 'none', 'negotiated'],
  'fr-film': ['FR', ['fr'], 'EUR', ['feature'], 'fees', null],
  'fr-tv': ['FR', ['fr'], 'EUR', TV, 'fees', 'negotiated'],
  'gb-pact-film': ['GB', ['en'], 'GBP', ['feature'], 'fees', 'negotiated'],
  'gb-bbc': ['GB', ['en'], 'GBP', TV, 'fees', null],
  'gb-itv': ['GB', ['en'], 'GBP', TV, 'fees', null],
  'gb-pact-tv': ['GB', ['en'], 'GBP', TV, 'fees', null],
  ie: ['IE', ['en'], null, ALL, 'none', null],
  in: ['IN', ['hi'], null, ALL, 'none', null],
  it: ['IT', ['it'], null, ALL, 'none', 'negotiated'],
  jp: ['JP', ['ja'], null, ALL, 'unknown', null],
  kr: ['KR', ['ko'], null, ALL, 'none', 'negotiated'],
  mx: ['MX', ['es'], null, ALL, 'unknown', null],
  ng: ['NG', ['en'], null, ALL, 'none', null],
  nl: ['NL', ['nl'], null, ALL, 'none', null],
  'no-film': ['NO', ['no'], 'NOK', ['feature'], 'fees', [{ forms: ['feature'], share: '0.1', base: '529883' }]],
  'no-series': ['NO', ['no'], null, TV, 'none', null],
  'no-nrk': ['NO', ['no'], 'NOK', TV, 'fees', null],
  nz: ['NZ', ['en'], null, ALL, 'none', 'negotiated'],
  'se-svt': ['SE', ['sv'], 'SEK', TV, 'fees', null],
  'se-producers': ['SE', ['sv'], 'SEK', TV, 'fees', null],
  'se-film': ['SE', ['sv'], null, ['feature'], 'none', null],
  za: ['ZA', ['en'], null, ALL, 'none', null],
  // The world's markets beyond the twenty (2026-11-01): a wage floor by the day written, fees by kind, and pay left to negotiation.
  ad: ['AD', ['ca'], 'EUR', ALL, 'fees', null],
  ai: ['AI', ['en'], null, ALL, 'none', null],
  as: ['AS', ['sm', 'en'], null, ALL, 'none', null],
  at: ['AT', ['de'], null, ALL, 'none', null],
  ax: ['AX', ['sv'], null, ALL, 'none', null],
  'az-state': ['AZ', ['az'], 'AZN', ALL, 'fees', null],
  ba: ['BA', ['bs', 'hr', 'sr'], null, ALL, 'none', null],
  be: ['BE', ['nl', 'fr'], null, ALL, 'none', null],
  bn: ['BN', ['ms'], null, ALL, 'none', null],
  bw: ['BW', ['en', 'tn'], null, ALL, 'none', null],
  'ch-film': ['CH', ['de', 'fr', 'it'], 'CHF', ['feature'], 'fees', null],
  'ch-tv': ['CH', ['de', 'fr', 'it'], null, TV, 'none', null],
  cl: ['CL', ['es'], null, ALL, 'none', null],
  fi: ['FI', ['fi', 'sv'], null, ALL, 'none', null],
  gi: ['GI', ['en'], null, ALL, 'none', null],
  li: ['LI', ['de'], null, ALL, 'none', null],
  ms: ['MS', ['en'], null, ALL, 'none', null],
  nc: ['NC', ['fr'], null, ALL, 'none', null],
  pa: ['PA', ['es'], null, ALL, 'none', null],
  ph: ['PH', ['fil', 'en'], null, ALL, 'none', null],
  pn: ['PN', ['en'], null, ALL, 'none', null],
  sh: ['SH', ['en'], null, ALL, 'none', null],
  tz: ['TZ', ['sw', 'en'], null, ALL, 'none', null],
  ua: ['UA', ['uk'], null, ALL, 'none', null],
  va: ['VA', ['it'], null, ALL, 'none', null],
  vg: ['VG', ['en'], null, ALL, 'none', null],
};
/** The markets that follow another's terms (the research: a French overseas department, an Australian territory, Puerto Rico under the US system), and those with none to sell under. */
const FOLLOWS: Record<string, string> = { BL: 'FR', CC: 'AU', CX: 'AU', GF: 'FR', MF: 'FR', NF: 'AU', PM: 'FR', PR: 'US', YT: 'FR' };
const NO_AGREEMENT = ['AN', 'AQ', 'CS', 'GS', 'HM', 'IO', 'JE', 'TH', 'UM'];
/** Every other market's own agreement, its figures unknown, as its blockers say: whether any agreement, guild rate or law sets the terms, or the fees. */
const UNKNOWN_AGREEMENTS = Object.keys(RESEARCH).filter((cc) => !Object.values(AGREEMENTS).some(([c]) => c === cc) && !(cc in FOLLOWS) && !NO_AGREEMENT.includes(cc));

/** What the twenty's research couldn't find, and the world's where it compiles an agreement of its own that tells or a market with nothing to sell under. */
const UNKNOWN: Record<string, string[]> = {
  AU: ['fees', 'option', 'language'],
  BR: [],
  CA: [],
  DE: ['option'],
  DK: ['fees'],
  ES: ['fees'],
  FR: ['option'],
  GB: ['language'],
  IE: ['union', 'option'],
  IN: ['union', 'fees'],
  IT: [],
  JP: ['fees'],
  KR: ['union', 'fees'],
  MX: ['agreement'],
  NG: ['union', 'fees'],
  NL: ['fees'],
  NO: ['fees'],
  NZ: ['fees', 'option'],
  SE: ['fees'],
  ZA: ['fees'],
  AI: ['none'],
  BE: ['fees'],
  BN: ['terms'],
  GI: ['none'],
  GP: ['follows'],
  HK: ['union', 'none'],
  HU: ['union', 'none'],
  RE: ['follows'],
  MS: ['none'],
  SH: ['none'],
  TH: ['union'],
  VG: ['none'],
};

const tierText = (f: Fee) => {
  const tiers = Object.entries(f.when).map(([k, [lo, hi]]) => `${k}${lo}-${hi ?? ''}`);
  return tiers.length === 0 ? '-' : tiers.join(' ');
};
/** What an agreement holds back until the first day of photography, as compiled: the production pays it with the rest that day, so only the compile's own record of it is read here. */
type Held = { held: { share: string } | { amount: string } | null };
const line = (f: Fee) => {
  const { held } = f as Fee & Held;
  return [f.forms.join('/'), ...(f.kind === null ? [] : [f.kind]), tierText(f), f.per ?? '-', f.from, f.amount ?? 'negotiated', ...(f.share === null ? [] : ['share', f.share]), ...(f.cap === null ? [] : ['cap', f.cap]), ...(held === null ? [] : ['held', 'share' in held ? held.share : `£${held.amount}`])].join(' ');
};

describe('the markets', () => {
  it("are each country's own, every minimum as the research gives it", () => {
    const agreements = compiled.agreements as unknown as Record<string, { country: string; languages: string[]; currency: string | null; forms: Form[]; none: boolean; unknown: boolean; fees: Fee[]; option: unknown }>;
    const unknown = Object.fromEntries(UNKNOWN_AGREEMENTS.map((cc) => [cc.toLowerCase(), [cc, [], null, ALL, 'unknown', null] as const]));
    expect(UNKNOWN_AGREEMENTS).toHaveLength(188);
    expect(Object.keys(agreements).sort()).toEqual([...Object.keys(AGREEMENTS), ...Object.keys(unknown)].sort());
    for (const [id, [country, languages, currency, forms, pays, option]] of Object.entries({ ...AGREEMENTS, ...unknown })) {
      const a = agreements[id];
      expect([a?.country, a?.languages, a?.currency, a?.forms, a?.none ? 'none' : a?.unknown ? 'unknown' : 'fees', a?.option], id).toEqual([country, languages, currency, forms, pays, option]);
      expect(a?.fees.map(line), id).toEqual(EXPECTED[id] ?? []);
      expect(countryOf(id)).toBe(country);
      expect(languagesOf(id)).toEqual(languages);
      expect(marketOf(id)).toBe(a);
    }
    // An agreement whose figures are unknown stands where its country's research couldn't find whether one sets the terms, or its fees.
    for (const cc of UNKNOWN_AGREEMENTS) expect(RESEARCH[cc]?.blockers.some((b) => ['agreement', 'fees', 'terms', 'none', 'follows'].includes(b.item)), cc).toBe(true);
    // What each market's research couldn't find: its blockers' items, each once, in the research's order.
    for (const [cc, m] of Object.entries(MARKETS)) expect(m.unknown, cc).toEqual([...new Set(RESEARCH[cc]?.blockers.map((b) => b.item))]);
    for (const [cc, u] of Object.entries(UNKNOWN)) expect(MARKETS[cc]?.unknown, cc).toEqual(u);
    // Each market sells under its own agreements, or those of the market it follows; or under none.
    for (const [cc, m] of Object.entries(MARKETS)) {
      const followed = FOLLOWS[cc];
      if (followed === 'US') expect(m.agreements, cc).toEqual([KEPT]);
      else if (followed !== undefined) expect(m.agreements, cc).toEqual(MARKETS[followed]?.agreements);
      else if (NO_AGREEMENT.includes(cc)) expect(m.agreements, cc).toEqual([]);
      else expect(m.agreements.length > 0 && m.agreements.every((id) => countryOf(id) === cc), cc).toBe(true);
    }
  });

  it('cover every country on the map: the WGA the US, each other one its research', () => {
    expect(Object.keys(MARKETS)).toEqual(COUNTRY_CODES.filter((cc) => cc !== 'US').sort());
    expect(Object.keys(MARKETS)).toHaveLength(251);
    expect(Object.keys(RESEARCH).sort()).toEqual(Object.keys(MARKETS));
    // A country whose writers are engaged on the US's terms has the WGA's agreement among its own.
    for (const cc of COUNTRY_CODES) expect(cc === 'US' || (MARKETS[cc]?.agreements.includes(KEPT) ?? false) === (FOLLOWS[cc] === 'US'), cc).toBe(true);
  });

  it("read a script's kind from its genre's BFI group", () => {
    expect(['documentary', 'nature-documentary', 'rockumentary', 'concert-film'].map(kindOf)).toEqual(['documentary', 'documentary', 'documentary', 'documentary']);
    expect(['animated', 'anime', 'isekai'].map(kindOf)).toEqual(['animation', 'animation', 'animation']);
    expect(['drama', 'docudrama', 'mockumentary', 'comedy'].map(kindOf)).toEqual(['fiction', 'fiction', 'fiction', 'fiction']);
  });

  it("keeps the WGA's own, the US's, in English, and refuses an agreement there's none of", () => {
    expect(KEPT).toBe('wga');
    expect(marketOf('wga')).toBeNull();
    expect(countryOf('wga')).toBe('US');
    expect(languagesOf('wga')).toEqual(['en']);
    expect(() => marketOf('wgx')).toThrow("there's no agreement wgx");
    expect(() => marketOf('toString')).toThrow("there's no agreement toString");
    for (const form of ALL) expect(minimumOf(terms('wga'), form, '1900-01-01')).toEqual(FEES[form]);
    expect(fee('wga', 'feature', '2026-11-01')).toEqual(FEES.feature);
  });
});

describe("a script a production pays for in a market", () => {
  it("is paid its agreement's minimum, by form and tier, on the day it's paid", () => {
    // Canada's IPA: a feature by the date, negotiable at a budget of C$82,000 or less; a TV script by its minutes.
    expect(fee('ca-ipa', 'feature', '2026-02-01', 82_000)).toBeNull();
    expect(fee('ca-ipa', 'feature', '2026-02-01', 82_001)).toEqual(money('CAD', '71202'));
    expect(fee('ca-ipa', 'feature', '2026-01-31', 82_001)).toEqual(money('CAD', '68794'));
    expect(fee('ca-ipa', 'feature', '2025-03-15', 1_000_000)).toEqual(money('CAD', '68794'));
    expect(fee('ca-ipa', 'feature', '2025-03-14', 1_000_000)).toEqual(money('CAD', '66148'));
    expect(fee('ca-ipa', 'feature', '2024-05-22', 1_000_000)).toEqual(money('CAD', '66148'));
    expect(fee('ca-ipa', 'feature', '2023-05-22', 1_000_000)).toEqual(money('CAD', '62998'));
    expect(() => fee('ca-ipa', 'feature', '2023-05-21', 1_000_000)).toThrow('no minimum under ca-ipa is known before 2023-05-22');
    expect(() => fee('ca-ipa', 'feature', '2023-05-21', 10)).toThrow('no minimum under ca-ipa is known before 2023-05-22');
    expect(fee('ca-ipa', 'feature', '2023-05-22', 10)).toBeNull();
    const tv: [number, string][] = [[1, '5271'], [15, '5271'], [16, '10546'], [30, '10546'], [31, '21088'], [60, '21088'], [61, '31629'], [90, '31629']];
    for (const [minutes, amount] of tv) for (const form of TV) expect(fee('ca-ipa', form, '2026-11-01', null, minutes), `${form} ${minutes}`).toEqual(money('CAD', amount));
    expect(() => fee('ca-ipa', 'episode', '2026-11-01', null, 91)).toThrow('ca-ipa sets no minimum for that episode');
    expect(() => fee('ca-ipa', 'episode', '2026-01-31', null, 60)).toThrow('no minimum under ca-ipa is known before 2026-02-01');
    expect(fee('ca-sartec', 'feature', '2021-11-27')).toEqual(money('CAD', '49063'));
    expect(fee('ca-sartec', 'feature', '2021-11-28')).toEqual(money('CAD', '50535'));
    expect(fee('ca-sartec', 'feature', '2019-03-01')).toEqual(money('CAD', '49063'));
    expect(() => fee('ca-sartec', 'feature', '2019-02-28')).toThrow('no minimum under ca-sartec is known before 2019-03-01');
    // Germany: Netflix's films by the budget; ARD, ZDF, RTL and ProSiebenSat.1 by the minutes; RTL's by the budget too.
    const netflix: [number, string][] = [[1, '80000'], [5_000_000, '80000'], [5_000_001, '95000'], [7_500_000, '95000'], [7_500_001, '110000'], [10_000_000, '110000']];
    for (const [budget, amount] of netflix) expect(fee('de-netflix', 'feature', '2026-11-01', budget), String(budget)).toEqual(money('EUR', amount));
    expect(() => fee('de-netflix', 'feature', '2026-11-01', 10_000_001)).toThrow('de-netflix sets no minimum for that feature');
    expect(() => fee('de-netflix', 'feature', '2025-12-31', 1)).toThrow('no minimum under de-netflix is known before 2026-01-01');
    const ard: [number, string, string][] = [[1, '20064', '17160'], [30, '20064', '17160'], [31, '33410', '28512'], [45, '33410', '28512'], [46, '44500', '38016'], [60, '44500', '38016']];
    for (const [minutes, prime, early] of ard) {
      expect(fee('de-ard', 'episode', '2025-09-01', null, minutes)).toEqual(money('EUR', prime));
      expect(fee('de-ard-early', 'pilot', '2025-09-01', null, minutes)).toEqual(money('EUR', early));
    }
    expect(() => fee('de-ard', 'episode', '2025-09-01', null, 61)).toThrow('de-ard sets no minimum for that episode');
    expect(fee('de-zdf', 'episode', '2026-11-01', null, 45)).toEqual(money('EUR', '27580.80'));
    expect(() => fee('de-zdf', 'episode', '2026-11-01', null, 46)).toThrow('de-zdf sets no minimum for that episode');
    const rtl: [number, number, string][] = [[22, 350_000, '16750'], [22, 574_999, '16750'], [1, 575_000, '17500'], [22, 899_999, '17500'], [22, 900_000, '20000'], [23, 600_000, '33500'], [45, 1_149_999, '33500'], [45, 1_150_000, '35000'], [45, 1_899_999, '35000'], [45, 1_900_000, '40000']];
    for (const [minutes, budget, amount] of rtl) {
      expect(fee('de-rtl', 'episode', '2026-02-15', budget, minutes), `${minutes} ${budget}`).toEqual(money('EUR', amount));
    }
    expect(() => fee('de-rtl', 'episode', '2026-11-01', 349_999, 22)).toThrow('de-rtl sets no minimum for that episode');
    expect(() => fee('de-rtl', 'episode', '2026-11-01', 599_999, 23)).toThrow('de-rtl sets no minimum for that episode');
    expect(() => fee('de-rtl', 'episode', '2026-11-01', 900_000, 46)).toThrow('de-rtl sets no minimum for that episode');
    expect(fee('de-p7s1', 'episode', '2014-06-03', null, 45)).toEqual(money('EUR', '30500'));
    // Denmark, France, Norway: a feature's own minimum.
    expect(fee('dk-feature', 'feature', '2026-01-01')).toEqual(money('DKK', '598836'));
    expect(() => fee('dk-feature', 'feature', '2025-12-31')).toThrow('no minimum under dk-feature is known before 2026-01-01');
    expect(fee('fr-film', 'feature', '2026-01-15')).toEqual(money('EUR', '17000'));
    expect(fee('no-film', 'feature', '2026-05-01')).toEqual(money('NOK', '535106'));
    // France's TV: 3% of the budget, at least €27,550 and at most €1.2 million an hour; left to negotiation under €600,000 an hour.
    expect(fee('fr-tv', 'episode', '2026-11-01', 599_999, 60)).toBeNull();
    expect(fee('fr-tv', 'episode', '2026-11-01', 600_000, 60)).toEqual(money('EUR', '27550'));
    expect(fee('fr-tv', 'episode', '2026-11-01', 1_000_000, 52)).toEqual(money('EUR', '30000'));
    expect(fee('fr-tv', 'episode', '2026-11-01', 520_000, 52)).toEqual(money('EUR', '23876.67'));
    expect(fee('fr-tv', 'episode', '2026-11-01', 519_999, 52)).toBeNull();
    expect(fee('fr-tv', 'pilot', '2026-11-01', 918_333, 60)).toEqual(money('EUR', '27550'));
    expect(fee('fr-tv', 'pilot', '2026-11-01', 918_334, 60)).toEqual(money('EUR', '27550.02'));
    expect(fee('fr-tv', 'pilot', '2026-11-01', 40_000_000, 60)).toEqual(money('EUR', '1200000'));
    expect(fee('fr-tv', 'pilot', '2026-11-01', 41_000_000, 60)).toEqual(money('EUR', '1200000'));
    expect(fee('fr-tv', 'pilot', '2026-11-01', 39_999_900, 60)).toEqual(money('EUR', '1199997'));
    expect(fee('fr-tv', 'pilot', '2026-11-01', 40_000_000, 30)).toEqual(money('EUR', '600000'));
    expect(() => fee('fr-tv', 'pilot', '2023-06-30', 40_000_000, 30)).toThrow('no minimum under fr-tv is known before 2023-07-01');
    // The UK: Pact's features by the budget, the photography stage held; the BBC by the minute, ITV and Pact's TV by the hour.
    // The photography stage is paid with the rest, on the first day of photography, when the production pays for the script.
    expect(fee('gb-pact-film', 'feature', '1990-10-01', 2_000_001)).toEqual(money('GBP', '23200'));
    expect(fee('gb-bbc', 'episode', '2025-12-15', null, 45)).toEqual(money('GBP', '9900'));
    expect(fee('gb-itv', 'episode', '2026-10-19', null, 45)).toEqual(money('GBP', '9661.50'));
    expect(fee('gb-itv', 'pilot', '2026-10-19', null, 60)).toEqual(money('GBP', '12882'));
    expect(() => fee('gb-itv', 'pilot', '2026-10-18', null, 60)).toThrow('no minimum under gb-itv is known before 2026-10-19');
    expect(fee('gb-pact-tv', 'episode', '2026-11-01', null, 7)).toEqual(money('GBP', '1233.17'));
    expect(fee('gb-pact-tv', 'episode', '2026-11-01', null, 30)).toEqual(money('GBP', '5285'));
    // Norway's NRK by the minute; Sweden's SVT and producers by the minute, at the rate of the script's length.
    expect(fee('no-nrk', 'episode', '2026-05-01', null, 60)).toEqual(money('NOK', '181320'));
    const svt: [number, string, string][] = [[1, '2898', '2674'], [19, '2898', '2674'], [20, '4456', '4113'], [29, '4456', '4113'], [30, '4551', '4200'], [60, '4551', '4200'], [61, '3945', '3642'], [200, '3945', '3642']];
    for (const [minutes, svtRate, producers] of svt) {
      expect(fee('se-svt', 'episode', '2026-11-01', null, minutes)).toEqual(money('SEK', String(Number(svtRate) * minutes)));
      expect(fee('se-producers', 'pilot', '2026-11-01', null, minutes)).toEqual(money('SEK', String(Number(producers) * minutes)));
    }
    // Where no agreement sets the pay, it is left to negotiation.
    for (const id of ['br', 'de-cinema', 'dk-dr', 'es', 'ie', 'in', 'it', 'kr', 'ng', 'nl', 'no-series', 'nz', 'se-film', 'za']) {
      for (const form of AGREEMENTS[id]?.[3] ?? []) expect(minimumOf(terms(id), form, '1900-01-01'), id).toBeNull();
    }
  });

  it("refuses what a market doesn't set: a form, a production's tier unsaid, a market whose figures aren't known", () => {
    expect(() => fee('de-ard', 'feature', '2026-11-01')).toThrow('de-ard sets no terms for a feature');
    expect(() => fee('ca-ipa', 'short', '2026-11-01')).toThrow('ca-ipa sets no terms for a short');
    expect(() => fee('de-cinema', 'episode', '2026-11-01')).toThrow('de-cinema sets no terms for a episode');
    expect(() => fee('ca-ipa', 'feature', '2026-11-01')).toThrow("a feature under ca-ipa names its production's budget");
    expect(() => fee('fr-tv', 'episode', '2026-11-01', null, 60)).toThrow("a episode under fr-tv names its production's budget");
    expect(() => fee('fr-tv', 'episode', '2026-11-01', 1_000_000)).toThrow('a episode under fr-tv names its running time');
    expect(() => fee('ca-ipa', 'episode', '2026-11-01', 1_000_000)).toThrow('a episode under ca-ipa names its running time');
    expect(() => fee('gb-bbc', 'episode', '2026-11-01')).toThrow('a episode under gb-bbc names its running time');
    expect(() => fee('gb-itv', 'episode', '2026-11-01')).toThrow('a episode under gb-itv names its running time');
    expect(() => fee('de-rtl', 'episode', '2026-11-01', null, 45)).toThrow("a episode under de-rtl names its production's budget");
    expect(fee('ca-ipa', 'episode', '2026-11-01', null, 30)).toEqual(money('CAD', '10546'));
    expect(fee('dk-feature', 'feature', '2026-11-01', null, null)).toEqual(money('DKK', '598836'));
    expect(() => fee('au-awg', 'feature', '2026-11-01')).toThrow(aboutMarket('au-awg') as string);
    expect(() => fee('jp', 'episode', '2026-11-01')).toThrow(aboutMarket('jp') as string);
    expect(() => fee('mx', 'short', '2026-11-01')).toThrow(t(UNKEPT_LINE, { country: 'Mexico', missing: MISSING.agreement }));
  });

  it("tells the player what of a market isn't known", () => {
    expect(UNKEPT_LINE).toBe('writing.unkept');
    expect(MISSING).toEqual({
      agreement: 'whether any agreement sets what a script is paid',
      fees: 'some of the minimums a script is paid',
      language: 'the language scripts are written in',
      union: "the guild's fees or whom it takes",
      terms: "whether any agreement, guild rate or law sets a script's terms",
      none: 'whether any fund, guild or agreement serves a writer there',
      follows: 'whether the agreements of the country whose law it follows reach a script written for a production there',
    });
    expect(aboutMarket('au-awg')).toBe("Some of what a screenwriter is paid or asked in Australia isn't known to this game yet: some of the minimums a script is paid and the language scripts are written in.");
    expect(aboutMarket('ie')).toBe("Some of what a screenwriter is paid or asked in Ireland isn't known to this game yet: the guild's fees or whom it takes.");
    // An option's terms alone aren't told: nothing the life does turns on them.
    expect(aboutMarket('de-zdf')).toBeUndefined();
    expect(aboutMarket('ca-ipa')).toBeUndefined();
    expect(aboutMarket('it')).toBeUndefined();
    expect(aboutMarket('wga')).toBeUndefined();
    for (const m of Object.values(MARKETS)) for (const id of m.agreements) expect(aboutMarket(id) === undefined, id).toBe(id === KEPT || (MARKETS[countryOf(id)] as typeof m).unknown.every((u) => u === 'option'));
    // The world's: a country whose research couldn't find whether anything sets the terms, or whether any fund, guild or agreement serves a writer; one with nothing to sell under told by its country.
    expect(aboutMarket('bn')).toBe(t(UNKEPT_LINE, { country: 'Brunei', missing: MISSING.terms }));
    expect(aboutMarket('ai')).toBe(t(UNKEPT_LINE, { country: 'Anguilla', missing: MISSING.none }));
    expect(aboutMarket('cd')).toBe(t(UNKEPT_LINE, { country: countryName('CD'), missing: `${MISSING.fees} and ${MISSING.none}` }));
    expect(aboutMarket('bg')).toBe(t(UNKEPT_LINE, { country: 'Bulgaria', missing: MISSING.fees }));
    expect(aboutCountry('TH')).toBe(t(UNKEPT_LINE, { country: 'Thailand', missing: MISSING.union }));
    // No writer's market leaves more than two items untold once an option's terms are set aside, so two are joined by "and".
    expect(Math.max(...Object.values(MARKETS).map((m) => m.unknown.filter((u) => u !== 'option').length))).toBe(2);
    expect(aboutCountry('BE')).toBe(aboutMarket('be'));
    expect(aboutMarket('re')).toBe(t(UNKEPT_LINE, { country: countryName('RE'), missing: MISSING.follows }));
    for (const cc of ['US', 'AZ', 'BL', 'JE', 'XX', 'toString']) expect(aboutCountry(cc), cc).toBeUndefined();
    for (const cc of Object.keys(MARKETS)) expect(aboutCountry(cc) === undefined, cc).toBe((RESEARCH[cc]?.blockers ?? []).every((b) => b.item === 'option'));
  });

  it('is paid where a wage floor reaches the writer by the days written, and by the kind of script where an agreement sets it by kind', () => {
    // Andorra: the minimum wage a day for each day given to the script, from 1 July 2026; none known before.
    const days = (n: number): Work => ({ genre: 'drama', days: n });
    expect(fee('ad', 'feature', '2026-07-01', null, null, days(1))).toEqual(money('EUR', '72.40'));
    expect(fee('ad', 'short', '2026-11-01', null, null, days(56))).toEqual(money('EUR', '4054.40'));
    expect(fee('ad', 'episode', '2026-11-01', null, null, days(9))).toEqual(money('EUR', '651.60'));
    expect(() => fee('ad', 'feature', '2026-06-30', null, null, days(1))).toThrow('no minimum under ad is known before 2026-07-01');
    expect(() => fee('ad', 'pilot', '2026-11-01')).toThrow('a pilot under ad is paid by the days it was written');
    // Azerbaijan's films made to state order: an original screenplay by its kind, from 10 January 2025.
    const of = (genre: string): Work => ({ genre, days: 1 });
    expect(fee('az-state', 'feature', '2025-01-10', null, null, of('drama'))).toEqual(money('AZN', '10000'));
    expect(fee('az-state', 'feature', '2026-11-01', null, null, of('nature-documentary'))).toEqual(money('AZN', '4000'));
    expect(fee('az-state', 'feature', '2026-11-01', null, null, of('anime'))).toEqual(money('AZN', '4000'));
    for (const form of ['pilot', 'episode', 'short'] as const) for (const genre of ['comedy', 'documentary', 'animated']) expect(fee('az-state', form, '2026-11-01', null, null, of(genre)), `${form} ${genre}`).toEqual(money('AZN', '1200'));
    expect(() => fee('az-state', 'feature', '2025-01-09', null, null, of('drama'))).toThrow('no minimum under az-state is known before 2025-01-10');
    expect(() => fee('az-state', 'feature', '2026-11-01')).toThrow('a feature under az-state names its genre');
    // Switzerland: a fiction feature's screenplay at CHF 75,000 from 5 August 2025, a documentary's left to negotiation, an animation's not set; TV left to negotiation.
    expect(fee('ch-film', 'feature', '2025-08-05', null, null, of('thriller'))).toEqual(money('CHF', '75000'));
    expect(fee('ch-film', 'feature', '2026-11-01', null, null, of('documentary'))).toBeNull();
    expect(() => fee('ch-film', 'feature', '2026-11-01', null, null, of('animated'))).toThrow('ch-film sets no minimum for that feature');
    expect(() => fee('ch-film', 'feature', '2025-08-04', null, null, of('thriller'))).toThrow('no minimum under ch-film is known before 2025-08-05');
    expect(() => fee('ch-film', 'episode', '2026-11-01')).toThrow('ch-film sets no terms for a episode');
    expect(fee('ch-tv', 'episode', '2026-11-01')).toBeNull();
    // Where the research says no agreement sets the pay, it is left to negotiation.
    for (const [id, [, , , forms, pays]] of Object.entries(AGREEMENTS)) if (pays === 'none') for (const form of forms) expect(minimumOf(terms(id), form, '1900-01-01'), id).toBeNull();
    // And where the research couldn't find it, refused and told.
    for (const cc of UNKNOWN_AGREEMENTS) expect(() => fee(cc.toLowerCase(), 'feature', '2026-11-01'), cc).toThrow(aboutCountry(cc) as string);
  });
});
