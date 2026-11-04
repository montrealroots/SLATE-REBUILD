import { defineCommand, type Context, type Json } from '../../core/frame/frame.ts';
import { fromMajor, minorUnits, money, type CurrencyCode, type Money } from '../../core/money/money.ts';
import { addMonths } from '../../core/time/dates.ts';
import { t, type LineId } from '../../core/text/text.ts';
import { payCost, type Holding } from '../../money/accounts/accounts.ts';
import { earn, type Earning, type Work } from '../../money/tax/tax.ts';
import { countryName, type CountryCode } from '../../world/gazetteer/gazetteer.ts';
import { AGREEMENTS, COUNTRY, dateOf, MARKET as WORK, MARKETS as ACTED, type ActingSlice, type Medium } from '../acting/acting.ts';
import { ATTRIBUTES, componentValues, practise, skillOf, type AttributesSlice } from '../attributes/attributes.ts';
import { EPISODES, FEATURE_SHOOT, type DirectingSlice, type Form as Directed } from '../directing/directing.ts';
import { boxOfficeFactor, lovesOrRefuse, type GenresSlice } from '../genres/genres.ts';
import { scriptOf, spread, type Form as Written, type ScriptsSlice } from '../work/work.ts';
import { aboutMarket as writersUnknown, countryOf, KEPT, languagesOf, marketOf as writerMarketOf, MARKETS as WRITTEN, minimumOf, pitchOf, quality, WRITES_IN, type CareerSlice } from '../work/career.ts';
import { inTheBusiness, personOf, residenceOf, speaks, type IdentitySlice } from '../identity/identity.ts';
import { permitted, type PermitsSlice } from '../permits/permits.ts';
import { engagement, fundRefuses, holdBack, hoursShare, type YouthSlice } from '../youth/youth.ts';
import compiled from './markets.json' with { type: 'json' };

/**
 * The life's own production and the producer's work on it (BUILD-ORDER layer 4; the owner, 2026-10-31: "I want my
 * attributes to effect the quality of my work ... it needs to actually produce results depending on how bad or good I
 * am"; and 2026-11-04: "Remember there is no casting because we're going to be in our own film if we every act",
 * "Remember them 4 should work in cohesiveness").
 *
 * A production is the one thing the four roles work on: the script is its material, the producer takes it from
 * material to release, the director preps, shoots and cuts it (src/person/directing), and the parts in it are the ones
 * the life may play (src/person/acting). On each production the life holds the roles it chooses, at least one (the
 * owner: "Any roles, at least one"); a role it doesn't hold is filled by people hired at a standard the game sets
 * (HIRED, person.producing.model), so only the life's own roles' attributes move that role's result. It is a film, a
 * television series or a stage play ("Films, TV and stage"), made in a country it names (the life's home where it names
 * none). Its material is the life's own script, or material optioned that isn't the life's ("Both"): a script the life
 * writes is never sold or optioned to another's production ("Remove spec sales too"). What it comes out as is the mean
 * of the four roles' results, script, producing, directing and acting, a quarter each, a role the life doesn't hold
 * counting at the hired standard ("Equal blend of four"). Every role the life holds is paid from its budget, through
 * its accounts, tax and union rules, as it would pay anyone ("Union minimum from budget"; the lead's reading for the
 * director's minimum and the producer's fee): the writer the agreement's minimum on the first day of photography, the
 * director a stage's share of the guild's minimum, the actor the union's minimum for the part, the producer the fee.
 *
 * The stages, on the trade's own figures where it publishes them (R-4612), the producer's six broad attributes
 * (Development, Financing, Production, Leadership, Dealmaking, Marketing) read through the components and facets the
 * research names (R-4609):
 *
 * - Optioning material (Development: choosing the material): the producer reads a script a day and options the one
 *   that reads best to them; a better eye picks the better script. The option is the WGA's: 18 months for 10% of the
 *   minimum, renewed for 18 more at another 10%, each payment credited against the purchase price. The life's own
 *   script is developed instead: no option, the rights being the life's.
 * - Budgeting and scheduling (Production's detailed plan, Financing's production costs): the days the production needs
 *   (a feature around the CNC's 32 shooting days, the director's FEATURE_SHOOT; a series the DGA's shooting days for
 *   each episode; a play the run it schedules), and the days the plan schedules, nearer the need the better the plan;
 *   for a film the producer's fee and overheads at the BFI's 7 to 8% of direct costs and the UK's tax credit, 53% (the
 *   IFTC, budgets to £15m) or 34% (the AVEC) of the 80% of core costs it counts.
 * - Financing (Development's pitch, Financing's sources and strategy, Dealmaking's network, words and terms): the BFI
 *   says yes at its 13%, as the package sells it, an award of its 22% of the budget up to its £1.25m, and only to an
 *   option with ten months left; the rest from the market in the EAO's shares (broadcasters 18%, pre-sales 14%), the
 *   remainder from equity, the producer's own 18% (the EAO's producer investment) carried last. The package is the
 *   material and the pitch; where the material is the life's script, the writer's own pitch and documents stand beside
 *   the producer's, and the writer's contacts and a family in the business open doors to the market (R-4622).
 * - The shoot (Production's crew, Leadership's team): days slip where the team falters, the days past the schedule cost
 *   the budget's day rate, and the producer's fee is deferred against the overrun first.
 * - The release (Marketing, the film's quality): a cinema release at the BFI's rate for the budget (11.6% under £0.5m
 *   to 83.3% above £10m), and earning back twice the budget at its rate for those released (3.3% to 14.8%), as the film
 *   and its campaign sell it, the second in the film's genre as the BFI's gross per release of its group (2023) stands
 *   against all films' (src/person/genres; R-4622). A producer's films released in the last seven years (the PGA's
 *   window for its two features), and those a festival chose where the life directed them, count toward how financiers
 *   take the next: the next production rests on what the life can finance (the lead's reading, replacing the
 *   director's "debut leads to a second").
 *
 * The producer options material in the genres they love (the game's reading of the Genres page, person.genres.model).
 *
 * Beyond the UK, every country's market the research reads (src/person/producing/markets.json, compiled by
 * tools/person/markets-producer from the research, register facts person.markets.producer.<CC>, and Telefilm's, the
 * CNC's and Screen Australia's terms from R-4612; all but a country no producer works in, one dissolved or with no
 * sovereign): the budget is in the market's currency, an option runs in the market's city's time (the actor's market
 * there: one model of where the work is; where the actor's engine has none, the country's most populous place), and
 * each stage is the market's where its research sets it, by the budget where it sets it by budget: the fee and
 * overheads at each cap a funder sets (none where it sets none), the credit at the incentive's rate on the share it
 * counts, at most its cap, nothing below its threshold or where the research says there is none, none where it isn't
 * known; the public fund's yes at its rate as the package sells it, an award at the most its terms allow (its share, its
 * cap or its fixed sum, and what the cap on all public aid leaves after the credit), refused where the market's fund
 * isn't known or the budget is outside it; a cinema release at the market's rate, refused where none is known, and
 * earning back nothing the game can tell. The option is the WGA's everywhere, and the market's money is sought in the
 * EAO's shares (the game's reading where a market's own aren't researched, person.markets.producer.model). The research
 * is a film's: what a fund, an incentive, a fee cap or a release does for a series or a play isn't known, so a series'
 * or a play's plan has no fee or credit, and its fund and release are refused, told. What a market's research couldn't
 * find is told.
 *
 * What the trade doesn't publish (how well a producer's eye reads a script, how far a plan is off, how far a shoot
 * slips, how often the market closes a deal, how much a better package, a contact or a campaign moves a rate, the
 * standard of the people hired) is the game's own until the owner balances it (person.producing.model).
 */

