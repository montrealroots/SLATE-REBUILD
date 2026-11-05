import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { begin, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { fromMajor, money, type CurrencyCode } from '../../../src/core/money/money.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { daysFromCivil, SECONDS_PER_DAY } from '../../../src/core/time/calendar.ts';
import { t } from '../../../src/core/text/text.ts';
import { ACTING_START, type ActingSlice } from '../../../src/person/acting/acting.ts';
import { ATTRIBUTES_START, chooseAttributes, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import { DIRECTING_START, type DirectingSlice } from '../../../src/person/directing/directing.ts';
import type { GenresSlice } from '../../../src/person/genres/genres.ts';
import type { IdentitySlice } from '../../../src/person/identity/identity.ts';
import type { PermitsSlice } from '../../../src/person/permits/permits.ts';
import {
  aboutCredit,
  aboutMarket,
  ABROAD_LINE,
  applyToFunder,
  developScript,
  factor,
  fundFor,
  MARKETS,
  MODEL,
  optionMaterial,
  packagePitch,
  partCredit,
  PART_MISSING,
  planProject,
  PRODUCING_START,
  producerValues,
  projectOf,
  qualityOf,
  raised,
  releaseFilm,
  sellSkill,
  shootProject,
  SLOT_MINUTES,
  target,
  termsOf,
  UNKEPT_LINE,
  unitsOf,
  writingFor,
  type Credit,
  type Project,
  type ProducingSlice,
  type Terms,
  type Tier,
} from '../../../src/person/producing/producing.ts';
import { CAREER_START, type CareerSlice } from '../../../src/person/work/career.ts';
import { SCRIPTS_START, writeScript, type ScriptsSlice } from '../../../src/person/work/work.ts';
import { YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';
import countries from '../../../src/world/gazetteer/countries.json' with { type: 'json' };
import type { CountryCode } from '../../../src/world/gazetteer/gazetteer.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { permitsEverywhere } from '../../support/permits.ts';
import { identity } from '../../support/person.ts';
import { ACCOUNT, purse } from '../../support/purse.ts';
import PINS from './terms-abroad.json' with { type: 'json' };

/**
 * A series and a play beyond the UK, on each market's research of 2026-11-04 (research/sources/person/work/tvstage-<CC>.json,
 * register facts person.markets.producer.<CC>.tvstage and its blockers): its incentive, its fund, a series' fee cap, how
 * each fares, and the agreement a play is staged under.
 */
type Lives = { attributes: AttributesSlice; producing: ProducingSlice; genres: GenresSlice; identity: IdentitySlice; acting: ActingSlice; directing: DirectingSlice; permits: PermitsSlice; youth: YouthSlice; scripts: ScriptsSlice; career: CareerSlice } & ReturnType<typeof purse>;
const ROOT = resolve(import.meta.dirname, '../../..');
const SEED = '0123456789abcdef';
const T0 = daysFromCivil(2026, 11, 1) * SECONDS_PER_DAY;
const life = (who: IdentitySlice = identity(), seed = SEED, levels: Record<string, number> = { producer: 60 }): Life<Lives> => {
  let l: Life<Lives> = begin(seed, T0, {
    attributes: structuredClone(ATTRIBUTES_START),
    producing: structuredClone(PRODUCING_START),
    genres: { loved: ['drama'] },
    identity: who,
    acting: structuredClone(ACTING_START),
    directing: structuredClone(DIRECTING_START),
    permits: permitsEverywhere(),
    youth: structuredClone(YOUTH_START),
    scripts: structuredClone(SCRIPTS_START),
    career: structuredClone(CAREER_START),
    ...purse(),
  });
  for (const [role, all] of Object.entries(levels)) l = dispatch(l, chooseAttributes, { role, all, each: {} });
  return l;
};
/** A series of hour episodes optioned in a market, its episodes' running time where given. */
const series = (market: string, episodes: number, extra: Record<string, unknown> = {}, l = life()) => dispatch(l, optionMaterial, { format: 'series', episode: 'hour', episodes, roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama', market, ...extra });
/** A play optioned in a market, staged under the agreement named. */
const play = (market: string, staged: string, l = life()) => dispatch(l, optionMaterial, { format: 'stage', staged, roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama', market });
const plan = (l: Life<Lives>, budget: string) => dispatch(l, planProject, { project: 1, budget, ...(projectOf(l.slices.producing, 1).format === 'stage' ? { rehearsal: 3, run: 6 } : {}) });
const project = (l: Life<Lives>) => projectOf(l.slices.producing, 1);
const credit = (l: Life<Lives>, budget: string) => project(plan(l, budget)).plan?.credit ?? null;
const of = (currency: CurrencyCode, major: string) => fromMajor(currency, major);
const funded = (l: Life<Lives>) => {
  const producing = structuredClone(l.slices.producing);
  const p = projectOf(producing, 1);
  p.raised['equity'] = money(p.plan?.budget.currency ?? 'EUR', target(p) - raised(p));
  return { ...l, slices: { ...l.slices, producing } };
};
const shot = (l: Life<Lives>) => dispatch(funded(l), shootProject, { project: 1, account: ACCOUNT });
const from = (cc: string) => life(identity({ citizenship: [cc as CountryCode] }));

/** A tier as a line: its budgets, then its sum or bands, base and most (as terms-abroad.json holds them). */
const line = (x: Tier) =>
  `${x.budget[0]}-${x.budget[1] ?? ''} ${x.sum !== null ? `sum ${x.sum}` : x.bands.map((b) => `${b.from}-${b.to ?? ''}:${b.rate}`).join(' ')}${x.base === 1 ? '' : ` base ${x.base}`}${x.most === null ? '' : ` most ${x.most}`}${x.currency === undefined ? '' : ` in ${x.currency}`}`.trim();
const lines = (p: Terms) => {
  const out: Record<string, unknown> = {};
  if (p.credit !== null) {
    const c = p.credit;
    const extra = (['per', 'least', 'most', 'episodes', 'minutes'] as const).filter((k) => c[k] !== null).map((k) => `${k} ${String(c[k])}`).join(' ');
    out['credit'] = [...(extra === '' ? [] : [extra]), ...c.tiers.map(line), ...(p.foreignOnly ? ['abroad'] : [])];
  }
  if (p.fund !== null) out['fund'] = [`rate ${p.fund.rate}`, ...p.fund.tiers.map(line)];
  if (p.aid.length > 0) out['aid'] = p.aid.map(line);
  if (p.fees.length > 0) out['fees'] = p.fees.map((f) => f.map(line));
  return out;
};
/** What a market's research of a series and a play couldn't find, as its file's blockers name it; every item where it found nothing. */
const unknownOf = (cc: string, part: 'series' | 'stage') => {
  const file = join(ROOT, `research/sources/person/work/tvstage-${cc}.json`);
  const items = { series: ['incentive', 'fund', 'feecap', 'outcomes'], stage: ['incentive', 'fund', 'outcomes'] }[part];
  if (!existsSync(file)) return items;
  const blockers = (JSON.parse(readFileSync(file, 'utf8')) as { blockers: { item: string }[] }).blockers.map((b) => b.item);
  return items.filter((i) => blockers.includes(`${part}.${i}`));
};

describe("a series' and a play's terms beyond the UK", () => {
  it("are each market's own, every term as its research gives it, and what it couldn't find", () => {
    const pins = PINS as Record<string, Record<string, unknown>>;
    for (const [cc, m] of Object.entries(MARKETS)) {
      const got: Record<string, unknown> = {};
      for (const part of ['series', 'stage'] as const) {
        const l = lines(m[part]);
        if (Object.keys(l).length > 0) got[part] = l;
        expect(m[part].unknown, `${cc} ${part}`).toEqual(unknownOf(cc, part));
      }
      expect(got, cc).toEqual(pins[cc] ?? {});
    }
    // A film's terms are its own; a series' and a play's theirs.
    expect(termsOf(MARKETS['NO'] as never, 'film')).toBe(MARKETS['NO']);
    expect(termsOf(MARKETS['NO'] as never, 'series')).toBe(MARKETS['NO']?.series);
  });

  it("counts a series by its episodes, hours or minutes, an episode its running time or else its slot's", () => {
    expect(SLOT_MINUTES).toEqual({ hour: 60, 'half-hour': 30 });
    const p = (form: 'hour' | 'half-hour', episodes: number, minutes: number | null = null) => ({ series: { form, episodes }, minutes });
    expect([unitsOf('episode', p('hour', 6)), unitsOf('hour', p('hour', 6)), unitsOf('minute', p('hour', 6))]).toEqual([6, 6, 360]);
    expect([unitsOf('hour', p('half-hour', 6)), unitsOf('minute', p('half-hour', 6)), unitsOf('minute', p('hour', 6, 45))]).toEqual([3, 180, 270]);
  });

  it('credits a tier by the budget, or by each unit, nothing under its least, at most its most, none where unknown or a rate is missing', () => {
    const tier = (over: Partial<Tier> = {}): Tier => ({ budget: [0, null], bands: [{ from: 0, to: null, rate: 0.25 }], base: 1, net: false, most: null, sum: null, ...over });
    const c = (over: Partial<Credit> = {}): Credit => ({ tiers: [tier()], per: null, least: null, most: null, episodes: null, minutes: null, ...over });
    type Made = Pick<Project, 'series' | 'minutes'>;
    const s: Made = { series: { form: 'hour', episodes: 4 }, minutes: null };
    const at = (x: Credit | null, major: string, p: Made = s, date = '2026-11-01') => partCredit(x, p, of('EUR', major), date);
    expect(at(null, '1000000')).toBeNull();
    expect(at(c(), '1000000')).toEqual(of('EUR', '250000'));
    // Each episode's budget sets its tier; each episode's most binds alone.
    const each = c({ per: 'episode', tiers: [tier({ budget: [200000, null], most: 50000 })] });
    expect(at(each, '1000000')).toEqual(of('EUR', '200000'));
    expect(at(each, '799999.96')).toEqual(of('EUR', '0'));
    expect(at(each, '800000')).toEqual(of('EUR', '200000'));
    expect(at(c({ per: 'hour', tiers: [tier({ budget: [0, null], most: 10000 })] }), '1000000', { series: { form: 'half-hour', episodes: 4 }, minutes: null })).toEqual(of('EUR', '20000'));
    // The least is of the whole budget, counted; the most of the whole.
    expect([at(c({ least: 1000000 }), '999999.99'), at(c({ least: 1000000 }), '1000000')]).toEqual([of('EUR', '0'), of('EUR', '250000')]);
    expect([at(c({ most: 200000 }), '1000000'), at(c({ most: 300000 }), '1000000')]).toEqual([of('EUR', '200000'), of('EUR', '250000')]);
    // Too few episodes, or too short a one, claims nothing.
    expect([at(c({ episodes: 5 }), '1000000'), at(c({ episodes: 4 }), '1000000')]).toEqual([of('EUR', '0'), of('EUR', '250000')]);
    expect([at(c({ minutes: 61 }), '1000000'), at(c({ minutes: 60 }), '1000000'), at(c({ minutes: 45 }), '1000000', { ...s, minutes: 44 })]).toEqual([of('EUR', '0'), of('EUR', '250000'), of('EUR', '0')]);
    // Set in another currency: its tiers, least and most at the day's rate; none on a day the game has no rate.
    const usd = c({ tiers: [tier({ currency: 'USD' })], least: 1000, most: 1_000_000, currency: 'USD' });
    expect(at(usd, '1000000')).toEqual(of('EUR', '250000'));
    expect(at(c({ tiers: [tier({ currency: 'USD' })], most: 100, currency: 'USD' }), '1000000')?.minor).toBeLessThan(10_000);
    expect(at(usd, '1000000', s, '1999-01-01')).toBeNull();
    expect(at(c({ least: 10, currency: 'USD' }), '1000000', s, '1999-01-01')).toBeNull();
    // No tier for the budget, none paid.
    expect(at(c({ tiers: [tier({ budget: [2000000, null] })] }), '1000000')).toEqual(of('EUR', '0'));
  });
});

describe('a series made beyond the UK', () => {
  it("claims its market's incentive, by the episode, the hour or the minute", () => {
    // Norway's: 25% where each episode's budget reaches NOK 10m.
    expect([credit(series('NO', 6), '72000000'), credit(series('NO', 6), '54000000')]).toEqual([of('NOK', '18000000'), of('NOK', '0')]);
    // Denmark's: 25% at DKK 150,000 a minute, from DKK 15m, at most DKK 20m; its minutes the episodes' running time where named.
    expect([credit(series('DK', 6), '72000000'), credit(series('DK', 6), '100000000'), credit(series('DK', 6), '50000000'), credit(series('DK', 6, { minutes: 45 }), '50000000')]).toEqual([of('DKK', '18000000'), of('DKK', '20000000'), of('DKK', '0'), of('DKK', '12500000')]);
    // France's: 25%, at most so much a minute by the cost of each.
    expect([credit(series('FR', 6, { minutes: 52 }), '3120000'), credit(series('FR', 6, { minutes: 52 }), '6240000'), credit(series('FR', 6, { minutes: 52 }), '1000000')]).toEqual([of('EUR', '468000'), of('EUR', '936000'), of('EUR', '0')]);
    // Spain's: 30% of each episode's first EUR 1m, 25% above.
    expect(credit(series('ES', 8), '16000000')).toEqual(of('EUR', '4400000'));
    // Australia's: 30% at AUD 500,000 an hour, from AUD 1m, two episodes at least.
    expect([credit(series('AU', 4), '4000000'), credit(series('AU', 4), '1600000'), credit(series('AU', 1), '4000000')]).toEqual([of('AUD', '1200000'), of('AUD', '0'), of('AUD', '0')]);
    // Greenland's excludes television: nothing. Afghanistan's isn't known: none.
    expect([credit(series('GL', 4), '4000000'), credit(series('AF', 4), '4000000')]).toEqual([of('DKK', '0'), null]);
  });

  it("is refused an incentive paid only to productions from abroad where the life's company makes it at home, told", () => {
    const co = (l: Life<Lives>) => credit(series('CO', 6, {}, l), '6000000000');
    expect([co(life()), co(from('CO'))]).toEqual([of('COP', '2100000000'), of('COP', '0')]);
    expect(aboutCredit(from('CO').slices, { format: 'series', market: 'CO' })).toBe(t(ABROAD_LINE, { country: 'Colombia', work: 'series' }));
    expect(aboutCredit(life().slices, { format: 'series', market: 'CO' })).toBeUndefined();
    expect(credit(series('IN', 4, {}, from('IN')), '100000000')).toEqual(of('INR', '0'));
    expect(credit(series('IN', 4), '100000000')).toEqual(of('INR', '30000000'));
    falsifyAny({ feature: 'producing.plan', claim: 'bites', says: "a COP 6bn series in Colombia is credited the CINA's 35% where an American makes it, nothing where a Colombian's company makes it at home", base: 'US', twin: 'CO', outcome: (cc: string) => co(from(cc)) });
  });

  it("caps the producer's fee and overheads at each cap its market's funders set, none where none is known", () => {
    // Germany's GMPF: the fee 5%, at most EUR 350,000; overheads 10% to EUR 5m of costs, 5% above, at most EUR 650,000.
    expect(project(plan(series('DE', 6), '8000000')).plan?.fee).toEqual(of('EUR', '1000000'));
    expect(project(plan(series('DE', 6), '2000000')).plan?.fee).toEqual(of('EUR', '300000'));
    expect(project(plan(series('AT', 6), '2000000')).plan?.fee).toEqual(of('EUR', '250000'));
    expect(project(plan(series('NO', 6), '2000000')).plan?.fee).toBeNull();
    // The Netherlands': the Film Fund's protocol holds a drama series' fee and overheads together to 15% (until 2026-11-04 not known).
    expect(project(plan(series('NL', 6), '2000000')).plan?.fee).toEqual(of('EUR', '300000'));
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a EUR 2m series' fee is the Dutch Film Fund's 15% in the Netherlands and none known in Norway", base: 'NL', twin: 'NO', outcome: (cc: string) => project(plan(series(cc, 6), '2000000')).plan?.fee ?? null });
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a EUR 2m series' fee is Germany's 15% in Germany and Austria's 12.5% in Austria", base: 'DE', twin: 'AT', outcome: (cc: string) => project(plan(series(cc, 6), '2000000')).plan?.fee });
  });

  it("applies to its market's fund: a yes at its rate as the package sells it, the most its terms allow; refused where none is known", () => {
    const no = project(plan(series('NO', 6), '72000000'));
    // Norway's: 3 of 6 in 2025, at most NOK 35m, all public aid at most half the budget, the credit with it.
    expect(fundFor(no)).toEqual({ rate: 0.5, award: 18_000_000_00 });
    expect(fundFor(project(plan(series('NO', 6), '20000000')))).toEqual({ rate: 0.5, award: 10_000_000_00 });
    expect(fundFor(project(plan(series('CL', 3), '500000000')))).toEqual({ rate: 2 / 29, award: 605_588_760 });
    const applied = (seed: string) => {
      const l = dispatch(plan(series('NO', 6, {}, life(identity(), seed)), '72000000'), applyToFunder, { project: 1 });
      const p = project(l);
      const yes = draws(seedFromText(seed), 'producing.work', 'apply', 1).float() < 0.5 * factor(l.slices.producing, packagePitch(l.slices, producerValues(l.slices, p), p), p, T0, l.slices.directing);
      expect(p.raised['fund']).toEqual(yes ? of('NOK', '18000000') : undefined);
      return yes;
    };
    const yes = Array.from({ length: 12 }, (_, i) => applied(i.toString(16).padStart(16, '0')));
    expect(yes).toContain(true);
    expect(yes).toContain(false);
    expect(() => dispatch(plan(series('FR', 6), '6000000'), applyToFunder, { project: 1 })).toThrow("what a public fund in France gives a producer's series isn't known to this game");
    falsifyAny({ feature: 'producing.apply', claim: 'bites', says: "a series' fund is Norway's 3 of 6 in Norway and Chile's 2 of 29 in Chile", base: 'NO', twin: 'CL', outcome: (cc: string) => fundFor(project(plan(series(cc, 6), cc === 'NO' ? '72000000' : '500000000'))).rate });
  });

  it("is offered to broadcasters once shot, in any market at the game's own chance, told", () => {
    const picked = Array.from({ length: 16 }, (_, i) => {
      const seed = (i + 1).toString(16).padStart(16, '0');
      const l = dispatch(shot(plan(series('NO', 2, {}, life(identity(), seed)), '30000000')), releaseFilm, { project: 1 });
      const p = project(l);
      const quality = qualityOf(l.slices, p);
      const audience = draws(seedFromText(seed), 'producing.work', 'release', 1).float() < MODEL.pickup * (0.5 + sellSkill(producerValues(l.slices, p), quality) / 100);
      expect(p.release).toEqual({ at: T0, quality, audience, doubled: null });
      return audience;
    });
    expect(picked).toContain(true);
    expect(picked).toContain(false);
    expect(PART_MISSING).toEqual({
      series: { incentive: 'the production incentive a series can claim', fund: 'what a public fund gives a series, or how often it says yes', feecap: "the cap a funder sets on a series producer's fee and overheads", outcomes: 'how often a broadcaster picks up a series made without one' },
      stage: { incentive: 'the tax incentive a play can claim', fund: 'what a public fund gives a play, or how often it says yes', outcomes: 'how often a play earns back its cost' },
    });
    expect(aboutMarket('FR', 'series')).toBe(t(UNKEPT_LINE, { country: 'France', missing: `${PART_MISSING.series.fund}, ${PART_MISSING.series.feecap} and ${PART_MISSING.series.outcomes}` }));
    expect(aboutMarket('AF', 'series')).toBe(t(UNKEPT_LINE, { country: 'Afghanistan', missing: `${PART_MISSING.series.incentive}, ${PART_MISSING.series.fund}, ${PART_MISSING.series.feecap} and ${PART_MISSING.series.outcomes}` }));
    expect(aboutMarket('FR', 'film')).toBe(aboutMarket('FR'));
    expect(aboutMarket('XX', 'series')).toBeUndefined();
  });
});

describe('a play made beyond the UK', () => {
  it("is staged under one of its market's agreements whose medium is the stage, refused where it has none, told", () => {
    expect(project(play('FR', 'fr-private-stage'))).toMatchObject({ format: 'stage', stage: null, staged: 'fr-private-stage', nation: null });
    expect(project(play('RE', 're-fr-subsidised-stage')).staged).toBe('re-fr-subsidised-stage');
    expect(() => play('FR', 'fr-film')).toThrow('a play made in France is staged under one of its agreements: fr-subsidised-stage, fr-private-stage (fr-film)');
    expect(() => play('FR', 'de-stage')).toThrow('a play made in France is staged under one of its agreements: fr-subsidised-stage, fr-private-stage (de-stage)');
    expect(() => play('US', 'sag-aftra')).toThrow("no agreement a play is staged under in United States is known to this game, so a play can't be made there");
    // The life directs one where the director's engine holds a play agreement of its market (Austria's), not elsewhere (France's).
    const directed = (market: string, staged: string) => dispatch(life(), optionMaterial, { format: 'stage', staged, roles: ['director'], account: ACCOUNT, days: 1, genre: 'drama', market });
    expect(project(directed('AT', 'at-stage')).roles).toEqual(['director']);
    // A film there is directed by the life whatever the market's stage: what a play's director needs, a film's doesn't.
    expect(project(dispatch(life(), optionMaterial, { format: 'film', roles: ['director'], account: ACCOUNT, days: 1, genre: 'drama', market: 'FR' })).roles).toEqual(['director']);
    expect(() => directed('FR', 'fr-private-stage')).toThrow("a stage director's terms in France aren't known to this game, so a play there is directed by someone hired");
    // A film, a series and a UK play name none.
    expect(project(series('FR', 2)).staged).toBeUndefined();
    expect(() => series('FR', 2, { staged: 'fr-private-stage' })).toThrow("a series isn't staged");
    expect(() => dispatch(life(), optionMaterial, { format: 'stage', staged: 'uk-theatre', theatre: 'commercial', seats: 400, touring: false, nation: 'GB.ENG', roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama', market: 'GB' })).toThrow("a UK play is staged under its theatre's agreement");
  });

  it("claims its market's tax incentive for theatre, nothing where its law has none, none where it isn't known", () => {
    // Spain's: 20% of the costs, at most EUR 500,000 (a taxpayer's in a year, held a play's).
    expect([credit(play('ES', 'es-madrid-stage'), '400000'), credit(play('ES', 'es-madrid-stage'), '3000000')]).toEqual([of('EUR', '80000'), of('EUR', '500000')]);
    expect(credit(play('FR', 'fr-private-stage'), '400000')).toBeNull();
    expect(project(plan(play('ES', 'es-madrid-stage'), '400000')).plan?.fee).toBeNull();
    falsifyAny({ feature: 'producing.plan', claim: 'bites', says: "a EUR 400,000 play is credited Spain's 20% in Spain and nothing known in France", base: 'ES', twin: 'FR', outcome: (cc: string) => credit(play(cc, cc === 'ES' ? 'es-madrid-stage' : 'fr-private-stage'), '400000') });
  });

  it("applies to its market's fund for a play, refused where none is known", () => {
    expect(fundFor(project(plan(play('NL', 'nl-stage'), '300000')))).toEqual({ rate: 0.35, award: 7_875_000 });
    expect(fundFor(project(plan(play('NZ', 'nz-court'), '300000')))).toEqual({ rate: 27 / 247, award: 12_500_000 });
    expect(() => dispatch(plan(play('FR', 'fr-private-stage'), '300000'), applyToFunder, { project: 1 })).toThrow("what a public fund in France gives a producer's play isn't known to this game");
    falsifyAny({ feature: 'producing.apply', claim: 'bites', says: "a play's fund says yes at the Dutch 35% in the Netherlands and Creative NZ's 27 of 247 in New Zealand", base: 'NL', twin: 'NZ', outcome: (cc: string) => fundFor(project(plan(play(cc, cc === 'NL' ? 'nl-stage' : 'nz-court'), '300000'))).rate });
  });

  it("opens once staged, its run earning back its cost at the game's own chance, told", () => {
    const recouped = Array.from({ length: 16 }, (_, i) => {
      const seed = (i + 1).toString(16).padStart(16, '0');
      const l = dispatch(shot(plan(play('NL', 'nl-stage', life(identity(), seed)), '300000')), releaseFilm, { project: 1 });
      const p = project(l);
      const quality = qualityOf(l.slices, p);
      const audience = draws(seedFromText(seed), 'producing.work', 'release', 1).float() < MODEL.recoup * (0.5 + sellSkill(producerValues(l.slices, p), quality) / 100);
      expect(p.release).toEqual({ at: T0, quality, audience, doubled: null });
      return audience;
    });
    expect(recouped).toContain(true);
    expect(recouped).toContain(false);
    expect(aboutMarket('NL', 'stage')).toBe(t(UNKEPT_LINE, { country: 'The Netherlands', missing: `${PART_MISSING.stage.incentive} and ${PART_MISSING.stage.outcomes}` }));
  });

  it("is written under its market's writers' agreement for a play, refused where there is none", () => {
    const writer = (who: IdentitySlice) => dispatch(life(who, SEED, { screenwriter: 70, producer: 60 }), writeScript, { form: 'play', genre: 'drama', days: 120 });
    const develop = (market: string, staged: string, who: IdentitySlice) => dispatch(writer(who), developScript, { script: 1, format: 'stage', staged, roles: ['writer', 'producer'], market, minutes: 90 });
    const dane = identity({ citizenship: ['DK'], languages: [{ lang: 'da', level: 'C2' }] });
    expect(project(develop('DK', 'dk-soejle-a', dane)).writing).toBe('dk-tio');
    expect(() => develop('DK', 'dk-soejle-a', identity())).toThrow("a script under dk-tio is written in da, which the writer doesn't write well enough");
    expect(() => develop('DE', 'de-stage', identity())).toThrow("no writers' agreement for a play in Germany is known to this game, so a play there is someone else's material");
    // A market whose writers' agreements include the WGA's, which sets no terms for a play (Puerto Rico's).
    expect(() => writingFor(life().slices, 'PR', 'play', undefined)).toThrow("no writers' agreement for a play in Puerto Rico is known to this game, so a play there is someone else's material");
    // Its minimum is paid as the play is staged, under the market's agreement.
    const staged = shot(plan(develop('DK', 'dk-soejle-a', dane), '400000'));
    expect(project(staged).costs.map((c: Project['costs'][number]) => [c.role, c.what])).toEqual([['writer', 'the script']]);
    expect(Object.keys(countries)).toContain('DK');
  });
});
