import { defineCommand, type Context, type Json } from '../../core/frame/frame.ts';
import { add, fromMajor, multiply, type CurrencyCode, type Money } from '../../core/money/money.ts';
import { civilFromDays, SECONDS_PER_DAY } from '../../core/time/calendar.ts';
import { t, type LineId } from '../../core/text/text.ts';
import { countryName, type CountryCode } from '../../world/gazetteer/gazetteer.ts';
import { componentOf, componentValues, practise, skillOf, type AttributesSlice } from '../attributes/attributes.ts';
import { ETHNICITIES, identifiesAs, personOf, playingAge, speaks, type Ethnicity, type IdentitySlice, type Level, type Person } from '../identity/identity.ts';
import { permitted, type PermitsSlice } from '../permits/permits.ts';
import type { DirectingSlice } from '../directing/directing.ts';
import { budgetMajor, financedOf, holds as plays, MEDIUM as MEDIUM_OF, payOut, projectOf, type Paying, type ProducingSlice, type Theatre } from '../producing/producing.ts';
import { mayTakeUnionWork, type UnionsSlice } from '../unions/unions.ts';
import { spread } from '../work/work.ts';
import { engagement, hoursShare } from '../youth/youth.ts';
import compiled from './markets.json' with { type: 'json' };

/**
 * The actor's work (BUILD-ORDER layer 4; the owner, 2026-10-31: "I want my attributes to effect the quality of my work
 * ... it needs to actually produce results depending on how bad or good I am"): playing a part in the life's own
 * production (src/person/producing), paid from its budget at the union's minimum for the part's agreement on the day
 * the work starts (the owner, 2026-11-04: "Remember there is no casting because we're going to be in our own film if we
 * every act", and "Union minimum from budget").
 *
 * Casting went that day: the breakdowns casting put out at the trade's shares of gender, ethnicity and age (Sowa's 2017
 * count, 2025's major film characters), the submissions under a headshot, the self-taped or room audition and its
 * booking chance (1 in 50 to a little under 1 in 3, the game's own, R-4614's blocker) were removed, because no one else
 * casts the life now. A part is written by the production the life acts in, as it would write any: for men, women,
 * either or a non-binary performer, naming an ethnicity or not, for an age range, in a language (the market's where it
 * names none). The life plays a part written for its sex or for either, and a they/them life any part (the owner,
 * 2026-11-01: "Actor (Male) Actress (Female) and for They/Them it could be either or", read through what the person is
 * billed as); a part for the ages it can play, an ethnicity it gives where the part names one (read only as the part
 * writes it, never as an ability, a judgment of the work, a pay rate or a chance; KEEP entry 4), and a language it
 * speaks at C1.
 *
 * A part asks for the craft every role uses (Acting's techniques, understanding the character and the situation, the
 * text, an interpretation of one's own, research and study of the role; Direction's taking direction; Memorization's
 * concentration, and its lines where it has any), the medium's own (the camera on screen; the space and the voice
 * that fills it on stage), and whatever else it calls for, named by the component it reads (singing, a dialect,
 * stunts, Shakespeare ...). Each is read at the level of the broad attribute that covers it, through its facets. How
 * well it is played is what the acting brings to what the production comes out as.
 *
 * The pay is the agreement's minimum (R-4614): SAG-AFTRA's day and weekly performers, its low-budget tiers by the
 * production's budget (none set under $20,000, the Micro-Budget agreement leaving it to negotiation); Pact/Equity's
 * Cinema Films Agreement for UK features of £3 million and over; ACTRA's Independent Production Agreement, a principal
 * by the day or week and a part of five lines or fewer by the day; and a UK play's, under its theatre's agreement
 * (research/sources/person/work/nations-GB.json, person.markets.actor.GB.stage), a week of performance or rehearsal
 * at a time, for the weeks of rehearsal and of the run its producer's plan names (src/person/producing), which the
 * part doesn't name; until 2026-11-04 the plan named one count of days and the part named its own weeks of each:
 *
 * - UK Theatre/Equity's commercial theatre weeks, by the venue's seats, rehearsal weeks at the rehearsal rate (R-4614).
 * - UK Theatre/Equity's Subsidised Theatre Agreement: a performer's minimum salary, one for MRSL grades 1 to 3 (its
 *   card's grade rows are another line, which the agreement, members-only, defines), each year's from its first day,
 *   rehearsal weeks at the same minimum, the card printing no performer's rehearsal rate apart. Its last agreed year
 *   ended on 5 April 2026, and Equity's notice of 9 October 2026 says the agreement is still in negotiation, so that
 *   year's £547.29 is kept past its term, as every agreement's last step is (rateAt).
 * - SOLT/Equity's West End agreement of 2026 to 2029: the eight-show minimum by the theatre's category of seats (C up
 *   to 799, B 800 to 1,099, A 1,100 and over), for 6 April 2026 to 4 April 2027 and 5 April 2027 to 2 April 2028;
 *   rehearsal weeks at the same minimum, the card's ceiling salary during rehearsals being those figures. A play here
 *   plays eight shows a week, the card's twelve-show rate left aside; its third year is set by a CPI not yet published.
 * - The ITC/Equity agreement for an ITC member's company: the minimum weekly salary, 2025/26 and 2026/27 from 1 April
 *   (the ITC: "dates represent the financial year"), rehearsal weeks at the same; its daily rate for three days or
 *   fewer is left aside, a stage engagement being by the week.
 *
 * Until 2026-11-04 a UK play's part was paid at a commercial theatre alone, the other three's minimums unread.
 *
 * shortcut: a play beyond the UK engages its part in its agreement's own units (a month, a performance, a session), which
 * the plan's weeks don't give without a count of performances a week or days a month that no source here holds, so its
 * part names its own run and rehearsal; upgrade when that market's stage research reads them.
 *
 * The production engages its parts under the agreements of the country it is made in, in the medium its format is (a
 * film, a series on television, a play on stage), and its budget is the one the tiers read.
 *
 * Beyond them, every market the research gives terms for (src/person/acting/markets.json, compiled by
 * tools/person/markets from the research, register facts person.markets.<CC>): each agreement a part can be engaged
 * under in the market's city, a territory whose work follows another country's terms engaged under that country's
 * agreements as its own (Saint-Barthélemy under France's, the Cocos Islands under Australia's; Monaco under France's
 * raised 5%, as its wage law owes Nice's minimum plus an allowance), its minimums
 * by medium (film, television, the stage), by role where it names roles, by the term it pays (a day, a week, a month, a
 * year, a session, a performance or an episode) and by the tier it sets (the budget, the lines, the seats, an
 * episode's minutes, the engagement's length, the actor's years in the work, the day or performance of the engagement),
 * each from the date it applies, in the agreement's currency. Where the research says no agreement sets an actor's
 * pay, it is left to negotiation, as under the Micro-Budget agreement. The actor's years are the whole years since the
 * first part they played, the game's reading (person.markets.model); what a country's research couldn't find is told,
 * whether its market is compiled or not.
 */