/** The line that tells the player these figures are the game's own (person.producing.model). */
export const MODEL_LINE: LineId = 'producing.model';

/** The zone the PGA's seven years are counted in: the UK's, the engine's own market. */
export const ZONE = 'Europe/London';

/** The market the engine keeps itself (R-4612). */
export const HOME = 'GB';

/** What a production is, and how each role's engine reads it: a film's feature, a series' episodes, a play on stage. */
export const FORMATS = ['film', 'series', 'stage'] as const;
export type Format = (typeof FORMATS)[number];
/** The medium an actor's part in it is in. */
export const MEDIUM: Readonly<Record<Format, Medium>> = { film: 'film', series: 'television', stage: 'stage' };
/** The episodes a series is made of, as the DGA's rate card has them. */
export const EPISODE_FORMS = ['hour', 'half-hour'] as const;
export type Episode = (typeof EPISODE_FORMS)[number];

/** The roles a production has, which the life holds or hires. */
export const ROLES = ['writer', 'producer', 'director', 'actor'] as const;
export type Role = (typeof ROLES)[number];
/** The kind of work each role is, as tax and the law for the young read it. */
export const WORK_OF: Readonly<Record<Role, Work>> = { writer: 'author', producer: 'producer', director: 'director', actor: 'performer' };
/** The standard the people hired for a role the life doesn't hold work at, 0 to 100: the game's (person.producing.model). */
export const HIRED = 50;

/** A rate paid on the part of what is counted from one amount to another (to none: the rest), as compiled. */
export interface Band {
  readonly from: number;
  readonly to: number | null;
  readonly rate: number;
}
/** A term for budgets in a range (both counted, in major units): a fixed sum, or its bands on the share counted, at most so much. */
export interface Tier {
  readonly budget: readonly [number, number | null];
  readonly bands: readonly Band[];
  readonly base: number;
  readonly net: boolean;
  readonly most: number | null;
  readonly sum: number | null;
}
/** What a market's research couldn't find, by the item its blockers name. */
export type Unknown = 'fund' | 'incentive' | 'feecap' | 'outcomes' | 'market' | 'union' | 'language' | 'terms' | 'none' | 'rules' | 'fund.primary';
/** A market as compiled (tools/person/markets-producer/compile.ts). */
export interface Market {
  readonly currency: CurrencyCode;
  readonly fund: { readonly rate: number; readonly tiers: readonly Tier[] } | null;
  readonly aid: readonly Tier[];
  readonly credit: readonly Tier[] | null;
  readonly fees: readonly (readonly Tier[])[];
  readonly release: readonly { readonly budget: readonly [number, number | null]; readonly rate: number }[] | null;
  readonly unknown: readonly Unknown[];
  /** Its most populous place's zone on the map, where the actor's engine keeps no city there; none where the map has none. */
  readonly zone: string | null;
}
export const MARKETS = compiled as unknown as Readonly<Record<string, Market>>;

/**
 * The zone a market's months run in: its city's, as the actor's market there keeps it (the actor's own three by their
 * agreements), else its most populous place's on the map; refused where the map has no place there.
 */
export function zoneOf(market: string): string {
  const agreement = AGREEMENTS.find((a) => COUNTRY[a] === market);
  const zone = Object.hasOwn(ACTED, market) ? (ACTED[market] as { zone: string }).zone : agreement !== undefined ? WORK[agreement].zone : MARKETS[market]?.zone;
  if (zone === undefined || zone === null) throw new Error(`where the work in ${market} is made isn't known to this game`);
  return zone;
}

/** A market's currency. */
export const currencyOf = (market: string): CurrencyCode => (market === HOME ? 'GBP' : (MARKETS[market] as Market).currency);

/** The WGA's option: 18 months, renewed for 18 more, each at 10% of the minimum (R-4612, the 2026 MBA). */
export const OPTION_MONTHS = 18;

/**
 * 10% of the 2026 MBA's minimum for an original screenplay with treatment, low budget ($92,268).
 * shortcut: the high-budget minimum ($173,215, its option $17,321.50) binds a picture of $5m and over, which needs the
 * budget in dollars at the day's rate; read when the ledger pays the option.
 */
// Stryker disable next-line StringLiteral: a mutant here throws as the module loads, which Stryker reports as surviving
// (HANDOFF, blockers); the test holds the payment to the cent.
export const OPTION_FEE: Money = fromMajor('USD', '9226.80');

/** The BFI funds no project with under ten months left on its option, unless renewal is provided for (R-4612). */
export const MONTHS_LEFT = 10;

/** The producer's fee and overheads, as a share of the direct costs: the middle of the BFI's 7 to 8% (R-4612). */
export const FEE_SHARE = 0.075;

/** The UK's credits on the 80% of core costs they count: the IFTC's 53% for budgets to £15m, the AVEC's 34% above (R-4612). */
export const CREDIT = { core: 0.8, independent: 0.53, ceiling: 15_000_000, film: 0.34 } as const;

/** The BFI's production funding: 13% of applicants funded (2013/14), awards 22% of the budget (2018/19), at most £1.25m (Impact). */
export const BFI = { rate: 0.13, share: 0.22, most: 1_250_000 } as const;

/** The market's sources in the order sought, each its EAO share of a European film's budget (2020 films; R-4612). */
export const MARKET = { broadcaster: 0.18, 'pre-sales': 0.14, equity: null } as const;
export type Source = keyof typeof MARKET;

/** The producer's own investment, carried after every source: the EAO's 18%. */
export const PRODUCER_SHARE = 0.18;

/** A cinema release within two years, by budget in pounds below each bound (BFI, UK independent films 2003 to 2011). */
export const RELEASE: readonly (readonly [number, number])[] = [
  [500_000, 0.116],
  [2_000_000, 0.379],
  [5_000_000, 0.592],
  [10_000_000, 0.714],
  [Infinity, 0.833],
];

