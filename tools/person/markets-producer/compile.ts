import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fromMajor, isCurrency, minorUnits, type CurrencyCode } from '../../../src/core/money/money.ts';
import countries from '../../../src/world/gazetteer/countries.json' with { type: 'json' };

/**
 * Compiles the markets a producer works in beyond the UK (src/person/producing/markets.json), from the research's files,
 * one per country (research/sources/person/markets/producer-<CC>.json, register fact person.markets.producer.<CC>) and
 * the producer's calibration (research/sources/person/work/producer-calibration.json, R-4612: Telefilm's, the CNC's
 * and Screen Australia's terms), each checked against the SHA-256 its register entry cites before a byte of it is read,
 * and the game's reading of them (tools/person/markets-producer/readings.json): where in the research each term stands.
 *
 * A market gives its currency and what a project there can draw on, each by the project's budget where the research
 * sets it by budget (a tier, its bounds counted): the public fund (how often it says yes, and what it awards: a share
 * of the budget, at most so much, or a fixed sum), the cap on all public aid a film may take (the fund's award holds
 * to what the cap leaves after the credit), the production incentive (its rate, a band at a time where it pays one rate
 * on the first so much and another on the rest; the share of the budget it counts; its most), each cap a funder sets on
 * the producer's fee and the company's overheads, and how often a film reaches cinemas. Every rate, share and amount is
 * read from the research at its place, or written in the reading and found standing in the research's figure, as every
 * bound of a tier or a band is; every amount's figure names the market's currency. A term the research doesn't give is
 * none (null): the engine refuses what rests on it and tells the player; an incentive the research says doesn't exist
 * pays nothing. An incentive's bounds and cap may be set in another currency than the market's (Azerbaijan's rebate in
 * US dollars, paid in manat), each standing in a figure that names it: the engine reads them in the market's currency at
 * the day's rate (money.rates), so a market keeps one currency, its agreements' and its budget's. An incentive whose own
 * terms pay it only to a production from abroad (or a co-production with a foreign partner) is held so (`foreignOnly`), on
 * a quote of its figure that a primary source said (the reading names the words); the engine refuses it to a production
 * the life's company makes at home. Until 2026-11-04 no limit was read, and every such incentive was paid at home too.
 *
 * Every country's research is read (the gazetteer's 251 beyond the UK): a market's currency is its country's (the
 * gazetteer's) unless its reading names another its research's terms are given in; a reading of none (null) is a
 * country no producer works in (one dissolved, or with no sovereign), which may hold no blockers, since none of its
 * market is told. A market's zone, where the actor's engine keeps no city there, is its most populous place's on the
 * map (GeoNames' first of the most populous, in the gazetteer's file; none where the map has no place there).
 */
export const SOURCES = 'research/sources/person/markets';
export const CALIBRATION = 'research/sources/person/work/producer-calibration.json';
export const READINGS = 'tools/person/markets-producer/readings.json';
export const OUTPUT = 'src/person/producing/markets.json';
/** The map's places, a file a country, and the zones the clock keeps. */
export const PLACES = 'src/world/gazetteer/places';
export const ZONES = 'src/core/time/tzdb.json';
/** The register's facts: a market's research, its blockers, and the calibration. */
export const FACT = 'person.markets.producer.';
export const BLOCKED = 'person.markets.producer.blocked.';
export const CALIBRATED = 'person.work.producer.calibration';
/** The market the producer's engine keeps itself (R-4612). */
export const KEPT = 'GB';
/** What a market's research can leave unknown, as its blockers name it. */
export const ITEMS = ['fund', 'incentive', 'feecap', 'outcomes', 'market', 'union', 'language', 'terms', 'none', 'rules', 'fund.primary'] as const;

export type Item = (typeof ITEMS)[number];
/** From one amount to another, both counted; to none, without end. */
export type Range = readonly [number, number | null];

/** A rate paid on the part of what is counted from one amount to another (to none: the rest). */
export interface Band {
  from: number;
  to: number | null;
  rate: number;
}
/** What a term gives a project whose budget is in its range: a fixed sum, or its bands on the share counted, at most so much. */
export interface Tier {
  budget: Range;
  bands: Band[];
  /** The share of the budget counted. */
  base: number;
  /** Counted net of its own share (a fee of so much of the costs without it, as the research's example counts it). */
  net: boolean;
  most: number | null;
  sum: number | null;
  /** The currency its bounds, bands and most are set in, where it isn't the market's (an incentive's alone). */
  currency?: CurrencyCode;
}
export interface Fund {
  rate: number;
  tiers: Tier[];
}
export interface Market {
  currency: CurrencyCode;
  fund: Fund | null;
  /** The cap on all public aid together, the credit with it; where no tier holds the budget, none. */
  aid: Tier[];
  /** The incentive; none where the research says there is none, null where it doesn't give it. */
  credit: Tier[] | null;
  /** Each cap on the producer's fee or the company's overheads. */
  fees: Tier[][];
  release: { budget: Range; rate: number }[] | null;
  unknown: Item[];
  /** The zone of its most populous place on the map; none where the map has none. */
  zone: string | null;
  /** Whether its incentive is paid only to a production from abroad, as its research's own words limit it. */
  foreignOnly: boolean;
  /** What a series and a play made there can draw on. */
  series: Terms;
  stage: Terms;
}
export type Markets = Record<string, Market>;

