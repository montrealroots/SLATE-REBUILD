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
// A UK play is paid under a theatre's agreement (career's PLAYS); a play elsewhere under its market's, from 2026-11-04.
import type { Screen } from '../../../src/person/work/career.ts';
import type { Form } from '../../../src/person/work/work.ts';
import compiled from '../../../src/person/work/markets.json' with { type: 'json' };

const money = (c: CurrencyCode, n: string) => fromMajor(c, n);
const terms = (agreement: string, budget: number | null = null, minutes: number | null = null) => ({ agreement, budget, minutes });
/** A play's terms: its running time, its theatre's grade, its run's performances, the writer's plays premiered before. */
const stage = (agreement: string, minutes: number | null, o: { grade?: number; performances?: number; premieres?: number } = {}) => ({ agreement, budget: null, minutes, ...o });
const fee = (agreement: string, form: Form, date: string, budget: number | null = null, minutes: number | null = null, work: Work | null = null) => minimumOf(terms(agreement, budget, minutes), form, date, work);
/** Each country's writer research, as the compile reads it (its blockers' items). */
const SOURCES = resolve(import.meta.dirname, '../../../research/sources/person/markets');
const RESEARCH = Object.fromEntries(
  readdirSync(SOURCES)
    .filter((f) => f.startsWith('writer-'))
    .map((f) => [f.slice(7, -5), JSON.parse(readFileSync(join(SOURCES, f), 'utf8')) as { blockers: { item: string }[] }]),
);