/** Box office of twice the budget, of those released, by budget in pounds below each bound (the same BFI study). */
export const RECOUP: readonly (readonly [number, number])[] = [
  [500_000, 0.033],
  [2_000_000, 0.049],
  [5_000_000, 0.087],
  [Infinity, 0.148],
];

/** The PGA's bar: two released features in seven years (R-4612). */
export const PGA = { features: 2, years: 7 } as const;

/** The game's own figures (person.producing.model). */
export const MODEL = {
  /** How far off a producer with no eye judges a script, either side, in points; none at 100. */
  misjudged: 100,
  /** How far a plan's days are off the need at 0, either side, as a share; none at 100. */
  planned: 0.3,
  /** A production's own need, either side of the trade's days, as a share. */
  need: 0.25,
  /** How far a shoot slips at 0 where the team falters, at most, as a share of the days; none at 100. */
  falter: 0.5,
  /** The market's chance of closing a source on a day of raising, for a package at the trade's middle. */
  daily: 1 / 30,
  /** What each film released in the PGA's window adds to how financiers take the next, up to its two. */
  record: 0.1,
  /** What each door open to the market (a contact, a family in the business) adds to a day's chance of closing, up to `doors`. */
  door: 0.05,
  doors: 10,
} as const;

export interface Plan {
  budget: Money;
  /** The days the production needs: a film's or a series' shooting days, a play's run. */
  needed: number;
  /** The days the plan schedules. */
  scheduled: number;
  /** The producer's fee and overheads; none where the market caps neither, or for a series or a play. */
  fee: Money | null;
  /** The market's tax credit; none where it isn't known, or for a series or a play. */
  credit: Money | null;
}

export interface Shoot {
  at: number;
  days: number;
  /** What the days past the schedule cost. */
  overrun: Money;
  /** The producer's fee after the overrun is taken from it. */
  fee: Money | null;
  /** What the producing made of it, 0 to 100: the producing's result. */
  quality: number;
}

/** What the production paid the life from its budget, in the budget's currency. */
export interface Cost {
  readonly at: number;
  readonly role: Role;
  readonly what: string;
  readonly amount: Money;
}

export interface Project {
  readonly id: number;
  readonly optioned: number;
  readonly format: Format;
  /** A series' episodes: their form, and how many. */
  readonly series: { readonly form: Episode; readonly episodes: number } | null;
  /** The film's or an episode's running time, where an agreement's minimums turn on it. */
  readonly minutes: number | null;
  /** The roles the life holds on it; the rest are hired. */
  readonly roles: readonly Role[];
  /** The life's own script it makes, by id; none where the material is optioned. */
  readonly script: number | null;
  /** The writers' agreement the life's script is paid under, where one sets its pay. */
  readonly writing: string | null;
  /** The genre of the material, by id. */
  readonly genre: string;
  /** The market it is made in, by country. */
  readonly market: string;
  /** The day the option lapses; none where the material is the life's own. */
  expires: number | null;
  /** Each option payment, the first and each renewal's, credited against the purchase price. */
  options: Money[];
  /** The material, 0 to 100: the life's script as last graded, or the one optioned. */
  material: number;
  plan: Plan | null;
  applied: boolean;
  /** Each source of money closed. */
  raised: { [source: string]: Money };
  shot: Shoot | null;
  costs: Cost[];
  /** What it came out as, and twice the budget back, where the market's research tells it. */
  release: { at: number; quality: number; cinema: boolean; doubled: boolean | null } | null;
}

export interface ProducingSlice {
  projects: Project[];
}

export const PRODUCING_START: ProducingSlice = { projects: [] };

type Values = Readonly<Record<string, number>>;
type Producing = { attributes: AttributesSlice; producing: ProducingSlice };
type Starting = Producing & { identity: IdentitySlice };
type Optioning = Starting & Holding & { genres: GenresSlice };
type Developing = Starting & { scripts: ScriptsSlice };
/** A project raised for: the writer's contacts and the person's family open doors. */
type Raising = Producing & { identity: IdentitySlice; career: CareerSlice; directing: DirectingSlice };
/** A fund applied to: whether it takes a producer of the person's age reads the person (person.youth). */
type Applying = Producing & { identity: IdentitySlice; career: CareerSlice; directing: DirectingSlice };
/** What pays the life from a production's budget: an account, tax, the law for the young. */
export type Paying = Producing & Earning & { identity: IdentitySlice; youth: YouthSlice };
/** A project shot: where the producer works, so whether they may work there reads the person, every role's days and the permits; the writer is paid. */
type Shooting = Paying & { acting: ActingSlice; directing: DirectingSlice; permits: PermitsSlice; scripts: ScriptsSlice };
/** A film released: what it came out as reads every role's work. */
type Releasing = Producing & { acting: ActingSlice; directing: DirectingSlice };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const of = (v: Values, id: string) => skillOf(v, 'producer', id);
const amount = (currency: CurrencyCode, minor: number) => money(currency, Math.round(minor));
const whole = (n: unknown, what: string, least: number) => {
  if (!Number.isInteger(n) || (n as number) < least) throw new RangeError(`${what} is a whole number of at least ${least} (${String(n)})`);
};
const wholeDays = (days: number) => {
  if (!Number.isInteger(days) || days < 1) throw new RangeError(`the days given are a whole number of at least 1 (${days})`);
};

export function projectOf(s: ProducingSlice, id: number): Project {
  const found = s.projects.find((p) => p.id === id);
  if (found === undefined) throw new Error(`there's no project ${id}`);
  return found;
}

/** Whether the life holds a role on a production. */
export const holds = (p: Pick<Project, 'roles'>, role: Role): boolean => p.roles.includes(role);

/** The producer's values on a production: the life's where it produces, the people hired's otherwise. */
export function producerValues(s: { attributes: AttributesSlice }, p: Pick<Project, 'roles'>): Values {
  // @slate:consumer attributes.choose
  return holds(p, 'producer') ? componentValues(s.attributes, 'producer') : componentValues({ producer: Object.fromEntries(ATTRIBUTES.producer.map((a) => [a.id, HIRED])) }, 'producer');
}

/** Practises the producer's attributes, where the life produces. */
const learn = (s: { attributes: AttributesSlice }, p: Pick<Project, 'roles'>, components: readonly string[], days: number) => {
  if (holds(p, 'producer')) practise(s.attributes, 'producer', components, days);
};