/** The line that tells the player these figures are the game's own (person.acting.model). */
export const MODEL_LINE: LineId = 'acting.model';

/** The agreements the markets engage parts under, as markets.json compiles them (a test holds the two lists one). */
export const MARKET_AGREEMENTS = [
  'ad-artists', 'ai-all', 'ar-film', 'ar-tv', 'ar-stage', 'at-screen', 'au-screen', 'au-stage', 'be-screen', 'bg-foreign-film', 'bn-screen', 'br-rj-tv', 'br-sp-screen', 'br-rj-stage', 'bw-screen',
  'cl-screen', 'co-all', 'cu-stage', 'de-screen', 'de-stage', 'de-guest', 'dk-film', 'dk-tv', 'dk-soejle-a', 'dk-copenhagen-stage', 'ee-film', 'ee-tv-private', 'ee-err', 'es-screen', 'es-madrid-stage', 'fi-stage', 'fi-guest',
  'fi-screen', 'fr-film', 'fr-tv', 'fr-subsidised-stage', 'fr-private-stage', 'gi-all', 'gr-private-stage', 'hk-film', 'ie-stage', 'il-screen', 'in-screen', 'it-screen', 'it-stage', 'jm-all',
  'jp-nhk', 'jp-live', 'kr-kbs', 'kr-mbc-sbs', 'li-film', 'ms-all', 'mx-televisa', 'mx-azteca', 'mx-other', 'nc-all', 'ng-screen', 'nl-stage', 'nl-screen', 'no-film', 'no-tv', 'no-nrk', 'no-stage',
  'nz-screen', 'nz-court', 'nz-atc', 'ph-screen', 'pn-all', 'se-screen', 'se-stage', 'se-private-stage', 'se-free-stage', 'sh-all', 'th-screen', 'tr-screen', 'va-screen', 'vg-all', 'za-all',
  'ax-fi-stage', 'ax-fi-guest', 'ax-fi-screen', 'bl-fr-film', 'bl-fr-tv', 'bl-fr-subsidised-stage', 'bl-fr-private-stage', 'cc-au-screen', 'cc-au-stage', 'cx-au-screen', 'cx-au-stage', 'gf-fr-film',
  'gf-fr-tv', 'gf-fr-subsidised-stage', 'gf-fr-private-stage', 'gp-fr-film', 'gp-fr-tv', 'gp-fr-subsidised-stage', 'gp-fr-private-stage', 'mc-fr-film', 'mc-fr-tv', 'mc-fr-subsidised-stage',
  'mc-fr-private-stage', 'mf-fr-film', 'mf-fr-tv', 'mf-fr-subsidised-stage', 'mf-fr-private-stage', 'mq-fr-film', 'mq-fr-tv', 'mq-fr-subsidised-stage', 'mq-fr-private-stage', 'nf-au-screen', 'nf-au-stage', 'pm-fr-film', 'pm-fr-tv', 'pm-fr-subsidised-stage',
  'pm-fr-private-stage', 're-fr-film', 're-fr-tv', 're-fr-subsidised-stage', 're-fr-private-stage', 'yt-fr-film', 'yt-fr-tv', 'yt-fr-subsidised-stage', 'yt-fr-private-stage',
] as const;
/** The agreement a part is engaged under. */
export type Agreement = 'sag-aftra' | 'pact-equity' | 'uk-theatre' | 'uk-theatre-subsidised' | 'solt-equity' | 'itc-equity' | 'actra' | (typeof MARKET_AGREEMENTS)[number];
export const AGREEMENTS: readonly Agreement[] = ['sag-aftra', 'pact-equity', 'uk-theatre', 'uk-theatre-subsidised', 'solt-equity', 'itc-equity', 'actra', ...MARKET_AGREEMENTS];
export const TERMS = ['day', 'week', 'month', 'year', 'session', 'performance', 'episode'] as const;
export type Term = (typeof TERMS)[number];
export const MEDIA = ['film', 'television', 'stage'] as const;
export type Medium = (typeof MEDIA)[number];

