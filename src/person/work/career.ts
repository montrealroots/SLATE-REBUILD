import { defineCommand, type Context } from '../../core/frame/frame.ts';
import { compare, fromMajor, money, multiply, roundHalfEven, type CurrencyCode, type Money } from '../../core/money/money.ts';
import { t, type LineId } from '../../core/text/text.ts';
import { countryName, type CountryCode } from '../../world/gazetteer/gazetteer.ts';
import { componentOf, componentValues, facetSkill, practise, skillOf, type AttributesSlice } from '../attributes/attributes.ts';
import { genreOf } from '../genres/genres.ts';
import type { Level } from '../identity/identity.ts';
import compiled from './markets.json' with { type: 'json' };
import { partScore, PARTS, scriptOf, spread, type Form, type Script, type ScriptsSlice } from './work.ts';

/**
 * The screenwriter's work with people and what the life's own production pays for a script: the attributes that work
 * with people (workbench/plans/screenwriter-attributes.md, 13 and 21 to 26), each acting through the facets the sources
 * name (R-4607), on the trade's own figures where it publishes them (R-4608, R-4241).
 *
 * A script is written for the life's own productions, never sold or optioned to another's (the owner, 2026-11-04: "Remove
 * spec sales too"). Its spec market (contacts asked to read, cold queries, pitch meetings that sold a script or took an
 * option for a year, the meeting's visit abroad) was removed that day, with the Scoggins Report's share of specs sold and
 * the query services' cold rate it read, because no script goes to anyone else's production now. What stays bites on
 * the life's own production (src/person/producing):
 *
 * - A script's documents (Synopsis): the ten the sources name, logline to scriptment, each written on its own; the best
 *   of the five a pitch puts forward goes with the writer's pitch to the production's financiers.
 * - Networking (Networking, Speaking, Social Perceptiveness): the contacts days among the trade make, each a door open to
 *   the market the production raises its money from.
 * - The writer's pitch (Pitching, Speaking, Persuasion, the pitch documents): beside the producer's, where the
 *   production makes the life's script.
 * - What the production pays for the script (src/person/work/markets.json, compiled by tools/person/markets-writer from
 *   the research of every country, register facts person.markets.writer.<CC>): the minimum of the writers' agreement of
 *   the country it is made in (the WGA's in the US; or, where the research says a writer there is engaged on another
 *   market's terms, as in France's overseas departments, that market's), for the form, the kind of script (fiction,
 *   documentary, animation: its genre's BFI group) and the production's budget and running time where its minimums turn
 *   on them, on the first day of photography, or its wage floor for each day the script was written where the
 *   research's source says the floor reaches a writer (Andorra's artists' statute); none where the research says no
 *   agreement sets the pay, left to negotiation; refused, and told, where the research couldn't find whether an
 *   agreement sets it, or its figures. The script is paid for whole that day: what an agreement holds back until
 *   photography is due with the rest. The writer must write one of the agreement's languages (identity's languages).
 *
 * The writer works alone (the owner, 2026-11-01: "just get rid of all the team stuff because I will be a solo writer"):
 * no writers' room, staffing or ladder of titles.
 *
 * What the trade doesn't publish (how likely a contact is made in a day) is the game's own until the owner balances it (person.career.model).
 */

/** The forms written for the screen, which the screen's agreements pay; a play is paid under a theatre's (PLAYS). */
export type Screen = Exclude<Form, 'play'>;

/**
 * What a production under the WGA's MBA pays for a script of each form, at the 2026 MBA's first-year minimum (R-4241): a
 * feature as an original screenplay with treatment at high budget, an episode a 60-minute network prime time story and
 * teleplay, a pilot 150% of that. The MBA binds the WGA's signatories, the US's productions; a production made in
 * another market pays by that market's agreement (markets.json).
 */
// Stryker disable next-line StringLiteral: a mutant here throws as the module loads, which Stryker 10.0.0 reports as
// surviving (HANDOFF, blockers); the test holds each fee to the cent.
export const FEES: Readonly<Record<Screen, Money | null>> = {
  // Stryker disable next-line StringLiteral: as above.
  feature: fromMajor('USD', '173215'),
  // Stryker disable next-line StringLiteral: as above.
  pilot: fromMajor('USD', '71190'),
  // Stryker disable next-line StringLiteral: as above.
  episode: fromMajor('USD', '47460'),
  short: null,
};