/** Every minimum as the research gives it (read from each country's writer file, 2026-11-01; Argentina's and Mexico's films 2026-11-04): forms, tiers, unit, from, amount, its share of the budget and ceiling. */
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
    'pilot/episode minutes1-22 budget350000-574999 script 2026-02-15 16750',
    'pilot/episode minutes1-22 budget575000-899999 script 2026-02-15 17500',
    'pilot/episode minutes1-22 budget900000- script 2026-02-15 20000',
    'pilot/episode minutes23-45 budget600000-1149999 script 2026-02-15 33500',
    'pilot/episode minutes23-45 budget1150000-1899999 script 2026-02-15 35000',
    'pilot/episode minutes23-45 budget1900000- script 2026-02-15 40000',
  ],
  'de-p7s1': ['pilot/episode minutes1-45 script 2014-06-03 30500'],
  'dk-feature': ['feature - script 2026-01-01 598836'],
  // Argentores' film minimum from 11 April 2025; the STPC writers' section's screenplay a film, each year from 15 May.
  'ar-film': ['feature - script 2025-04-11 21000000'],
  'mx-film': ['feature - script 2021-05-15 209475', 'feature - script 2022-05-15 219948.75', 'feature - script 2023-05-15 230946.19', 'feature - script 2024-05-15 242493.5'],
  'fr-film': ['feature - script 2026-01-15 17000'],
  'fr-tv': ['pilot/episode hourly0-599999 - 2023-07-01 negotiated', 'pilot/episode hourly600000- hour 2023-07-01 27550 share 0.03 cap 1200000'],
  'gb-pact-film': ['feature budget0-749999 script 1990-10-01 14000', 'feature budget750000-2000000 script 1990-10-01 14000', 'feature budget2000001- script 1990-10-01 23200'],
  'gb-bbc': ['pilot/episode - minute 2025-12-15 220'],
  'gb-itv': ['pilot/episode - hour 2026-10-19 12882'],
  'gb-pact-tv': ['pilot/episode - hour 2016-10-01 10570'],
  'no-film': ['feature - script 2026-05-01 535106'],
  'no-nrk': ['pilot/episode - minute 2026-05-01 3022'],
  'se-svt': ['pilot/episode minutes1-19 minute 2025-01-01 2898', 'pilot/episode minutes20-29 minute 2025-01-01 4456', 'pilot/episode minutes30-60 minute 2025-01-01 4551', 'pilot/episode minutes61- minute 2025-01-01 3945'],
  'se-producers': ['pilot/episode minutes1-19 minute 2023-08-30 2674', 'pilot/episode minutes20-29 minute 2023-08-30 4113', 'pilot/episode minutes30-60 minute 2023-08-30 4200', 'pilot/episode minutes61- minute 2023-08-30 3642'],
  // Andorra's artists' statute: the minimum wage a day of 8 hours, from 1 July 2026, for each day the script (or, from 2026-11-04, the play) was written.
  ad: ['feature/pilot/episode/short/play - day 2026-07-01 72.4'],
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
  // A play's (2026-11-04). Denmark's TIO theatres: salary months by the running time, the month DKK 28,401.25 from 1 April 2026.
  'dk-tio': ['play minutes1-30 script 2026-04-01 28401.25 times 3', 'play minutes31-45 script 2026-04-01 28401.25 times 3.5', 'play minutes46-75 script 2026-04-01 28401.25 times 4', 'play minutes76-90 script 2026-04-01 28401.25 times 4.5', 'play minutes91- script 2026-04-01 28401.25 times 5'],
  // Norway's Spekter theatres: the category's fee, half of it for 30 to 45 minutes, three quarters for 46 to 69; under 30 negotiated.
  'no-spekter': [
    'play minutes0-29 - 2026-04-15 negotiated',
    'play minutes30-45 grade1-1 script 2026-04-15 519298 times 0.5',
    'play minutes46-69 grade1-1 script 2026-04-15 519298 times 0.75',
    'play minutes70- grade1-1 script 2026-04-15 519298',
    'play minutes30-45 grade2-2 script 2026-04-15 467368 times 0.5',
    'play minutes46-69 grade2-2 script 2026-04-15 467368 times 0.75',
    'play minutes70- grade2-2 script 2026-04-15 467368',
    'play minutes30-45 grade3-3 script 2026-04-15 363509 times 0.5',
    'play minutes46-69 grade3-3 script 2026-04-15 363509 times 0.75',
    'play minutes70- grade3-3 script 2026-04-15 363509',
  ],
  // Iceland: the National Theatre's for the quarter from 1 October 2026, the City Theatre's from 1 January 2026; a writer's first work less.
  'is-national': ['play premieres0-0 script 2026-10-01 7607862', 'play premieres1- script 2026-10-01 7778825'],
  'is-reykjavik': ['play premieres0-0 script 2026-01-01 7285489', 'play premieres1- script 2026-01-01 7449269'],
  // Canada's PACT theatres: the guarantee by the run's performances, each year from 30 June; a short play's under 20 minutes.
  'ca-pgc': [
    'play minutes20- performances7- script 2025-06-30 2288',
    'play minutes20- performances1-6 script 2025-06-30 128.75',
    'play minutes1-19 performances7- script 2025-06-30 750',
    'play minutes1-19 performances1-6 performance 2025-06-30 50',
    'play minutes20- performances7- script 2026-06-30 2356.65',
    'play minutes20- performances1-6 script 2026-06-30 132.6',
    'play minutes20- performances7- script 2027-06-30 2427.35',
    'play minutes20- performances1-6 script 2027-06-30 136.6',
  ],
};