/** The formats a market's research reads apart from a film: a series and a play. */
export const PARTS = ['series', 'stage'] as const;
export type Part = (typeof PARTS)[number];
/** What a series' or a play's research seeks (its blockers name it `<part>.<item>`): its incentive, its fund, a series' fee cap, and how it fares. */
export const PART_ITEMS: Readonly<Record<Part, readonly PartItem[]>> = { series: ['incentive', 'fund', 'feecap', 'outcomes'], stage: ['incentive', 'fund', 'outcomes'] };
export type PartItem = 'incentive' | 'fund' | 'feecap' | 'outcomes';
/** What a series' incentive may set its terms by: each episode, each hour, each minute. */
export const UNITS = ['episode', 'hour', 'minute'] as const;
export type Unit = (typeof UNITS)[number];
/**
 * An incentive for a series or a play: its tiers, by the budget (or, where it sets its terms `per` episode, hour or minute,
 * by the budget of each, its most each one's); nothing below its `least` budget or under its least episodes or
 * minutes an episode; at most its `most` in all.
 */
export interface Credit {
  tiers: Tier[];
  per: Unit | null;
  least: number | null;
  most: number | null;
  episodes: number | null;
  minutes: number | null;
  /** The currency its tiers, least and most are set in, where it isn't the market's. */
  currency?: CurrencyCode;
}
/** What a series or a play can draw on in a market, as a film's are, and what its research couldn't find. */
export interface Terms {
  fund: Fund | null;
  aid: Tier[];
  credit: Credit | null;
  foreignOnly: boolean;
  fees: Tier[][];
  unknown: PartItem[];
}

interface Figure {
  /** A series' or a play's figure's part: which of the two it is of. */
  part?: string;
  item: string;
  value: unknown;
  /** What each of its sources (by its place in the file's) said of it. */
  sources?: { src: number; said: string }[];
}
export interface Research {
  country: string;
  figures: Figure[];
  blockers: { item: string }[];
  sources?: { kind: string }[];
}
/** The figures a reading may point into: the market's own, and the calibration's; a series' or a play's reading, its film's (`in: "film"`) too. */
export interface Sources {
  country: string;
  own: Research;
  calibration: Research;
  film?: Research;
}
interface Register {
  entries: { fact: string; value?: { file?: string; sha256?: string }; attempts?: { result: string }[] }[];
}

const record = (v: unknown, what: string): Record<string, unknown> => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new Error(`${what} is not an object`);
  return v as Record<string, unknown>;
};

const only = (m: Record<string, unknown>, keys: readonly string[], what: string) => {
  for (const k of Object.keys(m)) if (!keys.includes(k)) throw new Error(`${what} names ${k}, which the game doesn't read`);
};

/** The figure a reading points at: the market's own, or (`in: "calibration"`) the calibration's, or (`in: "film"`, a series' or a play's reading) its film's. */
export function figureOf(s: Sources, at: Record<string, unknown>): Figure {
  const where = at['in'] ?? 'own';
  const from = where === 'own' ? s.own : where === 'calibration' ? s.calibration : where === 'film' ? s.film : undefined;
  if (from === undefined) throw new Error(`a figure is the market's own or the calibration's, not ${String(at['in'])}'s`);
  const f = typeof at['fig'] === 'number' ? from.figures[at['fig']] : undefined;
  if (f === undefined) throw new Error(`${s.country} has no ${where === 'own' ? '' : `${String(where)} `}figure ${String(at['fig'])}`);
  return f;
}

/** What stands at a path in a figure's value. */
export function at(v: unknown, path: readonly (string | number)[]): unknown {
  let here = v;
  for (const key of path) {
    if (typeof here !== 'object' || here === null || !Object.hasOwn(here, key)) throw new Error(`has nothing at ${path.join('.')}`);
    here = (here as Record<string, unknown>)[key];
  }
  return here;
}

/** Every number a value holds. */
export function numbersIn(v: unknown): number[] {
  if (typeof v === 'number') return [v];
  if (typeof v !== 'object' || v === null) return [];
  return Object.values(v).flatMap(numbersIn);
}

/** A number as a figure's words may write it: with its thousands, in millions or billions, or as a percentage. */
export function written(n: number): string[] {
  return [n.toLocaleString('en-US'), `${n / 1e6}m`, `${n / 1e6} million`, `${n / 1e9}bn`, `${n / 1e9} billion`, `${Math.round(n * 1e6) / 1e4}%`];
}