/**
 * The days each document needs from a writer at 100 in Writing and Time Management, twice that from one at 0. The
 * treatment is half the MBA's 6.1 weeks for the treatment step at high budget (43 days), so the slowest writer takes all
 * of it (R-4608). shortcut: the others' times aren't published (R-4608 blockers); they're the game's own until found.
 */
export const DOCUMENT_DAYS = {
  logline: 1,
  'short-synopsis': 1,
  'one-page-synopsis': 2,
  outline: 5,
  treatment: 21.5,
  'scene-breakdown': 10,
  'series-bible': 14,
  'pitch-document': 3,
  'statement-of-intent': 1,
  scriptment: 21,
} as const;

export type Document = keyof typeof DOCUMENT_DAYS;

/** What a pitch to financiers puts forward: the logline and the synopses (a query's until 2026-11-04), the pitch document and the treatment. */
export const PITCH: readonly Document[] = ['logline', 'short-synopsis', 'one-page-synopsis', 'pitch-document', 'treatment'];

/** Each script's documents written, by its quality, 0 to 100. */
export type Documents = { [document: string]: number };

export interface CareerSlice {
  contacts: number;
  documents: { [script: string]: Documents };
}

export const CAREER_START: CareerSlice = { contacts: 0, documents: {} };

/** The agreement this engine keeps itself: the WGA's MBA (R-4241), the US's. */
export const KEPT = 'wga';

/** A market's minimum as compiled (tools/person/markets-writer/compile.ts). */
type Tier = 'budget' | 'minutes' | 'hourly';
/** The kinds of script an agreement can set its minimums by. */
export type Kind = 'fiction' | 'documentary' | 'animation';
export interface Fee {
  readonly forms: readonly Form[];
  readonly kind: Kind | null;
  readonly when: Readonly<Partial<Record<Tier, readonly [number, number | null]>>>;
  readonly per: 'script' | 'minute' | 'hour' | 'day' | null;
  readonly from: string;
  readonly amount: string | null;
  readonly share: string | null;
  readonly cap: string | null;
}
export interface MarketAgreement {
  readonly country: CountryCode;
  /** None where its figures aren't known. */
  readonly languages: readonly string[];
  readonly currency: CurrencyCode | null;
  readonly forms: readonly Form[];
  readonly none: boolean;
  readonly unknown: boolean;
  readonly fees: readonly Fee[];
}
/** What a market's research couldn't find, by the item its blockers name. */
export type Unknown = 'agreement' | 'fees' | 'language' | 'union' | 'terms' | 'none' | 'follows';
export interface Market {
  readonly agreements: readonly string[];
  readonly unknown: readonly Unknown[];
}
export const MARKETS = (compiled as unknown as { markets: Readonly<Record<string, Market>> }).markets;
const COMPILED = (compiled as unknown as { agreements: Readonly<Record<string, MarketAgreement>> }).agreements;

/** A market's agreement as compiled; none for the WGA's, kept here; refused where there is none of that id. */
export function marketOf(agreement: string): MarketAgreement | null {
  if (agreement === KEPT) return null;
  if (!Object.hasOwn(COMPILED, agreement)) throw new Error(`there's no agreement ${agreement}`);
  return COMPILED[agreement] as MarketAgreement;
}

/** The country an agreement is made in, and the languages its scripts are written in: the WGA's the US's and English. */
export const countryOf = (agreement: string): CountryCode => marketOf(agreement)?.country ?? 'US';
export const languagesOf = (agreement: string): readonly string[] => marketOf(agreement)?.languages ?? ['en'];

/** A script's kind, as an agreement setting its minimums by kind reads it: its genre's BFI group (Documentary, Animation), fiction otherwise. */
export function kindOf(genre: string): Kind {
  const group = genreOf(genre).bfi;
  return group === 'Documentary' ? 'documentary' : group === 'Animation' ? 'animation' : 'fiction';
}

/** How well a writer must write a language to write a production's script in it, the game's own (person.markets.writer.model). */
export const WRITES_IN: Level = 'C1';

/** The line that tells the player what of a market isn't known. */
export const UNKEPT_LINE: LineId = 'writing.unkept';
/**
 * Each item a market's research couldn't find, as the player is told it. An option's terms were set aside here until
 * 2026-11-04, when the compile stopped reading them (tools/person/markets-writer/compile.ts, UNREAD): they priced an
 * option to another's production, which went with spec sales, so nothing the player does turns on them.
 */