const ALL: Screen[] = ['feature', 'pilot', 'episode', 'short'];
const PLAY: Form[] = ['play'];
const TV: Form[] = ['pilot', 'episode'];
/** Each agreement's country, languages, currency, forms, and how it pays (none, unknown, or its minimums). */
const AGREEMENTS: Record<string, [string, string[], string | null, Form[], 'none' | 'unknown' | 'fees']> = {
  'ar-film': ['AR', ['es'], 'ARS', ['feature'], 'fees'],
  ar: ['AR', [], null, ['pilot', 'episode', 'short'], 'unknown'],
  'au-awg': ['AU', ['en'], null, ALL, 'unknown'],
  br: ['BR', ['pt'], null, ALL, 'none'],
  'ca-ipa': ['CA', ['en'], 'CAD', ['feature', 'pilot', 'episode'], 'fees'],
  'ca-sartec': ['CA', ['fr'], 'CAD', ['feature'], 'fees'],
  'de-cinema': ['DE', ['de'], null, ['feature'], 'none'],
  'de-netflix': ['DE', ['de'], 'EUR', ['feature'], 'fees'],
  'de-ard': ['DE', ['de'], 'EUR', TV, 'fees'],
  'de-ard-early': ['DE', ['de'], 'EUR', TV, 'fees'],
  'de-zdf': ['DE', ['de'], 'EUR', TV, 'fees'],
  'de-rtl': ['DE', ['de'], 'EUR', TV, 'fees'],
  'de-p7s1': ['DE', ['de'], 'EUR', TV, 'fees'],
  'dk-feature': ['DK', ['da'], 'DKK', ['feature'], 'fees'],
  'dk-dr': ['DK', ['da'], null, TV, 'none'],
  es: ['ES', ['es'], null, ALL, 'none'],
  'fr-film': ['FR', ['fr'], 'EUR', ['feature'], 'fees'],
  'fr-tv': ['FR', ['fr'], 'EUR', TV, 'fees'],
  'gb-pact-film': ['GB', ['en'], 'GBP', ['feature'], 'fees'],
  'gb-bbc': ['GB', ['en'], 'GBP', TV, 'fees'],
  'gb-itv': ['GB', ['en'], 'GBP', TV, 'fees'],
  'gb-pact-tv': ['GB', ['en'], 'GBP', TV, 'fees'],
  ie: ['IE', ['en'], null, ALL, 'none'],
  in: ['IN', ['hi'], null, ALL, 'none'],
  it: ['IT', ['it'], null, ALL, 'none'],
  jp: ['JP', ['ja'], null, ALL, 'unknown'],
  kr: ['KR', ['ko'], null, ALL, 'none'],
  'mx-film': ['MX', ['es'], 'MXN', ['feature'], 'fees'],
  mx: ['MX', ['es'], null, ['pilot', 'episode', 'short'], 'unknown'],
  ng: ['NG', ['en'], null, ALL, 'none'],
  nl: ['NL', ['nl'], null, ALL, 'none'],
  'no-film': ['NO', ['no'], 'NOK', ['feature'], 'fees'],
  'no-series': ['NO', ['no'], null, TV, 'none'],
  'no-nrk': ['NO', ['no'], 'NOK', TV, 'fees'],
  nz: ['NZ', ['en'], null, ALL, 'none'],
  'se-svt': ['SE', ['sv'], 'SEK', TV, 'fees'],
  'se-producers': ['SE', ['sv'], 'SEK', TV, 'fees'],
  'se-film': ['SE', ['sv'], null, ['feature'], 'none'],
  za: ['ZA', ['en'], null, ALL, 'none'],
  // The world's markets beyond the twenty (2026-11-01): a wage floor by the day written, fees by kind, and pay left to negotiation.
  ad: ['AD', ['ca'], 'EUR', [...ALL, 'play'], 'fees'],
  ai: ['AI', ['en'], null, ALL, 'none'],
  as: ['AS', ['sm', 'en'], null, ALL, 'none'],
  at: ['AT', ['de'], null, ALL, 'none'],
  ax: ['AX', ['sv'], null, ALL, 'none'],
  'az-state': ['AZ', ['az'], 'AZN', ALL, 'fees'],
  ba: ['BA', ['bs', 'hr', 'sr'], null, ALL, 'none'],
  be: ['BE', ['nl', 'fr'], null, ALL, 'none'],
  bn: ['BN', ['ms'], null, ALL, 'none'],
  bw: ['BW', ['en', 'tn'], null, ALL, 'none'],
  'ch-film': ['CH', ['de', 'fr', 'it'], 'CHF', ['feature'], 'fees'],
  'ch-tv': ['CH', ['de', 'fr', 'it'], null, TV, 'none'],
  cl: ['CL', ['es'], null, ALL, 'none'],
  fi: ['FI', ['fi', 'sv'], null, ALL, 'none'],
  gi: ['GI', ['en'], null, ALL, 'none'],
  li: ['LI', ['de'], null, ALL, 'none'],
  ms: ['MS', ['en'], null, ALL, 'none'],
  nc: ['NC', ['fr'], null, [...ALL, 'play'], 'none'],
  pa: ['PA', ['es'], null, ALL, 'none'],
  ph: ['PH', ['fil', 'en'], null, ALL, 'none'],
  pn: ['PN', ['en'], null, [...ALL, 'play'], 'none'],
  sh: ['SH', ['en'], null, ALL, 'none'],
  tz: ['TZ', ['sw', 'en'], null, ALL, 'none'],
  ua: ['UA', ['uk'], null, ALL, 'none'],
  va: ['VA', ['it'], null, [...ALL, 'play'], 'none'],
  vg: ['VG', ['en'], null, ALL, 'none'],
  // A play's writers' agreements (2026-11-04): an up-front minimum, or none where the minimum is a share of the takings alone.
  'dk-tio': ['DK', ['da'], 'DKK', PLAY, 'fees'],
  'no-spekter': ['NO', ['no'], 'NOK', PLAY, 'fees'],
  'is-national': ['IS', ['is'], 'ISK', PLAY, 'fees'],
  'is-reykjavik': ['IS', ['is'], 'ISK', PLAY, 'fees'],
  'ca-pgc': ['CA', ['en'], 'CAD', PLAY, 'fees'],
  'fr-sacd': ['FR', ['fr'], null, PLAY, 'none'],
  'sk-lita': ['SK', ['sk'], null, PLAY, 'none'],
  'lt-latga': ['LT', ['lt'], null, PLAY, 'none'],
  'uy-agadu': ['UY', ['es'], null, PLAY, 'none'],
  'it-siae': ['IT', ['it'], null, PLAY, 'none'],
  'cz-dilia': ['CZ', ['cs'], null, PLAY, 'none'],
  // From the methods round of 2026-11-04: a copyright law's royalty floor or a society's tariff, a share of the takings alone.
  'cl-17336': ['CL', ['es'], null, PLAY, 'none'],
  'co-ley23': ['CO', ['es'], null, PLAY, 'none'],
  'gr-2121': ['GR', ['el'], null, PLAY, 'none'],
  'lv-akka': ['LV', ['lv'], null, PLAY, 'none'],
  'mg-omda': ['MG', ['mg', 'fr'], null, PLAY, 'none'],
  'py-apa': ['PY', ['es'], null, PLAY, 'none'],
};
/** The countries whose only agreements known are a play's, their screen agreement's figures unknown. */
const PLAY_ONLY = ['CO', 'CZ', 'GR', 'IS', 'LT', 'LV', 'MG', 'PY', 'SK', 'UY'];
/** The markets that follow another's terms (the research: a French overseas department, an Australian territory, Puerto Rico under the US system), and those with none to sell under. */
const FOLLOWS: Record<string, string> = { BL: 'FR', CC: 'AU', CX: 'AU', GF: 'FR', MF: 'FR', NF: 'AU', PM: 'FR', PR: 'US', YT: 'FR' };
const NO_AGREEMENT = ['AN', 'AQ', 'CS', 'GS', 'HM', 'IO', 'JE', 'TH', 'UM'];
/** Every other market's own agreement, its figures unknown, as its blockers say: whether any agreement, guild rate or law sets the terms, or the fees. */
const UNKNOWN_AGREEMENTS = Object.keys(RESEARCH).filter((cc) => PLAY_ONLY.includes(cc) || (!Object.values(AGREEMENTS).some(([c]) => c === cc) && !(cc in FOLLOWS) && !NO_AGREEMENT.includes(cc)));