/** A part as its production engages it. */
export interface Part {
  [key: string]: Json;
  agreement: Agreement;
  /** The production's budget, in the agreement's currency's major units (SAG-AFTRA's tiers, Pact/Equity's threshold turn on it): the production's own. */
  budget: number;
  /** The theatre's seats (UK Theatre's commercial tiers and SOLT's categories turn on it). */
  seats: number;
  /** The lines the part speaks. */
  lines: number;
  term: Term;
  /** Days or weeks engaged: on stage, the weeks of performance. */
  length: number;
  /** Weeks of rehearsal before them, on stage. */
  rehearsal: number;
  /** What else the part calls for, by the actor's components (singing, accents-and-dialects ...). */
  asks: string[];
  /** A market's part: its medium, where its agreement covers more than one. */
  medium?: Medium;
  /** A market's part: its role, where its agreement sets its minimums by role. */
  role?: string;
  /** A market's part: an episode's running time, where its agreement's minimums turn on it. */
  minutes?: number;
}

export interface Work {
  readonly at: number;
  /** How the part was played, 0 to 100. */
  readonly quality: number;
  /** The agreement's minimum for the engagement; none where the agreement sets none. */
  readonly pay: Money | null;
}

/** Who a part is written for: men, women, either (open), or a non-binary performer. */
export const GENDERS = ['men', 'women', 'open', 'non-binary'] as const;
export type Gender = (typeof GENDERS)[number];
/** The ethnicity a part names, or open to every ethnicity, or silent on it. */
export type Named = 'open' | 'silent' | Ethnicity;

/** A part in one of the life's productions, as written, and how it was played. */
export interface Cast {
  readonly id: number;
  readonly at: number;
  /** The production it is in. */
  readonly project: number;
  readonly part: Part;
  readonly gender: Gender;
  readonly ethnicity: Named;
  /** The ages the part is written for, from and to. */
  readonly ages: readonly [number, number];
  /** BCP 47: the language it is played in. */
  readonly language: string;
  work: Work | null;
}

export interface ActingSlice {
  parts: Cast[];
}

export const ACTING_START: ActingSlice = { parts: [] };

type Values = Readonly<Record<string, number>>;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const mean = (xs: readonly number[]) => xs.reduce((t, x) => t + x, 0) / xs.length;
const of = (v: Values, id: string) => skillOf(v, 'actor', id);

/** What every part asks of the actor, whatever the medium: the game's reading of the components any role uses. */
export const CRAFT = ['acting-techniques', 'understanding-character-and-situation', 'text-analysis', 'own-interpretation', 'research-roles', 'study-roles-from-scripts', 'ability-to-take-direction', 'konzentrationsf-higkeit'] as const;

/** What the medium asks besides: the camera on screen; on stage the space and the voice that fills it. */
export const MEDIUM = { screen: ['acting-for-the-camera'], stage: ['appropriation-d-espace-sc-nique', 'speaking'] } as const;

export const STAGE: readonly Agreement[] = ['uk-theatre', 'uk-theatre-subsidised', 'solt-equity', 'itc-equity'];

/** The agreement a UK play's part is engaged under, by its theatre. */
export const THEATRE_AGREEMENT: Readonly<Record<Theatre, Agreement>> = { subsidised: 'uk-theatre-subsidised', commercial: 'uk-theatre', 'west-end': 'solt-equity', itc: 'itc-equity' };

/** Whether a part is played on stage: a UK theatre's agreement's, or a market's part whose medium is the stage. */
export const onStage = (part: Part): boolean => STAGE.includes(part.agreement) || (marketOf(part.agreement) !== undefined && mediumOf(part) === 'stage');

/** Every component a part asks for. */
export function demands(part: Part): string[] {
  const out = new Set<string>(CRAFT);
  if (part.lines > 0) out.add('memorise-lines');
  for (const id of MEDIUM[onStage(part) ? 'stage' : 'screen']) out.add(id);
  for (const id of part.asks) out.add(componentOf('actor', id).id);
  return [...out];
}

/** What the actor can do in a part: every component it asks, as the actor has it, equally. */
export const partSkill = (v: Values, part: Part): number => mean(demands(part).map((id) => of(v, id)));

/** The best part the actor has played, 0 where none: what distinction is read from (papers.permits). */
export function credit(s: ActingSlice): number {
  // @slate:consumer acting.perform
  return Math.max(0, ...s.parts.map((x) => x.work?.quality ?? 0));
}

/** A minimum's steps: from each date (the first day it applies), the amount in major units. */
type Table = readonly (readonly [from: string, major: string])[];

interface Scale {
  readonly currency: CurrencyCode;
  readonly day?: Table;
  readonly week?: Table;
  /** A rehearsal week's, on stage; a market's part's rehearsal unit's. */
  readonly rehearsal?: Table;
  /** A market's part: the minimums for its term, each paying the engagement's units from one to another (to none: the rest). */
  readonly bands?: readonly Band[];
}

export interface Band {
  readonly from: number;
  readonly to: number | null;
  readonly table: Table;
}

/** A market's minimum as compiled (tools/person/markets/compile.ts). */
type Tier = 'budget' | 'lines' | 'seats' | 'minutes' | 'length' | 'years' | 'nth';
export interface Minimum {
  readonly medium: Medium;
  readonly role: string | null;
  readonly per: Term;
  readonly rehearsal: boolean;
  readonly with: readonly Term[] | null;
  readonly when: Readonly<Partial<Record<Tier, readonly [number, number | null]>>>;
  readonly from: string;
  readonly amount: string;
}
export interface MarketAgreement {
  readonly country: CountryCode;
  readonly currency: CurrencyCode | null;
  readonly media: readonly Medium[];
  readonly none: boolean;
  readonly minimums: readonly Minimum[];
  /** The agreement whose terms a territory's work follows. */
  readonly follows?: Agreement;
  /** Where the minimum is the followed one raised by a share (Monaco's: Nice's, plus 5%), that share. */
  readonly uplift?: string;
}
/** What a market's research couldn't find, by the item its blockers name. */
export type Unknown = 'agreements' | 'rates' | 'none' | 'union' | 'language' | 'market' | 'terms' | 'successors';
export interface Market {
  readonly language: string;
  readonly zone: string;
  readonly agreements: readonly Agreement[];
}
export const MARKETS = (compiled as unknown as { markets: Readonly<Record<string, Market>> }).markets;
/** What each country's research couldn't find, its market compiled or not. */
export const UNKNOWN = (compiled as unknown as { unknown: Readonly<Record<string, readonly Unknown[]>> }).unknown;
const COMPILED = (compiled as unknown as { agreements: Readonly<Record<string, MarketAgreement>> }).agreements;

