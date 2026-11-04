import { describe, expect, it } from 'vitest';
import { begin, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { fromMajor, money } from '../../../src/core/money/money.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { daysFromCivil, SECONDS_PER_DAY } from '../../../src/core/time/calendar.ts';
import { addMonths } from '../../../src/core/time/dates.ts';
import { exchangeOn } from '../../../src/money/rates/rates.ts';
import { ACTING_START, castOf, castPart, daysWorked, ITC, pay, playPart, SOLT, THEATRE_AGREEMENT, UK_SUBSIDISED, type ActingSlice, type Agreement } from '../../../src/person/acting/acting.ts';
import { ATTRIBUTES_START, chooseAttributes, componentValues, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import { cutFilm, DIRECTING_START, EPISODES, filmOf, ITC_DIRECTOR, itcFee, jobOf, OVER_FOUR, PLANNED, subsidisedFee, prepFilm, shootFilm, shootNeeded, STAGE_FEES, submitFilm, terms, type DirectingSlice } from '../../../src/person/directing/directing.ts';
import type { GenresSlice } from '../../../src/person/genres/genres.ts';
import { homeRegionOf, personOf, type IdentitySlice } from '../../../src/person/identity/identity.ts';
import type { PermitsSlice } from '../../../src/person/permits/permits.ts';
import {
  aboutMarket,
  ACE,
  ARTS_COUNCIL,
  grantFor,
  applyToFunder,
  AVEC,
  developScript,
  engagementOf,
  factor,
  HIRED,
  HOME_MISSING,
  NATION_MISSING,
  OPEN_FUND,
  SCREEN_AGENCY,
  MODEL,
  optionMaterial,
  packagePitch,
  planProject,
  planSkill,
  PLAY_WRITING,
  PRODUCING_START,
  producerValues,
  projectOf,
  qualityOf,
  raised,
  releaseFilm,
  sellSkill,
  seriesCredit,
  shootProject,
  stageCredit,
  target,
  THEATRES,
  tradeDays,
  TTR,
  UNKEPT_LINE,
  type Project,
  type ProducingSlice,
  type Stage,
} from '../../../src/person/producing/producing.ts';
import { t } from '../../../src/core/text/text.ts';
import { CAREER_START, PLAYS, playMinimum, type CareerSlice } from '../../../src/person/work/career.ts';
import { UNIONS_START, type UnionsSlice } from '../../../src/person/unions/unions.ts';
import { SCRIPTS_START, writeScript, type ScriptsSlice } from '../../../src/person/work/work.ts';
import { YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { permitsEverywhere } from '../../support/permits.ts';
import { identity } from '../../support/person.ts';
import { ACCOUNT, purse } from '../../support/purse.ts';

type Lives = { attributes: AttributesSlice; producing: ProducingSlice; genres: GenresSlice; identity: IdentitySlice; acting: ActingSlice; directing: DirectingSlice; permits: PermitsSlice; youth: YouthSlice; scripts: ScriptsSlice; career: CareerSlice; unions: UnionsSlice } & ReturnType<typeof purse>;
const SEED = '0123456789abcdef';
const seedOf = (i: number) => i.toString(16).padStart(16, '0');
const T0 = daysFromCivil(2026, 11, 1) * SECONDS_PER_DAY;
const TODAY = '2026-11-01';
const dr = (seed: string, ...keys: (string | number)[]) => draws(seedFromText(seed), 'producing.work', ...keys);
const gbp = (n: string) => fromMajor('GBP', n);
const ACE_NAME = "Arts Council England's project grants";

/** A life with the roles' attributes chosen as given, an American born in 2000 who loves drama, animation and children's films. */
const life = (levels: Partial<Record<'producer' | 'screenwriter' | 'director' | 'actor', number>> = { producer: 60 }, who: IdentitySlice = identity(), seed = SEED, at = T0): Life<Lives> => {
  let l: Life<Lives> = begin(seed, at, {
    attributes: structuredClone(ATTRIBUTES_START),
    producing: structuredClone(PRODUCING_START),
    genres: { loved: ['drama', 'animated', 'childrens'] },
    identity: who,
    acting: structuredClone(ACTING_START),
    directing: structuredClone(DIRECTING_START),
    permits: permitsEverywhere(),
    youth: structuredClone(YOUTH_START),
    scripts: structuredClone(SCRIPTS_START),
    career: structuredClone(CAREER_START),
    unions: structuredClone(UNIONS_START),
    ...purse(),
  });
  for (const [role, all] of Object.entries(levels)) l = dispatch(l, chooseAttributes, { role, all, each: {} });
  return l;
};
const SUBSIDISED = { theatre: 'subsidised', grade: 2, touring: false };
const COMMERCIAL = { theatre: 'commercial', seats: 600, touring: false };
const WEST_END = { theatre: 'west-end', seats: 900, touring: false };
const ITC_COMPANY = { theatre: 'itc', touring: true, minutes: 90 };
/** A British actress, at home in the UK, who grew up in California. */
const british = () => identity({ citizenship: ['GB'] });
/** A British actress who grew up, and so lives, in a region of the UK ('' for none named). */
const grewUpIn = (region: string) => identity({ citizenship: ['GB'], grewUp: { country: 'GB', region } });
/** Material optioned for a UK production of a format, the life holding the roles given; a play at a subsidised theatre unless named. */
/** Args as given, a key given as undefined left out (a command's arguments are plain data). */
const named = (args: Record<string, unknown>) => Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined)) as never;
/** A play at a subsidised theatre of grade 2 that doesn't tour, unless the extra names its theatre (undefined: none). */
const playArgs = (format: string, extra: Record<string, unknown>) => ({
  ...(format === 'stage' && !('theatre' in extra) ? SUBSIDISED : {}),
  // A UK series or play in England unless the extra names its nation, or a market beyond the UK.
  ...(format !== 'film' && !('nation' in extra) && (extra['market'] ?? 'GB') === 'GB' ? { nation: 'GB.ENG' } : {}),
});
/** Material optioned for a UK production of a format, the life holding the roles given. */
const opt = (format: string, extra: Record<string, unknown> = {}, roles: string[] = ['producer'], l: Life<Lives> = life()) =>
  dispatch(l, optionMaterial, named({ format, roles, account: ACCOUNT, days: 1, genre: 'drama', market: 'GB', ...playArgs(format, extra), ...extra }));
/** Plans a project on a budget; a play its weeks of rehearsal and of the run. */
const plan = (l: Life<Lives>, budget: string, weeks?: readonly [number, number]) => dispatch(l, planProject, { project: 1, budget, ...(weeks === undefined ? {} : { rehearsal: weeks[0], run: weeks[1] }) });
const project = (l: Life<Lives>, id = 1) => projectOf(l.slices.producing, id);
const edit = (l: Life<Lives>, f: (p: Project) => void): Life<Lives> => {
  const producing = structuredClone(l.slices.producing);
  f(projectOf(producing, 1));
  return { ...l, slices: { ...l.slices, producing } };
};
const funded = (l: Life<Lives>) =>
  edit(l, (p) => {
    p.raised['equity'] = money(p.plan?.budget.currency ?? 'GBP', target(p) - raised(p));
  });
const shot = (l: Life<Lives>) => dispatch(funded(l), shootProject, { project: 1, account: ACCOUNT });

describe("a UK play's theatre", () => {
  it('names its theatre, a subsidised theatre by its grade or another by its seats, and whether it tours, in the UK alone', () => {
    expect(THEATRES).toEqual(['subsidised', 'commercial', 'west-end', 'itc']);
    expect(project(opt('stage', ITC_COMPANY)).stage).toEqual({ theatre: 'itc', grade: null, seats: null, touring: true });
    expect(project(opt('stage')).stage).toEqual({ theatre: 'subsidised', grade: 2, seats: null, touring: false });
    expect(project(opt('stage', { ...COMMERCIAL, touring: true })).stage).toEqual({ theatre: 'commercial', grade: null, seats: 600, touring: true });
    expect(project(opt('stage', WEST_END)).stage).toEqual({ theatre: 'west-end', grade: null, seats: 900, touring: false });
    expect(project(opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'US' })).stage).toBeNull();
    expect([project(opt('film')).stage, project(opt('series', { episode: 'hour', episodes: 1 })).stage]).toEqual([null, null]);
  });

  it('is refused a theatre there is not, a grade or seats out of turn, a touring left unsaid, or a theatre outside the UK or off the stage', () => {
    const go = (extra: Record<string, unknown>, format = 'stage') => () => opt(format, extra);
    expect(go({ theatre: 'fringe' })).toThrow('a play made in the UK names its theatre: subsidised, commercial, west-end, itc (fringe)');
    expect(go({ theatre: undefined })).toThrow('a play made in the UK names its theatre: subsidised, commercial, west-end, itc (undefined)');
    for (const named of [{ grade: 1 }, { seats: 300 }]) expect(go({ ...ITC_COMPANY, ...named })).toThrow("an ITC company's play names neither a grade nor seats");
    expect(go({ seats: 300 })).toThrow('a subsidised theatre names its grade, not its seats');
    for (const grade of [0, 4, 1.5, undefined]) expect(go({ grade })).toThrow(`a subsidised theatre's grade is 1, 2 or 3 (${String(grade)})`);
    for (const grade of [1, 3]) expect(project(go({ grade })()).stage?.grade).toBe(grade);
    expect(go({ ...COMMERCIAL, grade: 1 })).toThrow('a commercial theatre names its seats, not a grade');
    expect(go({ ...WEST_END, grade: 1 })).toThrow('a West End theatre names its seats, not a grade');
    expect(go({ ...COMMERCIAL, seats: undefined })).toThrow("the theatre's seats is a whole number of at least 1 (undefined)");
    expect(go({ ...WEST_END, seats: 0 })).toThrow("the theatre's seats is a whole number of at least 1 (0)");
    expect(project(go({ ...WEST_END, seats: 1 })()).stage?.seats).toBe(1);
    expect(go({ touring: 'yes' })).toThrow('a play names whether it tours (yes)');
    expect(go({ touring: undefined })).toThrow('a play names whether it tours (undefined)');
    // Each of the four named outside the UK is refused alone.
    const abroad = "a play's theatre is named in the UK alone, the one market whose theatres the game knows";
    for (const named of [{ theatre: 'subsidised' }, { grade: 1 }, { seats: 100 }, { touring: false }]) expect(go({ theatre: undefined, grade: undefined, touring: undefined, market: 'US', ...named })).toThrow(abroad);
    expect(go({ seats: 100 }, 'film')).toThrow('a film has no theatre');
    expect(go({ touring: true, episode: 'hour', episodes: 1 }, 'series')).toThrow('a series has no theatre');
  });

  it("lets the life act in a play at any UK theatre and direct one at a subsidised theatre, in the West End or for an ITC company, and refuses a commercial theatre's director, told", () => {
    expect(project(opt('stage', {}, ['director'])).roles).toEqual(['director']);
    expect(project(opt('stage', WEST_END, ['director', 'producer'])).roles).toEqual(['director', 'producer']);
    expect(project(opt('stage', ITC_COMPANY, ['director'])).roles).toEqual(['director']);
    expect(() => opt('stage', COMMERCIAL, ['director'])).toThrow("a commercial theatre director's minimum turns on a run's length and level that the published rates don't define, so a play there is directed by someone hired");
    expect(() => opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' }, ['director'])).toThrow("a stage director's terms in France aren't known to this game, so a play there is directed by someone hired");
    for (const theatre of [COMMERCIAL, SUBSIDISED, WEST_END, ITC_COMPANY]) expect(project(opt('stage', theatre, ['actor'])).roles).toEqual(['actor']);
    // One play the life acts in and directs.
    for (const theatre of [SUBSIDISED, WEST_END, ITC_COMPANY]) expect(project(opt('stage', theatre, ['actor', 'director'])).roles).toEqual(['actor', 'director']);
    // A play abroad is acted under the market's agreements.
    expect(project(opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' }, ['actor'])).roles).toEqual(['actor']);
  });
});

describe("a UK production's nation", () => {
  it('is named for a UK series or play as the map keys it, none for a film or beyond the UK', () => {
    for (const nation of ['GB.ENG', 'GB.SCT', 'GB.WLS', 'GB.NIR']) {
      expect(project(opt('stage', { nation })).nation).toBe(nation);
      expect(project(opt('series', { episode: 'hour', episodes: 1, nation })).nation).toBe(nation);
    }
    expect([project(opt('film')).nation, project(opt('series', { episode: 'hour', episodes: 1, market: 'FR' })).nation]).toEqual([null, null]);
  });

  it("is refused unnamed or unknown, on a film, beyond the UK, and anywhere but England for a West End play", () => {
    expect(() => opt('stage', { nation: undefined })).toThrow('a play made in the UK names its nation: GB.ENG, GB.NIR, GB.SCT, GB.WLS (undefined)');
    expect(() => opt('series', { episode: 'hour', episodes: 1, nation: 'GB.LND' })).toThrow('a series made in the UK names its nation: GB.ENG, GB.NIR, GB.SCT, GB.WLS (GB.LND)');
    expect(() => opt('film', { nation: 'GB.ENG' })).toThrow("a film's public fund, the BFI's, is the whole UK's, so a film names no nation");
    expect(() => opt('series', { episode: 'hour', episodes: 1, market: 'FR', nation: 'GB.ENG' })).toThrow("a production's nation is named in the UK alone");
    for (const nation of ['GB.SCT', 'GB.WLS', 'GB.NIR']) expect(() => opt('stage', { ...WEST_END, nation })).toThrow('a West End theatre is in London, so a play there is made in England');
    expect(project(opt('stage', { ...SUBSIDISED, nation: 'GB.SCT' })).stage?.theatre).toBe('subsidised');
  });

  it('is the nation the life grew up in where it names none and the life grew up in the UK, still nameable', () => {
    for (const nation of ['GB.ENG', 'GB.SCT', 'GB.WLS', 'GB.NIR']) {
      expect(project(opt('stage', { nation: undefined }, ['producer'], life({ producer: 60 }, grewUpIn(nation)))).nation).toBe(nation);
      expect(project(opt('series', { episode: 'hour', episodes: 1, nation: undefined }, ['producer'], life({ producer: 60 }, grewUpIn(nation)))).nation).toBe(nation);
    }
    expect(project(opt('stage', { nation: 'GB.WLS' }, ['producer'], life({ producer: 60 }, grewUpIn('GB.SCT')))).nation).toBe('GB.WLS');
    expect(() => opt('stage', { nation: undefined }, ['producer'], life({ producer: 60 }, grewUpIn('')))).toThrow('a play made in the UK names its nation: GB.ENG, GB.NIR, GB.SCT, GB.WLS (undefined)');
    expect(() => opt('stage', { ...WEST_END, nation: undefined }, ['producer'], life({ producer: 60 }, grewUpIn('GB.SCT')))).toThrow('a West End theatre is in London, so a play there is made in England');
    expect(project(opt('film', {}, ['producer'], life({ producer: 60 }, grewUpIn('GB.SCT')))).nation).toBeNull();
    expect(homeRegionOf(personOf(grewUpIn('GB.WLS')))).toBe('GB.WLS');
  });

  it('identity.make: where the life grew up sets the nation its play is made in', () => {
    const won = (region: string) =>
      Array.from({ length: 20 }, (_, i) => project(dispatch(plan(opt('stage', { nation: undefined }, ['producer'], life({ producer: 60 }, grewUpIn(region), seedOf(i + 1))), '300000', [3, 6]), applyToFunder, { project: 1 })).raised);
    falsifyAny({ feature: 'identity.make', claim: 'downstream', says: "a life that grew up in England makes its play, naming no nation, in England, and applies to Arts Council England; one that grew up in Scotland makes it in Scotland and applies to Creative Scotland's Open Fund", base: 'GB.ENG', twin: 'GB.SCT', outcome: won });
  });
});

describe('a series and a play', () => {
  it("are planned on their own days: a series' episodes the DGA's shooting days, a play's weeks of rehearsal and run as named, five days each", () => {
    const series = project(plan(opt('series', { episode: 'hour', episodes: 6 }), '3000000')).plan;
    expect(series?.needed).toBe(Math.round(EPISODES.hour.shoot * 6 * (1 + MODEL.need * (2 * dr(SEED, 'plan', 1).float() - 1))));
    expect(series?.weeks).toBeNull();
    const l = plan(opt('stage'), '300000', [3, 6]);
    const play = project(l).plan;
    expect([play?.needed, play?.weeks]).toEqual([45, { rehearsal: 3, run: 6 }]);
    // The producer schedules the play's days about its need as about a film's, and is engaged for them all.
    const k = planSkill(producerValues(l.slices, project(l)));
    expect(play?.scheduled).toBe(Math.max(1, Math.round(45 * (1 + MODEL.planned * (1 - k / 100) * (2 * dr(SEED, 'plan', 1).float() - 1)))));
    expect(engagementOf(project(l))).toEqual({ country: 'GB', days: play?.scheduled });
    expect([tradeDays({ series: null }, { rehearsal: 1, run: 1 }), tradeDays({ series: null }, { rehearsal: 4, run: 2 })]).toEqual([10, 30]);
    expect(() => plan(opt('stage'), '300000')).toThrow("a play's weeks of rehearsal is a whole number of at least 1 (undefined)");
    expect(() => plan(opt('stage'), '300000', [0, 6])).toThrow("a play's weeks of rehearsal is a whole number of at least 1 (0)");
    expect(() => dispatch(opt('stage'), planProject, { project: 1, budget: '300000', rehearsal: 3 })).toThrow("a play's weeks of performance is a whole number of at least 1 (undefined)");
    expect(() => plan(opt('stage'), '300000', [3, 0])).toThrow("a play's weeks of performance is a whole number of at least 1 (0)");
    for (const weeks of [{ rehearsal: 3 }, { run: 6 }]) {
      expect(() => dispatch(opt('film'), planProject, { project: 1, budget: '300000', ...weeks })).toThrow("a film's days are the trade's");
      expect(() => dispatch(opt('series', { episode: 'hour', episodes: 2 }), planProject, { project: 1, budget: '300000', ...weeks })).toThrow("a series's days are the trade's");
    }
  });

  it("producing.plan: a play's longer run engages its producer for more days", () => {
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: 'a play planned for three weeks of rehearsal and six of performance schedules its producer 45 days or so, one with ten weeks of performance 65 or so, the days a permit to work there asks', base: 6, twin: 10, outcome: (run: number) => engagementOf(project(plan(opt('stage'), '300000', [3, run]))).days });
  });
});