/** What the twenty's research couldn't find, and the world's where it compiles an agreement of its own that tells or a market with nothing to sell under. */
const UNKNOWN: Record<string, string[]> = {
  AR: ['fees', 'play'],
  AU: ['fees', 'language', 'play'],
  BR: ['play'],
  CA: [],
  DE: ['play'],
  DK: ['fees'],
  ES: ['fees', 'play'],
  FR: [],
  GB: ['language'],
  IE: ['play'],
  IN: ['union', 'fees', 'play'],
  IT: [],
  JP: ['fees', 'play'],
  KR: ['union', 'fees', 'play'],
  MX: ['agreement', 'play'],
  NG: ['union', 'fees', 'play'],
  NL: ['fees', 'play'],
  NO: ['fees'],
  NZ: ['fees', 'play'],
  SE: ['fees', 'play'],
  ZA: ['fees', 'play'],
  AI: ['none', 'play'],
  BE: ['fees', 'play'],
  BN: ['terms', 'play'],
  GI: ['none', 'play'],
  GP: ['follows', 'play'],
  HK: ['union', 'none', 'play'],
  HU: ['union', 'none', 'play'],
  RE: ['follows', 'play'],
  MS: ['none', 'play'],
  SH: ['none', 'play'],
  TH: ['union', 'play'],
  VG: ['none', 'play'],
  // Vietnam's play: every method tried on 2026-11-04, the decree in force (287/2026) not reached.
  VN: ['fees', 'play'],
};