/** A market's agreement as compiled; none for the four this engine keeps itself. */
export const marketOf = (a: Agreement): MarketAgreement | undefined => (Object.hasOwn(COMPILED, a) ? COMPILED[a] : undefined);

/** A market's part's medium: as the part names it, or its agreement's only one. */
export function mediumOf(part: Part): Medium {
  const a = marketOf(part.agreement) as MarketAgreement;
  const medium = part.medium ?? (a.media.length === 1 ? a.media[0] : undefined);
  if (medium === undefined) throw new Error(`a part under ${part.agreement} names its medium: ${a.media.join(', ')}`);
  if (!a.media.includes(medium)) throw new Error(`${part.agreement} sets no terms for ${medium}`);
  return medium;
}

/** Whether a minimum's tiers hold for a part and the actor's years (the unit it pays, `nth`, is a band's, not a test). */
function holds(m: Minimum, part: Part, years: number): boolean {
  const value: Record<Exclude<Tier, 'nth'>, number> = { budget: part.budget, lines: part.lines, seats: part.seats, minutes: part.minutes ?? 0, length: part.length, years };
  return (Object.entries(m.when) as [Tier, readonly [number, number | null]][]).every(([k, [lo, hi]]) => k === 'nth' || (value[k] >= lo && (hi === null || value[k] <= hi)));
}

/** A slot's minimums as a table of steps: the compile writes each agreement's minimums by date. */
const tableOf = (ms: readonly Minimum[]): Table => ms.map((m) => [m.from, m.amount] as const);

/** A market's part's scale: its term's minimums, band by band, and its rehearsal's; none where no agreement sets the pay. */
function marketScale(part: Part, a: MarketAgreement, years: number): Scale | null {
  const medium = mediumOf(part);
  if (a.none) return null;
  const own = a.minimums.filter((m) => m.medium === medium);
  const roles = [...new Set(own.map((m) => m.role))];
  const role = part.role ?? null;
  if (!roles.includes(role)) throw new Error(roles.includes(null) ? `${part.agreement} sets no minimum by role` : `a part under ${part.agreement} is one of its roles: ${roles.join(', ')}`);
  const fit = own.filter((m) => m.role === role && holds(m, part, years));
  const bands = new Map<string, Minimum[]>();
  for (const m of fit.filter((x) => !x.rehearsal && x.per === part.term)) {
    const key = JSON.stringify(m.when.nth ?? [1, null]);
    bands.set(key, [...(bands.get(key) ?? []), m]);
  }
  const rehearsal = fit.filter((m) => m.rehearsal && (m.with === null || m.with.includes(part.term)));
  return {
    currency: a.currency as CurrencyCode,
    bands: [...bands.entries()].map(([key, ms]) => {
      const [from, to] = JSON.parse(key) as [number, number | null];
      return { from, to, table: tableOf(ms) };
    }),
    ...(rehearsal.length > 0 ? { rehearsal: tableOf(rehearsal) } : {}),
  };
}

const SAG_YEARS = ['2025-07-01', '2026-07-01', '2027-07-01', '2028-07-01', '2029-07-01'];
const LOW_YEARS = ['2026-07-01', '2027-07-01', '2028-07-01', '2029-07-01'];
const PACT_YEARS = ['2020-04-06', '2021-04-06', '2022-04-06', '2023-04-06', '2024-04-06'];
const ACTRA_YEARS = ['2025-01-26', '2026-01-01', '2027-01-01'];
const steps = (from: readonly string[], amounts: readonly string[]): Table => from.map((d, i) => [d, amounts[i] as string]);

/** SAG-AFTRA's minimums, July 2025 to June 2030, by the film's budget (R-4614: CBA Schedules A and B; the low-budget agreements). */
export const SAG = {
  /** The Codified Basic Agreement and the Television Agreement: day performers on 8 hours, weekly on a 44-hour week. */
  basic: { currency: 'USD', day: steps(SAG_YEARS, ['1246', '1283', '1321', '1361', '1402']), week: steps(SAG_YEARS, ['4326', '4456', '4590', '4728', '4870']) },
  /** Low Budget, up to $2 million. */
  low: { currency: 'USD', day: steps(LOW_YEARS, ['834', '859', '885', '911']), week: steps(LOW_YEARS, ['2896', '2984', '3073', '3166']) },
  /** Moderate Low Budget, up to $700,000. */
  moderate: { currency: 'USD', day: steps(LOW_YEARS, ['449', '462', '476', '491']), week: steps(LOW_YEARS, ['1560', '1607', '1655', '1705']) },
  /** Ultra Low Budget, up to $300,000: a day rate only. */
  ultra: { currency: 'USD', day: steps(LOW_YEARS, ['257', '264', '272', '280']) },
} as const satisfies Record<string, Scale>;

/** The budgets each SAG-AFTRA tier reaches up to, in dollars; above the last, the basic agreement. */
export const SAG_TIERS = { micro: 20_000, ultra: 300_000, moderate: 700_000, low: 2_000_000 } as const;

/** Pact/Equity's Cinema Films Agreement, features of £3 million and over, April 2020 to April 2025 (R-4614). */
export const PACT = { currency: 'GBP', day: steps(PACT_YEARS, ['144', '147', '150', '156', '161']), week: steps(PACT_YEARS, ['576', '588', '600', '624', '644']) } as const satisfies Scale;
export const PACT_FLOOR = 3_000_000;