describe('a UK series', () => {
  const credit = (form: 'hour' | 'half-hour', episodes: number, pounds: string, genre = 'drama', date = TODAY) => seriesCredit({ series: { form, episodes }, genre }, gbp(pounds), date);

  it("claims the AVEC: 34% of the 80% counted where core costs reach £1m an hour of slot, 39% for an animation or a children's programme, nothing below; none before 2024", () => {
    expect(AVEC).toEqual({ from: '2024-01-01', special: 0.39, hourly: 1_000_000, slot: { hour: 1, 'half-hour': 0.5 } });
    expect(credit('hour', 6, '6000000')).toEqual(gbp('1632000'));
    expect(credit('hour', 6, '5999999.99')).toEqual(gbp('0'));
    expect(credit('half-hour', 6, '3000000')).toEqual(gbp('816000'));
    expect(credit('half-hour', 6, '2999999.99')).toEqual(gbp('0'));
    for (const genre of ['animated', 'anime', 'childrens']) expect(credit('hour', 6, '100000', genre)).toEqual(gbp('31200'));
    expect(credit('hour', 6, '6000000', 'animated')).toEqual(gbp('1872000'));
    expect(credit('hour', 6, '6000000', 'drama', '2023-12-31')).toBeNull();
    expect(credit('hour', 6, '6000000', 'drama', '2024-01-01')).toEqual(gbp('1632000'));
    const planned = project(plan(opt('series', { episode: 'hour', episodes: 2 }), '2000000')).plan;
    expect([planned?.fee, planned?.credit]).toEqual([null, gbp('544000')]);
    // Beyond the UK a series' credit isn't known.
    const fr = project(plan(opt('series', { episode: 'hour', episodes: 2, market: 'FR' }), '2000000')).plan;
    expect([fr?.fee, fr?.credit]).toEqual([null, null]);
  });

  it('producing.option: a series of more episodes needs more core costs for its credit', () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: 'a £2m UK series of two hour episodes claims the AVEC; one of three, under £1m an hour, claims nothing', base: 2, twin: 3, outcome: (episodes: number) => project(plan(opt('series', { episode: 'hour', episodes }), '2000000')).plan?.credit });
  });

  it("is refused a fund in every nation, told what is known: none across the UK or in England, each other nation's screen agency's without a rate of yes; elsewhere the research doesn't say", () => {
    const apply = (nation: string) => () => dispatch(plan(opt('series', { episode: 'hour', episodes: 2, nation }), '2000000'), applyToFunder, { project: 1 });
    expect(apply('GB.ENG')).toThrow("no public fund across the UK or in England backs a drama series: the BFI's Global Screen Fund takes television only as an international co-production in animation or documentary");
    expect(SCREEN_AGENCY).toEqual({ 'GB.SCT': 'Screen Scotland', 'GB.WLS': 'Creative Wales', 'GB.NIR': 'Northern Ireland Screen' });
    expect(apply('GB.SCT')).toThrow("Screen Scotland funds series made in Scotland, but it doesn't publish how often it says yes, so its fund isn't modeled in this game");
    expect(apply('GB.WLS')).toThrow("Creative Wales funds series made in Wales, but it doesn't publish how often it says yes, so its fund isn't modeled in this game");
    expect(apply('GB.NIR')).toThrow("Northern Ireland Screen funds series made in Northern Ireland, but it doesn't publish how often it says yes, so its fund isn't modeled in this game");
    expect(() => dispatch(plan(opt('series', { episode: 'hour', episodes: 2, market: 'FR' }), '2000000'), applyToFunder, { project: 1 })).toThrow("what a public fund in France gives a series isn't known to this game");
  });

  it("is offered to broadcasters once shot, picked up at the game's 30% as the series and its campaign sell it", () => {
    const picked = Array.from({ length: 20 }, (_, i) => {
      const seed = seedOf(i + 1);
      const l = dispatch(shot(plan(opt('series', { episode: 'hour', episodes: 2 }, ['producer'], life({ producer: 60 }, identity(), seed)), '2000000')), releaseFilm, { project: 1 });
      const p = project(l);
      const quality = qualityOf(l.slices, p);
      const audience = dr(seed, 'release', 1).float() < MODEL.pickup * (0.5 + sellSkill(producerValues(l.slices, p), quality) / 100);
      expect(p.release).toEqual({ at: T0, quality, audience, doubled: null });
      return audience;
    });
    expect(picked).toContain(true);
    expect(picked).toContain(false);
    expect(() => dispatch(shot(plan(opt('series', { episode: 'hour', episodes: 2, market: 'FR' }), '2000000')), releaseFilm, { project: 1 })).toThrow("how a series made in France fares once it's made isn't known to this game");
  });

  it('producing.option: a series finds its audience at its own rate, a film at the BFI’s', () => {
    // A £300,000 film reaches cinemas at the BFI's 11.6%; a series of that budget is picked up at the game's 30%.
    const found = (format: string) =>
      Array.from({ length: 30 }, (_, i) => {
        const extra = format === 'series' ? { episode: 'half-hour', episodes: 1 } : {};
        const l = dispatch(shot(plan(opt(format, extra, ['producer'], life({ producer: 50 }, identity(), seedOf(i + 1))), '300000')), releaseFilm, { project: 1 });
        return project(l).release?.audience;
      }).filter((x) => x === true).length;
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "the same production made a series is picked up more often (the game's 30%) than made a film it reaches cinemas (the BFI's 11.6% under £0.5m)", base: 'film', twin: 'series', outcome: found });
  });

  it("tells what the UK's research couldn't find of a series and a play, in each nation", () => {
    expect(HOME_MISSING).toEqual({
      film: [],
      series: ["the cap a broadcaster or funder sets on a series producer's fee", 'how often a broadcaster picks up a series made without one'],
      stage: ['how often a play earns back its cost', "the playwright's minimum in the West End"],
    });
    expect(NATION_MISSING).toEqual({
      'GB.ENG': { series: [], stage: ["where Arts Council England's project grants take an applicant from"] },
      'GB.SCT': { series: ['how often Screen Scotland says yes to a series'], stage: [] },
      'GB.WLS': { series: ['how often Creative Wales says yes to a series'], stage: ['how often the Arts Council of Wales says yes to a play'] },
      'GB.NIR': { series: ['how often Northern Ireland Screen says yes to a series'], stage: ['how often the Arts Council of Northern Ireland says yes to a play'] },
    });
    expect(aboutMarket('GB')).toBeUndefined();
    expect(aboutMarket('GB', 'film')).toBeUndefined();
    expect(aboutMarket('GB', 'film', 'GB.WLS')).toBeUndefined();
    expect(aboutMarket('GB', 'series')).toBe(t(UNKEPT_LINE, { country: 'United Kingdom', missing: "the cap a broadcaster or funder sets on a series producer's fee and how often a broadcaster picks up a series made without one" }));
    expect(aboutMarket('GB', 'stage')).toBe(t(UNKEPT_LINE, { country: 'United Kingdom', missing: "how often a play earns back its cost and the playwright's minimum in the West End" }));
    expect(aboutMarket('GB', 'series', 'GB.ENG')).toBe(t(UNKEPT_LINE, { country: 'England', missing: "the cap a broadcaster or funder sets on a series producer's fee and how often a broadcaster picks up a series made without one" }));
    expect(aboutMarket('GB', 'series', 'GB.SCT')).toBe(t(UNKEPT_LINE, { country: 'Scotland', missing: "the cap a broadcaster or funder sets on a series producer's fee, how often a broadcaster picks up a series made without one and how often Screen Scotland says yes to a series" }));
    expect(aboutMarket('GB', 'stage', 'GB.ENG')).toBe(t(UNKEPT_LINE, { country: 'England', missing: "how often a play earns back its cost, the playwright's minimum in the West End and where Arts Council England's project grants take an applicant from" }));
    expect(aboutMarket('GB', 'stage', 'GB.SCT')).toBe(aboutMarket('GB', 'stage')?.replace('United Kingdom', 'Scotland'));
    expect(aboutMarket('GB', 'stage', 'GB.NIR')).toBe(t(UNKEPT_LINE, { country: 'Northern Ireland', missing: "how often a play earns back its cost, the playwright's minimum in the West End and how often the Arts Council of Northern Ireland says yes to a play" }));
    // A market's own unknowns, and nothing of the UK's, beyond it.
    expect(aboutMarket('AU', 'series')).toBe(aboutMarket('AU'));
  });
});