/**
 * Whether a number stands in a figure: nought always; else among its value's numbers, or written in its words (not
 * inside a longer number, its thousands' commas counted, nor a count of millions or billions); a bound may stand one minor unit off it (one "under" or "over" a figure, written inside it).
 */
export function stands(f: Figure, n: number, decimals: number, bound: boolean): boolean {
  if (n === 0) return true;
  const scale = 10 ** decimals;
  const nums = numbersIn(f.value);
  const text = JSON.stringify(f);
  const m = Math.round(n * scale);
  return (bound ? [m, m + 1, m - 1] : [m]).some((c) => {
    const x = c / scale;
    return nums.includes(x) || written(x).some((w) => new RegExp(`(?<![\\d.]|\\d,)${w.replace(/\./g, '\\.')}(?![\\d]|[,.]\\d|\\s?(?:m|bn|million|billion)\\b)`).test(text));
  });
}

/** The context a tier is read in: the market, its currency, the figure its values stand in by default. */
interface Reading {
  s: Sources;
  currency: CurrencyCode;
  fig: Figure | null;
}

const figureFor = (r: Reading, what: string): Figure => {
  if (r.fig === null) throw new Error(`${r.s.country}'s ${what} names no figure`);
  return r.fig;
};

/**
 * A number a reading gives: a path in its figure's value (or `{fig, in, path}` in another's), or a number written in
 * the reading that stands in the figure. Read as a rate (0 to 1) or an amount (above nought, in the market's currency,
 * its figure naming it).
 */
export function valueOf(r: Reading, v: unknown, kind: 'rate' | 'amount', what: string): number {
  let fig: Figure;
  let n: unknown;
  if (typeof v === 'number') {
    fig = figureFor(r, what);
    if (!stands(fig, v, kind === 'rate' ? 4 : minorUnits(r.currency), false)) throw new Error(`${r.s.country}'s ${what} ${v} doesn't stand in its figure`);
    n = v;
  } else if (Array.isArray(v)) {
    fig = figureFor(r, what);
    n = at(fig.value, v as (string | number)[]);
  } else {
    const ref = record(v, `${r.s.country}'s ${what}`);
    only(ref, ['fig', 'in', 'path'], `${r.s.country}'s ${what}`);
    fig = figureOf(r.s, ref);
    n = at(fig.value, ref['path'] as (string | number)[]);
  }
  if (typeof n !== 'number') throw new Error(`${r.s.country}'s ${what} isn't a number`);
  if (kind === 'rate' && !(n >= 0 && n <= 1)) throw new Error(`${r.s.country}'s ${what} ${n} isn't a rate`);
  if (kind === 'amount') {
    if (!(n > 0)) throw new Error(`${r.s.country}'s ${what} ${n} isn't an amount`);
    fromMajor(r.currency, String(n));
    if (!JSON.stringify(fig).includes(r.currency)) throw new Error(`${r.s.country}'s ${what} stands in a figure that doesn't name ${r.currency}`);
  }
  return n;
}

/** A bound of a tier or band: an amount in the currency, standing in its figure (nought, or none, always does). */
export function boundOf(r: Reading, v: unknown, what: string): number {
  if (typeof v !== 'number' || !(v >= 0)) throw new Error(`${r.s.country}'s ${what} ${String(v)} isn't a bound`);
  fromMajor(r.currency, String(v));
  if (v === 0) return 0;
  const fig = figureFor(r, what);
  if (!stands(fig, v, minorUnits(r.currency), true)) throw new Error(`${r.s.country}'s ${what} ${v} doesn't stand in its figure`);
  if (!JSON.stringify(fig).includes(r.currency)) throw new Error(`${r.s.country}'s ${what} stands in a figure that doesn't name ${r.currency}`);
  return v;
}

/** A bound of a range: in the range's figure, or (`{fig, in, bound}`) in another, where a term ends at another's start. */
function endOf(r: Reading, v: unknown): number {
  if (typeof v !== 'object' || v === null) return boundOf(r, v, 'budget');
  const ref = record(v, `${r.s.country}'s bound`);
  only(ref, ['fig', 'in', 'bound'], `${r.s.country}'s bound`);
  return boundOf({ ...r, fig: figureOf(r.s, ref) }, ref['bound'], 'budget');
}

/** A range of budgets, from one bound to a greater one or none; given bare (in the tier's figure) or as `{fig, in, range}`. */
export function rangeOf(r: Reading, v: unknown): Range {
  let here = r;
  let pair = v;
  if (!Array.isArray(v)) {
    const ref = record(v, `${r.s.country}'s budget`);
    only(ref, ['fig', 'in', 'range'], `${r.s.country}'s budget`);
    here = { ...r, fig: figureOf(r.s, ref) };
    pair = ref['range'];
  }
  if (!Array.isArray(pair) || pair.length !== 2) throw new Error(`${r.s.country}'s budget is a pair`);
  const lo = endOf(here, pair[0]);
  const hi = pair[1] === null ? null : endOf(here, pair[1]);
  if (hi !== null && hi < lo) throw new Error(`${r.s.country}'s budget runs from ${lo} down to ${hi}`);
  return [lo, hi];
}