/** The component ids the engine reads, by the broad attribute that covers them. */
export const C = {
  select: 'select-plays-scripts-books-news-content-or-ideas-to-be-produ',
  pitch: 'pitch-ideas-to-tv-companies-and-film-studios-to-back-your-pr',
  arrange: 'arrange-financing-for-productions',
  adequacy: 'adequacy-of-the-financing-strategy',
  costs: 'calculate-production-costs',
  plan: 'detailed-plan-for-a-project',
  hire: 'hire-directors-and-production-staff',
  lead: 'ability-to-lead-and-motivate-teams',
  network: 'develop-professional-network',
  communicator: 'a-first-class-communicator',
  marketing: 'develop-marketing-plans-for-finished-products-collaborating-',
} as const;

/** The option still runs a number of months past a moment (the life's own material always does); refused where it doesn't. */
function running(p: Project, at: number, months: number): void {
  // @slate:consumer producing.renew
  if (p.expires !== null && addMonths(zoneOf(p.market), at, months) > p.expires) throw new Error(`project ${p.id}'s option ${months === 0 ? 'has lapsed' : `has under ${months} months left`}`);
}

/**
 * The producer's films in the PGA's seven years before a moment that found an audience: released in cinemas, or (the
 * life directing them) chosen by a festival, prepped in those years, each production once. A festival's choice is the
 * director's engine's reading of an audience found (person.directing.model), which led to a second feature until
 * 2026-11-04 and now counts toward how financiers take the next, as a release does (person.producing.model).
 */
// Stryker disable next-line ArrayDeclaration: a film standing in for none has no start in the window, so no input tells the two apart.
export function record(s: ProducingSlice, at: number, d: DirectingSlice = { films: [] }): number {
  const since = addMonths(ZONE, at, -12 * PGA.years);
  // @slate:consumer producing.release
  const released = s.projects.filter((p) => p.release?.cinema === true && p.release.at >= since).map((p) => p.id);
  // @slate:consumer directing.submit
  const chosen = d.films.filter((f) => f.started >= since && Object.values(f.festivals).includes(true)).map((f) => f.project);
  return new Set([...released, ...chosen]).size;
}

/** How the producer sells a package, 0 to 100: the pitch, the financing's sources and strategy, the network, words and terms. */
export const pitchSkill = (v: Values): number =>
  0.3 * of(v, C.pitch) + 0.2 * of(v, C.arrange) + 0.1 * of(v, C.adequacy) + 0.2 * of(v, C.network) + 0.1 * of(v, C.communicator) + 0.1 * of(v, 'negotiation');

/** The pitch a package goes out with: the producer's, and where the material is the life's script, the writer's own beside it, equally. */
export function packagePitch(s: { attributes: AttributesSlice; career: CareerSlice }, v: Values, p: Project): number {
  if (p.script === null) return pitchSkill(v);
  // @slate:consumer script.summarise
  return (pitchSkill(v) + pitchOf(componentValues(s.attributes, 'screenwriter'), s.career.documents[String(p.script)] ?? {})) / 2;
}

/** How a financier takes a project, 0.5 to 1.7: the material and the pitch, 1 for both at the middle, and the producer's record. */
export function factor(s: ProducingSlice, pitch: number, p: Project, at: number, d?: DirectingSlice): number {
  // @slate:consumer producing.option
  // @slate:consumer producing.develop
  return 0.5 + (0.5 * p.material + 0.5 * pitch) / 100 + MODEL.record * Math.min(PGA.features, record(s, at, d));
}

/** The doors open to the market: the contacts the life has made (network.meet), and one for a family in the business, which sponsors (R-4622). */
export function doors(s: { identity: IdentitySlice; career: CareerSlice }): number {
  // @slate:consumer network.meet
  // @slate:consumer identity.make
  return s.career.contacts + (inTheBusiness(personOf(s.identity)) === null ? 0 : 1);
}

/** The eye a producer reads material with, 0 to 100: choosing the material. */
export const eye = (v: Values): number => of(v, C.select);

export interface DaysArgs {
  [key: string]: number;
  days: number;
}

/** What every production names: its format, the roles the life holds, its country, a series' episodes and a running time. */
export interface MakingArgs {
  [key: string]: Json;
  format: string;
  roles: string[];
  /** The country it is made in, by code: the life's home where none is given. */
  market?: string;
  /** A series': its episodes' form and how many. */
  episode?: string;
  episodes?: number;
  /** The film's or an episode's running time, where an agreement's minimums turn on it. */
  minutes?: number;
}

type Making = Pick<Project, 'format' | 'series' | 'minutes' | 'roles' | 'market'>;

/** A production as named: refused for a format or a role there isn't, no role or one twice, a series without its episodes, a stage play directed. */
function making(s: Starting, a: MakingArgs): Making {
  const format = a.format as Format;
  if (!FORMATS.includes(format)) throw new Error(`there's no format ${String(a.format)}`);
  if (!Array.isArray(a.roles) || a.roles.length === 0) throw new Error('the life holds at least one role on a production');
  const roles = a.roles as Role[];
  for (const r of roles) if (!ROLES.includes(r)) throw new Error(`there's no role ${String(r)}`);
  if (new Set(roles).size !== roles.length) throw new Error('a role is held once');
  if (format === 'stage' && roles.includes('director')) throw new Error("a stage director's terms aren't known to this game, so a play is directed by someone hired");
  let series: Project['series'] = null;
  if (format === 'series') {
    if (!EPISODE_FORMS.includes(a.episode as Episode)) throw new Error(`a series' episodes are an hour or a half-hour (${String(a.episode)})`);
    whole(a.episodes, 'the episodes', 1);
    series = { form: a.episode as Episode, episodes: a.episodes as number };
  } else if (a.episode !== undefined || a.episodes !== undefined) throw new Error(`a ${format} has no episodes`);
  if (a.minutes !== undefined) whole(a.minutes, 'the running time', 1);
  // @slate:consumer identity.make
  const market = a.market ?? residenceOf(personOf(s.identity));
  if (market !== HOME && !Object.hasOwn(MARKETS, market)) throw new Error(`${market} isn't a market a producer works in`);
  zoneOf(market);
  return { format, series, minutes: a.minutes ?? null, roles: [...roles], market };
}

const started = (s: Producing, id: number, at: number, m: Making, rest: Pick<Project, 'script' | 'writing' | 'genre' | 'expires' | 'options' | 'material'>): void => {
  s.producing.projects.push({ id, optioned: at, ...m, ...rest, plan: null, applied: false, raised: {}, shot: null, costs: [], release: null });
};

/**
 * Options material that isn't the life's (a book, a story, another's script): a script read a day, each at its own
 * worth (any from 0 to 100, as the market's are), judged by the producer's eye, the one judged best optioned.
 */