describe('a UK play', () => {
  it("claims Theatre Tax Relief: 45% touring, 40% otherwise, of the 80% counted, at most €50m at the day's rate; none before April 2025", () => {
    expect(TTR).toEqual({ from: '2025-04-01', touring: 0.45, other: 0.4, cap: fromMajor('EUR', '50000000') });
    expect(stageCredit(false, gbp('300000'), TODAY)).toEqual(gbp('96000'));
    expect(stageCredit(true, gbp('300000'), TODAY)).toEqual(gbp('108000'));
    const cap = exchangeOn(TTR.cap, 'GBP', TODAY)?.money;
    expect(cap?.minor).toBeGreaterThan(4_000_000_000);
    expect(stageCredit(true, gbp('200000000'), TODAY)).toEqual(cap);
    expect(stageCredit(true, gbp('100000000'), TODAY)).toEqual(gbp('36000000'));
    // Before the game's first rate the cap isn't applied.
    expect(stageCredit(true, gbp('200000000'), '2025-06-01')).toEqual(gbp('72000000'));
    expect(stageCredit(true, gbp('300000'), '2025-03-31')).toBeNull();
    expect(stageCredit(true, gbp('300000'), '2025-04-01')).toEqual(gbp('108000'));
    const planned = project(plan(opt('stage'), '300000', [3, 6])).plan;
    expect([planned?.fee, planned?.credit, planned?.needed]).toEqual([null, gbp('96000'), 45]);
    expect(project(plan(opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' }), '300000', [3, 6])).plan?.credit).toBeNull();
  });

  it('producing.option: a play that tours claims more of its costs', () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "a £300,000 UK play that tours claims Theatre Tax Relief at 45%, one that doesn't at 40%", base: false, twin: true, outcome: (touring: boolean) => project(plan(opt('stage', { touring }), '300000', [3, 6])).plan?.credit });
  });

  it("applies to Arts Council England once: a yes at 29.4% as the package sells it, an award of what's left to raise, £1,000 to £100,000", () => {
    expect(ACE).toEqual({ rate: 0.294, least: 1_000, most: 100_000 });
    // £300,000: £246,000 to close, £96,000 of it the credit; £150,000 left, held to £100,000.
    expect(grantFor(project(plan(opt('stage'), '300000', [3, 6])), ACE, ACE_NAME)).toEqual({ rate: 0.294, award: 10_000_000 });
    expect(grantFor(project(plan(opt('stage'), '150000', [3, 6])), ACE, ACE_NAME)).toEqual({ rate: 0.294, award: 7_500_000 });
    const short = (left: number) => edit(plan(opt('stage'), '150000', [3, 6]), (p) => (p.raised['equity'] = money('GBP', target(p) - raised(p) - left)));
    expect(grantFor(project(short(100_000)), ACE, ACE_NAME)).toEqual({ rate: 0.294, award: 100_000 });
    expect(() => grantFor(project(short(99_999)), ACE, ACE_NAME)).toThrow("Arts Council England's project grants start at £1,000, more than project 1 has left to raise");
    expect(() => dispatch(short(99_999), applyToFunder, { project: 1 })).toThrow("Arts Council England's project grants start at £1,000, more than project 1 has left to raise");
    const said = Array.from({ length: 20 }, (_, i) => {
      const seed = seedOf(i + 1);
      const l = plan(opt('stage', {}, ['producer'], life({ producer: 60 }, identity(), seed)), '300000', [3, 6]);
      const after = project(dispatch(l, applyToFunder, { project: 1 }));
      const p = project(l);
      const yes = dr(seed, 'apply', 1).float() < ACE.rate * factor(l.slices.producing, packagePitch(l.slices, producerValues(l.slices, p), p), p, T0, l.slices.directing);
      expect(after.raised).toEqual(yes ? { ace: gbp('100000') } : {});
      expect(after.applied).toBe(true);
      return yes;
    });
    expect(said).toContain(true);
    expect(said).toContain(false);
    // The BFI's ten months left on an option is the BFI's own: a play's option with five left still applies.
    const late = edit(plan(opt('stage'), '300000', [3, 6]), (p) => (p.expires = addMonths('Europe/London', T0, 5)));
    expect(project(dispatch(late, applyToFunder, { project: 1 })).applied).toBe(true);
    expect(() => dispatch(plan(opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' }), '300000', [3, 6]), applyToFunder, { project: 1 })).toThrow("what a public fund in France gives a play isn't known to this game");
  });

  it('producing.plan: a bigger play asks Arts Council England for more', () => {
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a £150,000 UK play asks Arts Council England for the £75,000 it has left to raise; a £300,000 one for the £100,000 most", base: '150000', twin: '300000', outcome: (budget: string) => grantFor(project(plan(opt('stage'), budget, [3, 6])), ACE, ACE_NAME).award });
  });

  it("applies in Scotland to Creative Scotland's Open Fund for Individuals, as an artist living there: a yes at 535 of 1,761, £500 to £50,000", () => {
    expect(OPEN_FUND).toEqual({ rate: 535 / 1761, least: 500, most: 50_000 });
    const scottish = (budget = '300000', who = grewUpIn('GB.SCT')) => plan(opt('stage', { nation: 'GB.SCT' }, ['producer'], life({ producer: 60 }, who)), budget, [3, 6]);
    const name = "Creative Scotland's Open Fund for Individuals' grants";
    expect(grantFor(project(scottish()), OPEN_FUND, name)).toEqual({ rate: 535 / 1761, award: 5_000_000 });
    const short = (left: number) => edit(scottish('150000'), (p) => (p.raised['equity'] = money('GBP', target(p) - raised(p) - left)));
    expect(grantFor(project(short(50_000)), OPEN_FUND, name)).toEqual({ rate: 535 / 1761, award: 50_000 });
    expect(() => grantFor(project(short(49_999)), OPEN_FUND, name)).toThrow("Creative Scotland's Open Fund for Individuals' grants start at £500, more than project 1 has left to raise");
    expect(() => dispatch(short(49_999), applyToFunder, { project: 1 })).toThrow("Creative Scotland's Open Fund for Individuals' grants start at £500, more than project 1 has left to raise");
    const said = Array.from({ length: 20 }, (_, i) => {
      const seed = seedOf(i + 1);
      const l = plan(opt('stage', { nation: 'GB.SCT' }, ['producer'], life({ producer: 60 }, grewUpIn('GB.SCT'), seed)), '300000', [3, 6]);
      const p = project(l);
      const yes = dr(seed, 'apply', 1).float() < OPEN_FUND.rate * factor(l.slices.producing, packagePitch(l.slices, producerValues(l.slices, p), p), p, T0, l.slices.directing);
      expect(project(dispatch(l, applyToFunder, { project: 1 })).raised).toEqual(yes ? { 'creative-scotland': gbp('50000') } : {});
      return yes;
    });
    expect(said).toContain(true);
    expect(said).toContain(false);
    // A life lives where it grew up: in the US, in England, or in the UK but in no region named, it doesn't live in Scotland.
    for (const who of [identity(), british(), grewUpIn('GB.ENG'), grewUpIn('')]) expect(() => dispatch(scottish('300000', who), applyToFunder, { project: 1 })).toThrow("Creative Scotland's Open Fund for Individuals takes artists living in Scotland");
    // The UK's age for a public fund, 18, is the Open Fund's own.
    expect(() => dispatch(scottish('300000', identity({ citizenship: ['GB'], born: { date: '2010-01-01', country: 'GB', region: 'GB.SCT' } })), applyToFunder, { project: 1 })).toThrow("United Kingdom's public fund takes no applicant under 18");
  });

  it('is refused a fund in Wales and Northern Ireland, whose arts councils publish no rate of yes', () => {
    const apply = (nation: string) => () => dispatch(plan(opt('stage', { nation }, ['producer'], life({ producer: 60 }, british())), '300000', [3, 6]), applyToFunder, { project: 1 });
    expect(ARTS_COUNCIL).toEqual({ 'GB.WLS': 'the Arts Council of Wales', 'GB.NIR': 'the Arts Council of Northern Ireland' });
    expect(apply('GB.WLS')).toThrow("the Arts Council of Wales publishes what its project funds give but not how often it says yes, so its fund isn't modeled in this game");
    expect(apply('GB.NIR')).toThrow("the Arts Council of Northern Ireland publishes what its project funds give but not how often it says yes, so its fund isn't modeled in this game");
  });

  it("producing.option: a play's nation sets the fund it applies to", () => {
    const won = (nation: string) =>
      Array.from({ length: 20 }, (_, i) => project(dispatch(plan(opt('stage', { nation }, ['producer'], life({ producer: 60 }, grewUpIn('GB.SCT'), seedOf(i + 1))), '300000', [3, 6]), applyToFunder, { project: 1 })).raised);
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "a £300,000 play made in England wins Arts Council England's £100,000 at 29.4%; made in Scotland, Creative Scotland's £50,000 at 30.4%", base: 'GB.ENG', twin: 'GB.SCT', outcome: won });
  });

  it("producing.apply: Creative Scotland's Open Fund reads where the life lives", () => {
    const applied = (region: string) => {
      try {
        return project(dispatch(plan(opt('stage', { nation: 'GB.SCT' }, ['producer'], life({ producer: 60 }, grewUpIn(region))), '300000', [3, 6]), applyToFunder, { project: 1 })).applied;
      } catch {
        return false;
      }
    };
    falsifyAny({ feature: 'identity.make', claim: 'downstream', says: "a life that grew up in Scotland, and so lives there, applies to Creative Scotland's Open Fund for its play made in Scotland; one that grew up in England is refused", base: 'GB.SCT', twin: 'GB.ENG', outcome: applied });
  });

  it("opens once staged, its run earning back its cost at the game's 20% as the play and its campaign sell it", () => {
    const recouped = Array.from({ length: 30 }, (_, i) => {
      const seed = seedOf(i + 1);
      const l = dispatch(shot(plan(opt('stage', {}, ['producer'], life({ producer: 60 }, identity(), seed)), '300000', [3, 6])), releaseFilm, { project: 1 });
      const p = project(l);
      const quality = qualityOf(l.slices, p);
      const audience = dr(seed, 'release', 1).float() < MODEL.recoup * (0.5 + sellSkill(producerValues(l.slices, p), quality) / 100);
      expect(p.release).toEqual({ at: T0, quality, audience, doubled: null });
      return audience;
    });
    expect(recouped).toContain(true);
    expect(recouped).toContain(false);
    const fr = opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' });
    expect(() => dispatch(shot(plan(fr, '300000', [3, 6])), releaseFilm, { project: 1 })).toThrow("how a play made in France fares once it's made isn't known to this game");
  });
});

describe("the life's own play", () => {
  /** A life that wrote a play, at a level. */
  const writer = (who = identity()) => dispatch(life({ screenwriter: 70, producer: 60 }, who), writeScript, { form: 'play', genre: 'drama', days: 120 });
  const develop = (extra: Record<string, unknown> = {}, l = writer()) => dispatch(l, developScript, named({ script: 1, format: 'stage', roles: ['writer', 'producer'], market: 'GB', ...playArgs('stage', extra), ...extra }));

  it("is written for a UK subsidised or commercial theatre or an ITC company, paid under UK Theatre's or the ITC's, and refused for the West End and elsewhere", () => {
    expect(PLAY_WRITING).toEqual({ subsidised: ['uk-theatre-wggb', 'itc-wggb'], commercial: ['itc-wggb'], 'west-end': [], itc: ['itc-wggb'] });
    expect(project(develop(ITC_COMPANY)).writing).toBe('itc-wggb');
    expect(() => develop()).toThrow("a play made in GB names its writers' agreement: uk-theatre-wggb, itc-wggb");
    expect(project(develop({ agreement: 'uk-theatre-wggb' })).writing).toBe('uk-theatre-wggb');
    expect(project(develop({ agreement: 'itc-wggb' })).writing).toBe('itc-wggb');
    expect(project(develop(COMMERCIAL)).writing).toBe('itc-wggb');
    expect(() => develop({ ...COMMERCIAL, agreement: 'uk-theatre-wggb' })).toThrow("a play made in GB isn't paid under uk-theatre-wggb");
    expect(() => develop(WEST_END)).toThrow("no writers' agreement for the West End is known to this game, so a West End play is someone else's material");
    expect(() => develop({ theatre: undefined, grade: undefined, touring: undefined, market: 'US' })).toThrow("a play's writers' minimum in United States isn't known to this game, so a play there is someone else's material");
    expect(() => develop({ agreement: 'uk-theatre-wggb' }, writer(identity({ languages: [{ lang: 'fr', level: 'C2' }] })))).toThrow("a script under uk-theatre-wggb is written in en, which the writer doesn't write well enough");
    expect(() => dispatch(writer(), developScript, { script: 1, format: 'film', roles: ['writer'], market: 'GB' })).toThrow('a film is made from a feature or short, not a play');
  });

  it("is paid its agreement's minimum when it's staged: UK Theatre's by the theatre's grade, the ITC's by its running time", () => {
    expect(PLAYS['uk-theatre-wggb']).toEqual({ 1: [['2026-05-04', '11598.60']], 2: [['2026-05-04', '9383.49']], 3: [['2026-05-04', '8281.65']] });
    const ukt = (grade: 1 | 2 | 3, date = TODAY) => playMinimum('uk-theatre-wggb', { grade, minutes: null }, date);
    expect([ukt(1), ukt(2), ukt(3)]).toEqual([gbp('11598.60'), gbp('9383.49'), gbp('8281.65')]);
    expect(ukt(1, '2026-05-04')).toEqual(gbp('11598.60'));
    expect(() => ukt(1, '2026-05-03')).toThrow('no minimum under uk-theatre-wggb is known before 2026-05-04');
    expect(PLAYS['itc-wggb']).toEqual([
      { over: 70, steps: [['2025-06-01', '10323.00'], ['2026-04-01', '10942.38'], ['2027-04-01', '11380.08']] },
      { over: 30, steps: [['2025-06-01', '6873.75'], ['2026-04-01', '7286.18'], ['2027-04-01', '7577.62']] },
      { over: 10, steps: [['2025-06-01', '3438.00'], ['2026-04-01', '3644.28'], ['2027-04-01', '3790.05']] },
      { over: 0, steps: [['2025-06-01', '1000.00'], ['2026-04-01', '1060.00'], ['2027-04-01', '1102.40']] },
    ]);
    const itc = (minutes: number | null, date = TODAY) => playMinimum('itc-wggb', { grade: null, minutes }, date);
    expect([71, 70, 31, 30, 11, 10, 1].map((m) => itc(m))).toEqual(['10942.38', '7286.18', '7286.18', '3644.28', '3644.28', '1060.00', '1060.00'].map(gbp));
    expect([itc(90, '2025-06-01'), itc(90, '2026-03-31'), itc(90, '2026-04-01'), itc(90, '2027-04-01')]).toEqual(['10323.00', '10323.00', '10942.38', '11380.08'].map(gbp));
    expect([itc(50, '2025-06-01'), itc(20, '2027-04-01'), itc(5, '2025-06-01')]).toEqual(['6873.75', '3790.05', '1000.00'].map(gbp));
    expect(() => itc(90, '2025-05-31')).toThrow('no minimum under itc-wggb is known before 2025-06-01');
    expect(() => itc(null)).toThrow('a play under itc-wggb names its running time');
    const l = shot(plan(develop({ agreement: 'uk-theatre-wggb' }), '300000', [3, 6]));
    expect(project(l).costs.filter((c) => c.role === 'writer').map((c) => [c.what, c.amount])).toEqual([['the script', gbp('9383.49')]]);
    expect(l.slices.tax.paid[0]).toMatchObject({ what: 'the script', work: 'author', country: 'GB', gross: 938_349 });
    const independent = shot(plan(develop({ ...COMMERCIAL, minutes: 90 }), '300000', [3, 6]));
    expect(project(independent).costs.filter((c) => c.role === 'writer').map((c) => c.amount)).toEqual([gbp('10942.38')]);
    expect(() => shot(plan(develop(COMMERCIAL), '300000', [3, 6]))).toThrow('a play under itc-wggb names its running time');
  });

  it("producing.develop: a play for a better-graded theatre pays its script more", () => {
    falsifyAny({ feature: 'producing.develop', claim: 'downstream', says: "the life's play at a grade 1 subsidised theatre is paid UK Theatre's £11,598.60, at grade 3 £8,281.65", base: 1, twin: 3, outcome: (grade: number) => project(shot(plan(develop({ grade, agreement: 'uk-theatre-wggb' }), '300000', [3, 6]))).costs.map((c) => c.amount) });
  });
});

describe('a UK play the life directs', () => {
  const stage = (over: Partial<Stage> = {}): Stage => ({ theatre: 'subsidised', grade: 1, seats: null, touring: false, ...over });
  // Four weeks of rehearsal: no week over four.
  const fee = (s: Stage, date = TODAY) => terms({ form: 'play', country: 'GB', stage: s, budget: 300_000, shoot: 20, minutes: null, prep: 10 }, { films: [] }, daysFromCivil(...(date.split('-').map(Number) as [number, number, number])) * SECONDS_PER_DAY).fee;

  it("is paid its theatre's directors' minimum: UK Theatre's with Equity by the grade, SOLT's in the West End by the seats", () => {
    const years = (amounts: string[]) => ['2023-07-03', '2024-04-01', '2025-03-31', '2026-04-06'].map((d, i) => [d, amounts[i]]);
    expect(STAGE_FEES).toEqual({
      subsidised: { 1: years(['4089.48', '4293.95', '4465.71', '4644.34']), 2: years(['3572.20', '3750.81', '3900.84', '4056.88']), 3: years(['3367.62', '3536.00', '3677.44', '3824.54']) },
      'west-end': [
        { seats: 0, steps: years(['5018.00', '5269.00', '5533.00', '5809.00']) },
        { seats: 800, steps: years(['5520.00', '5796.00', '6086.00', '6390.00']) },
        { seats: 1100, steps: years(['6347.00', '6664.00', '6998.00', '7347.00']) },
      ],
    });
    expect([1, 2, 3].map((grade) => fee(stage({ grade: grade as 1 | 2 | 3 })))).toEqual(['4644.34', '4056.88', '3824.54'].map(gbp));
    expect([fee(stage(), '2026-04-05'), fee(stage(), '2024-04-01'), fee(stage(), '2023-07-03'), fee(stage({ grade: 2 }), '2024-03-31'), fee(stage({ grade: 3 }), '2025-03-31')]).toEqual(['4465.71', '4293.95', '4089.48', '3572.20', '3677.44'].map(gbp));
    const we = (seats: number, date = TODAY) => fee(stage({ theatre: 'west-end', grade: null, seats }), date);
    expect([we(1), we(799), we(800), we(1099), we(1100), we(2000)]).toEqual(['5809', '5809', '6390', '6390', '7347', '7347'].map(gbp));
    expect([we(500, '2023-07-03'), we(900, '2024-04-01'), we(1200, '2025-03-31')]).toEqual(['5018', '5796', '6998'].map(gbp));
    expect(() => fee(stage(), '2023-07-02')).toThrow('no minimum is known before 2023-07-03');
    const job = { form: 'play' as const, country: 'GB', stage: stage(), budget: 300_000, shoot: 20, minutes: null };
    expect(terms({ ...job, prep: 10 }, { films: [] }, T0)).toEqual({ country: 'GB', agreement: 'uk-theatre-equity', budget: null, minutes: null, prepDays: 10, shootDays: 20, cutDays: 0, fee: gbp('4644.34') });
    // A rehearsal is planned in whole weeks of five days.
    for (const shoot of [7, 0]) expect(() => terms({ ...job, shoot, prep: 10 }, { films: [] }, T0)).toThrow(`a play's weeks of rehearsal is a whole number of at least 1 (${shoot / 5})`);
    expect(terms({ ...job, stage: stage({ theatre: 'west-end', grade: null, seats: 900 }), prep: 5 }, { films: [] }, T0).agreement).toBe('solt-equity');
    expect(() => terms(job, { films: [] }, T0)).toThrow('the prep days is a whole number of at least 1 (undefined)');
    expect(() => terms({ ...job, prep: 10, cut: 3 }, { films: [] }, T0)).toThrow("a play isn't cut");
    expect(() => terms({ ...job, prep: 10, agreement: 'x' }, { films: [] }, T0)).toThrow("a play's theatre sets its directors' agreement");
  });

  it("is paid UK Theatre's 20% of the fee for each rehearsal week over four at a subsidised theatre, and SOLT's fee alone in the West End", () => {
    expect(OVER_FOUR).toEqual({ weeks: 4, share: '0.2' });
    // 20% of £4,644.34 is £928.868, a week's £928.87.
    expect([0, 1, 4, 5, 6, 10].map((weeks) => subsidisedFee(gbp('4644.34'), weeks))).toEqual(['4644.34', '4644.34', '4644.34', '5573.21', '6502.08', '10217.56'].map(gbp));
    const at = (s: Stage, weeks: number) => terms({ form: 'play', country: 'GB', stage: s, budget: 300_000, shoot: weeks * 5, minutes: null, prep: 10 }, { films: [] }, T0).fee;
    expect([4, 5, 6].map((weeks) => at(stage({ grade: 3 }), weeks))).toEqual(['3824.54', '4589.45', '5354.36'].map(gbp));
    const westEnd = stage({ theatre: 'west-end', grade: null, seats: 900 });
    expect([1, 4, 6, 10].map((weeks) => at(westEnd, weeks))).toEqual(['6390', '6390', '6390', '6390'].map(gbp));
  });

  it("is directed over the plan's rehearsal weeks alone: the run doesn't move the fee or the days", () => {
    const directed = (weeks: readonly [number, number], theatre: Record<string, unknown> = {}) => filmOf(dispatch(funded(plan(opt('stage', theatre, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', weeks)), prepFilm, { project: 1, prep: 10, account: ACCOUNT }).slices.directing, 1);
    expect([directed([6, 4]), directed([6, 12])].map((f) => [f.shootDays, f.fee])).toEqual([[30, gbp('5679.64')], [30, gbp('5679.64')]]);
    expect([directed([3, 4], ITC_COMPANY), directed([3, 12], ITC_COMPANY)].map((f) => [f.shootDays, f.fee])).toEqual([[15, gbp('3719.75')], [15, gbp('3719.75')]]);
    // The job reads the rehearsal's days, not the producer's schedule of rehearsal and run.
    const p = project(funded(plan(opt('stage'), '300000', [2, 9])));
    expect(jobOf(p as Project & { plan: NonNullable<Project['plan']> }, { prep: 10 }).job.shoot).toBe(10);
  });

  it('producing.plan: more rehearsal weeks pay the director more', () => {
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a play the life directs at a grade 2 subsidised theatre with four weeks of rehearsal pays UK Theatre's £4,056.88; with six, £1,622.76 more, 20% of the fee for each week over four", base: 4, twin: 6, outcome: (weeks: number) => filmOf(dispatch(funded(plan(opt('stage', {}, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', [weeks, 6])), prepFilm, { project: 1, prep: 10, account: ACCOUNT }).slices.directing, 1).fee });
  });

  it("is prepped, then staged in its plan's rehearsal weeks with no cut, its direction what the staging brought", () => {
    const l = dispatch(funded(plan(opt('stage', {}, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', [2, 4])), prepFilm, { project: 1, prep: 10, account: ACCOUNT });
    const scheduled = 10;
    expect(filmOf(l.slices.directing, 1)).toMatchObject({ form: 'play', episodes: 1, country: 'GB', agreement: 'uk-theatre-equity', prepDays: 10, shootDays: scheduled, cutDays: 0, fee: gbp('4056.88') });
    expect(project(l).costs.map((c) => c.what)).toEqual(['prep']);
    const staged = dispatch(l, shootFilm, { film: 1, account: ACCOUNT });
    const film = filmOf(staged.slices.directing, 1);
    const shotParts = film.shot as Record<(typeof PLANNED)[number], number>;
    expect(film.quality).toBeCloseTo(PLANNED.reduce((t, p) => t + shotParts[p], 0) / PLANNED.length, 12);
    expect(film.cut).toBeNull();
    expect(film.needed).toBeCloseTo(shootNeeded(componentValues(l.slices.attributes, 'director'), { form: 'play', shootDays: scheduled }), 12);
    // The whole fee is paid by the staging: nothing is left for a cut.
    expect(project(staged).costs.filter((c) => c.role === 'director').reduce((t, c) => t + c.amount.minor, 0)).toBe(405_688);
    expect(() => dispatch(staged, cutFilm, { film: 1, account: ACCOUNT })).toThrow('film 1 is a play, which isn\'t cut');
    expect(() => dispatch(staged, submitFilm, { film: 1, festival: 'cannes' })).toThrow('film 1 is a play');
    const released = dispatch(dispatch(staged, shootProject, { project: 1, account: ACCOUNT }), releaseFilm, { project: 1 });
    expect(project(released).release?.quality).toBeCloseTo((HIRED + (project(released).shot?.quality as number) + (film.quality as number) + HIRED) / 4, 12);
  });

  it("producing.option: a play at a better-graded theatre pays its director more", () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "a play the life directs at a grade 1 subsidised theatre pays UK Theatre's £4,644.34, at grade 3 £3,824.54", base: 1, twin: 3, outcome: (grade: number) => {
      const l = dispatch(funded(plan(opt('stage', { grade }, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', [2, 4])), prepFilm, { project: 1, prep: 10, account: ACCOUNT });
      return filmOf(l.slices.directing, 1).fee;
    } });
  });
});


describe("an ITC company's play the life directs", () => {
  const job = (minutes: number | null, shoot = 30) => ({ form: 'play' as const, country: 'GB', stage: { theatre: 'itc' as const, grade: null, seats: null, touring: true }, budget: 300_000, shoot, minutes, prep: 10 });
  const at = (date: string) => daysFromCivil(...(date.split('-').map(Number) as [number, number, number])) * SECONDS_PER_DAY;

  it("is paid the ITC's preparatory fee by its running time and its weekly rehearsal payment for each rehearsal week", () => {
    expect(ITC_DIRECTOR).toEqual({ from: '2025-04-01', full: '1916.75', short: '1326.25', weekly: '601.00', over: 70 });
    // Six weeks of rehearsal: £3,606 with the preparatory fee.
    expect(itcFee(90, 6, TODAY)).toEqual(gbp('5522.75'));
    expect(itcFee(71, 6, TODAY)).toEqual(gbp('5522.75'));
    expect(itcFee(70, 6, TODAY)).toEqual(gbp('4932.25'));
    expect(itcFee(90, 1, TODAY)).toEqual(gbp('2517.75'));
    expect(itcFee(90, 6, '2025-04-01')).toEqual(gbp('5522.75'));
    expect(() => itcFee(90, 6, '2025-03-31')).toThrow('no minimum is known before 2025-04-01');
    expect(() => itcFee(null, 6, TODAY)).toThrow("a play under the ITC's directors' agreement names its running time");
    expect(terms(job(90), { films: [] }, T0)).toEqual({ country: 'GB', agreement: 'itc-equity', budget: null, minutes: 90, prepDays: 10, shootDays: 30, cutDays: 0, fee: gbp('5522.75') });
    expect(terms(job(60), { films: [] }, at('2026-04-01')).fee).toEqual(gbp('4932.25'));
  });

  it('producing.option: a longer ITC play pays its director the full-length preparatory fee', () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "a 90-minute ITC play the life directs pays the ITC's full-length £1,916.75 preparatory fee; a 60-minute one the short play's £1,326.25", base: 90, twin: 60, outcome: (minutes: number) => {
      const l = dispatch(funded(plan(opt('stage', { ...ITC_COMPANY, minutes }, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', [2, 4])), prepFilm, { project: 1, prep: 10, account: ACCOUNT });
      return filmOf(l.slices.directing, 1).fee;
    } });
  });

  it("producing.plan: more rehearsal weeks pay the ITC's director more weekly payments", () => {
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a 90-minute ITC play the life directs with two weeks of rehearsal pays £1,916.75 and two weekly payments of £601; with three, a third", base: 2, twin: 3, outcome: (weeks: number) => filmOf(dispatch(funded(plan(opt('stage', ITC_COMPANY, ['producer', 'director'], life({ producer: 60, director: 60 })), '300000', [weeks, 4])), prepFilm, { project: 1, prep: 10, account: ACCOUNT }).slices.directing, 1).fee });
  });
});

describe('a UK play the life acts in', () => {
  // A UK play's part names neither its weeks of performance nor of rehearsal: its plan's are four and two.
  const ARGS = { project: 1, agreement: 'uk-theatre', term: 'week', lines: 40, asks: [], gender: 'open', ages: [0, 120] };
  const cast = (seats: number, extra: Record<string, unknown> = {}, weeks: readonly [number, number] = [2, 4]) => dispatch(plan(opt('stage', { ...COMMERCIAL, seats }, ['producer', 'actor'], life({ producer: 60, actor: 60 })), '300000', weeks), castPart, { ...ARGS, ...extra });
  /** A part played in a play at a theatre, under the agreement named (the theatre's own where none is), on a day. */
  const played = (theatre: Record<string, unknown>, agreement: string, date = T0) => {
    const l = dispatch(funded(plan(opt('stage', theatre, ['producer', 'actor'], life({ producer: 60, actor: 60 }, identity(), SEED, date)), '300000', [2, 4])), castPart, { ...ARGS, agreement });
    return castOf(dispatch(l, playPart, { part: 1, account: ACCOUNT }).slices.acting, 1);
  };
  it("is engaged under UK Theatre's commercial agreement at its theatre's seats, which the part doesn't name", () => {
    expect(castOf(cast(600).slices.acting, 1).part.seats).toBe(600);
    expect(() => cast(600, { seats: 200 })).toThrow("a UK play's seats are its theatre's");
  });

  it("is engaged for its plan's weeks: the rehearsal at the rehearsal rate, the run at the week's minimum", () => {
    expect(castOf(cast(600, {}, [3, 7]).slices.acting, 1).part).toMatchObject({ term: 'week', length: 7, rehearsal: 3 });
    for (const named of [{ length: 4 }, { rehearsal: 2 }]) expect(() => cast(600, named)).toThrow("a UK play's weeks of rehearsal and performance are its plan's");
    // At 600 seats, tier B's: £545.58 a rehearsal week, £569.14 a week of performance.
    const paid = (weeks: readonly [number, number]) => castOf(dispatch(funded(cast(600, {}, weeks)), playPart, { part: 1, account: ACCOUNT }).slices.acting, 1).work?.pay;
    expect([paid([2, 4]), paid([3, 4]), paid([2, 5])]).toEqual(['3367.72', '3913.30', '3936.86'].map(gbp));
    // What a part engages a minor's or a foreigner's days for: the plan's weeks, five days each.
    expect(daysWorked(castOf(cast(600, {}, [3, 7]).slices.acting, 1).part)).toBe(50);
    // A part is cast in a play once it is planned.
    expect(() => dispatch(opt('stage', COMMERCIAL, ['producer', 'actor'], life({ producer: 60, actor: 60 })), castPart, ARGS)).toThrow('project 1 has no budget');
    // A play abroad engages its part in its agreement's own units, as the part names them.
    const french = identity({ citizenship: ['FR'], languages: [{ lang: 'fr', level: 'C2' }] });
    const abroad = dispatch(plan(opt('stage', { theatre: undefined, grade: undefined, touring: undefined, market: 'FR' }, ['producer', 'actor'], life({ producer: 60, actor: 60 }, french)), '300000', [2, 4]), castPart, { ...ARGS, agreement: 'fr-private-stage', term: 'performance', length: 10, rehearsal: 0 });
    expect(castOf(abroad.slices.acting, 1).part).toMatchObject({ term: 'performance', length: 10, rehearsal: 0 });
  });

  it('producing.plan: more rehearsal weeks pay the actor more', () => {
    falsifyAny({ feature: 'producing.plan', claim: 'downstream', says: "a part in the life's play at a 600-seat commercial theatre pays UK Theatre's £545.58 for each of its plan's rehearsal weeks, two or three, beside its four weeks of performance", base: 2, twin: 3, outcome: (weeks: number) => castOf(dispatch(funded(cast(600, {}, [weeks, 4])), playPart, { part: 1, account: ACCOUNT }).slices.acting, 1).work?.pay });
  });

  it("is engaged under its theatre's agreement: UK Theatre's subsidised, SOLT's in the West End, the ITC's for an ITC company", () => {
    expect(THEATRE_AGREEMENT).toEqual({ subsidised: 'uk-theatre-subsidised', commercial: 'uk-theatre', 'west-end': 'solt-equity', itc: 'itc-equity' });
    expect(() => cast(600, { agreement: 'solt-equity' })).toThrow("a part in a UK play is engaged under its theatre's agreement, uk-theatre");
    expect(() => played(SUBSIDISED, 'uk-theatre')).toThrow("a part in a UK play is engaged under its theatre's agreement, uk-theatre-subsidised");
    // Four weeks played and two rehearsed, each at the week's minimum.
    expect(played(SUBSIDISED, 'uk-theatre-subsidised').work?.pay).toEqual(gbp('3283.74'));
    expect(UK_SUBSIDISED).toEqual({ currency: 'GBP', week: [['2023-04-03', '482.00'], ['2024-04-01', '526.24'], ['2025-03-31', '547.29']], rehearsal: [['2023-04-03', '482.00'], ['2024-04-01', '526.24'], ['2025-03-31', '547.29']] });
    expect(SOLT.map((t) => [t.seats, t.week, t.rehearsal === t.week])).toEqual([
      [0, [['2026-04-06', '790.30'], ['2027-04-05', '829.82']], true],
      [800, [['2026-04-06', '878.32'], ['2027-04-05', '922.24']], true],
      [1100, [['2026-04-06', '965.55'], ['2027-04-05', '1013.83']], true],
    ]);
    expect([799, 800, 1099, 1100].map((seats) => played({ ...WEST_END, seats }, 'solt-equity').work?.pay)).toEqual(['4741.80', '5269.92', '5269.92', '5793.30'].map(gbp));
    expect(ITC).toEqual({ currency: 'GBP', week: [['2025-04-01', '601.00'], ['2026-04-01', '631.00']], rehearsal: [['2025-04-01', '601.00'], ['2026-04-01', '631.00']] });
    expect(played(ITC_COMPANY, 'itc-equity').work?.pay).toEqual(gbp('3786.00'));
    // Each year's from its first day, the subsidised agreement's last kept past its term; none before the first.
    const on = (agreement: Agreement, date: string, seats = 0) => pay({ agreement, budget: 300_000, seats, lines: 40, term: 'week', length: 1, rehearsal: 0, asks: [] }, date);
    expect([on('uk-theatre-subsidised', '2024-03-31'), on('uk-theatre-subsidised', '2024-04-01'), on('uk-theatre-subsidised', '2025-03-30'), on('uk-theatre-subsidised', '2025-03-31'), on('uk-theatre-subsidised', '2026-11-01')]).toEqual(['482.00', '526.24', '526.24', '547.29', '547.29'].map(gbp));
    expect(() => on('uk-theatre-subsidised', '2023-04-02')).toThrow('no minimum is known before 2023-04-03');
    expect([on('solt-equity', '2027-04-04', 1100), on('solt-equity', '2027-04-05', 1100)]).toEqual(['965.55', '1013.83'].map(gbp));
    expect(() => on('solt-equity', '2026-04-05')).toThrow('no minimum is known before 2026-04-06');
    expect([on('itc-equity', '2026-03-31'), on('itc-equity', '2026-04-01')]).toEqual(['601.00', '631.00'].map(gbp));
    expect(() => on('itc-equity', '2025-03-31')).toThrow('no minimum is known before 2025-04-01');
  });

  it("producing.option: a part in the West End pays more than one at a subsidised theatre", () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "six weeks of a part in the life's play pay SOLT's £790.30 a week at a small West End theatre, UK Theatre's subsidised £547.29 at a subsidised one", base: 'subsidised', twin: 'west-end', outcome: (theatre: string) => (theatre === 'subsidised' ? played(SUBSIDISED, 'uk-theatre-subsidised') : played({ ...WEST_END, seats: 500 }, 'solt-equity')).work?.pay });
  });

  it('acts in and directs one play: the part and the direction each paid from its budget', () => {
    const l = dispatch(funded(plan(opt('stage', ITC_COMPANY, ['producer', 'actor', 'director'], life({ producer: 60, actor: 60, director: 60 })), '300000', [2, 4])), prepFilm, { project: 1, prep: 10, account: ACCOUNT });
    const cast = dispatch(dispatch(l, castPart, { ...ARGS, agreement: 'itc-equity' }), playPart, { part: 1, account: ACCOUNT });
    expect(castOf(cast.slices.acting, 1).part).toMatchObject({ length: 4, rehearsal: 2 });
    expect(filmOf(cast.slices.directing, 1).shootDays).toBe(10);
    expect(project(cast).costs.map((c) => c.role)).toEqual(['director', 'actor']);
  });

  it('producing.option: a bigger commercial theatre pays the part more', () => {
    falsifyAny({ feature: 'producing.option', claim: 'downstream', says: "a part in the life's play at a commercial theatre of 1,500 seats is paid UK Theatre's tier A* weeks; at 200 seats tier C's", base: 200, twin: 1500, outcome: (seats: number) => {
      const l = dispatch(funded(cast(seats)), playPart, { part: 1, account: ACCOUNT });
      return castOf(l.slices.acting, 1).work?.pay;
    } });
  });
});