const TIER_KEYS = ['fig', 'in', 'budget', 'share', 'bands', 'base', 'net', 'most', 'sum', 'currency'];

/**
 * One tier: its budgets, and a fixed sum, or a share or bands of the share counted, at most so much; or (`bare`) none of
 * them. Where it may (`foreign`, an incentive's), its amounts may be set in another currency it names, which its figures name.
 */
export function tierOf(s: Sources, market: CurrencyCode, reading: unknown, bare = false, foreign = false): Tier {
  const t = record(reading, `${s.country}'s tier`);
  only(t, TIER_KEYS, `${s.country}'s tier`);
  const own = t['currency'];
  if (own !== undefined && (!foreign || own === market || !isCurrency(String(own)))) throw new Error(`${s.country}'s tier is set in ${String(own)}, which isn't another currency an incentive may be set in`);
  const currency = (own ?? market) as CurrencyCode;
  const r: Reading = { s, currency, fig: t['fig'] === undefined ? null : figureOf(s, t) };
  const named = own === undefined ? {} : { currency };
  const budget = rangeOf(r, t['budget']);
  const net = t['net'] === true;
  if (t['sum'] !== undefined) {
    if (t['share'] !== undefined || t['bands'] !== undefined || t['base'] !== undefined || t['most'] !== undefined || net) throw new Error(`${s.country}'s tier is a sum or a share, not both`);
    return { budget, bands: [], base: 1, net: false, most: null, sum: valueOf(r, t['sum'], 'amount', 'sum'), ...named };
  }
  if (t['share'] !== undefined && t['bands'] !== undefined) throw new Error(`${s.country}'s tier is a share or bands, not both`);
  const bands: Band[] = [];
  if (t['share'] !== undefined) bands.push({ from: 0, to: null, rate: valueOf(r, t['share'], 'rate', 'share') });
  if (t['bands'] !== undefined) {
    if (!Array.isArray(t['bands']) || t['bands'].length < 2) throw new Error(`${s.country}'s bands are two or more`);
    for (const b of t['bands'] as unknown[]) {
      const band = record(b, `${s.country}'s band`);
      only(band, ['from', 'to', 'rate'], `${s.country}'s band`);
      const from = boundOf(r, band['from'], 'band');
      const to = band['to'] === null ? null : boundOf(r, band['to'], 'band');
      const last = bands.at(-1);
      if (from !== (last === undefined ? 0 : last.to) || (to !== null && to <= from)) throw new Error(`${s.country}'s bands run from nought, each from where the last ends`);
      bands.push({ from, to, rate: valueOf(r, band['rate'], 'rate', 'band rate') });
    }
  }
  if (bands.length === 0 && !bare) throw new Error(`${s.country}'s tier gives nothing`);
  if (net && bands.length !== 1) throw new Error(`${s.country}'s tier is counted net of one share`);
  const most = t['most'] === undefined ? null : valueOf(r, t['most'], 'amount', 'most');
  return { budget, bands, base: t['base'] === undefined ? 1 : valueOf(r, t['base'], 'rate', 'base'), net, most, sum: null, ...named };
}

/** Whether two ranges of budgets meet. */
export const meet = (a: Range, b: Range): boolean => a[0] <= (b[1] ?? Infinity) && b[0] <= (a[1] ?? Infinity);

/** A term's tiers, none of whose budgets meet another's, in the order of their budgets. */
export function tiersOf(s: Sources, currency: CurrencyCode, reading: unknown, what: string, bare = false, foreign = false): Tier[] {
  if (!Array.isArray(reading)) throw new Error(`${s.country}'s ${what} is a list of tiers`);
  const tiers = reading.map((t) => tierOf(s, currency, t, bare, foreign)).sort((a, b) => a.budget[0] - b.budget[0]);
  for (const [i, t] of tiers.entries()) if (i > 0 && meet((tiers[i - 1] as Tier).budget, t.budget)) throw new Error(`${s.country}'s ${what} has two tiers for one budget`);
  return tiers;
}

/** How often a fund says yes: a rate at its place, or so many funded of so many applied. */
export function rateOf(s: Sources, reading: unknown): number {
  const r = record(reading, `${s.country}'s rate`);
  only(r, ['fig', 'in', 'path', 'of'], `${s.country}'s rate`);
  const fig = figureOf(s, r);
  if (r['of'] === undefined) {
    const n = at(fig.value, r['path'] as (string | number)[]);
    if (typeof n !== 'number' || !(n > 0 && n <= 1)) throw new Error(`${s.country}'s rate isn't a chance`);
    return n;
  }
  if (r['path'] !== undefined) throw new Error(`${s.country}'s rate is so many of so many`);
  return ofIn(s, fig, r['of'], 'rate');
}