function option(s: Optioning, a: OptionArgs, c: Context): void {
  wholeDays(a.days);
  const m = making(s, a);
  if (holds(m, 'writer')) throw new Error("optioned material is someone else's writing, so the life doesn't hold the writer's role");
  // @slate:consumer genres.choose
  lovesOrRefuse(s.genres, a.genre);
  const v = producerValues(s, m);
  const id = s.producing.projects.length + 1;
  const off = MODEL.misjudged * (1 - eye(v) / 100);
  const d = c.draws('producing.work', 'option', id, c.now);
  let best = { worth: 0, judged: -Infinity };
  for (let i = 0; i < a.days; i += 1) {
    const worth = 100 * d.float();
    // Off by up to `off` either side: only the order of the judgements counts, so it is drawn on one side, twice as wide.
    const judged = worth + 2 * off * d.float();
    // Stryker disable next-line EqualityOperator: a draw is continuous, so two judge alike with no probability.
    if (judged > best.judged) best = { worth, judged };
  }
  // The option is paid to the material's owner from the account named (refused where it can't cover it).
  payCost(s, a.account, 'rights holder', OPTION_FEE, 'an option', c.now);
  started(s, id, c.now, m, { script: null, writing: null, genre: a.genre, expires: addMonths(zoneOf(m.market), c.now, OPTION_MONTHS), options: [OPTION_FEE], material: best.worth });
  learn(s, m, [C.select], a.days);
}

export interface OptionArgs extends MakingArgs {
  days: number;
  /** The genre read in, by id: one the producer loves. */
  genre: string;
  /** The account the option is paid from. */
  account: string;
}

export interface DevelopArgs extends MakingArgs {
  /** The life's own script, by id. */
  script: number;
  /** The writers' agreement it is paid under, where the market has several for its form. */
  agreement?: string;
}

/** The forms of script each format is made from. */
export const WRITTEN_FOR: Readonly<Record<Exclude<Format, 'stage'>, readonly Written[]>> = { film: ['feature', 'short'], series: ['pilot', 'episode'] };

/**
 * The writers' agreement a production pays the life's script under: the one named, or the market's only one for the
 * form (the WGA's in the US); none where the research knows none there. Refused where the one named isn't the market's,
 * the market has several and none is named, the agreement's figures aren't known (told), or the writer doesn't write
 * any of its languages well enough.
 */
export function writingFor(s: { identity: IdentitySlice }, market: string, form: Written, named: string | undefined): string | null {
  const all = market === countryOf(KEPT) ? [KEPT] : ((WRITTEN[market]?.agreements ?? []) as readonly string[]);
  const covering = all.filter((id) => id === KEPT || (writerMarketOf(id) as { forms: readonly Written[] }).forms.includes(form));
  if (named !== undefined && !covering.includes(named)) throw new Error(`a ${form} made in ${market} isn't paid under ${named}`);
  const id = named ?? (covering.length > 1 ? undefined : (covering[0] ?? null));
  if (id === undefined) throw new Error(`a ${form} made in ${market} names its writers' agreement: ${covering.join(', ')}`);
  if (id === null) return null;
  if (writerMarketOf(id)?.unknown === true) throw new Error(writersUnknown(id) as string);
  const languages = languagesOf(id);
  // @slate:consumer identity.make
  if (!languages.some((l) => speaks(personOf(s.identity), l, WRITES_IN))) throw new Error(`a script under ${id} is written in ${languages.join(' or ')}, which the writer doesn't write well enough`);
  return id;
}

/** Develops the life's own script into a production: the material is the script as it stands, the rights the life's. */
function develop(s: Developing, a: DevelopArgs, c: Context): void {
  const m = making(s, a);
  if (!holds(m, 'writer')) throw new Error("the life's own script makes the life the production's writer");
  // @slate:consumer script.write
  const script = scriptOf(s.scripts, a.script);
  if (s.producing.projects.some((p) => p.script === script.id)) throw new Error(`script ${script.id} is in a production already`);
  if (m.format === 'stage') throw new Error("the life writes for the screen, so a play is someone else's material");
  const forms = WRITTEN_FOR[m.format];
  if (!forms.includes(script.form)) throw new Error(`a ${m.format} is made from a ${forms.join(' or ')}, not a ${script.form}`);
  const writing = writingFor(s, m.market, script.form, a.agreement);
  // @slate:consumer script.revise
  // @slate:consumer script.read
  started(s, s.producing.projects.length + 1, c.now, m, { script: script.id, writing, genre: script.genre, expires: null, options: [], material: quality(script) });
}

export interface ProjectArgs {
  [key: string]: number;
  project: number;
}

export interface PayingArgs {
  [key: string]: Json;
  project: number;
  /** The account paid from, or into. */
  account: string;
}

/** Renews a running option for another 18 months, from when it would have lapsed, at another 10%, paid from the account named. */
function renew(s: { producing: ProducingSlice } & Holding, a: PayingArgs, c: Context): void {
  const p = projectOf(s.producing, a.project);
  if (p.expires === null) throw new Error(`project ${p.id}'s material is the life's own, under no option`);
  if (p.shot !== null) throw new Error(`project ${p.id}'s rights are bought`);
  running(p, c.now, 0);
  payCost(s, a.account, 'rights holder', OPTION_FEE, 'an option renewed', c.now);
  p.expires = addMonths(zoneOf(p.market), p.expires, OPTION_MONTHS);
  p.options.push(OPTION_FEE);
}

export interface PlanArgs {
  [key: string]: number | string;
  project: number;
  /** In the market's currency. */
  budget: string;
  /** A play's: the days of rehearsal and performance it runs. */
  days?: number;
}

/** The UK's credit on a budget: the IFTC's 53% to £15m (its £6.36m most is 53% of 80% of £15m), the AVEC's 34% above. */
export function creditOn(budget: Money): Money {
  const rate = budget.minor <= CREDIT.ceiling * 100 ? CREDIT.independent : CREDIT.film;
  return amount('GBP', budget.minor * CREDIT.core * rate);
}

/** The tier of a market's term that holds a budget; none where none does. */
export function tierFor<T extends { readonly budget: readonly [number, number | null] }>(tiers: readonly T[], budget: Money): T | undefined {
  const scale = 10 ** minorUnits(budget.currency);
  return tiers.find(({ budget: [lo, hi] }) => budget.minor >= Math.round(lo * scale) && (hi === null || budget.minor <= Math.round(hi * scale)));
}

/** What a tier gives a budget, in minor units: its sum, or its bands on the share counted (without end where it has none), at most its most. */
export function amountOf(tier: Tier, budget: Money): number {
  const scale = 10 ** minorUnits(budget.currency);
  if (tier.sum !== null) return tier.sum * scale;
  // Net of itself as the research's example counts it (Germany's fee: 5% of €3.25m less its 5%, €154,375).
  const counted = budget.minor * tier.base * (tier.net ? 1 - (tier.bands[0] as Band).rate : 1);
  const banded = tier.bands.length === 0 ? Infinity : tier.bands.reduce((sum, b) => sum + b.rate * Math.max(0, Math.min(counted, b.to === null ? Infinity : b.to * scale) - b.from * scale), 0);
  return tier.most === null ? banded : Math.min(banded, tier.most * scale);
}