const tierText = (f: Fee) => {
  const tiers = Object.entries(f.when).map(([k, [lo, hi]]) => `${k}${lo}-${hi ?? ''}`);
  return tiers.length === 0 ? '-' : tiers.join(' ');
};
const line = (f: Fee) => [f.forms.join('/'), ...(f.kind === null ? [] : [f.kind]), tierText(f), f.per ?? '-', f.from, f.amount ?? 'negotiated', ...(f.share === null ? [] : ['share', f.share]), ...(f.cap === null ? [] : ['cap', f.cap]), ...(f.times === null ? [] : ['times', f.times])].join(' ');

describe('the markets', () => {
  it("are each country's own, every minimum as the research gives it", () => {
    const agreements = compiled.agreements as unknown as Record<string, { country: string; languages: string[]; currency: string | null; forms: Form[]; none: boolean; unknown: boolean; fees: Fee[] }>;
    const unknown = Object.fromEntries(UNKNOWN_AGREEMENTS.map((cc) => [cc.toLowerCase(), [cc, [], null, ALL, 'unknown'] as const]));
    expect(UNKNOWN_AGREEMENTS).toHaveLength(187);
    expect(Object.keys(agreements).sort()).toEqual([...Object.keys(AGREEMENTS), ...Object.keys(unknown)].sort());
    for (const [id, [country, languages, currency, forms, pays]] of Object.entries({ ...AGREEMENTS, ...unknown })) {
      const a = agreements[id];
      // What waits for photography and an option's terms went from the compile on 2026-11-04 (nothing read them).
      expect(Object.keys(a ?? {}).sort(), id).toEqual(['country', 'currency', 'fees', 'forms', 'languages', 'none', 'unknown']);
      for (const f of a?.fees ?? []) expect(Object.keys(f).sort(), id).toEqual(['amount', 'cap', 'forms', 'from', 'kind', 'per', 'share', 'times', 'when']);
      expect([a?.country, a?.languages, a?.currency, a?.forms, a?.none ? 'none' : a?.unknown ? 'unknown' : 'fees'], id).toEqual([country, languages, currency, forms, pays]);
      expect(a?.fees.map(line), id).toEqual(EXPECTED[id] ?? []);
      expect(countryOf(id)).toBe(country);
      expect(languagesOf(id)).toEqual(languages);
      expect(marketOf(id)).toBe(a);
    }
    // An agreement whose figures are unknown stands where its country's research couldn't find whether one sets the terms, or its fees.
    for (const cc of UNKNOWN_AGREEMENTS) expect(RESEARCH[cc]?.blockers.some((b) => ['agreement', 'fees', 'terms', 'none', 'follows'].includes(b.item)), cc).toBe(true);
    // What each market's research couldn't find: its blockers' items, each once, in the research's order, less an option's terms, which nothing reads.
    for (const [cc, m] of Object.entries(MARKETS)) expect(m.unknown, cc).toEqual([...new Set(RESEARCH[cc]?.blockers.map((b) => b.item))].filter((i) => i !== 'option'));
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
    // Argentina: Argentores' film minimum from 11 April 2025; its TV and short terms unknown, and told.
    expect(fee('ar-film', 'feature', '2025-04-11')).toEqual(money('ARS', '21000000'));
    expect(() => fee('ar-film', 'feature', '2025-04-10')).toThrow('no minimum under ar-film is known before 2025-04-11');
    expect(() => fee('ar-film', 'episode', '2026-11-01')).toThrow('ar-film sets no terms for a episode');
    expect(() => fee('ar', 'episode', '2026-11-01')).toThrow(t(UNKEPT_LINE, { country: 'Argentina', missing: `${MISSING.fees} and ${MISSING.play}` }));
    // Mexico: the STPC writers' section's screenplay a film, the year's table from 15 May.
    const mx: [string, string][] = [['2021-05-15', '209475'], ['2022-05-14', '209475'], ['2022-05-15', '219948.75'], ['2023-05-15', '230946.19'], ['2024-05-14', '230946.19'], ['2024-05-15', '242493.50'], ['2026-11-01', '242493.50']];
    for (const [date, amount] of mx) expect(fee('mx-film', 'feature', date), date).toEqual(money('MXN', amount));
    expect(() => fee('mx-film', 'feature', '2021-05-14')).toThrow('no minimum under mx-film is known before 2021-05-15');
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
    expect(() => fee('mx', 'short', '2026-11-01')).toThrow(t(UNKEPT_LINE, { country: 'Mexico', missing: `${MISSING.agreement} and ${MISSING.play}` }));
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
      play: "what a play's script is paid",
    });
    expect(aboutCountry('VN')).toBe(t(UNKEPT_LINE, { country: 'Vietnam', missing: `${MISSING.fees} and ${MISSING.play}` }));
    // Three items, from the methods round of 2026-11-04 (a play's minimum where the research couldn't find it), are listed with a comma and "and".
    expect(aboutMarket('au-awg')).toBe("Some of what a screenwriter is paid or asked in Australia isn't known to this game yet: some of the minimums a script is paid, the language scripts are written in and what a play's script is paid.");
    expect(aboutMarket('ar-film')).toBe("Some of what a screenwriter is paid or asked in Argentina isn't known to this game yet: some of the minimums a script is paid and what a play's script is paid.");
    expect(aboutMarket('ar')).toBe(aboutMarket('ar-film'));
    // Ireland's guild's terms were found on 2026-11-04 (its page as Common Crawl kept it); a play's writer's weren't, which alone is told.
    expect(aboutMarket('ie')).toBe(t(UNKEPT_LINE, { country: 'Ireland', missing: MISSING.play }));
    // An option's terms aren't told: nothing the life does turns on them. Germany's play's writer's terms, which the methods round couldn't find, are.
    expect(aboutMarket('de-zdf')).toBe(t(UNKEPT_LINE, { country: 'Germany', missing: MISSING.play }));
    expect(aboutMarket('ca-ipa')).toBeUndefined();
    expect(aboutMarket('it')).toBeUndefined();
    // A market whose play's terms were found by the methods round tells nothing of a play: Chile's copyright law.
    expect(aboutMarket('cl')).toBeUndefined();
    expect(aboutMarket('wga')).toBeUndefined();
    for (const m of Object.values(MARKETS)) for (const id of m.agreements) expect(aboutMarket(id) === undefined, id).toBe(id === KEPT || (MARKETS[countryOf(id)] as typeof m).unknown.length === 0);
    // The world's: a country whose research couldn't find whether anything sets the terms, or whether any fund, guild or agreement serves a writer; one with nothing to sell under told by its country.
    expect(aboutMarket('bn')).toBe(t(UNKEPT_LINE, { country: 'Brunei', missing: `${MISSING.terms} and ${MISSING.play}` }));
    expect(aboutMarket('ai')).toBe(t(UNKEPT_LINE, { country: 'Anguilla', missing: `${MISSING.none} and ${MISSING.play}` }));
    expect(aboutMarket('cd')).toBe(t(UNKEPT_LINE, { country: countryName('CD'), missing: `${MISSING.fees}, ${MISSING.none} and ${MISSING.play}` }));
    expect(aboutMarket('bg')).toBe(t(UNKEPT_LINE, { country: 'Bulgaria', missing: `${MISSING.fees} and ${MISSING.play}` }));
    expect(aboutCountry('TH')).toBe(t(UNKEPT_LINE, { country: 'Thailand', missing: `${MISSING.union} and ${MISSING.play}` }));
    // No writer's market left more than two items untold until the methods round of 2026-11-04 added a play's minimum to some.
    expect(Math.max(...Object.values(MARKETS).map((m) => m.unknown.length))).toBe(3);
    expect(aboutCountry('BE')).toBe(aboutMarket('be'));
    expect(aboutMarket('re')).toBe(t(UNKEPT_LINE, { country: countryName('RE'), missing: `${MISSING.follows} and ${MISSING.play}` }));
    for (const cc of ['US', 'BL', 'XX', 'toString']) expect(aboutCountry(cc), cc).toBeUndefined();
    // Azerbaijan's and Jersey's screen terms are known whole; a play's writer's aren't, and are told.
    for (const cc of ['AZ', 'JE'] as const) expect(aboutCountry(cc), cc).toBe(t(UNKEPT_LINE, { country: countryName(cc), missing: MISSING.play }));
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

  it("is paid for a play its market's playwrights' minimum: by its running time, its theatre's grade, its run, the writer's first premiere", () => {
    const play = (o: ReturnType<typeof stage>, date = '2026-11-04', work: Work | null = null) => minimumOf(o, 'play', date, work);
    // Denmark's TIO theatres: 3 salary months up to 30 minutes, 3.5 to 45, 4 to 75, 4.5 to 90, 5 beyond; DKK 28,401.25 a month from 1 April 2026.
    const dk: [number, string][] = [[1, '85203.75'], [30, '85203.75'], [31, '99404.38'], [45, '99404.38'], [46, '113605'], [75, '113605'], [76, '127805.62'], [90, '127805.62'], [91, '142006.25'], [180, '142006.25']];
    for (const [minutes, amount] of dk) expect(play(stage('dk-tio', minutes)), String(minutes)).toEqual(money('DKK', amount));
    expect(play(stage('dk-tio', 90), '2026-04-01')).toEqual(money('DKK', '127805.62'));
    expect(() => play(stage('dk-tio', 90), '2026-03-31')).toThrow('no minimum under dk-tio is known before 2026-04-01');
    expect(() => play(stage('dk-tio', 0))).toThrow('dk-tio sets no minimum for that play');
    expect(() => play(stage('dk-tio', null))).toThrow('a play under dk-tio names its running time');
    // Norway's Spekter theatres: the category's fee for a full-length play, half for 30 to 45 minutes, three quarters for 46 to 69; under 30 negotiated.
    const no: [number, number, string][] = [[1, 70, '519298'], [2, 120, '467368'], [3, 70, '363509'], [1, 69, '389473.50'], [3, 46, '272631.75'], [2, 45, '233684'], [1, 30, '259649']];
    for (const [grade, minutes, amount] of no) expect(play(stage('no-spekter', minutes, { grade })), `${grade} ${minutes}`).toEqual(money('NOK', amount));
    expect(play(stage('no-spekter', 29, { grade: 1 }))).toBeNull();
    expect(play(stage('no-spekter', 29))).toBeNull();
    expect(() => play(stage('no-spekter', 70))).toThrow("a play under no-spekter names its theatre's grade");
    expect(() => play(stage('no-spekter', 70, { grade: 4 }))).toThrow('no-spekter sets no minimum for that play');
    expect(() => play(stage('no-spekter', 70, { grade: 1 }), '2026-04-14')).toThrow('no minimum under no-spekter is known before 2026-04-15');
    // Iceland: the National Theatre's and the City Theatre's minimum, less for the writer's first work at a professional theatre.
    expect(play(stage('is-national', 90, { premieres: 0 }))).toEqual(money('ISK', '7607862'));
    expect(play(stage('is-national', 90, { premieres: 1 }))).toEqual(money('ISK', '7778825'));
    expect(play(stage('is-national', 40, { premieres: 5 }), '2026-10-01')).toEqual(money('ISK', '7778825'));
    expect(() => play(stage('is-national', 90, { premieres: 1 }), '2026-09-30')).toThrow('no minimum under is-national is known before 2026-10-01');
    expect(play(stage('is-reykjavik', 90, { premieres: 0 }), '2026-01-01')).toEqual(money('ISK', '7285489'));
    expect(play(stage('is-reykjavik', 90, { premieres: 2 }))).toEqual(money('ISK', '7449269'));
    expect(() => play(stage('is-reykjavik', 90, { premieres: 0 }), '2025-12-31')).toThrow('no minimum under is-reykjavik is known before 2026-01-01');
    expect(() => play(stage('is-national', 90))).toThrow("a play under is-national names the writer's plays premiered before");
    // Canada's PACT theatres: the guarantee by the run's performances, each year from 30 June; a short play's under 20 minutes, by the performance under 7.
    const ca: [string, number, number, string][] = [
      ['2025-06-30', 90, 7, '2288'], ['2026-06-29', 20, 40, '2288'], ['2026-06-30', 90, 7, '2356.65'], ['2027-06-30', 90, 8, '2427.35'],
      ['2025-06-30', 90, 6, '128.75'], ['2026-11-04', 90, 1, '132.60'], ['2027-06-30', 90, 6, '136.60'],
      ['2026-11-04', 19, 7, '750'], ['2026-11-04', 1, 6, '300'], ['2026-11-04', 10, 1, '50'],
    ];
    for (const [date, minutes, performances, amount] of ca) expect(play(stage('ca-pgc', minutes, { performances }), date), `${date} ${minutes} ${performances}`).toEqual(money('CAD', amount));
    expect(() => play(stage('ca-pgc', 90))).toThrow("a play under ca-pgc names its run's performances");
    expect(() => play(stage('ca-pgc', 10))).toThrow("a play under ca-pgc names its run's performances");
    expect(() => play(stage('ca-pgc', 90, { performances: 8 }), '2025-06-29')).toThrow('no minimum under ca-pgc is known before 2025-06-30');
    // Andorra: the artists' statute's floor a day for each day the play was written, as a script's.
    expect(play(stage('ad', 90), '2026-11-04', { genre: 'drama', days: 56 })).toEqual(money('EUR', '4054.40'));
    // A share of the takings alone: nothing up front, the game keeping no box office.
    for (const id of ['fr-sacd', 'sk-lita', 'lt-latga', 'uy-agadu', 'it-siae', 'cz-dilia']) expect(play(stage(id, 90)), id).toBeNull();
    // From the methods round: a copyright law's royalty floor (Chile, Colombia, Greece) or a society's tariff (Latvia, Madagascar, Paraguay).
    for (const id of ['cl-17336', 'co-ley23', 'gr-2121', 'lv-akka', 'mg-omda', 'py-apa']) expect(play(stage(id, 90)), id).toBeNull();
    // And none where nothing sets a stage writer's pay: Pitcairn, New Caledonia, Vatican City.
    for (const id of ['pn', 'nc', 'va']) expect(play(stage(id, 90)), id).toBeNull();
    // A French overseas collectivity follows France's, the play's agreement with the rest.
    for (const cc of ['BL', 'GF', 'MF', 'PM', 'YT']) expect(MARKETS[cc]?.agreements, cc).toContain('fr-sacd');
    // A screen agreement sets no terms for a play, nor a play's for the screen, nor the WGA's for a play.
    expect(() => play(stage('dk-feature', 90))).toThrow('dk-feature sets no terms for a play');
    expect(() => fee('dk-tio', 'feature', '2026-11-04')).toThrow('dk-tio sets no terms for a feature');
    expect(() => play(stage('wga', 90))).toThrow('wga sets no terms for a play');
    // A play where the research couldn't find its writer's terms is told (Vietnam's: every method tried, the decree in force not reached).
    expect(aboutCountry('VN')).toContain(MISSING.play);
    // The methods round's falsifier: the same play is staged, nothing paid up front, under Chile's law, and refused and told under Argentina's market, whose play's terms weren't found.
    expect(MARKETS.CL?.agreements).toContain('cl-17336');
    expect(MARKETS.AR?.agreements.some((id) => marketOf(id)?.forms.includes('play'))).toBe(false);
    expect(aboutCountry('AR')).toContain(MISSING.play);
    expect(aboutCountry('CL')).toBeUndefined();
    expect(() => play(stage('ar-film', 90))).toThrow('ar-film sets no terms for a play');
  });

  it("pays one play differently by its market: the same ninety-minute play under each market's terms", () => {
    const o = { grade: 1, performances: 8, premieres: 1 };
    const paid = ['dk-tio', 'no-spekter', 'is-national', 'ca-pgc', 'fr-sacd'].map((id) => minimumOf(stage(id, 90, o), 'play', '2026-11-04'));
    expect(paid).toEqual([money('DKK', '127805.62'), money('NOK', '519298'), money('ISK', '7778825'), money('CAD', '2356.65'), null]);
    // And one input moved moves the pay: the running time in Denmark, the grade in Norway, the first work in Iceland, the run in Canada.
    expect(minimumOf(stage('dk-tio', 91, o), 'play', '2026-11-04')).not.toEqual(paid[0]);
    expect(minimumOf(stage('no-spekter', 90, { ...o, grade: 2 }), 'play', '2026-11-04')).not.toEqual(paid[1]);
    expect(minimumOf(stage('is-national', 90, { ...o, premieres: 0 }), 'play', '2026-11-04')).not.toEqual(paid[2]);
    expect(minimumOf(stage('ca-pgc', 90, { ...o, performances: 6 }), 'play', '2026-11-04')).not.toEqual(paid[3]);
  });
});