/** So many of so many, at two places in a figure: a count of some, and of all, the some at least one. */
export function ofIn(s: Sources, fig: Figure, of: unknown, what: string): number {
  if (!Array.isArray(of) || of.length !== 2) throw new Error(`${s.country}'s ${what} is so many of so many`);
  const [yes, all] = (of as (string | number)[][]).map((p) => at(fig.value, p));
  if (!Number.isSafeInteger(yes) || !Number.isSafeInteger(all) || !((yes as number) > 0 && (yes as number) <= (all as number))) throw new Error(`${s.country}'s ${what} isn't so many of so many`);
  return (yes as number) / (all as number);
}

/** A market's fund: how often it says yes, and its tiers; none where the reading gives none. */
export function fundOf(s: Sources, currency: CurrencyCode, reading: unknown, aid: readonly Tier[]): Fund | null {
  if (reading === null) return null;
  const f = record(reading, `${s.country}'s fund`);
  only(f, ['rate', 'tiers'], `${s.country}'s fund`);
  const tiers = tiersOf(s, currency, f['tiers'], 'fund', true);
  // An award up to so much gives that much; a tier with nothing at all is held only by the cap on all public aid.
  if (aid.length === 0 && tiers.some((t) => t.bands.length === 0 && t.most === null && t.sum === null)) throw new Error(`${s.country}'s tier gives nothing`);
  return { rate: rateOf(s, f['rate']), tiers };
}

/** A market's incentive: its tiers, any set in another currency; none (no tiers) where the research says there's none; null where it isn't given. */
export function creditOf(s: Sources, currency: CurrencyCode, reading: unknown): Tier[] | null {
  if (reading === null) return null;
  if (Array.isArray(reading)) {
    const tiers = tiersOf(s, currency, reading, 'incentive', false, true);
    // Its tiers are ordered and kept apart by their bounds, so they are set in one currency.
    if (new Set(tiers.map((t) => t.currency)).size > 1) throw new Error(`${s.country}'s incentive is set in more than one currency`);
    return tiers;
  }
  const n = record(reading, `${s.country}'s incentive`);
  only(n, ['none'], `${s.country}'s incentive`);
  const none = record(n['none'], `${s.country}'s none`);
  only(none, ['fig', 'in', 'path'], `${s.country}'s none`);
  const path = none['path'] as (string | number)[];
  const v = at(figureOf(s, none).value, path);
  // False, or none (null) where the place itself names the incentive (a rebate, an incentive, cash), as the research writes there's none.
  if (v !== false && !(v === null && /rebate|incentive|^cash$/i.test(String(path.at(-1))))) throw new Error(`${s.country}'s research doesn't say it has no incentive`);
  return [];
}

/**
 * Whether a market's incentive is paid only to a production from abroad: where the reading names the words of the
 * incentive's figure that limit it so, each standing in what a primary source of the figure said; no limit where it names
 * none. Refused on an incentive that pays nothing or isn't known, since nothing would read the limit.
 */
export function foreignOnlyOf(s: Sources, reading: unknown, credit: readonly Tier[] | null): boolean {
  if (reading === undefined) return false;
  const r = record(reading, `${s.country}'s limit`);
  only(r, ['fig', 'said'], `${s.country}'s limit`);
  if (credit === null || credit.length === 0) throw new Error(`${s.country}'s incentive pays nothing the game knows, so nothing reads a limit on it`);
  const f = figureOf(s, r);
  const said = r['said'];
  if (f.item !== 'incentive') throw new Error(`${s.country}'s figure ${String(r['fig'])} isn't its incentive`);
  if (typeof said !== 'string' || said === '' || !(f.sources ?? []).some((x) => x.said.includes(said) && s.own.sources?.[x.src]?.kind === 'primary')) throw new Error(`${s.country}'s incentive's primary sources don't say "${String(said)}"`);
  return true;
}

/** A market's chance of a release by budget. */
export function releaseOf(s: Sources, currency: CurrencyCode, reading: unknown): { budget: Range; rate: number }[] | null {
  if (reading === null) return null;
  if (!Array.isArray(reading) || reading.length === 0) throw new Error(`${s.country}'s release is a list of tiers`);
  const tiers = reading.map((x) => {
    const t = record(x, `${s.country}'s release`);
    only(t, ['fig', 'in', 'budget', 'rate'], `${s.country}'s release`);
    const r: Reading = { s, currency, fig: figureOf(s, t) };
    const rate = t['rate'];
    const of = Object.hasOwn(Object(rate), 'of');
    if (of) only(rate as Record<string, unknown>, ['of'], `${s.country}'s release rate`);
    return { budget: rangeOf(r, t['budget']), rate: of ? ofIn(s, r.fig as Figure, (rate as Record<string, unknown>)['of'], 'release rate') : valueOf(r, rate, 'rate', 'release rate') };
  });
  tiers.sort((a, b) => a.budget[0] - b.budget[0]);
  for (const [i, t] of tiers.entries()) if (i > 0 && meet((tiers[i - 1] as { budget: Range }).budget, t.budget)) throw new Error(`${s.country}'s release has two tiers for one budget`);
  return tiers;
}