/** A market's fee and overheads on a budget: each cap it sets, summed; none where it sets none for the budget. */
export function feeIn(m: Market, budget: Money): Money | null {
  const tiers = m.fees.map((part) => tierFor(part, budget)).filter((x): x is Tier => x !== undefined);
  return tiers.length === 0 ? null : amount(budget.currency, tiers.reduce((sum, x) => sum + amountOf(x, budget), 0));
}

/** A market's credit on a budget: nothing where no tier holds it (below the threshold, or none at all); none where it isn't known. */
export function creditIn(m: Market, budget: Money): Money | null {
  if (m.credit === null) return null;
  const tier = tierFor(m.credit, budget);
  return amount(budget.currency, tier === undefined ? 0 : amountOf(tier, budget));
}

/** How near the need a producer schedules, 0 to 100: the detailed plan and the production's costs. */
export const planSkill = (v: Values): number => 0.5 * of(v, C.plan) + 0.5 * of(v, C.costs);

/** The trade's days for a production, before its own need: a feature's 32 shooting days, a series' episodes' guaranteed shooting days, a play's run as given. */
export function tradeDays(p: Pick<Project, 'format' | 'series'>, days: number | undefined): number {
  if (p.format !== 'stage') {
    if (days !== undefined) throw new Error(`a ${p.format}'s days are the trade's`);
    return p.series === null ? FEATURE_SHOOT : EPISODES[p.series.form].shoot * p.series.episodes;
  }
  whole(days, "a play's days", 1);
  return days as number;
}

/** Budgets and schedules a project: the days it needs, the days the plan gives it, and for a film the fee and the credit. */
function plan(s: Producing, a: PlanArgs, c: Context): void {
  const p = projectOf(s.producing, a.project);
  const v = producerValues(s, p);
  if (p.plan !== null) throw new Error(`project ${p.id} is planned`);
  // @slate:consumer producing.option
  const currency = currencyOf(p.market);
  const budget = fromMajor(currency, a.budget);
  if (budget.minor < 10 ** minorUnits(currency)) throw new RangeError(`a budget is at least 1 ${currency} (${a.budget})`);
  const base = tradeDays(p, a.days);
  const d = c.draws('producing.work', 'plan', p.id);
  const needed = p.format === 'stage' ? base : Math.round(base * (1 + MODEL.need * (2 * d.float() - 1)));
  const scheduled = Math.max(1, Math.round(needed * (1 + MODEL.planned * (1 - planSkill(v) / 100) * (2 * d.float() - 1))));
  const m = MARKETS[p.market] as Market;
  const home = p.market === HOME;
  const film = p.format === 'film';
  p.plan = { budget, needed, scheduled, fee: !film ? null : home ? amount(currency, (budget.minor * FEE_SHARE) / (1 + FEE_SHARE)) : feeIn(m, budget), credit: !film ? null : home ? creditOn(budget) : creditIn(m, budget) };
  learn(s, p, [C.plan, C.costs], 1);
}

const planOf = (p: Project): Plan => {
  if (p.plan === null) throw new Error(`project ${p.id} has no budget`);
  return p.plan;
};

/** The money closed for a project, the credit with it. */
export function raised(p: Project): number {
  // @slate:consumer producing.plan
  // @slate:consumer producing.apply
  // @slate:consumer producing.raise
  return Object.values(p.raised).reduce((sum, m) => sum + m.minor, planOf(p).credit?.minor ?? 0);
}

/** What the sources must close: all but the producer's own share. */
export const target = (p: Project): number => planOf(p).budget.minor - Math.round(planOf(p).budget.minor * PRODUCER_SHARE);

export const financed = (p: Project): boolean => raised(p) >= target(p);

/** A project financed, refused otherwise: what every role's work on it waits for. */
export function financedOf(s: ProducingSlice, id: number): Project & { plan: Plan } {
  const p = projectOf(s, id);
  if (!financed(p)) throw new Error(`project ${p.id} isn't financed`);
  return p as Project & { plan: Plan };
}

/** Refused where a project can't take more money: not planned, financed already, or its option short of the months. */
function seeking(p: Project, at: number, months: number): void {
  if (financed(p)) throw new Error(`project ${p.id} is financed`);
  running(p, at, months);
}

/**
 * A market's fund for a project: how often it says yes, and its award at the most its terms allow, held to what the cap
 * on all public aid leaves after the credit; refused where the fund isn't known, the budget is outside it, or the credit
 * takes all the aid the budget may have.
 */
export function fundFor(p: Project): { rate: number; award: number } {
  const m = MARKETS[p.market] as Market;
  const { budget, credit } = planOf(p);
  if (m.fund === null) throw new Error(`what a public fund in ${countryName(p.market as CountryCode)} gives a producer's film isn't known to this game`);
  const tier = tierFor(m.fund.tiers, budget);
  if (tier === undefined) throw new Error(`project ${p.id}'s budget isn't one ${countryName(p.market as CountryCode)}'s fund backs`);
  const aid = tierFor(m.aid, budget);
  const left = aid === undefined ? Infinity : amountOf(aid, budget) - (credit?.minor ?? 0);
  if (left <= 0) throw new Error(`project ${p.id}'s credit takes all the public aid it may have`);
  return { rate: m.fund.rate, award: Math.min(amountOf(tier, budget), left) };
}

/** Applies to the market's fund (the BFI in the UK), once a project: a yes at its rate as the package sells it, and its award. */
function apply(s: Applying, a: ProjectArgs, c: Context): void {
  const p = projectOf(s.producing, a.project);
  const v = producerValues(s, p);
  if (p.applied) throw new Error(`project ${p.id} has applied`);
  if (p.format !== 'film') throw new Error(`what a public fund gives a ${p.format === 'series' ? 'series' : 'play'} isn't known to this game`);
  // @slate:consumer identity.make
  const refused = fundRefuses(personOf(s.identity), p.market, c.now);
  if (refused !== null) throw new Error(refused);
  const home = p.market === HOME;
  seeking(p, c.now, home ? MONTHS_LEFT : 0);
  const { rate, award } = home ? { rate: BFI.rate, award: Math.min(planOf(p).budget.minor * BFI.share, BFI.most * 100) } : fundFor(p);
  p.applied = true;
  // Stryker disable next-line EqualityOperator: a draw is continuous, so it equals the chance with no probability.
  if (c.draws('producing.work', 'apply', p.id).float() < rate * factor(s.producing, packagePitch(s, v, p), p, c.now, s.directing)) p.raised[home ? 'bfi' : 'fund'] = amount(planOf(p).budget.currency, award);
  learn(s, p, [C.pitch, C.arrange, C.network], 1);
}