export const MISSING: Readonly<Record<Unknown, string>> = {
  agreement: 'whether any agreement sets what a script is paid',
  fees: 'some of the minimums a script is paid',
  language: 'the language scripts are written in',
  union: "the guild's fees or whom it takes",
  terms: "whether any agreement, guild rate or law sets a script's terms",
  none: 'whether any fund, guild or agreement serves a writer there',
  follows: "whether the agreements of the country whose law it follows reach a script written for a production there",
};

/**
 * What the player is told of a country's market where its research couldn't find all of it: "a" or "a and b" (no
 * writer's market leaves more than two items untold, a test holds); nothing where it is known whole, or there's no
 * research of it.
 */
export function aboutCountry(country: string): string | undefined {
  if (!Object.hasOwn(MARKETS, country)) return undefined;
  const missing = (MARKETS[country] as Market).unknown.map((u) => MISSING[u]);
  if (missing.length === 0) return undefined;
  return t(UNKEPT_LINE, { country: countryName(country as CountryCode), missing: missing.join(' and ') });
}

/** What the player is told of an agreement's market where its research couldn't find all of it; nothing for the WGA's. */
export function aboutMarket(agreement: string): string | undefined {
  const a = marketOf(agreement);
  return a === null ? undefined : aboutCountry(a.country);
}

/** What a production names of itself that a minimum can turn on: the writers' agreement, its budget (major units) and running time. */
export interface Terms {
  agreement: string;
  budget: number | null;
  minutes: number | null;
}
/** What of the script itself a minimum can turn on: its genre (for its kind) and the days written into it. */
export type Work = Pick<Script, 'genre' | 'days'>;

/** What a tier turns on, for the production: its budget, the script's minutes, the budget an hour of it; refused where the production doesn't say. */
function tierOf(k: Tier, o: Terms, form: Form): number {
  if (k !== 'minutes' && o.budget === null) throw new Error(`a ${form} under ${o.agreement} names its production's budget`);
  if (k !== 'budget' && o.minutes === null) throw new Error(`a ${form} under ${o.agreement} names its running time`);
  const [budget, minutes] = [o.budget as number, o.minutes as number];
  return k === 'budget' ? budget : k === 'minutes' ? minutes : Math.floor((budget * 60) / minutes);
}

/** Whether a minimum's tiers hold for the production. */
function holds(f: Fee, o: Terms, form: Form): boolean {
  return (Object.entries(f.when) as [Tier, readonly [number, number | null]][]).every(([k, [lo, hi]]) => {
    const v = tierOf(k, o, form);
    return v >= lo && (hi === null || v <= hi);
  });
}

/** An amount an hour, for so many minutes: rounded half to even to a minor unit. */
const forMinutes = (m: Money, minutes: number): Money => money(m.currency, Number(roundHalfEven(BigInt(m.minor) * BigInt(minutes), 60n)));

/** A minimum's amount for the production: by the script, each day written, the minute or the hour; at least its share of the budget, at most its ceiling. */
function amountOf(currency: CurrencyCode, f: Fee, o: Terms, form: Form, work: Work | null): Money {
  const base = fromMajor(currency, f.amount as string);
  if (f.per === 'script') return base;
  if (f.per === 'day') {
    if (work === null) throw new Error(`a ${form} under ${o.agreement} is paid by the days it was written`);
    return multiply(base, String(work.days));
  }
  if (o.minutes === null) throw new Error(`a ${form} under ${o.agreement} names its running time`);
  const minutes = o.minutes;
  let m = f.per === 'minute' ? multiply(base, String(minutes)) : forMinutes(base, minutes);
  if (f.share !== null) {
    const share = multiply(fromMajor(currency, String(o.budget)), f.share);
    // Stryker disable next-line EqualityOperator: where the two are equal, either is the same amount.
    if (compare(share, m) > 0) m = share;
  }
  if (f.cap !== null) {
    const cap = forMinutes(fromMajor(currency, f.cap), minutes);
    // Stryker disable next-line EqualityOperator: where the two are equal, either is the same amount.
    if (compare(cap, m) < 0) m = cap;
  }
  return m;
}

/**
 * The minimum a production pays for a script of a form under an agreement on a date: the WGA's for the form; a
 * market's for the form, kind and tier, the latest begun by then; none where it is left to negotiation. Refused where
 * the agreement sets no terms for the form, the kind or the tier, the production doesn't say what its tier turns on, the
 * script isn't named where a minimum turns on it, no minimum is known by the date, or its figures aren't known (told).
 */