/** The items a file's blockers name, each once, in the research's order. */
export function unknownOf(blockers: readonly { item: string }[]): Item[] {
  const out: Item[] = [];
  for (const { item } of blockers) {
    if (!ITEMS.includes(item as Item)) throw new Error(`a blocker names ${item}, which isn't a fact the research seeks`);
    if (!out.includes(item as Item)) out.push(item as Item);
  }
  return out;
}

/** The zone of a country's most populous place on the map (the first of them in its file), one the clock keeps; none where it has no place. */
export function zoneIn(root: string, cc: string, zones: ReadonlySet<string>): string | null {
  const file = join(root, PLACES, `${cc}.tsv`);
  if (!existsSync(file)) return null;
  let best = { zone: '', population: -1 };
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const cells = line.split('\t');
    const population = Number(cells[7]);
    if (cells.length === 9 && population > best.population) best = { zone: cells[6] as string, population };
  }
  if (!zones.has(best.zone)) throw new Error(`${cc}'s most populous place is in ${best.zone}, which isn't a zone the clock keeps`);
  return best.zone;
}

/** A market, as its reading reads its research. */
export function marketOf(s: Sources, reading: unknown): Omit<Market, 'zone' | Part> {
  const m = record(reading, `the reading of ${s.country}`);
  only(m, ['currency', 'fund', 'aid', 'credit', 'foreignOnly', 'fees', 'release', ...PARTS], `the reading of ${s.country}`);
  const own = (countries as Record<string, { currency: string }>)[s.country]?.currency;
  const currency = String(m['currency'] ?? own);
  if (!isCurrency(currency)) throw new Error(`${s.country} pays in ${currency}, which isn't a currency`);
  if (currency !== own && !JSON.stringify(s.own.figures).includes(currency)) throw new Error(`${s.country}'s research gives no term in ${currency}, which isn't its country's`);
  const aid = m['aid'] === undefined ? [] : tiersOf(s, currency, m['aid'], 'aid');
  const fund = fundOf(s, currency, m['fund'] ?? null, aid);
  if (fund === null && aid.length > 0) throw new Error(`${s.country}'s cap on public aid holds no fund`);
  const fees = m['fees'] ?? [];
  if (!Array.isArray(fees)) throw new Error(`${s.country}'s fees are a list`);
  const credit = creditOf(s, currency, m['credit'] ?? null);
  return { currency, fund, aid, credit, foreignOnly: foreignOnlyOf(s, m['foreignOnly'], credit), fees: fees.map((f) => tiersOf(s, currency, f, 'fee')), release: releaseOf(s, currency, m['release'] ?? null), unknown: unknownOf(s.own.blockers) };
}

/** A file the register cites by a fact, checked against its SHA-256 before a byte is read. */
export function cited(root: string, register: Register, fact: string, file: string): Research {
  // Stryker disable next-line OptionalChaining: the entry found names the file, so it has a value.
  const sha = register.entries.find((e) => e.fact === fact && e.value?.file === file)?.value?.sha256;
  if (sha === undefined) throw new Error(`${file} isn't cited by the register`);
  const bytes = readFileSync(join(root, file));
  if (createHash('sha256').update(bytes).digest('hex') !== sha) throw new Error(`${file} isn't the file the register cites`);
  return JSON.parse(bytes.toString('utf8')) as Research;
}

/** A market's research, and whether the register holds its blockers. */
export function readResearch(root: string, register: Register, cc: string): { research: Research; blocked: boolean } {
  const file = `${SOURCES}/producer-${cc}.json`;
  const blocker = register.entries.find((e) => e.fact === `${BLOCKED}${cc}`);
  // A country whose research found nothing is cited by its blockers alone: what wasn't found is each attempt's.
  if (blocker !== undefined && !register.entries.some((e) => e.fact === `${FACT}${cc}`)) return { research: { country: cc, figures: [], blockers: (blocker.attempts ?? []).map(({ result }) => ({ item: result.replace(/^not found: /, '') })) }, blocked: true };
  const research = cited(root, register, `${FACT}${cc}`, file);
  if (research.country !== cc) throw new Error(`${file} is ${research.country}'s`);
  return { research, blocked: blocker !== undefined };
}