/** UK Theatre/Equity's commercial theatre, from 31 March 2025, by the venue's seats: tiers C, B, A and A* (R-4614). */
export const UK_THEATRE: readonly (Scale & { readonly seats: number })[] = [
  { seats: 0, currency: 'GBP', rehearsal: [['2025-03-31', '525.03']], week: [['2025-03-31', '561.66']] },
  { seats: 250, currency: 'GBP', rehearsal: [['2025-03-31', '531.69']], week: [['2025-03-31', '561.93']] },
  { seats: 500, currency: 'GBP', rehearsal: [['2025-03-31', '545.58']], week: [['2025-03-31', '569.14']] },
  { seats: 1500, currency: 'GBP', rehearsal: [['2025-03-31', '551.57']], week: [['2025-03-31', '590.33']] },
];

/** UK Theatre/Equity's Subsidised Theatre Agreement, a performer at MRSL grades 1 to 3, from 3 April 2023; rehearsal at the same. */
const SUBSIDISED_YEARS = steps(['2023-04-03', '2024-04-01', '2025-03-31'], ['482.00', '526.24', '547.29']);
export const UK_SUBSIDISED = { currency: 'GBP', week: SUBSIDISED_YEARS, rehearsal: SUBSIDISED_YEARS } as const satisfies Scale;

/** SOLT/Equity's eight-show minimum in the West End by the theatre's category of seats, C, B and A, from 6 April 2026; rehearsal at the same. */
const westEnd = (seats: number, amounts: readonly string[]): Scale & { readonly seats: number } => {
  const table = steps(['2026-04-06', '2027-04-05'], amounts);
  return { seats, currency: 'GBP', week: table, rehearsal: table };
};
export const SOLT: readonly (Scale & { readonly seats: number })[] = [westEnd(0, ['790.30', '829.82']), westEnd(800, ['878.32', '922.24']), westEnd(1100, ['965.55', '1013.83'])];

/** The ITC/Equity minimum weekly salary, 2025/26 and 2026/27 from 1 April; rehearsal at the same. */
const ITC_YEARS = steps(['2025-04-01', '2026-04-01'], ['601.00', '631.00']);
export const ITC = { currency: 'GBP', week: ITC_YEARS, rehearsal: ITC_YEARS } as const satisfies Scale;

/** ACTRA's Independent Production Agreement, January 2025 to December 2027 (R-4614). */
export const ACTRA = {
  principal: { currency: 'CAD', day: steps(ACTRA_YEARS, ['935.25', '972.75', '1006.75']), week: steps(ACTRA_YEARS, ['3974.50', '4133.50', '4278.25']) },
  /** An actor with five lines or fewer: a day rate only. */
  few: { currency: 'CAD', day: steps(ACTRA_YEARS, ['631.25', '656.50', '679.50']) },
} as const satisfies Record<string, Scale>;
export const ACTRA_FEW_LINES = 5;

/** The scale a part is paid on, for an actor of so many years in the work; none where its agreement sets no minimum. */
export function scaleOf(part: Part, years = 0): Scale | null {
  const market = marketOf(part.agreement);
  if (market !== undefined) return marketScale(part, market, years);
  switch (part.agreement) {
    case 'sag-aftra':
      if (part.budget <= SAG_TIERS.micro) return null;
      if (part.budget <= SAG_TIERS.ultra) return SAG.ultra;
      if (part.budget <= SAG_TIERS.moderate) return SAG.moderate;
      return part.budget <= SAG_TIERS.low ? SAG.low : SAG.basic;
    case 'pact-equity':
      // shortcut: films under £3 million go to Equity's low-budget agreements, whose rates Equity shows members only (R-4614 blockers); refused until read.
      if (part.budget < PACT_FLOOR) throw new Error("the minimums for a UK film under £3 million aren't known");
      return PACT;
    case 'uk-theatre':
      return UK_THEATRE.findLast((t) => part.seats >= t.seats) as Scale;
    case 'uk-theatre-subsidised':
      return UK_SUBSIDISED;
    case 'solt-equity':
      return SOLT.findLast((t) => part.seats >= t.seats) as Scale;
    case 'itc-equity':
      return ITC;
    default:
      return part.lines <= ACTRA_FEW_LINES ? ACTRA.few : ACTRA.principal;
  }
}