export function minimumOf(o: Terms, form: Screen, date: string, work: Work | null = null): Money | null {
  const a = marketOf(o.agreement);
  if (a === null) return FEES[form];
  if (a.unknown) throw new Error(aboutMarket(o.agreement) as string);
  if (!a.forms.includes(form)) throw new Error(`${o.agreement} sets no terms for a ${form}`);
  if (a.none) return null;
  const kind = (): Kind => {
    if (work === null) throw new Error(`a ${form} under ${o.agreement} names its genre`);
    return kindOf(work.genre);
  };
  const fit = a.fees.filter((f) => f.forms.includes(form) && (f.kind === null || f.kind === kind()) && holds(f, o, form));
  if (fit.length === 0) throw new Error(`${o.agreement} sets no minimum for that ${form}`);
  const fee = fit.findLast((f) => f.from <= date);
  if (fee === undefined) throw new Error(`no minimum under ${o.agreement} is known before ${(fit[0] as Fee).from}`);
  return fee.amount === null ? null : amountOf(a.currency as CurrencyCode, fee, o, form, work);
}

/** A minimum's steps: from each date (the first day it applies), the amount in pounds. */
type Steps = readonly (readonly [from: string, pounds: string])[];

/** The theatres' agreements, by their tiers: UK Theatre's by the grade, the ITC's by the minutes a play runs over. */
type Plays = { readonly 'uk-theatre-wggb': Readonly<Record<1 | 2 | 3, Steps>>; readonly 'itc-wggb': readonly { readonly over: number; readonly steps: Steps }[] };

/**
 * The agreements a play written for the life's own production is paid under in the UK (research/sources/person/work/
 * tvstage-GB.json, person.markets.writer.GB.stage), each the whole of what it pays on signature, delivery and
 * acceptance, which the production pays when it stages the play, as a film pays its script on the first day of
 * photography:
 *
 * - UK Theatre's with the WGGB and the Scottish Society of Playwrights, for subsidised theatres, by the theatre's MRSL
 *   grade, from 4 May 2026 (the earlier years' weren't read, so a play staged before is refused).
 * - The ITC's with the WGGB, for a play by an ITC member's company, by its running time (over 70 minutes, 31 to 70, 11 to
 *   30, 10 or less), each year's from its start: 2025/26 from 1 June 2025, as its rate card says; 2026/27 and 2027/28
 *   from 1 April, the day the agreement's financial terms are revised each year (the game's reading of its "relevant
 *   year", person.producing.model).
 *
 * Their royalties (at least 8% of the net box office, the advances recouped against it) aren't modelled: the game keeps
 * no box office.
 */
export const PLAYS = {
  'uk-theatre-wggb': { 1: [['2026-05-04', '11598.60']], 2: [['2026-05-04', '9383.49']], 3: [['2026-05-04', '8281.65']] },
  'itc-wggb': [
    { over: 70, steps: [['2025-06-01', '10323.00'], ['2026-04-01', '10942.38'], ['2027-04-01', '11380.08']] },
    { over: 30, steps: [['2025-06-01', '6873.75'], ['2026-04-01', '7286.18'], ['2027-04-01', '7577.62']] },
    { over: 10, steps: [['2025-06-01', '3438.00'], ['2026-04-01', '3644.28'], ['2027-04-01', '3790.05']] },
    { over: 0, steps: [['2025-06-01', '1000.00'], ['2026-04-01', '1060.00'], ['2027-04-01', '1102.40']] },
  ],
} as const satisfies Plays;
export type PlayAgreement = keyof typeof PLAYS;

/**
 * What a play's script is paid under a theatre's agreement on a date: UK Theatre's by the theatre's grade, the ITC's by
 * the running time; the latest step begun by then, the last kept past an agreement's term. Refused where the play names
 * no running time the ITC's turns on, or no minimum is known by the date.
 */
export function playMinimum(agreement: PlayAgreement, o: { grade: 1 | 2 | 3 | null; minutes: number | null }, date: string): Money {
  let steps: Steps;
  if (agreement === 'uk-theatre-wggb') steps = PLAYS[agreement][o.grade as 1 | 2 | 3];
  else {
    if (o.minutes === null) throw new Error(`a play under ${agreement} names its running time`);
    const minutes = o.minutes;
    steps = (PLAYS[agreement].find((t) => minutes > t.over) as { steps: Steps }).steps;
  }
  const step = steps.findLast(([from]) => from <= date);
  if (step === undefined) throw new Error(`no minimum under ${agreement} is known before ${(steps[0] as Steps[number])[0]}`);
  return fromMajor('GBP', step[1]);
}