/** Where a series' and a play's research is kept beside the UK's (tvstage-<CC>.json), and the suffix of its register facts. */
export const TVSTAGE = 'research/sources/person/work';
export const TV = '.tvstage';

/** The items a series' or a play's blockers name for a part (`<part>.<item>`), each once, in the research's order; refused for one it doesn't seek. */
export function partUnknownOf(blockers: readonly { item: string }[], part: Part): PartItem[] {
  const out: PartItem[] = [];
  for (const { item } of blockers) {
    const [p, i, ...rest] = item.split('.');
    if (rest.length > 0 || !PARTS.includes(p as Part) || !PART_ITEMS[p as Part].includes(i as PartItem)) throw new Error(`a blocker names ${item}, which isn't a fact a series' or a play's research seeks`);
    if (p === part && !out.includes(i as PartItem)) out.push(i as PartItem);
  }
  return out;
}

/** A count a reading gives (episodes, minutes): a whole number at a place in its figure, or written in the reading and standing in it. */
export function countOf(r: Reading, v: unknown, what: string): number {
  const fig = figureFor(r, what);
  const n = Array.isArray(v) ? at(fig.value, v as (string | number)[]) : v;
  if (!Number.isSafeInteger(n) || (n as number) < 1) throw new Error(`${r.s.country}'s ${what} isn't a count`);
  if (!Array.isArray(v) && !stands(fig, n as number, 0, false)) throw new Error(`${r.s.country}'s ${what} ${String(n)} doesn't stand in its figure`);
  return n as number;
}

const CREDIT_KEYS = ['fig', 'in', 'tiers', 'per', 'least', 'most', 'episodes', 'minutes'];

/**
 * A series' or a play's incentive: tiers as a film's (or none, `{none}`), or (`{tiers, ...}`) tiers with the terms a
 * series' sets: its tiers by the budget of each episode, hour or minute (`per`), its least budget and most in all (each
 * an amount standing in its figure, in its tiers' currency), its least episodes and minutes an episode (a series' alone);
 * null where it isn't given.
 */
export function partCreditOf(s: Sources, currency: CurrencyCode, reading: unknown, part: Part): Credit | null {
  if (reading === undefined) return null;
  const plain = { per: null, least: null, most: null, episodes: null, minutes: null };
  if (Array.isArray(reading) || Object.hasOwn(Object(reading), 'none')) return { tiers: creditOf(s, currency, reading) as Tier[], ...plain };
  const c = record(reading, `${s.country}'s ${part} incentive`);
  only(c, CREDIT_KEYS, `${s.country}'s ${part} incentive`);
  if (!Array.isArray(c['tiers'])) throw new Error(`${s.country}'s ${part} incentive has its tiers`);
  const tiers = creditOf(s, currency, c['tiers']) as Tier[];
  const per = (c['per'] ?? null) as Unit | null;
  if (per !== null && !UNITS.includes(per)) throw new Error(`${s.country}'s ${part} incentive is set by the episode, the hour or the minute, not ${String(per)}`);
  if (part === 'stage' && [c['per'], c['episodes'], c['minutes']].some((x) => x !== undefined)) throw new Error(`a play has no episodes`);
  const set = tiers[0]?.currency;
  const r: Reading = { s, currency: set ?? currency, fig: c['fig'] === undefined ? null : figureOf(s, c) };
  const amountAt = (k: string) => (c[k] === undefined ? null : valueOf(r, c[k], 'amount', k));
  const countAt = (k: string) => (c[k] === undefined ? null : countOf(r, c[k], k));
  const out: Credit = { tiers, per, least: amountAt('least'), most: amountAt('most'), episodes: countAt('episodes'), minutes: countAt('minutes'), ...(set === undefined ? {} : { currency: set }) };
  if (tiers.length === 0 && Object.values(out).some((x) => x !== null && !Array.isArray(x))) throw new Error(`${s.country}'s ${part} incentive pays nothing, so it sets no terms`);
  return out;
}

const TERMS_KEYS = ['fund', 'aid', 'credit', 'foreignOnly', 'fees'];

/**
 * A series' or a play's terms in a market, read as a film's are from its own research (tvstage-<CC>.json; its film's
 * with `in: "film"`), each item it seeks read or blocked, never both, never neither; how it fares is always blocked, the
 * game's own reading standing in. A play's research seeks no fee cap.
 */