/** Days raising the rest from the market: each day a chance of closing the next source, until the project is financed. */
function raise(s: Raising, a: DaysArgs & ProjectArgs, c: Context): void {
  wholeDays(a.days);
  const p = projectOf(s.producing, a.project);
  const v = producerValues(s, p);
  seeking(p, c.now, 0);
  const chance = MODEL.daily * factor(s.producing, packagePitch(s, v, p), p, c.now, s.directing) * (1 + MODEL.door * Math.min(MODEL.doors, doors(s)));
  const d = c.draws('producing.work', 'raise', p.id, c.now);
  for (let day = 0; day < a.days && !financed(p); day += 1) {
    // Stryker disable next-line EqualityOperator: a draw is continuous, so it equals the chance with no probability.
    if (d.float() >= chance) continue;
    const [source, share] = Object.entries(MARKET).find(([k]) => !(k in p.raised)) as [Source, number | null];
    p.raised[source] = amount(planOf(p).budget.currency, share === null ? target(p) - raised(p) : planOf(p).budget.minor * share);
  }
  learn(s, p, [C.arrange, C.network], a.days);
}

/** A production's budget in whole major units of its currency, as the agreements' tiers read it (every market's agreements pay in its currency, a test holds). */
export const budgetMajor = (p: Project): number => Math.floor(planOf(p).budget.minor / 10 ** minorUnits(planOf(p).budget.currency));

/** What the production's budget has left to pay, in its minor units: the budget less what it has paid the life. */
export const left = (p: Project): number => planOf(p).budget.minor - p.costs.reduce((t, x) => t + x.amount.minor, 0);

/**
 * Pays the life for a role on a production, from its budget: refused where the budget can't cover it; into the account
 * named, less what the production's country withholds (money.tax), and what its law sets aside of a minor's pay
 * (person.youth). The production's world account pays it, so the money leaves the budget once and is income once.
 */
export function payOut(s: Paying, p: Project, role: Role, gross: Money, what: string, account: string, c: Context): void {
  if (gross.currency !== planOf(p).budget.currency) throw new Error(`project ${p.id}'s budget is in ${planOf(p).budget.currency}, not ${gross.currency}`);
  if (gross.minor > left(p)) throw new Error(`project ${p.id}'s budget can't pay ${what}`);
  // @slate:consumer identity.make
  const paid = earn(s, { account, payer: `production:${p.id}`, country: p.market, home: residenceOf(personOf(s.identity)), work: WORK_OF[role], gross, what }, c);
  p.costs.push({ at: c.now, role, what, amount: gross });
  holdBack(s, paid, `${role}:${p.id}`, c);
}

/** The crew a producer hires and runs, 0 to 100: Production's hiring, coordination, time and detail. */
export const crewSkill = (v: Values): number => 0.4 * of(v, C.hire) + 0.2 * of(v, 'coordination') + 0.2 * of(v, 'time-management') + 0.2 * of(v, 'attention-to-detail');

/** How the producer holds the team, 0 to 100: Leadership's leading, stress, problems and change. */
export const leadSkill = (v: Values): number => 0.4 * of(v, C.lead) + 0.2 * of(v, 'stress-tolerance') + 0.2 * of(v, 'complex-problem-solving') + 0.2 * of(v, 'adaptability');

export const team = (v: Values): number => (crewSkill(v) + leadSkill(v)) / 2;

/**
 * Shoots a financed project: the days it takes, what the days past the schedule cost, the fee left, and what the
 * producing made of it; the life's script is paid for on this first day of photography, at its agreement's minimum
 * (what an agreement holds back for photography is due today with the rest).
 */
function shoot(s: Shooting, a: PayingArgs, c: Context): void {
  // @slate:consumer producing.raise
  const p = financedOf(s.producing, a.project);
  const v = producerValues(s, p);
  if (p.shot !== null) throw new Error(`project ${p.id} is shot`);
  running(p, c.now, 0);
  const e = engagementOf(p);
  const producing = holds(p, 'producer');
  // @slate:consumer permits.decision
  // Stryker disable next-line StringLiteral: no rule the research names covers a producer apart (papers.permits' COVERS), so another name is refused alike; the permits engine's tests hold the reading.
  if (producing && !permitted(s, e.country, c.now, e.days, 'producer')) throw new Error(`the person may not work in ${e.country} without a permit`);
  // A minor producer is engaged as the shoot's country's law lets them be, their days at the hours it allows (person.youth).
  const grant = producing ? engagement(s, e.country, 'producer', c.now) : null;
  const writes = p.writing === null ? null : writerPay(s, p, c.now);
  // A minor's script is bought as that law binds the contract, so it is refused here where that isn't granted.
  const signed = writes === null ? null : engagement(s, e.country, 'author', c.now);
  // @slate:consumer producing.plan
  const { budget, needed, scheduled, fee } = p.plan;
  const t = team(v);
  const d = c.draws('producing.work', 'shoot', p.id);
  const days = Math.ceil(needed * (1 + MODEL.falter * (1 - t / 100) * d.float()));
  const overrun = (Math.max(0, days - scheduled) * budget.minor) / scheduled;
  const quality = clamp(t + spread(t) * (2 * d.float() - 1), 0, 100);
  p.shot = { at: c.now, days, overrun: amount(budget.currency, overrun), fee: fee === null ? null : amount(budget.currency, Math.max(0, fee.minor - overrun)), quality };
  if (writes !== null) payOut(s, p, 'writer', writes, 'the script', a.account, c);
  if (signed !== null) signed.used = true;
  // The fee left after the overrun is paid to the life where it produces.
  if (producing && p.shot.fee !== null && p.shot.fee.minor > 0) payOut(s, p, 'producer', p.shot.fee, "producer's fee", a.account, c);
  if (grant !== null) grant.used = true;
  // @slate:consumer identity.make
  learn(s, p, [C.hire, C.lead], days * hoursShare(personOf(s.identity), e.country, 'producer', c.now));
}

/** What the production pays the life's script: its agreement's minimum on the day, for the production's budget and running time; none where it's left to negotiation. */
function writerPay(s: { scripts: ScriptsSlice }, p: Project & { plan: Plan }, now: number): Money | null {
  // @slate:consumer script.write
  const script = scriptOf(s.scripts, p.script as number);
  return minimumOf({ agreement: p.writing as string, budget: budgetMajor(p), minutes: p.minutes }, script.form, dateOf(now), script);
}

/**
 * What a production came out as, 0 to 100: the mean of the four roles' results, script, producing, directing and acting,
 * a quarter each, a role the life doesn't hold at the hired standard. Refused until each role the life holds has done
 * its work: the shoot, the director's cut, every part cast played.
 */
