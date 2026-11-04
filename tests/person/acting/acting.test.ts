import { describe, expect, it } from 'vitest';
import { begin, commandIndex, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { fromMajor, money } from '../../../src/core/money/money.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { daysFromCivil, SECONDS_PER_DAY } from '../../../src/core/time/calendar.ts';
import { ATTRIBUTES, ATTRIBUTES_START, broadOf, chooseAttributes, componentValues, DAILY, skillOf, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import {
  ACTING_START,
  ACTRA,
  ACTRA_FEW_LINES,
  AGREEMENTS,
  castOf,
  castPart,
  COUNTRY,
  CRAFT,
  credit,
  dateOf,
  daysWorked,
  demands,
  experience,
  FLUENT,
  GENDERS,
  MARKET,
  MEDIUM,
  marketOf,
  misfit,
  MODEL_LINE,
  PACT,
  PACT_FLOOR,
  partOf,
  partSkill,
  pay,
  playPart,
  rateAt,
  SAG,
  SAG_TIERS,
  scaleOf,
  STAGE,
  UK_THEATRE,
  WEEK_DAYS,
  type ActingSlice,
  type Cast,
  type CastArgs,
  type Part,
  type Written,
} from '../../../src/person/acting/acting.ts';
import type { IdentitySlice } from '../../../src/person/identity/identity.ts';
import { identity, person } from '../../support/person.ts';
import { production } from '../../support/production.ts';
import { UNIONS_START, type UnionsSlice } from '../../../src/person/unions/unions.ts';
import { PERMITS_START, type PermitsSlice } from '../../../src/person/permits/permits.ts';
import { DIRECTING_START, type DirectingSlice } from '../../../src/person/directing/directing.ts';
import { currencyOf, PRODUCING_START, projectOf, qualityOf, type Project, type ProducingSlice } from '../../../src/person/producing/producing.ts';
import { spread } from '../../../src/person/work/work.ts';
import { t } from '../../../src/core/text/text.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { ACCOUNT, minorIn, purse } from '../../support/purse.ts';
import { authoriseWork, YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';

type Acting = { attributes: AttributesSlice; acting: ActingSlice; identity: IdentitySlice; unions: UnionsSlice; permits: PermitsSlice; directing: DirectingSlice; producing: ProducingSlice; youth: YouthSlice } & ReturnType<typeof purse>;
const SEED = '0123456789abcdef';
const day = (y: number, m: number, d: number) => daysFromCivil(y, m, d) * SECONDS_PER_DAY;
const AUGUST = day(2026, 8, 1);
const clamp = (n: number) => Math.min(100, Math.max(0, n));
const mean = (xs: number[]) => xs.reduce((t, x) => t + x, 0) / xs.length;
const grown = (from: number, days: number) => 100 - (100 - from) * (1 - DAILY) ** days;
const usd = (n: string) => fromMajor('USD', n);
const gbp = (n: string) => fromMajor('GBP', n);
const cad = (n: string) => fromMajor('CAD', n);

/** Levels by broad attribute over one level for all. */
const made = (all: number, each: Record<string, number> = {}, seed = SEED, now = AUGUST, who: IdentitySlice = identity()): Life<Acting> =>
  dispatch(begin(seed, now, { attributes: structuredClone(ATTRIBUTES_START), acting: structuredClone(ACTING_START), identity: who, unions: structuredClone(UNIONS_START), permits: structuredClone(PERMITS_START), directing: structuredClone(DIRECTING_START), producing: structuredClone(PRODUCING_START), youth: structuredClone(YOUTH_START), ...purse() }), chooseAttributes, { role: 'actor', all, each });
const part = (p: Partial<Part> = {}): Part => ({ agreement: 'sag-aftra', budget: 5_000_000, seats: 0, lines: 20, term: 'day', length: 3, rehearsal: 0, asks: [], ...p });
const v = (l: Life<Acting>) => componentValues(l.slices.attributes, 'actor');
const held = (l: Life<Acting>) => l.slices.attributes['actor'] as Record<string, number>;
const parts = (l: Life<Acting>) => l.slices.acting.parts;
/** A part cast by hand, open to anyone (either gender, any ethnicity, every age, in English), in production `project`. */
const cast = (p: Part, id = 1, quality: number | null = null, project = id): Cast => ({ id, at: 0, project, part: p, gender: 'open', ethnicity: 'open', ages: [0, 120], language: 'en', work: quality === null ? null : { at: 0, quality, pay: null } });
/** A life with these parts cast, each in its own production financed in its agreement's country. */
const withParts = (l: Life<Acting>, list: Cast[], over: Partial<Project> = {}): Life<Acting> => ({
  ...l,
  slices: { ...l.slices, acting: { parts: list }, producing: { projects: [...new Set(list.map((c) => c.project))].map((id) => production({ id, market: COUNTRY[(list.find((c) => c.project === id) as Cast).part.agreement], ...over })) } },
});
/** A life with one production in it, by hand. */
const withProject = (l: Life<Acting>, p: Project): Life<Acting> => ({ ...l, slices: { ...l.slices, producing: { projects: [...l.slices.producing.projects, p] } } });
/** What the production writes for a part under SAG-AFTRA by the day, open to anyone. */
const args = (over: Partial<CastArgs> = {}): CastArgs => ({ project: 1, agreement: 'sag-aftra', term: 'day', length: 3, lines: 20, rehearsal: 0, asks: [], gender: 'open', ages: [0, 120], ...over });
const broadIds = ATTRIBUTES.actor.map((a) => a.id);

describe('a part', () => {
  it('asks the craft every role uses, its medium, its lines, and what else it calls for', () => {
    expect(CRAFT).toEqual(['acting-techniques', 'understanding-character-and-situation', 'text-analysis', 'own-interpretation', 'research-roles', 'study-roles-from-scripts', 'ability-to-take-direction', 'konzentrationsf-higkeit']);
    expect(MEDIUM).toEqual({ screen: ['acting-for-the-camera'], stage: ['appropriation-d-espace-sc-nique', 'speaking'] });
    expect(STAGE).toEqual(['uk-theatre', 'uk-theatre-subsidised', 'solt-equity', 'itc-equity']);
    expect(demands(part())).toEqual([...CRAFT, 'memorise-lines', 'acting-for-the-camera']);
    expect(demands(part({ lines: 0 }))).toEqual([...CRAFT, 'acting-for-the-camera']);
    expect(demands(part({ lines: 1 }))).toContain('memorise-lines');
    expect(demands(part({ agreement: 'uk-theatre', term: 'week', asks: ['singing', 'speaking', 'dance'] }))).toEqual([...CRAFT, 'memorise-lines', 'appropriation-d-espace-sc-nique', 'speaking', 'singing', 'dance']);
    expect(() => demands(part({ asks: ['juggling'] }))).toThrow('actor has no component juggling');
  });

  it('is played as well as the actor is in each component it asks, equally', () => {
    const w = v(made(50, { acting: 90, voice: 10, physicality: 70 }));
    const p = part({ asks: ['singing', 'dance'] });
    expect(partSkill(w, p)).toBeCloseTo(mean(demands(p).map((id) => skillOf(w, 'actor', id))), 10);
    expect(partSkill(w, p)).not.toBeCloseTo(partSkill(w, part()), 3);
  });

  it("reads each of the actor's broad attributes in a part", () => {
    // Auditioning and Camera's self-taping were removed on 2026-11-04 (the owner: "Remove them"), with casting.
    expect(broadIds).toEqual(['acting', 'memorization', 'voice', 'physicality', 'camera', 'direction']);
    const p = part({ asks: ['singing', 'dance'] });
    for (const id of broadIds) expect(partSkill(v(made(50, { [id]: 90 })), p), id).toBeGreaterThan(partSkill(v(made(50, { [id]: 20 })), p));
  });

  it('is held to what an engagement can be', () => {
    expect(partOf(part())).toEqual(part());
    expect(() => partOf(part({ agreement: 'wga' as 'actra' }))).toThrow("there's no agreement wga");
    expect(() => partOf(part({ term: 'fortnight' as 'day' }))).toThrow("there's no term fortnight");
    // SAG-AFTRA, Pact/Equity, UK Theatre and ACTRA pay by the day or the week, even where no minimum is set.
    for (const term of ['month', 'session'] as const) expect(() => partOf(part({ term, budget: 0 })), term).toThrow(`there's no ${term} minimum for that part`);
    for (const over of [{ medium: 'film' as const }, { role: 'lead' }, { minutes: 30 }]) expect(() => partOf(part(over)), JSON.stringify(over)).toThrow('sag-aftra sets no terms by medium, role or minutes');
    expect(() => partOf(part({ budget: -1 }))).toThrow('the budget must be a whole number of at least 0 (-1)');
    expect(() => partOf(part({ budget: 1.5 }))).toThrow(RangeError);
    expect(() => partOf(part({ seats: -1 }))).toThrow('the seats must be a whole number of at least 0 (-1)');
    expect(() => partOf(part({ lines: -1 }))).toThrow('the lines must be a whole number of at least 0 (-1)');
    expect(() => partOf(part({ length: 0 }))).toThrow('the length must be a whole number of at least 1 (0)');
    expect(() => partOf(part({ rehearsal: -1 }))).toThrow('the rehearsal must be a whole number of at least 0 (-1)');
    expect(partOf(part({ budget: 0, lines: 0, length: 1 })).length).toBe(1);
    expect(() => partOf(part({ agreement: 'uk-theatre', term: 'day' }))).toThrow('a stage engagement is by the week');
    expect(() => partOf(part({ rehearsal: 1 }))).toThrow("rehearsal weeks are a stage engagement's");
    expect(partOf(part({ agreement: 'uk-theatre', term: 'week', rehearsal: 3 })).rehearsal).toBe(3);
    expect(() => partOf(part({ budget: 300_000, term: 'week' }))).toThrow("there's no week minimum for that part");
    expect(() => partOf(part({ agreement: 'actra', lines: 5, term: 'week' }))).toThrow("there's no week minimum for that part");
    expect(partOf(part({ budget: 20_000, term: 'week' })).term).toBe('week');
    expect(() => partOf(part({ asks: ['juggling'] }))).toThrow('actor has no component juggling');
  });
});

describe("a part's pay", () => {
  it('writes dates as the tables do, and counts the days worked: five to a week', () => {
    expect(dateOf(day(2026, 7, 1))).toBe('2026-07-01');
    expect(dateOf(day(2026, 12, 31) + SECONDS_PER_DAY - 1)).toBe('2026-12-31');
    expect(WEEK_DAYS).toBe(5);
    expect(daysWorked(part({ length: 4 }))).toBe(4);
    expect(daysWorked(part({ term: 'week', length: 4 }))).toBe(20);
    expect(daysWorked(part({ agreement: 'uk-theatre', term: 'week', length: 6, rehearsal: 3 }))).toBe(45);
  });

  it("is SAG-AFTRA's day or week minimum for the date, refused before the tables, the last kept after", () => {
    expect(SAG.basic.day.map((s) => s[1])).toEqual(['1246', '1283', '1321', '1361', '1402']);
    expect(SAG.basic.week.map((s) => s[1])).toEqual(['4326', '4456', '4590', '4728', '4870']);
    expect(SAG.basic.day.map((s) => s[0])).toEqual(['2025-07-01', '2026-07-01', '2027-07-01', '2028-07-01', '2029-07-01']);
    expect(pay(part({ length: 3 }), '2026-06-30')).toEqual(usd('3738'));
    expect(pay(part({ length: 3 }), '2026-07-01')).toEqual(usd('3849'));
    expect(pay(part({ term: 'week', length: 2 }), '2025-07-01')).toEqual(usd('8652'));
    expect(pay(part({ term: 'week', length: 1 }), '2029-07-01')).toEqual(usd('4870'));
    expect(pay(part({ length: 1 }), '2031-03-01')).toEqual(usd('1402'));
    expect(() => pay(part(), '2025-06-30')).toThrow('no minimum is known before 2025-07-01');
    expect(rateAt('USD', SAG.basic.day, '2028-06-30')).toEqual(usd('1321'));
  });

  it("follows SAG-AFTRA's tiers by the budget: none set to $20,000, then Ultra Low, Moderate Low, Low and the basic agreement", () => {
    expect(SAG_TIERS).toEqual({ micro: 20_000, ultra: 300_000, moderate: 700_000, low: 2_000_000 });
    expect(SAG.ultra).toEqual({ currency: 'USD', day: [['2026-07-01', '257'], ['2027-07-01', '264'], ['2028-07-01', '272'], ['2029-07-01', '280']] });
    expect(SAG.moderate.day.map((s) => s[1])).toEqual(['449', '462', '476', '491']);
    expect(SAG.moderate.week.map((s) => s[1])).toEqual(['1560', '1607', '1655', '1705']);
    expect(SAG.low.day.map((s) => s[1])).toEqual(['834', '859', '885', '911']);
    expect(SAG.low.week.map((s) => s[1])).toEqual(['2896', '2984', '3073', '3166']);
    const at = (budget: number, term: 'day' | 'week' = 'day') => pay(part({ budget, term, length: 1 }), '2026-07-01');
    expect(at(0)).toBeNull();
    expect(at(20_000)).toBeNull();
    expect(at(20_001)).toEqual(usd('257'));
    expect(at(300_000)).toEqual(usd('257'));
    expect(at(300_001)).toEqual(usd('449'));
    expect(at(700_000, 'week')).toEqual(usd('1560'));
    expect(at(700_001)).toEqual(usd('834'));
    expect(at(2_000_000, 'week')).toEqual(usd('2896'));
    expect(at(2_000_001)).toEqual(usd('1283'));
    expect(scaleOf(part({ budget: 2_000_001 }))).toBe(SAG.basic);
    expect(() => pay(part({ budget: 500_000 }), '2026-06-30')).toThrow('no minimum is known before 2026-07-01');
    expect(pay(part({ budget: 500_000, length: 2 }), '2029-07-01')).toEqual(usd('982'));
    expect(() => pay(part({ budget: 100_000, term: 'week' }), '2026-07-01')).toThrow("there's no week minimum for that part");
  });

  it("is Pact/Equity's for a UK feature of £3 million and over, refused under it", () => {
    expect(PACT_FLOOR).toBe(3_000_000);
    expect(PACT.day).toEqual([['2020-04-06', '144'], ['2021-04-06', '147'], ['2022-04-06', '150'], ['2023-04-06', '156'], ['2024-04-06', '161']]);
    expect(PACT.week.map((s) => s[1])).toEqual(['576', '588', '600', '624', '644']);
    const p = (q: Partial<Part>) => part({ agreement: 'pact-equity', budget: 3_000_000, ...q });
    expect(pay(p({ length: 2 }), '2024-04-05')).toEqual(gbp('312'));
    expect(pay(p({ length: 2 }), '2024-04-06')).toEqual(gbp('322'));
    expect(pay(p({ term: 'week', length: 1 }), '2020-04-06')).toEqual(gbp('576'));
    expect(() => pay(p({}), '2020-04-05')).toThrow('no minimum is known before 2020-04-06');
    expect(() => partOf(p({ budget: 2_999_999 }))).toThrow("the minimums for a UK film under £3 million aren't known");
  });

  it("is UK Theatre's commercial week by the venue's seats, rehearsal weeks at the rehearsal rate", () => {
    expect(UK_THEATRE.map((t) => [t.seats, t.rehearsal, t.week])).toEqual([
      [0, [['2025-03-31', '525.03']], [['2025-03-31', '561.66']]],
      [250, [['2025-03-31', '531.69']], [['2025-03-31', '561.93']]],
      [500, [['2025-03-31', '545.58']], [['2025-03-31', '569.14']]],
      [1500, [['2025-03-31', '551.57']], [['2025-03-31', '590.33']]],
    ]);
    const stage = (seats: number, rehearsal = 0, length = 1) => pay(part({ agreement: 'uk-theatre', term: 'week', seats, rehearsal, length }), '2025-03-31');
    expect(stage(0)).toEqual(gbp('561.66'));
    expect(stage(249)).toEqual(gbp('561.66'));
    expect(stage(250)).toEqual(gbp('561.93'));
    expect(stage(499)).toEqual(gbp('561.93'));
    expect(stage(500)).toEqual(gbp('569.14'));
    expect(stage(1499)).toEqual(gbp('569.14'));
    expect(stage(1500)).toEqual(gbp('590.33'));
    expect(stage(1500, 4, 10)).toEqual(gbp(String((4 * 55157 + 10 * 59033) / 100)));
    expect(stage(100, 2, 3)).toEqual(gbp('2735.04'));
    expect(() => pay(part({ agreement: 'uk-theatre', term: 'week' }), '2025-03-30')).toThrow('no minimum is known before 2025-03-31');
  });

  it("is ACTRA's principal by the day or week, a part of five lines or fewer by the day", () => {
    expect(ACTRA_FEW_LINES).toBe(5);
    expect(ACTRA.principal.day).toEqual([['2025-01-26', '935.25'], ['2026-01-01', '972.75'], ['2027-01-01', '1006.75']]);
    expect(ACTRA.principal.week.map((s) => s[1])).toEqual(['3974.50', '4133.50', '4278.25']);
    expect(ACTRA.few.day.map((s) => s[1])).toEqual(['631.25', '656.50', '679.50']);
    const p = (q: Partial<Part>) => part({ agreement: 'actra', length: 1, ...q });
    expect(pay(p({ lines: 5 }), '2025-12-31')).toEqual(cad('631.25'));
    expect(pay(p({ lines: 6 }), '2026-01-01')).toEqual(cad('972.75'));
    expect(pay(p({ lines: 0, length: 2 }), '2027-01-01')).toEqual(cad('1359'));
    expect(pay(p({ term: 'week', length: 2 }), '2025-01-26')).toEqual(cad('7949'));
    expect(() => pay(p({}), '2025-01-25')).toThrow('no minimum is known before 2025-01-26');
  });
});

describe("a part's fit", () => {
  // Ada Reyes, an actress born 14 June 2000: 26 on 1 August 2026, playing 21 to 31.
  const w = (over: Partial<Written>): Written => ({ part: part(), gender: 'open', ethnicity: 'open', ages: [0, 120], language: 'en', ...over });
  const fit = (over: Partial<Written>, who: Parameters<typeof person>[0] = {}, now = AUGUST) => misfit(person(who), w(over), now);

  it("reads Billed As: a part for men is an actor's, one for women an actress's, one for either anyone's", () => {
    expect(GENDERS).toEqual(['men', 'women', 'open', 'non-binary']);
    expect(fit({ gender: 'men' })).toBe('the part is written for an actor');
    expect(fit({ gender: 'men' }, { billedAs: 'actor', pronouns: 'he' })).toBeNull();
    expect(fit({ gender: 'women' })).toBeNull();
    expect(fit({ gender: 'women' }, { billedAs: 'actor', pronouns: 'he' })).toBe('the part is written for an actress');
    expect(fit({ gender: 'open' }, { billedAs: 'actor', pronouns: 'he' })).toBeNull();
    expect(fit({ gender: 'open' })).toBeNull();
  });

  it('lets a they/them life play any part, and only a they/them life a part written for a non-binary performer', () => {
    expect(fit({ gender: 'non-binary' })).toBe('the part is written for a non-binary performer');
    expect(fit({ gender: 'non-binary' }, { billedAs: 'actor', pronouns: 'he' })).toBe('the part is written for a non-binary performer');
    for (const billedAs of ['actor', 'actress'] as const) for (const gender of GENDERS) expect(fit({ gender }, { pronouns: 'they', billedAs }), `${billedAs} ${gender}`).toBeNull();
  });

  it('reads the playing age: the part must overlap it at either end', () => {
    expect(fit({ ages: [32, 39] })).toBe('the part is for 32 to 39, and you play 21 to 31');
    expect(fit({ ages: [31, 40] })).toBeNull();
    expect(fit({ ages: [10, 21] })).toBeNull();
    expect(fit({ ages: [10, 20] })).toBe('the part is for 10 to 20, and you play 21 to 31');
    expect(fit({ ages: [6, 12] }, { born: { date: '2012-01-01', country: 'US', region: '' } })).toBe('the part is for 6 to 12, and you play 13 to 15');
    expect(fit({ ages: [6, 12] }, { born: { date: '2013-12-01', country: 'US', region: '' } })).toBeNull();
  });

  it("reckons the age where the work is: Los Angeles, London or Toronto", () => {
    // 03:00 UTC on 14 June 2026: Ada's 26th birthday in London, still the 13th in Los Angeles and Toronto.
    const at = Date.UTC(2026, 5, 14, 3) / 1000;
    const where = (agreement: Part['agreement']) => misfit(person(), w({ part: part({ agreement, term: 'week' }), ages: [31, 40] }), at);
    expect(where('sag-aftra')).toBe('the part is for 31 to 40, and you play 20 to 30');
    expect(where('actra')).toBe('the part is for 31 to 40, and you play 20 to 30');
    expect(where('pact-equity')).toBeNull();
    expect(where('uk-theatre')).toBeNull();
  });

  it('reads an ethnicity only where the part names one', () => {
    expect(fit({ ethnicity: 'black' })).toBe("the part names an ethnicity you don't give (black)");
    expect(fit({ ethnicity: 'black' }, { ethnicity: ['white', 'black'] })).toBeNull();
    expect(fit({ ethnicity: 'open' })).toBeNull();
    expect(fit({ ethnicity: 'silent' })).toBeNull();
    expect(fit({ ethnicity: 'silent' }, { ethnicity: ['asian'] })).toBeNull();
  });

  it("reads the languages: the part's at C1 or better", () => {
    expect(FLUENT).toBe('C1');
    expect(fit({}, { languages: [{ lang: 'en', level: 'B2' }] })).toBe('the part is played in en, at C1 or better');
    expect(fit({}, { languages: [{ lang: 'en', level: 'C1' }] })).toBeNull();
    expect(fit({}, { languages: [{ lang: 'fr', level: 'C2' }] })).toBe('the part is played in en, at C1 or better');
    expect(fit({ language: 'fr' }, { languages: [{ lang: 'en', level: 'C2' }, { lang: 'fr-CA', level: 'C1' }] })).toBeNull();
  });
});

describe('a part in the life\'s own production', () => {
  const life = (over: Partial<Project> = {}, budget = 500_000_000, who = identity()) => withProject(made(50, {}, SEED, AUGUST, who), production(over, budget));

  it("is written by the production the life acts in, its budget the production's, in the market's language where none is named", () => {
    const l = dispatch(life(), castPart, args({ gender: 'women', ages: [20, 30] }));
    expect(parts(l)).toEqual([{ id: 1, at: AUGUST, project: 1, part: part(), gender: 'women', ethnicity: 'open', ages: [20, 30], language: MARKET['sag-aftra'].language, work: null }]);
    expect((['sag-aftra', 'pact-equity', 'uk-theatre', 'actra'] as const).map((a) => MARKET[a].language)).toEqual(['en', 'en', 'en', 'en']);
    // A budget of $250,000 is the Ultra Low tier's, and the part reads it.
    const small = dispatch(life({}, 25_000_015), castPart, args({ ethnicity: 'silent', language: 'en-US' }));
    expect(castOf(small.slices.acting, 1)).toMatchObject({ part: part({ budget: 250_000 }), ethnicity: 'silent', language: 'en-US' });
    expect(pay(castOf(small.slices.acting, 1).part, '2026-08-01')).toEqual(usd('771'));
    expect(parts(dispatch(dispatch(life(), castPart, args()), castPart, args({ length: 1 }))).map((x) => [x.id, x.part.length])).toEqual([[1, 3], [2, 1]]);
  });

  it("is engaged in its format's medium, its running time the production's, under an agreement of the country it is made in", () => {
    const fr = (over: Partial<Project>, a: Partial<CastArgs>) => castOf(dispatch(life({ market: 'FR', ...over }, 300_000_000, identity({ citizenship: ['FR'], languages: [{ lang: 'fr', level: 'C2' }] })), castPart, args(a)).slices.acting, 1).part;
    expect(fr({}, { agreement: 'fr-film' })).toEqual({ ...part({ agreement: 'fr-film', budget: 3_000_000 }), medium: 'film' });
    expect(fr({ minutes: 95 }, { agreement: 'fr-film' })).toEqual({ ...part({ agreement: 'fr-film', budget: 3_000_000 }), medium: 'film', minutes: 95 });
    expect(fr({ format: 'series', series: { form: 'hour', episodes: 6 } }, { agreement: 'fr-tv' }).medium).toBe('television');
    expect(() => fr({ format: 'series', series: { form: 'hour', episodes: 6 } }, { agreement: 'fr-film' })).toThrow('fr-film sets no terms for television');
    expect(fr({ format: 'stage' }, { agreement: 'fr-private-stage', term: 'performance', length: 10 }).medium).toBe('stage');
    // UK Theatre's is the stage's, SAG-AFTRA's the screen's; a role is the part's where its agreement names roles.
    const gb = (format: Project['format'], agreement: string, a: Partial<CastArgs> = {}) => dispatch(life({ market: 'GB', format }), castPart, args({ agreement, term: 'week', length: 1, ...a }));
    expect(castOf(gb('stage', 'uk-theatre', { seats: 600 }).slices.acting, 1).part).toMatchObject({ agreement: 'uk-theatre', seats: 600 });
    expect(() => gb('film', 'uk-theatre')).toThrow("a film isn't engaged under uk-theatre");
    expect(() => gb('stage', 'pact-equity')).toThrow("a stage isn't engaged under pact-equity");
    expect(() => dispatch(life(), castPart, args({ agreement: 'pact-equity' }))).toThrow("a part in a production made in US isn't engaged under pact-equity");
    expect(() => dispatch(life(), castPart, args({ agreement: 'wga' }))).toThrow("there's no agreement wga");
    expect(() => dispatch(life(), castPart, args({ role: 'lead' }))).toThrow('sag-aftra sets no terms by medium, role or minutes');
    expect(Object.hasOwn(castOf(dispatch(life({ minutes: 90 }), castPart, args()).slices.acting, 1).part, 'minutes')).toBe(false);
  });

  it('pays every agreement in the currency of the country it engages in, as a production there budgets', () => {
    for (const a of AGREEMENTS) {
      const m = marketOf(a);
      if (m === undefined || m.currency === null) continue;
      expect(m.currency, a).toBe(currencyOf(COUNTRY[a]));
    }
    expect([currencyOf('US'), currencyOf('GB'), currencyOf('CA')]).toEqual(['USD', 'GBP', 'CAD']);
  });

  it("is refused where the life doesn't act in the production, it has no budget, it's released, or the life may not play the part as written", () => {
    expect(() => dispatch(life({ roles: ['producer'] }), castPart, args())).toThrow("the life doesn't act in project 1");
    expect(() => dispatch(life({ plan: null }), castPart, args())).toThrow('project 1 has no budget');
    expect(() => dispatch(life({ release: { at: 0, quality: 50, audience: false, doubled: false } }), castPart, args())).toThrow('project 1 is released');
    expect(() => dispatch(life(), castPart, args({ project: 2 }))).toThrow("there's no project 2");
    expect(() => dispatch(life(), castPart, args({ gender: 'men' }))).toThrow('the part is written for an actor');
    expect(() => dispatch(life(), castPart, args({ gender: 'boys' }))).toThrow("a part isn't written for boys");
    expect(() => dispatch(life(), castPart, args({ ethnicity: 'martian' }))).toThrow("there's no ethnicity martian");
    expect(() => dispatch(life(), castPart, args({ ethnicity: 'black' }))).toThrow("the part names an ethnicity you don't give (black)");
    expect(() => dispatch(life(), castPart, args({ ages: [40, 50] }))).toThrow('the part is for 40 to 50, and you play 21 to 31');
    expect(() => dispatch(life(), castPart, args({ language: 'fr' }))).toThrow('the part is played in fr, at C1 or better');
    for (const ages of [[20], [20, 30, 40], 20 as never]) expect(() => dispatch(life(), castPart, args({ ages })), JSON.stringify(ages)).toThrow('a part is written for an age range, from and to');
    expect(() => dispatch(life(), castPart, args({ ages: [-1, 30] }))).toThrow('the youngest age must be a whole number of at least 0 (-1)');
    expect(() => dispatch(life(), castPart, args({ ages: [30, 29] }))).toThrow('the oldest age must be a whole number of at least 30 (29)');
    expect(parts(dispatch(life(), castPart, args({ ages: [26, 26] })))).toHaveLength(1);
    expect(() => dispatch(life(), castPart, args({ length: 0 }))).toThrow('the length must be a whole number of at least 1 (0)');
    expect(() => dispatch(life({}, 500_000_000, { person: null }), castPart, args())).toThrow('the person is not made yet');
    expect(() => castOf(ACTING_START, 1)).toThrow("there's no part 1");
  });

  it('acting.cast: a production with a bigger budget writes the part at a higher tier, and pays more', () => {
    const paid = (budget: number) => {
      const l = dispatch(dispatch(life({}, budget), castPart, args()), playPart, { part: 1, account: ACCOUNT });
      return castOf(l.slices.acting, 1).work?.pay;
    };
    falsifyAny({ feature: 'acting.cast', claim: 'bites', says: "a part cast in a $250,000 production pays the Ultra Low day; in a $5 million one, the basic agreement's", base: 25_000_000, twin: 500_000_000, outcome: paid });
  });

  it('identity.make: the person made decides which parts they may play', () => {
    const plays = (who: IdentitySlice) => (['men', 'women', 'open', 'non-binary'] as const).filter((gender) => { try { dispatch(life({}, 500_000_000, who), castPart, args({ gender })); return true; } catch { return false; } });
    falsifyAny({ feature: 'identity.make', claim: 'bites', says: 'an actor and an actress may play different parts', base: identity(), twin: identity({ billedAs: 'actor', pronouns: 'he' }), outcome: plays });
  });
});

describe('playing a part', () => {
  it('plays it as the actor is in what it asks, within the spread, and pays the minimum for the day it starts', () => {
    for (const [i, all] of [0, 41, 100, 73].entries()) {
      const seed = (i + 7).toString(16).padStart(16, '0');
      const p = part({ asks: ['dance'], length: 2 });
      const base = withParts(made(all, { physicality: 100 - all }, seed), [cast(p)]);
      const k = partSkill(v(base), p);
      const l = dispatch(base, playPart, { part: 1, account: ACCOUNT });
      const quality = clamp(k + spread(k) * (2 * draws(seedFromText(seed), 'acting.work', 'perform', 1).float() - 1));
      expect(parts(l)[0]?.work, seed).toEqual({ at: AUGUST, quality, pay: usd('2566') });
      for (const id of broadIds) expect(held(l)[id], id).toBeCloseTo(id === 'voice' ? (held(base)[id] as number) : grown(held(base)[id] as number, 2), 10);
    }
  });

  it('works a weekly or stage engagement five days a week, rehearsals too, and pays nothing where no minimum is set', () => {
    const p = part({ agreement: 'uk-theatre', term: 'week', seats: 600, rehearsal: 2, length: 4 });
    const made40 = made(40, {}, SEED, day(2025, 9, 1), identity({ citizenship: ['GB', 'US'] }));
    const base = withParts({ ...made40, slices: { ...made40.slices, youth: structuredClone(YOUTH_START), ...purse('GBP') } }, [cast(p), cast(part({ budget: 15_000 }), 2)]);
    const l = dispatch(dispatch(base, playPart, { part: 1, account: ACCOUNT }), playPart, { part: 2, account: ACCOUNT });
    expect(parts(l)[0]?.work?.pay).toEqual(gbp(String((2 * 54558 + 4 * 56914) / 100)));
    expect(parts(l)[1]?.work?.pay).toBeNull();
    // Paid into the account whole (below the year's National Insurance threshold); a part with no minimum pays nothing.
    expect(minorIn(l.slices.ledger, ACCOUNT)).toBe(100_000_000 + 2 * 54558 + 4 * 56914);
    expect(l.slices.tax.paid.map((x) => [x.work, x.country, x.gross])).toEqual([['performer', 'GB', 2 * 54558 + 4 * 56914]]);
    expect(held(dispatch(base, playPart, { part: 1, account: ACCOUNT }))['voice']).toBeCloseTo(grown(40, 30), 10);
  });

  it('comes out at the top from an actor at 100 throughout, near 50 from one at 50, poor from one at 10', () => {
    const played = (all: number, seed: string) => parts(dispatch(withParts(made(all, {}, seed), [cast(part())]), playPart, { part: 1, account: ACCOUNT }))[0]?.work?.quality as number;
    const seeds = Array.from({ length: 30 }, (_, i) => (i + 1).toString(16).padStart(16, '0'));
    for (const s of seeds) expect(played(100, s)).toBeGreaterThanOrEqual(97);
    for (const s of seeds) expect(Math.abs(played(50, s) - 50)).toBeLessThanOrEqual(spread(50));
    for (const s of seeds) expect(played(10, s)).toBeLessThanOrEqual(10 + spread(10));
  });

  it("is refused where the person may not work: a country whose work takes a permit their citizenship doesn't spare (papers.work), as the I-9 and the UK's right-to-work check ask (R-4621)", () => {
    // Past the 30 days the UK lets a short engagement be worked without the Creative Worker visa; within them, played.
    const uk = part({ agreement: 'pact-equity', budget: 5_000_000, length: 31 });
    const american = withParts(made(50), [cast(uk), cast(part({ agreement: 'pact-equity', length: 30 }), 2)]);
    expect(() => dispatch(american, playPart, { part: 1, account: ACCOUNT })).toThrow('the person may not work in GB without a permit');
    expect(parts(dispatch(american, playPart, { part: 2, account: ACCOUNT }))[1]?.work).not.toBeNull();
    // With the permit granted and in force, the long one is played.
    const visa = { id: 1, at: 0, country: 'GB' as const, role: 'actor' as const, engagement: 1, renews: null, by: 'worker' as const, premium: false, fees: null, decided: { at: 0, until: AUGUST + 1 } };
    const holding = { ...american, slices: { ...american.slices, permits: { applications: [visa] } } };
    expect(parts(dispatch(holding, playPart, { part: 1, account: ACCOUNT }))[0]?.work).not.toBeNull();
    const irish = withParts(made(50, {}, SEED, AUGUST, identity({ citizenship: ['IE'] })), [cast(uk)]);
    expect(parts(dispatch(irish, playPart, { part: 1, account: ACCOUNT }))[0]?.work).not.toBeNull();
    expect(COUNTRY).toMatchObject({ 'sag-aftra': 'US', 'pact-equity': 'GB', 'uk-theatre': 'GB', actra: 'CA' });
    const canadian = withParts(made(50, {}, SEED, AUGUST, identity({ citizenship: ['CA'] })), [cast(part({ agreement: 'actra' })), cast(part(), 2)]);
    expect(parts(dispatch(canadian, playPart, { part: 1, account: ACCOUNT }))[0]?.work).not.toBeNull();
    expect(() => dispatch(canadian, playPart, { part: 2, account: ACCOUNT })).toThrow('the person may not work in US without a permit');
  });

  it("is refused a SAG-AFTRA part past the thirtieth day after the person's first, unless they joined (Taft-Hartley and union security, R-4621)", () => {
    const first: Cast = { ...cast(part(), 1, 60), work: { at: AUGUST, quality: 60, pay: null } };
    const at = (days: number) => withParts(made(50, {}, SEED, AUGUST + days * SECONDS_PER_DAY), [first, cast(part(), 2)]);
    expect(parts(dispatch(at(29), playPart, { part: 2, account: ACCOUNT }))[1]?.work).not.toBeNull();
    expect(() => dispatch(at(30), playPart, { part: 2, account: ACCOUNT })).toThrow("a part under sag-aftra past the thirtieth day of union work is a member's");
    const member = (l: Life<Acting>): Life<Acting> => ({ ...l, slices: { ...l.slices, unions: { joined: [{ union: 'sag-aftra', at: AUGUST, standing: 'full', name: 'Ada Reyes', initiation: null, dues: null }] } } });
    expect(parts(dispatch(member(at(30)), playPart, { part: 2, account: ACCOUNT }))[1]?.work).not.toBeNull();
    const uk = { ...cast(part({ agreement: 'uk-theatre', term: 'week', seats: 100, length: 1 }), 2) };
    const brit = withParts(made(50, {}, SEED, AUGUST + 40 * SECONDS_PER_DAY, identity({ citizenship: ['GB'] })), [first, uk]);
    expect(parts(dispatch(brit, playPart, { part: 2, account: ACCOUNT }))[1]?.work).not.toBeNull();
  });

  it("is refused where the part is played, there's no such part, or its production isn't financed", () => {
    const p = part();
    const base = withParts(made(50), [cast(p), cast(p, 2, 60)]);
    expect(() => dispatch(base, playPart, { part: 2, account: ACCOUNT })).toThrow('part 2 is played');
    expect(() => dispatch(base, playPart, { part: 3, account: ACCOUNT })).toThrow("there's no part 3");
    expect(() => dispatch(withParts(made(50), [cast(p)], { raised: {} }), playPart, { part: 1, account: ACCOUNT })).toThrow("project 1 isn't financed");
    const early = withParts(made(50, {}, SEED, day(2025, 6, 30)), [cast(p)]);
    expect(() => dispatch(early, playPart, { part: 1, account: ACCOUNT })).toThrow('no minimum is known before 2025-07-01');
  });

  it("is paid from its production's budget, through the production's account, taxed once, and the budget left less by it", () => {
    let l = withProject(made(100), production());
    for (let i = 0; i < 3; i += 1) l = dispatch(l, castPart, args());
    const after = dispatch(l, playPart, { part: 2, account: ACCOUNT });
    expect(castOf(after.slices.acting, 2).work?.pay).toEqual(usd('3849'));
    // Paid by the production into the account named, less the employee's Social Security and Medicare (7.65%).
    expect([minorIn(after.slices.ledger, ACCOUNT), minorIn(after.slices.ledger, 'world:production:1:USD'), minorIn(after.slices.ledger, 'world:social:US:USD')]).toEqual([100_000_000 + 384900 - 29445, -384900, 29445]);
    expect(projectOf(after.slices.producing, 1).costs).toEqual([{ at: AUGUST, role: 'actor', what: "a part's pay", amount: usd('3849') }]);
    expect(after.slices.tax.paid.map((x) => [x.work, x.gross])).toEqual([['performer', 384900]]);
    expect(after.frame.schedule.map((i) => i.kind)).toEqual(['tax.reckon']);
    expect(after.slices.ledger.accounts.find((x) => x.id === ACCOUNT)?.postings.map((x) => x.what)).toEqual(['the family', "a part's pay"]);
    expect(() => dispatch(l, playPart, { part: 2, account: 'everyday:9' })).toThrow('no account everyday:9 is held at a bank');
    expect(parts(after).filter((a) => a.work !== null).map((a) => a.id)).toEqual([2]);
    // A budget that can't cover the part's minimum refuses it; one that just can pays it.
    const tight = (minor: number) => dispatch(withParts(made(50), [cast(part())], { plan: { budget: money('USD', minor), needed: 32, scheduled: 32, fee: null, credit: null }, raised: { equity: money('USD', minor) } }), playPart, { part: 1, account: ACCOUNT });
    expect(() => tight(384_899)).toThrow("project 1's budget can't pay a part's pay");
    expect(castOf(tight(384_900).slices.acting, 1).work?.pay).toEqual(usd('3849'));
  });

  it('is read by what the production comes out as, and by the actor\'s years and best work', () => {
    const l = dispatch(withParts(made(50), [{ ...cast(part(), 1, 80, 1), work: { at: AUGUST, quality: 80, pay: null } }, cast(part(), 2, null, 1)]), playPart, { part: 2, account: ACCOUNT });
    const q = castOf(l.slices.acting, 2).work?.quality as number;
    const shot = { ...projectOf(l.slices.producing, 1), roles: ['actor' as const], shot: { at: 0, days: 32, overrun: usd('0'), fee: null, quality: 70 } };
    expect(qualityOf(l.slices, shot)).toBeCloseTo((50 + 50 + 50 + (80 + q) / 2) / 4, 10);
    expect(credit(l.slices.acting)).toBe(Math.max(80, q));
    expect(experience(l.slices.acting, AUGUST + 366 * SECONDS_PER_DAY)).toBe(1);
  });

  it('is the same for the same life and differs for another', () => {
    const quality = (seed: string) => parts(dispatch(withParts(made(50, {}, seed), [cast(part())]), playPart, { part: 1, account: ACCOUNT }))[0]?.work?.quality;
    expect(quality(SEED)).toBe(quality(SEED));
    expect(quality('fedcba9876543210')).not.toBe(quality(SEED));
  });

  it('acting.perform: a better actor plays the part better', () => {
    falsifyAny({ feature: 'acting.perform', claim: 'bites', says: 'an actor at 90 in Acting plays a part better than one at 30', base: 30, twin: 90, outcome: (n) => parts(dispatch(withParts(made(50, { acting: n }), [cast(part())]), playPart, { part: 1, account: ACCOUNT }))[0]?.work?.quality });
  });

  it("tells the player its own figures are the game's", () => {
    expect(MODEL_LINE).toBe('acting.model');
    expect(t(MODEL_LINE)).toContain("SLATE's own reckoning");
  });

  it('is run through the frame, each command declaring what it reads and writes', () => {
    expect(commandIndex().filter((x) => x.id.startsWith('acting.'))).toEqual([
      { id: 'acting.cast', reads: ['identity', 'producing'], writes: ['acting'] },
      { id: 'acting.perform', reads: ['identity', 'unions', 'permits', 'directing', 'producing'], writes: ['attributes', 'acting', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'] },
    ]);
    expect(ACTING_START).toEqual({ parts: [] });
    expect(broadOf('actor', 'acting-for-the-camera').id).toBe('camera');
  });
});

describe("a minor's part (person.youth)", () => {
  const citizen = (date: string, country: string, over: Parameters<typeof identity>[0] = {}) => identity({ born: { date, country: country as never, region: '' }, citizenship: [country as never], grewUp: { country: country as never, region: '' }, ...over });
  it("is played only with what the work's country's law needs first, the grant used, its days at the hours the law allows", () => {
    const l = withParts(made(50, {}, SEED, AUGUST, citizen('2016-03-10', 'GB')), [cast(part({ agreement: 'pact-equity', length: 3 }))]);
    expect(() => dispatch(l, playPart, { part: 1, account: ACCOUNT })).toThrow('that work in United Kingdom needs permit first');
    const p = dispatch(dispatch(l, authoriseWork, { country: 'GB', role: 'performer' }), playPart, { part: 1, account: ACCOUNT });
    expect(p.slices.youth.granted).toMatchObject([{ country: 'GB', role: 'performer', needs: ['permit'], used: true }]);
    expect(held(p)['acting']).toBeCloseTo(grown(50, 3 * (5 / 8)), 10);
  });

  it("has the share the work's country sets aside of a minor's pay held for the part", () => {
    const l = withParts(made(50, {}, SEED, AUGUST, citizen('2014-05-20', 'FR', { billedAs: 'actor', pronouns: 'he' })), [cast(part({ agreement: 'fr-film', length: 2 }))]);
    const p = dispatch(dispatch(l, authoriseWork, { country: 'FR', role: 'performer' }), playPart, { part: 1, account: ACCOUNT });
    expect(p.slices.youth.held.map((h) => [h.engagement, h.into])).toEqual([['actor:1', 'Caisse des dépôts et consignations']]);
  });
});