export function termsOf(s: Sources, currency: CurrencyCode, reading: unknown, part: Part): Terms {
  const r = reading === undefined ? {} : record(reading, `the reading of ${s.country}'s ${part}`);
  only(r, TERMS_KEYS, `the reading of ${s.country}'s ${part}`);
  if (part === 'stage' && r['fees'] !== undefined) throw new Error("a play's research seeks no fee cap");
  const aid = r['aid'] === undefined ? [] : tiersOf(s, currency, r['aid'], 'aid');
  const fund = fundOf(s, currency, r['fund'] ?? null, aid);
  if (fund === null && aid.length > 0) throw new Error(`${s.country}'s cap on public aid holds no fund`);
  const credit = partCreditOf(s, currency, r['credit'], part);
  const fees = r['fees'] ?? [];
  if (!Array.isArray(fees)) throw new Error(`${s.country}'s fees are a list`);
  const limit = r['foreignOnly'];
  if ((Object(limit) as Record<string, unknown>)['in'] !== undefined) throw new Error(`${s.country}'s ${part} limit is read in its own research`);
  if (limit !== undefined && figureOf(s, record(limit, `${s.country}'s limit`)).part !== part) throw new Error(`${s.country}'s figure ${String((limit as Record<string, unknown>)['fig'])} isn't its ${part}'s`);
  const unknown = partUnknownOf(s.own.blockers, part);
  const read: Record<PartItem, boolean> = { incentive: credit !== null, fund: fund !== null, feecap: r['fees'] !== undefined, outcomes: false };
  for (const item of PART_ITEMS[part]) if (read[item] === unknown.includes(item)) throw new Error(`${s.country}'s ${part} ${item} is ${read[item] ? 'read and blocked both' : 'neither read nor blocked'}`);
  return { fund, aid, credit, foreignOnly: foreignOnlyOf(s, limit, credit?.tiers ?? null), fees: fees.map((f) => tiersOf(s, currency, f, 'fee')), unknown };
}

/** A market's series' and play's research, as the register cites it (person.markets.producer.<CC>.tvstage); where it found nothing, every item its blockers' (person.markets.producer.blocked.<CC>.tvstage). */
export function readTvstage(root: string, register: Register, cc: string): Research {
  const blocker = register.entries.some((e) => e.fact === `${BLOCKED}${cc}${TV}`);
  if (!register.entries.some((e) => e.fact === `${FACT}${cc}${TV}`)) {
    if (!blocker) throw new Error(`the register holds no research of ${cc}'s series and plays`);
    return { country: cc, figures: [], blockers: PARTS.flatMap((p) => PART_ITEMS[p].map((i) => ({ item: `${p}.${i}` }))) };
  }
  const file = `${TVSTAGE}/tvstage-${cc}.json`;
  const research = cited(root, register, `${FACT}${cc}${TV}`, file);
  if (research.country !== cc) throw new Error(`${file} is ${research.country}'s`);
  if (blocker !== research.blockers.length > 0) throw new Error(blocker ? `the register holds ${cc}'s series' and plays' blockers, which its research doesn't` : `${cc}'s series' and plays' research has blockers the register doesn't hold`);
  return research;
}

/** Every market the research holds, read as the readings say; a file without a reading, or a reading without a file, is refused. */
export function readMarkets(root: string): Markets {
  const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8')) as unknown;
  const readings = record(read(READINGS), 'the readings');
  const register = read('research/register.json') as Register;
  const calibration = cited(root, register, CALIBRATED, CALIBRATION);
  const tz = read(ZONES) as { zones: object; links: object };
  const zones = new Set([...Object.keys(tz.zones), ...Object.keys(tz.links)]);
  // Stryker disable next-line MethodExpression: the directory's order is sorted on the file systems the gate runs on; the sort holds it on any other.
  const files = existsSync(join(root, SOURCES)) ? readdirSync(join(root, SOURCES)).filter((f) => /^producer-[A-Z]{2}\.json$/.test(f)).map((f) => f.slice(9, 11)).sort() : [];
  for (const cc of Object.keys(readings).filter((c) => !files.includes(c))) throw new Error(`${cc} has a reading and no research`);
  const out: Markets = {};
  for (const cc of files) {
    if (cc === KEPT) throw new Error(`${KEPT} is the market the engine keeps itself`);
    if (!Object.hasOwn(readings, cc)) throw new Error(`${SOURCES}/producer-${cc}.json has no reading`);
    const { research, blocked } = readResearch(root, register, cc);
    if (readings[cc] === null) {
      if (research.blockers.length > 0 || blocked) throw new Error(`${cc} is no market, so what of it isn't known can't be told`);
      continue;
    }
    const market = marketOf({ country: cc, own: research, calibration }, readings[cc]);
    if (blocked !== market.unknown.length > 0) throw new Error(blocked ? `the register holds ${cc}'s blockers, which its research doesn't` : `${cc}'s research has blockers the register doesn't hold`);
    const parts = { country: cc, own: readTvstage(root, register, cc), calibration, film: research };
    const reading = readings[cc] as Record<string, unknown>;
    out[cc] = { ...market, series: termsOf(parts, market.currency, reading['series'], 'series'), stage: termsOf(parts, market.currency, reading['stage'], 'stage'), zone: zoneIn(root, cc, zones) };
  }
  return out;
}

export const serialize = (m: Markets) => `${JSON.stringify(m, null, 1)}\n`;