type Values = Readonly<Record<string, number>>;
type Career = { attributes: AttributesSlice; scripts: ScriptsSlice; career: CareerSlice };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const of = (v: Values, id: string) => skillOf(v, 'screenwriter', id);
const wholeDays = (days: number) => {
  if (!Number.isInteger(days) || days < 1) throw new RangeError(`the days given are a whole number of at least 1 (${days})`);
};
/** A script's quality as a production weighs it: its last grade out of 10, or the mean of its parts where none has graded it. */
export function quality(script: Script): number {
  const last = script.reads.at(-1);
  if (last !== undefined) return last.overall * 10;
  return PARTS.reduce((t, p) => t + partScore(script, p), 0) / PARTS.length;
}

/** The best of the documents written among those given, 0 where none is: what a pitch puts forward. */
export const bestOf = (documents: Documents, among: readonly Document[]): number => Math.max(0, ...among.map((d) => documents[d] ?? 0));

export interface DocumentArgs {
  [key: string]: number | string;
  script: number;
  document: Document;
  days: number;
}

/** What a writer can do in a document: the Synopsis facet it is (with what a source ties to it), and Writing. */
export function documentSkill(values: Values, document: Document): number {
  const facet = componentOf('screenwriter', 'synopsis').facets.find((f) => f.id === document);
  if (facet === undefined) throw new Error(`there's no document ${document}`);
  return 0.7 * facetSkill(values, facet, 'synopsis') + 0.3 * of(values, 'writing');
}

/** Writes one of a script's documents. */
function summarise(s: Career, a: DocumentArgs, c: Context): void {
  wholeDays(a.days);
  const values = componentValues(s.attributes, 'screenwriter');
  const k = documentSkill(values, a.document);
  const script = scriptOf(s.scripts, a.script);
  const needed = Math.ceil(DOCUMENT_DAYS[a.document] / (0.5 + (0.5 * (0.6 * of(values, 'writing') + 0.4 * of(values, 'time-management'))) / 100));
  const effort = Math.min(1, a.days / needed);
  // @slate:consumer script.write
  (s.career.documents[String(script.id)] ??= {})[a.document] = clamp(k * (0.5 + 0.5 * effort) + spread(k) * (2 * c.draws('work.career', 'document', script.id, a.document, c.now).float() - 1), 0, 100);
  practise(s.attributes, 'screenwriter', ['synopsis', 'writing'], a.days);
}

export interface DaysArgs {
  [key: string]: number;
  days: number;
}

/** A contact a day's networking makes, at the most: a twentieth of the days for a writer at 0, half for one at 100. */
export const contactChance = (v: Values): number => 0.05 + (0.45 * (0.6 * of(v, 'networking') + 0.2 * of(v, 'speaking') + 0.2 * of(v, 'social-perceptiveness'))) / 100;

/** Days spent among the trade: festivals, panels, the people a writer already knows. */
function network(s: Career, a: DaysArgs, c: Context): void {
  wholeDays(a.days);
  const values = componentValues(s.attributes, 'screenwriter');
  const p = contactChance(values);
  const d = c.draws('work.career', 'network', c.now);
  for (let day = 0; day < a.days; day += 1) {
    // Stryker disable next-line EqualityOperator: a draw is continuous, so it equals the chance with no probability.
    if (d.float() < p) s.career.contacts += 1;
  }
  practise(s.attributes, 'screenwriter', ['networking', 'speaking', 'social-perceptiveness'], a.days);
}

/** How a writer pitches the script to the production's financiers, 0 to 100: Pitching, Speaking and Persuasion, and the best pitch document. */
export const pitchOf = (v: Values, documents: Documents): number => 0.5 * of(v, 'pitching') + 0.2 * of(v, 'speaking') + 0.2 * of(v, 'persuasion') + 0.1 * bestOf(documents, PITCH);

// Stryker disable all: a mutant of a declaration made as the module loads changes its shape, so the module loaded
// again for it is refused as declared twice (as the accounts' and the cards' say). The declarations are held by the
// test that lists each command with what it reads and writes; what each does is mutated above.
export const summariseScript = defineCommand<Career, DocumentArgs>({ id: 'script.summarise', reads: ['scripts'], writes: ['attributes', 'career'], run: summarise });
export const meetPeople = defineCommand<Career, DaysArgs>({ id: 'network.meet', reads: [], writes: ['attributes', 'career'], run: network });