/** A date as the tables write it. */
export function dateOf(now: number): string {
  const { year, month, day } = civilFromDays(Math.floor(now / SECONDS_PER_DAY));
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * The amount in force on a date: the latest step begun by then. shortcut: past an agreement's term its last rate is
 * kept, the game's own reckoning (person.acting.model), until the next agreement's rates are read.
 */
export function rateAt(currency: CurrencyCode, table: Table, date: string): Money {
  const step = table.findLast(([from]) => from <= date);
  if (step === undefined) throw new Error(`no minimum is known before ${(table[0] as readonly [string, string])[0]}`);
  return fromMajor(currency, step[1]);
}

/**
 * What the engagement pays, at the minimums in force the day the work starts, to an actor of so many years in the work.
 * A market's minimums by the unit pay each unit of the engagement at its own (the first five days at one, the rest at
 * another), and its rehearsal units at the rehearsal's. shortcut: an engagement spanning a new year's rates is paid all
 * of it at the first day's; overtime and use fees aren't modeled.
 */
export function pay(part: Part, date: string, years = 0): Money | null {
  const scale = scaleOf(part, years);
  if (scale === null) return null;
  if (scale.bands !== undefined) {
    const sum = marketPay(part, scale as Scale & { bands: readonly Band[] }, date);
    const share = (marketOf(part.agreement) as MarketAgreement).uplift;
    return share === undefined ? sum : add(sum, multiply(sum, share));
  }
  const table = scale[part.term as 'day' | 'week'];
  if (table === undefined) throw new Error(`there's no ${part.term} minimum for that part`);
  const performed = multiply(rateAt(scale.currency, table, date), String(part.length));
  return scale.rehearsal === undefined ? performed : add(performed, multiply(rateAt(scale.currency, scale.rehearsal, date), String(part.rehearsal)));
}

function marketPay(part: Part, scale: Scale & { bands: readonly Band[] }, date: string): Money {
  if (scale.bands.length === 0) throw new Error(`there's no ${part.term} minimum for that part`);
  let total = fromMajor(scale.currency, '0');
  for (const b of scale.bands) {
    if (part.length >= b.from) total = add(total, multiply(rateAt(scale.currency, b.table, date), String(Math.min(part.length, b.to ?? part.length) - b.from + 1)));
  }
  if (part.rehearsal === 0) return total;
  if (scale.rehearsal === undefined) throw new Error("there's no rehearsal minimum for that part");
  return add(total, multiply(rateAt(scale.currency, scale.rehearsal, date), String(part.rehearsal)));
}

/**
 * The days an engagement works: a week is five (SAG-AFTRA's five-day studio week; the game's for the others); a month
 * 21 and a year 220 (the Virke TV-drama agreement's basis, read for every agreement: person.markets.model); a session,
 * a performance and an episode a day each. A market's rehearsal units are counted by its rehearsal's term (weeks where
 * it sets none).
 */
export const WEEK_DAYS = 5;
export const UNIT_DAYS: Readonly<Record<Term, number>> = { day: 1, week: WEEK_DAYS, month: 21, year: 220, session: 1, performance: 1, episode: 1 };
export function daysWorked(part: Part): number {
  const rehearsal = marketOf(part.agreement)?.minimums.find((m) => m.rehearsal)?.per ?? 'week';
  return UNIT_DAYS[part.term] * part.length + UNIT_DAYS[rehearsal] * part.rehearsal;
}

/** The actor's whole years in the work on a day: since the first part they played, none before it (person.markets.model). */
export function experience(s: ActingSlice, now: number): number {
  // @slate:consumer acting.perform
  const first = Math.min(...s.parts.flatMap((a) => (a.work === null ? [] : [a.work.at])));
  if (first === Infinity) return 0;
  const [since, today] = [dateOf(first), dateOf(now)];
  return Number(today.slice(0, 4)) - Number(since.slice(0, 4)) - (today.slice(5) < since.slice(5) ? 1 : 0);
}

const whole = (n: unknown, what: string, least: number): void => {
  if (!Number.isSafeInteger(n) || (n as number) < least) throw new RangeError(`${what} must be a whole number of at least ${least} (${String(n)})`);
};

/** A part as given, held to what an engagement can be. */
export function partOf(a: Part): Part {
  if (!AGREEMENTS.includes(a.agreement)) throw new Error(`there's no agreement ${String(a.agreement)}`);
  if (!TERMS.includes(a.term)) throw new Error(`there's no term ${String(a.term)}`);
  whole(a.budget, 'the budget', 0);
  whole(a.seats, 'the seats', 0);
  whole(a.lines, 'the lines', 0);
  whole(a.length, 'the length', 1);
  whole(a.rehearsal, 'the rehearsal', 0);
  if (a.minutes !== undefined) whole(a.minutes, 'the minutes', 1);
  if (a.medium !== undefined && !MEDIA.includes(a.medium)) throw new Error(`there's no medium ${String(a.medium)}`);
  const market = marketOf(a.agreement);
  if (market === undefined) {
    if (a.medium !== undefined || a.role !== undefined || a.minutes !== undefined) throw new Error(`${a.agreement} sets no terms by medium, role or minutes`);
    if (a.term !== 'day' && a.term !== 'week') throw new Error(`there's no ${a.term} minimum for that part`);
    const stage = STAGE.includes(a.agreement);
    if (stage && a.term === 'day') throw new Error('a stage engagement is by the week');
    if (!stage && a.rehearsal > 0) throw new Error("rehearsal weeks are a stage engagement's");
  }
  demands(a);
  const scale = scaleOf(a);
  if (scale !== null && (scale.bands === undefined ? scale[a.term as 'day' | 'week'] === undefined : scale.bands.length === 0)) throw new Error(`there's no ${a.term} minimum for that part`);
  if (scale?.bands !== undefined && a.rehearsal > 0 && scale.rehearsal === undefined) throw new Error("there's no rehearsal minimum for that part");
  return a;
}

/**
 * Each agreement's market: the language a part is played in where its production names none (R-4620: the US's parts
 * are English; the game's for the UK's and Canada's English-language agreements; each market's own, as compiled) and
 * where the actor's age is reckoned (the market's city's zone).
 */
export const MARKET: Readonly<Record<Agreement, { readonly language: string; readonly zone: string }>> = {
  'sag-aftra': { language: 'en', zone: 'America/Los_Angeles' },
  'pact-equity': { language: 'en', zone: 'Europe/London' },
  'uk-theatre': { language: 'en', zone: 'Europe/London' },
  'uk-theatre-subsidised': { language: 'en', zone: 'Europe/London' },
  'solt-equity': { language: 'en', zone: 'Europe/London' },
  'itc-equity': { language: 'en', zone: 'Europe/London' },
  actra: { language: 'en', zone: 'America/Toronto' },
  ...(Object.fromEntries(Object.values(MARKETS).flatMap((m) => m.agreements.map((id) => [id, { language: m.language, zone: m.zone }]))) as Record<(typeof MARKET_AGREEMENTS)[number], { language: string; zone: string }>),
};

/** How well an actor must speak a part's language to play it, the game's own (person.acting.model). */
export const FLUENT: Level = 'C1';

/** What a part is written for, as the life's fit for it is read. */
export type Written = Pick<Cast, 'part' | 'gender' | 'ethnicity' | 'ages' | 'language'>;

/** Why the person may not play a part as written, or null where they may. */
export function misfit(p: Person, w: Written, now: number): string | null {
  // @slate:consumer identity.make
  // A part for men is an actor's, one for women an actress's, one for either anyone's, and a they/them life plays any
  // (the owner, 2026-11-01: "Actor (Male) Actress (Female) and for They/Them it could be either or").
  if (p.pronouns !== 'they' && w.gender !== 'open') {
    if (w.gender === 'non-binary') return 'the part is written for a non-binary performer';
    if ((w.gender === 'men') !== (p.billedAs === 'actor')) return `the part is written for an ${w.gender === 'men' ? 'actor' : 'actress'}`;
  }
  const [from, to] = playingAge(p, now, MARKET[w.part.agreement].zone);
  if (to < w.ages[0] || from > w.ages[1]) return `the part is for ${w.ages[0]} to ${w.ages[1]}, and you play ${from} to ${to}`;
  if (w.ethnicity !== 'open' && w.ethnicity !== 'silent' && !identifiesAs(p, w.ethnicity)) return `the part names an ethnicity you don't give (${w.ethnicity})`;
  if (!speaks(p, w.language, FLUENT)) return `the part is played in ${w.language}, at ${FLUENT} or better`;
  return null;
}

export function castOf(s: ActingSlice, id: number): Cast {
  const found = s.parts.find((x) => x.id === id);
  if (found === undefined) throw new Error(`there's no part ${id}`);
  return found;
}

export interface CastArgs {
  [key: string]: Json;
  /** The production the part is in. */
  project: number;
  agreement: string;
  term: string;
  /** Days or weeks engaged, and weeks of rehearsal: a UK play's are its plan's, which the part doesn't name. */
  length?: number;
  lines: number;
  rehearsal?: number;
  /** The venue's seats, on stage: a market's play's (a UK play's are its theatre's, as its producer named them). */
  seats?: number;
  asks: string[];
  role?: string;
  gender: string;
  /** The ethnicity it names, or open (the default) or silent. */
  ethnicity?: string;
  ages: number[];
  /** The language it is played in: the market's where none is given. */
  language?: string;
}

/**
 * Writes a part in a production the life acts in, and casts the life in it: engaged under one of the agreements of the
 * country it is made in, in its format's medium, its budget the production's. Refused where the life doesn't act in it,
 * it has no budget yet or is released, the agreement or the medium isn't the production's, or the life may not play the
 * part as written.
 */
function cast(s: Casting, a: CastArgs, c: Context): void {
  const p = projectOf(s.producing, a.project);
  // @slate:consumer producing.option
  // @slate:consumer producing.develop
  if (!plays(p, 'actor')) throw new Error(`the life doesn't act in project ${p.id}`);
  // @slate:consumer producing.release
  if (p.release !== null) throw new Error(`project ${p.id} is released`);
  const agreement = a.agreement as Agreement;
  if (!AGREEMENTS.includes(agreement)) throw new Error(`there's no agreement ${String(a.agreement)}`);
  if (COUNTRY[agreement] !== p.market) throw new Error(`a part in a production made in ${p.market} isn't engaged under ${agreement}`);
  const market = marketOf(agreement) !== undefined;
  if (!market && STAGE.includes(agreement) !== (p.format === 'stage')) throw new Error(`a ${p.format} isn't engaged under ${agreement}`);
  // A UK play's part is engaged under its theatre's agreement, and its seats are its theatre's, as the producer named it.
  // @slate:consumer producing.option
  // @slate:consumer producing.develop
  if (p.stage !== null && agreement !== THEATRE_AGREEMENT[p.stage.theatre]) throw new Error(`a part in a UK play is engaged under its theatre's agreement, ${THEATRE_AGREEMENT[p.stage.theatre]}`);
  if (p.stage !== null && a.seats !== undefined) throw new Error("a UK play's seats are its theatre's");
  // A UK play's part is engaged for the weeks its plan names: the rehearsal at the rehearsal rate, the run at the week's minimum.
  // @slate:consumer producing.plan
  if (p.stage !== null && (a.length !== undefined || a.rehearsal !== undefined)) throw new Error("a UK play's weeks of rehearsal and performance are its plan's");
  const weeks = p.stage === null ? null : p.plan?.weeks;
  const part = partOf({
    agreement,
    // @slate:consumer producing.plan
    // A production with no budget yet is refused here (producing's planOf).
    budget: budgetMajor(p),
    // @slate:consumer producing.option
    // @slate:consumer producing.develop
    seats: p.stage?.seats ?? a.seats ?? 0,
    lines: a.lines,
    term: a.term as Term,
    length: (weeks?.run ?? a.length) as number,
    rehearsal: (weeks?.rehearsal ?? a.rehearsal) as number,
    asks: a.asks,
    ...(market ? { medium: MEDIUM_OF[p.format] } : {}),
    ...(a.role === undefined ? {} : { role: a.role }),
    ...(market && p.minutes !== null ? { minutes: p.minutes } : {}),
  });
  const gender = a.gender as Gender;
  if (!GENDERS.includes(gender)) throw new Error(`a part isn't written for ${String(a.gender)}`);
  const ethnicity = (a.ethnicity ?? 'open') as Named;
  if (!['open', 'silent', ...ETHNICITIES].includes(ethnicity)) throw new Error(`there's no ethnicity ${String(a.ethnicity)}`);
  if (!Array.isArray(a.ages) || a.ages.length !== 2) throw new Error('a part is written for an age range, from and to');
  const [from, to] = a.ages as [number, number];
  whole(from, 'the youngest age', 0);
  whole(to, 'the oldest age', from);
  const written: Written = { part, gender, ethnicity, ages: [from, to], language: a.language ?? MARKET[agreement].language };
  const why = misfit(personOf(s.identity), written, c.now);
  if (why !== null) throw new Error(why);
  s.acting.parts.push({ id: s.acting.parts.length + 1, at: c.now, project: p.id, ...written, work: null });
}

export interface PlayArgs {
  [key: string]: Json;
  /** The part cast. */
  part: number;
  /** The account the part is paid into. */
  account: string;
}

/** The country each agreement's work is in: SAG-AFTRA's the US, Pact/Equity's and the UK theatres' the UK, ACTRA's Canada, a market's its own. */
export const COUNTRY: Readonly<Record<Agreement, CountryCode>> = {
  'sag-aftra': 'US',
  'pact-equity': 'GB',
  'uk-theatre': 'GB',
  'uk-theatre-subsidised': 'GB',
  'solt-equity': 'GB',
  'itc-equity': 'GB',
  actra: 'CA',
  ...(Object.fromEntries(MARKET_AGREEMENTS.map((id) => [id, (COMPILED[id] as MarketAgreement).country])) as Record<(typeof MARKET_AGREEMENTS)[number], CountryCode>),
};

/** The line that tells the player what of a market isn't known. */
export const UNKEPT_LINE: LineId = 'acting.unkept';
/** Each item a market's research couldn't find, as the player is told it. */
export const MISSING: Readonly<Record<Unknown, string>> = {
  agreements: 'some of the agreements parts are engaged under',
  rates: 'some of the minimums parts are paid',
  none: 'whether anything sets the pay where no agreement does',
  union: "the union's fees or whether a part needs it",
  language: 'the language parts are played in',
  market: 'where most of the work is',
  terms: 'what terms a part is engaged on',
  successors: 'the terms of the places that succeeded it',
};

/**
 * What the player is told of a country, or of an agreement's, where its research couldn't find all of it: "a, b and
 * c"; nothing where it is known whole. A territory's agreement that follows another country's tells what neither
 * country's research found.
 */
export function aboutMarket(where: Agreement | CountryCode): string | undefined {
  const a = marketOf(where as Agreement);
  const country = a?.country ?? (where as CountryCode);
  const followed = a?.follows === undefined ? [] : (UNKNOWN[(marketOf(a.follows) as MarketAgreement).country] as readonly Unknown[]);
  const missing = [...new Set([...(UNKNOWN[country] ?? []), ...followed])].map((u) => MISSING[u]);
  if (missing.length === 0) return undefined;
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing.at(-1) as string}` : (missing[0] as string);
  return t(UNKEPT_LINE, { country: countryName(country), missing: list });
}

/**
 * The slices a part played reads besides its own: its production, financed and not released; whether the person may
 * work there reads every role's days and permits, and, for a minor, what the law of the work's country needs first
 * (person.youth); its pay comes from the production's budget into an account, taxed, less what that law sets aside.
 */
type Casting = { identity: IdentitySlice; acting: ActingSlice; producing: ProducingSlice };
type Playing = Paying & { attributes: AttributesSlice; acting: ActingSlice; unions: UnionsSlice; permits: PermitsSlice; directing: DirectingSlice };

/** Plays a part cast: how well, as the actor is in what it asks, and what it pays, from the production's budget. */
function play(s: Playing, a: PlayArgs, c: Context): void {
  // @slate:consumer acting.cast
  const job = castOf(s.acting, a.part);
  if (job.work !== null) throw new Error(`part ${a.part} is played`);
  // @slate:consumer producing.raise
  // A released production has every part played (producing.release), so a part left to play is never in one.
  const p = financedOf(s.producing, job.project);
  const where = COUNTRY[job.part.agreement];
  // @slate:consumer permits.decision
  if (!permitted(s, where, c.now, daysWorked(job.part))) throw new Error(`the person may not work in ${where} without a permit`);
  // @slate:consumer unions.join
  if (!mayTakeUnionWork(s, job.part.agreement, c.now)) throw new Error(`a part under ${job.part.agreement} past the thirtieth day of union work is a member's`);
  // A minor's part is engaged as the work's country's law lets them take it (person.youth), its days at the hours it allows.
  const grant = engagement(s, where, 'performer', c.now);
  const share = hoursShare(personOf(s.identity), where, 'performer', c.now);
  // @slate:consumer attributes.choose
  const k = partSkill(componentValues(s.attributes, 'actor'), job.part);
  const quality = clamp(k + spread(k) * (2 * c.draws('acting.work', 'perform', job.id).float() - 1), 0, 100);
  const paid = pay(job.part, dateOf(c.now), experience(s.acting, c.now));
  job.work = { at: c.now, quality, pay: paid };
  if (paid !== null) payOut(s, p, 'actor', paid, "a part's pay", a.account, c);
  if (grant !== null) grant.used = true;
  practise(s.attributes, 'actor', demands(job.part), daysWorked(job.part) * share);
}

// Stryker disable all: a mutant of a declaration made as the module loads changes its shape, so the module loaded
// again for it is refused as declared twice (as the accounts' and the cards' say). The declarations are held by the
// test that lists each command with what it reads and writes; what each does is mutated above.
export const castPart = defineCommand<Casting, CastArgs>({ id: 'acting.cast', reads: ['identity', 'producing'], writes: ['acting'], run: cast });
export const playPart = defineCommand<Playing, PlayArgs>({ id: 'acting.perform', reads: ['identity', 'unions', 'permits', 'directing', 'producing'], writes: ['attributes', 'acting', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'], run: play });