export function qualityOf(s: { directing: DirectingSlice; acting: ActingSlice }, p: Project): number {
  // @slate:consumer producing.shoot
  if (p.shot === null) throw new Error(`project ${p.id} isn't shot`);
  // @slate:consumer directing.cut
  const cut = s.directing.films.find((f) => f.project === p.id)?.quality ?? null;
  if (holds(p, 'director') && cut === null) throw new Error(`project ${p.id} isn't cut`);
  // @slate:consumer acting.cast
  // @slate:consumer acting.perform
  const parts = s.acting.parts.filter((x) => x.project === p.id).map((x) => x.work?.quality ?? null);
  if (holds(p, 'actor') && (parts.length === 0 || parts.includes(null))) throw new Error(`project ${p.id}'s parts aren't all played`);
  const acted = parts.reduce((t: number, q) => t + (q as number), 0) / parts.length;
  const result = (role: Role, own: number) => (holds(p, role) ? own : HIRED);
  return (result('writer', p.material) + result('producer', p.shot.quality) + result('director', cut as number) + result('actor', acted)) / 4;
}

/** How the film and its campaign sell it, 0 to 100: the film, and Marketing's plans and media. */
export const sellSkill = (v: Values, quality: number): number => 0.5 * quality + 0.5 * (0.7 * of(v, C.marketing) + 0.3 * of(v, 'communications-and-media'));

/** A rate by budget, from a table of bounds in pounds. */
export const rateFor = (table: readonly (readonly [number, number])[], budget: Money): number => (table.find(([below]) => budget.minor < below * 100) as readonly [number, number])[1];

/**
 * Releases a film shot: what it came out as, a cinema release, and twice the budget back, at the BFI's rates for its
 * budget as it sells; in another market, a cinema release at its rate, refused where its research gives none. A
 * series' or a play's release isn't researched, so it is refused, told.
 */
function release(s: Releasing, a: ProjectArgs, c: Context): void {
  const p = projectOf(s.producing, a.project);
  const v = producerValues(s, p);
  if (p.format !== 'film') throw new Error(`how a ${p.format === 'series' ? 'series' : 'play'} fares once it's made isn't known to this game`);
  if (p.release !== null) throw new Error(`project ${p.id} is released`);
  const quality = qualityOf(s, p);
  const { budget } = planOf(p);
  const home = p.market === HOME;
  const tier = home ? undefined : tierFor((MARKETS[p.market] as Market).release ?? [], budget);
  if (!home && tier === undefined) throw new Error(`how often a film made in ${countryName(p.market as CountryCode)} reaches cinemas isn't known to this game`);
  const f = 0.5 + sellSkill(v, quality) / 100;
  const d = c.draws('producing.work', 'release', p.id);
  // Stryker disable next-line EqualityOperator: a draw is continuous, so it equals the chance with no probability.
  const cinema = d.float() < (tier === undefined ? rateFor(RELEASE, budget) : tier.rate) * f;
  // @slate:consumer producing.option
  const earns = rateFor(RECOUP, budget) * f * boxOfficeFactor(p.genre);
  // Stryker disable next-line EqualityOperator: as above.
  p.release = { at: c.now, quality, cinema, doubled: home ? cinema && d.float() < earns : null };
  learn(s, p, [C.marketing], 1);
}

/** The line that tells the player what of a market isn't known. */
export const UNKEPT_LINE: LineId = 'producing.unkept';
/** Each item a market's research couldn't find, as the player is told it. */
export const MISSING: Readonly<Record<Unknown, string>> = {
  fund: 'what its public fund gives a film, or how often it says yes',
  incentive: 'the production incentive a film can claim',
  feecap: "the cap a funder sets on the producer's fee and overheads",
  outcomes: 'how often a film is released or earns back its cost',
  market: 'where most of the work is',
  union: "the producers' association and what it asks",
  language: 'the language the work is made in',
  terms: "what fund, incentive or agreement sets a producer's terms",
  none: 'whether any fund, incentive or agreement exists for a producer at all',
  rules: 'the rules a production must follow',
  'fund.primary': "the public fund's own published terms",
};

/** What the player is told of a market where its research couldn't find all of it: "a, b and c"; nothing where it is known whole. */
export function aboutMarket(market: string): string | undefined {
  const missing = (MARKETS[market]?.unknown ?? []).map((u) => MISSING[u]);
  if (missing.length === 0) return undefined;
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing.at(-1) as string}` : (missing[0] as string);
  return t(UNKEPT_LINE, { country: countryName(market as CountryCode), missing: list });
}

/** Where a project is made and the days it is scheduled for, as a permit to work there would ask. */
export const engagementOf = (p: Project): { country: CountryCode; days: number } => ({ country: p.market as CountryCode, days: planOf(p).scheduled });

/** The form the director's engine reads a production as: a feature, or a series' episodes. */
export const directedAs = (p: Pick<Project, 'format' | 'series'>): Directed => (p.series === null ? 'feature' : p.series.form);

// Stryker disable all: a mutant of a declaration made as the module loads changes its shape, so the module loaded
// again for it is refused as declared twice (as the accounts' and the cards' say). The declarations are held by the
// test that lists each command with what it reads and writes; what each does is mutated above.
export const optionMaterial = defineCommand<Optioning, OptionArgs>({ id: 'producing.option', reads: ['genres', 'identity'], writes: ['attributes', 'producing', 'accounts', 'ledger'], run: option });
export const developScript = defineCommand<Developing, DevelopArgs>({ id: 'producing.develop', reads: ['identity', 'scripts'], writes: ['producing'], run: develop });
export const renewOption = defineCommand<{ producing: ProducingSlice } & Holding, PayingArgs>({ id: 'producing.renew', reads: [], writes: ['producing', 'accounts', 'ledger'], run: renew });
export const planProject = defineCommand<Producing, PlanArgs>({ id: 'producing.plan', reads: [], writes: ['attributes', 'producing'], run: plan });
export const applyToFunder = defineCommand<Applying, ProjectArgs>({ id: 'producing.apply', reads: ['identity', 'career', 'directing'], writes: ['attributes', 'producing'], run: apply });
export const raiseMoney = defineCommand<Raising, DaysArgs & ProjectArgs>({ id: 'producing.raise', reads: ['identity', 'career', 'directing'], writes: ['attributes', 'producing'], run: raise });
export const shootProject = defineCommand<Shooting, PayingArgs>({ id: 'producing.shoot', reads: ['identity', 'acting', 'directing', 'permits', 'scripts'], writes: ['attributes', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'], run: shoot });
export const releaseFilm = defineCommand<Releasing, ProjectArgs>({ id: 'producing.release', reads: ['acting', 'directing'], writes: ['attributes', 'producing'], run: release });
