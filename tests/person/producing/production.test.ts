import { describe, expect, it } from 'vitest';
import { begin, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { fromMajor, money } from '../../../src/core/money/money.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { daysFromCivil, SECONDS_PER_DAY } from '../../../src/core/time/calendar.ts';
import { addMonths } from '../../../src/core/time/dates.ts';
import { ACTING_START, type ActingSlice } from '../../../src/person/acting/acting.ts';
import { ATTRIBUTES_START, chooseAttributes, componentValues, skillOf, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import { DIRECTING_START, pitchSkill as directorsPitch, type DirectingSlice, type Film } from '../../../src/person/directing/directing.ts';
import type { GenresSlice } from '../../../src/person/genres/genres.ts';
import type { IdentitySlice } from '../../../src/person/identity/identity.ts';
import type { PermitsSlice } from '../../../src/person/permits/permits.ts';
import {
  developScript,
  directedAs,
  doors,
  eye,
  factor,
  FORMATS,
  HIRED,
  holds,
  left,
  MEDIUM,
  MODEL,
  optionMaterial,
  OPTION_MONTHS,
  packagePitch,
  payOut,
  pitchSkill,
  planProject,
  producerValues,
  PRODUCING_START,
  projectOf,
  qualityOf,
  raiseMoney,
  releaseFilm,
  renewOption,
  ROLES,
  shootProject,
  target,
  raised,
  record,
  WORK_OF,
  WRITTEN_FOR,
  zoneOf,
  type Project,
  type ProducingSlice,
} from '../../../src/person/producing/producing.ts';
import { CAREER_START, FEES, pitchOf, quality, summariseScript, meetPeople, type CareerSlice } from '../../../src/person/work/career.ts';
import { readScript, SCRIPTS_START, writeScript, type ScriptsSlice } from '../../../src/person/work/work.ts';
import { YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { permitsEverywhere } from '../../support/permits.ts';
import { identity } from '../../support/person.ts';
import { production } from '../../support/production.ts';
import { ACCOUNT, minorIn, purse } from '../../support/purse.ts';

type Lives = { attributes: AttributesSlice; producing: ProducingSlice; genres: GenresSlice; identity: IdentitySlice; acting: ActingSlice; directing: DirectingSlice; permits: PermitsSlice; youth: YouthSlice; scripts: ScriptsSlice; career: CareerSlice } & ReturnType<typeof purse>;
const SEED = '0123456789abcdef';
const T0 = daysFromCivil(2026, 11, 1) * SECONDS_PER_DAY;
const dr = (...keys: (string | number)[]) => draws(seedFromText(SEED), 'producing.work', ...keys);
const usd = (n: string) => fromMajor('USD', n);

/** A life with the roles' attributes chosen as given (none where a role's isn't), an American born in 2000. */
const life = (levels: Partial<Record<'producer' | 'screenwriter', number>> = {}, who: IdentitySlice = identity(), currency = 'USD', seed = SEED): Life<Lives> => {
  let l: Life<Lives> = begin(seed, T0, { attributes: structuredClone(ATTRIBUTES_START), producing: structuredClone(PRODUCING_START), genres: { loved: ['drama'] }, identity: who, acting: structuredClone(ACTING_START), directing: structuredClone(DIRECTING_START), permits: permitsEverywhere(), youth: structuredClone(YOUTH_START), scripts: structuredClone(SCRIPTS_START), career: structuredClone(CAREER_START), ...purse(currency) });
  for (const [role, all] of Object.entries(levels)) l = dispatch(l, chooseAttributes, { role, all, each: {} });
  return l;
};
/** A life that wrote a feature, at a level, and so holds a script. */
const writer = (level = 70, form = 'feature', producer: number | null = null, who = identity(), seed = SEED) => dispatch(life(producer === null ? { screenwriter: level } : { screenwriter: level, producer }, who, 'USD', seed), writeScript, { form, genre: 'drama', days: 120 });
const project = (l: Life<Lives>, id = 1) => projectOf(l.slices.producing, id);
const withProject = (l: Life<Lives>, p: Project): Life<Lives> => ({ ...l, slices: { ...l.slices, producing: { projects: [...l.slices.producing.projects, p] } } });
const edit = (l: Life<Lives>, f: (p: Project) => void, id = 1): Life<Lives> => {
  const producing = structuredClone(l.slices.producing);
  f(projectOf(producing, id));
  return { ...l, slices: { ...l.slices, producing } };
};
const funded = (l: Life<Lives>, id = 1) =>
  edit(l, (p) => {
    p.raised['equity'] = money(p.plan?.budget.currency ?? 'USD', target(p) - raised(p));
  }, id);
const DEVELOP = { script: 1, format: 'film', roles: ['writer', 'producer'] };

describe('a production', () => {
  it('is a film, a series or a play, its roles the life holds among the four, its medium and form as each role reads it', () => {
    expect(FORMATS).toEqual(['film', 'series', 'stage']);
    expect(ROLES).toEqual(['writer', 'producer', 'director', 'actor']);
    expect(MEDIUM).toEqual({ film: 'film', series: 'television', stage: 'stage' });
    expect(WORK_OF).toEqual({ writer: 'author', producer: 'producer', director: 'director', actor: 'performer' });
    expect(WRITTEN_FOR).toEqual({ film: ['feature', 'short'], series: ['pilot', 'episode'], stage: ['play'] });
    expect(HIRED).toBe(50);
    expect([directedAs({ format: 'film', series: null }), directedAs({ format: 'series', series: { form: 'half-hour', episodes: 4 } }), directedAs({ format: 'stage', series: null })]).toEqual(['feature', 'half-hour', 'play']);
    expect([holds({ roles: ['actor'] }, 'actor'), holds({ roles: ['actor'] }, 'writer')]).toEqual([true, false]);
  });

  it("is made in the country it names, the life's home where it names none", () => {
    const opt = (over: Record<string, unknown> = {}, who = identity()) => project(dispatch(life({ producer: 60 }, who), optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 2, genre: 'drama', ...over }));
    expect(opt().market).toBe('US');
    expect(opt({}, identity({ citizenship: ['GB', 'US'] })).market).toBe('GB');
    expect(opt({ market: 'FR' }).market).toBe('FR');
    expect(project(dispatch(life({ producer: 60 }), optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 2, genre: 'drama', market: 'JP' })).expires).toBe(addMonths(zoneOf('JP'), T0, OPTION_MONTHS));
    expect(() => opt({ market: 'XX' })).toThrow("XX isn't a market a producer works in");
    expect(() => opt({}, identity({ citizenship: ['BV'] }))).toThrow("where the work in BV is made isn't known to this game");
    expect(() => dispatch(life({ producer: 60 }, { person: null }), optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 2, genre: 'drama' })).toThrow('the person is not made yet');
  });

  it('is refused for a format or role there is not, no role or one twice, a series without its episodes, a stage play the life directs', () => {
    const go = (over: Record<string, unknown>) => () => dispatch(life({ producer: 60 }), optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama', market: 'US', ...over });
    expect(go({ format: 'novel' })).toThrow("there's no format novel");
    expect(go({ roles: [] })).toThrow('the life holds at least one role on a production');
    expect(go({ roles: 'producer' })).toThrow('the life holds at least one role on a production');
    expect(go({ roles: ['producer', 'grip'] })).toThrow("there's no role grip");
    expect(go({ roles: ['producer', 'producer'] })).toThrow('a role is held once');
    expect(go({ roles: ['producer', 'writer'] })).toThrow("optioned material is someone else's writing, so the life doesn't hold the writer's role");
    expect(go({ format: 'stage', roles: ['director'] })).toThrow("a stage director's terms in United States aren't known to this game, so a play there is directed by someone hired");
    expect(go({ format: 'series' })).toThrow("a series' episodes are an hour or a half-hour (undefined)");
    expect(go({ format: 'series', episode: 'minute', episodes: 3 })).toThrow("a series' episodes are an hour or a half-hour (minute)");
    expect(go({ format: 'series', episode: 'hour' })).toThrow('the episodes is a whole number of at least 1 (undefined)');
    expect(go({ format: 'series', episode: 'hour', episodes: 0 })).toThrow('the episodes is a whole number of at least 1 (0)');
    expect(go({ episode: 'hour' })).toThrow('a film has no episodes');
    expect(go({ format: 'stage', episodes: 2 })).toThrow('a stage has no episodes');
    expect(go({ minutes: 0 })).toThrow('the running time is a whole number of at least 1 (0)');
    expect(project(go({ format: 'series', episode: 'half-hour', episodes: 6, minutes: 22, roles: ['actor', 'producer'] })())).toMatchObject({ format: 'series', series: { form: 'half-hour', episodes: 6 }, minutes: 22, roles: ['actor', 'producer'], script: null, writing: null, costs: [] });
    expect(project(go({ format: 'stage', roles: ['actor'] })())).toMatchObject({ format: 'stage', series: null, minutes: null, stage: null, roles: ['actor'] });
    expect(project(go({ roles: ['director'] })()).roles).toEqual(['director']);
  });

  it("is produced by people hired at the game's standard where the life doesn't produce it: their eye, their plan, and the life's attributes left as they are", () => {
    const l = dispatch(life({ screenwriter: 40 }), optionMaterial, { format: 'film', roles: ['actor'], account: ACCOUNT, days: 6, genre: 'drama' });
    const hired = producerValues(l.slices, { roles: ['actor'] });
    expect(Object.values(hired).every((x) => x === HIRED)).toBe(true);
    const off = MODEL.misjudged * (1 - eye(hired) / 100);
    const d = dr('option', 1, T0);
    let best = { worth: 0, judged: -Infinity };
    for (let i = 0; i < 6; i += 1) {
      const worth = 100 * d.float();
      const judged = worth + 2 * off * d.float();
      if (judged > best.judged) best = { worth, judged };
    }
    expect(project(l).material).toBe(best.worth);
    expect(l.slices.attributes['producer']).toBeUndefined();
    const planned = dispatch(l, planProject, { project: 1, budget: '1000000' });
    expect(planned.slices.attributes).toEqual(l.slices.attributes);
    expect(producerValues(life({ producer: 80 }).slices, { roles: ['producer'] })).toEqual(componentValues(life({ producer: 80 }).slices.attributes, 'producer'));
  });
});

describe("the life's own script", () => {
  it('is developed into a production: its material the script as graded, the rights the life\'s, its genre the script\'s, its agreement the market\'s', () => {
    const l = dispatch(writer(70, 'feature', 60), readScript, { script: 1, reader: 'black-list' });
    const p = project(dispatch(l, developScript, DEVELOP));
    const script = l.slices.scripts.written[0] as NonNullable<ScriptsSlice['written'][number]>;
    expect(p).toEqual({ id: 1, optioned: T0, format: 'film', series: null, minutes: null, stage: null, nation: null, roles: ['writer', 'producer'], script: 1, writing: 'wga', genre: 'drama', market: 'US', expires: null, options: [], material: quality(script), plan: null, applied: false, raised: {}, shot: null, costs: [], release: null });
    expect(p.material).toBe((script.reads.at(-1)?.overall as number) * 10);
    // No option is paid for the life's own script, and none can be renewed.
    expect(minorIn(dispatch(l, developScript, DEVELOP).slices.ledger, ACCOUNT)).toBe(100_000_000);
    expect(() => dispatch(dispatch(l, developScript, DEVELOP), renewOption, { project: 1, account: ACCOUNT })).toThrow("project 1's material is the life's own, under no option");
  });

  it("is refused where the life isn't its writer, it's in a production already, there's no such script, or its form isn't the format's", () => {
    const l = writer(70, 'feature', 60);
    expect(() => dispatch(l, developScript, { ...DEVELOP, roles: ['producer'] })).toThrow("the life's own script makes the life the production's writer");
    expect(() => dispatch(dispatch(l, developScript, DEVELOP), developScript, DEVELOP)).toThrow('script 1 is in a production already');
    // Another production, of optioned material or of another script, leaves this one free.
    const two = dispatch(dispatch(dispatch(l, optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama' }), writeScript, { form: 'feature', genre: 'drama', days: 30 }), developScript, { ...DEVELOP, script: 2 });
    expect(project(dispatch(two, developScript, DEVELOP), 3).script).toBe(1);
    expect(() => dispatch(l, developScript, { ...DEVELOP, market: 'BV' })).toThrow("where the work in BV is made isn't known to this game");
    expect(() => dispatch(l, developScript, { ...DEVELOP, script: 2 })).toThrow("there's no script 2");
    expect(() => dispatch(l, developScript, { ...DEVELOP, format: 'stage', theatre: 'subsidised', grade: 1, touring: false, market: 'GB', nation: 'GB.ENG' })).toThrow('a play is made from a play, not a feature');
    expect(() => dispatch(l, developScript, { ...DEVELOP, format: 'series', episode: 'hour', episodes: 2 })).toThrow('a series is made from a pilot or episode, not a feature');
    expect(() => dispatch(writer(70, 'pilot', 60), developScript, DEVELOP)).toThrow('a film is made from a feature or short, not a pilot');
    expect(project(dispatch(writer(70, 'short', 60), developScript, DEVELOP)).writing).toBe('wga');
    expect(project(dispatch(writer(70, 'episode', 60), developScript, { ...DEVELOP, format: 'series', episode: 'hour', episodes: 8 })).series).toEqual({ form: 'hour', episodes: 8 });
  });

  it("is paid under the market's writers' agreement for its form, named where it has several, refused where its figures aren't known or the writer doesn't write its language", () => {
    const at = (market: string, form = 'feature', agreement?: string, who = identity()) => project(dispatch(writer(70, form, 60, who), developScript, { ...DEVELOP, market, ...(agreement === undefined ? {} : { agreement }), ...(form === 'feature' ? {} : { format: 'series', episode: 'hour', episodes: 1, ...(market === 'GB' ? { nation: 'GB.ENG' } : {}) }) })).writing;
    expect(at('US')).toBe('wga');
    expect(at('PR')).toBe('wga');
    expect(at('GB')).toBe('gb-pact-film');
    expect(() => at('GB', 'episode')).toThrow('a episode made in GB names its writers\' agreement: gb-bbc, gb-itv, gb-pact-tv');
    expect(at('GB', 'episode', 'gb-bbc')).toBe('gb-bbc');
    expect(() => at('GB', 'feature', 'gb-bbc')).toThrow("a feature made in GB isn't paid under gb-bbc");
    expect(() => at('US', 'feature', 'gb-pact-film')).toThrow("a feature made in US isn't paid under gb-pact-film");
    // A territory paid on France's terms, in French.
    const french = identity({ languages: [{ lang: 'fr', level: 'C1' }] });
    expect(at('BL', 'feature', undefined, french)).toBe('fr-film');
    expect(() => at('FR')).toThrow("a script under fr-film is written in fr, which the writer doesn't write well enough");
    expect(() => at('FR', 'feature', undefined, identity({ languages: [{ lang: 'fr', level: 'B2' }] }))).toThrow("a script under fr-film is written in fr, which the writer doesn't write well enough");
    // A Swiss film is written in any of three languages; the writer needs one.
    expect(at('CH', 'feature', undefined, french)).toBe('ch-film');
    expect(() => at('CH')).toThrow("a script under ch-film is written in de or fr or it, which the writer doesn't write well enough");
    // Nothing the research knows sets its pay: none; what it couldn't find, refused and told.
    expect(at('TH')).toBeNull();
    expect(() => at('AU')).toThrow("Some of what a screenwriter is paid or asked in Australia isn't known to this game yet");
  });

  it('producing.develop: a better script makes better material, which financiers take better', () => {
    const material = (level: number) => {
      const l = dispatch(dispatch(writer(level, 'feature', 60), developScript, DEVELOP), planProject, { project: 1, budget: '1000000' });
      return factor(l.slices.producing, 50, project(l), T0);
    };
    falsifyAny({ feature: 'producing.develop', claim: 'bites', says: 'a production of a script written at 90 is taken better by financiers than one written at 20', base: 20, twin: 90, outcome: material });
  });
});

describe("financing the life's own script", () => {
  const developed = (writing = 70, producing = 60, seed = SEED) => dispatch(dispatch(writer(writing, 'feature', producing, identity(), seed), developScript, DEVELOP), planProject, { project: 1, budget: '1000000' });

  it("goes out with the writer's pitch beside the producer's, the documents with it", () => {
    const l = dispatch(developed(), summariseScript, { script: 1, document: 'pitch-document', days: 5 });
    const v = componentValues(l.slices.attributes, 'producer');
    const w = componentValues(l.slices.attributes, 'screenwriter');
    expect(packagePitch(l.slices, v, project(l))).toBeCloseTo((pitchSkill(v) + pitchOf(w, l.slices.career.documents['1'] ?? {})) / 2, 12);
    const fresh = developed();
    expect(packagePitch(fresh.slices, v, project(fresh))).toBeCloseTo((pitchSkill(v) + pitchOf(componentValues(fresh.slices.attributes, 'screenwriter'), {})) / 2, 12);
    const optioned = dispatch(life({ producer: 60 }), optionMaterial, { format: 'film', roles: ['producer'], account: ACCOUNT, days: 1, genre: 'drama' });
    expect(packagePitch(optioned.slices, v, project(optioned))).toBe(pitchSkill(v));
  });

  it("goes out with the director's pitch beside the others where the life directs, and the director's Communication moves the financing", () => {
    /** A production of the life's script, the life directing it or not, its director's Communication at a level (the rest at 50). */
    const directing = (communication: number, roles = ['writer', 'producer', 'director']) => {
      const l = dispatch(writer(70, 'feature', 30), chooseAttributes, { role: 'director', all: 50, each: { communication } });
      return dispatch(dispatch(l, developScript, { ...DEVELOP, roles }), planProject, { project: 1, budget: '1000000' });
    };
    const l = directing(80);
    const [v, w, d] = (['producer', 'screenwriter', 'director'] as const).map((r) => componentValues(l.slices.attributes, r)) as [ReturnType<typeof componentValues>, ReturnType<typeof componentValues>, ReturnType<typeof componentValues>];
    expect(directorsPitch(d)).toBeCloseTo(0.5 * skillOf(d, 'director', 'pitching-and-presenting-the-project') + 0.25 * skillOf(d, 'director', 'speaking') + 0.25 * skillOf(d, 'director', 'persuasion'), 12);
    expect(packagePitch(l.slices, v, project(l))).toBeCloseTo((pitchSkill(v) + pitchOf(w, {}) + directorsPitch(d)) / 3, 12);
    const optioned = dispatch(dispatch(life({ producer: 60 }), chooseAttributes, { role: 'director', all: 90 }), optionMaterial, { format: 'film', roles: ['producer', 'director'], account: ACCOUNT, days: 1, genre: 'drama' });
    const ov = componentValues(optioned.slices.attributes, 'producer');
    expect(packagePitch(optioned.slices, ov, project(optioned))).toBeCloseTo((pitchSkill(ov) + directorsPitch(componentValues(optioned.slices.attributes, 'director'))) / 2, 12);
    // Not directing, the director's Communication pitches nothing: the package is the producer's and the writer's.
    const pitched = (c: number, roles?: string[]) => {
      const x = directing(c, roles);
      return factor(x.slices.producing, packagePitch(x.slices, componentValues(x.slices.attributes, 'producer'), project(x)), project(x), T0);
    };
    expect(pitched(10, ['writer', 'producer'])).toBe(pitched(95, ['writer', 'producer']));
    expect(pitched(95)).toBeGreaterThan(pitched(10));
    // Over twenty lives, the sources each closes in forty days of raising: a better-spoken director closes more.
    const closed = (c: number, roles?: string[]) =>
      Array.from({ length: 20 }, (_, i) => {
        const seed = (i + 1).toString(16).padStart(16, '0');
        const x = dispatch(dispatch(dispatch(writer(70, 'feature', 30, identity(), seed), chooseAttributes, { role: 'director', all: 50, each: { communication: c } }), developScript, { ...DEVELOP, roles: roles ?? ['writer', 'producer', 'director'] }), planProject, { project: 1, budget: '1000000' });
        return Object.keys(project(dispatch(x, raiseMoney, { project: 1, days: 40 })).raised).length;
      });
    expect(closed(10, ['writer', 'producer'])).toEqual(closed(95, ['writer', 'producer']));
    falsifyAny({ feature: 'attributes.choose', claim: 'downstream', says: "a director at 95 in Communication pitches the production the life directs to its financiers better than one at 10, and it closes more of its money", base: 10, twin: 95, outcome: closed });
  });

  it('script.summarise: a better pitch document helps the production raise its money', () => {
    const pitch = (days: number) => {
      const l = days === 0 ? developed() : dispatch(developed(), summariseScript, { script: 1, document: 'pitch-document', days });
      return packagePitch(l.slices, componentValues(l.slices.attributes, 'producer'), project(l));
    };
    falsifyAny({ feature: 'script.summarise', claim: 'downstream', says: "a pitch document written goes out with the writer's pitch to the production's financiers", base: 0, twin: 5, outcome: pitch });
  });

  it('opens a door to the market for each contact the life has made and a family in the business, up to ten', () => {
    const at = (contacts: number, family: 'outside' | 'acting' = 'outside') => doors({ identity: identity({ family }), career: { contacts, documents: {} } });
    expect([at(0), at(3), at(3, 'acting'), at(12)]).toEqual([0, 3, 4, 12]);
    expect([MODEL.door, MODEL.doors]).toEqual([0.05, 10]);
    const raisedIn = (contacts: number, family: 'outside' | 'acting' = 'outside') => {
      const base = developed(70, 30);
      const l = { ...base, slices: { ...base.slices, identity: identity({ family }), career: { contacts, documents: {} } } };
      const p = project(l);
      const chance = MODEL.daily * factor(l.slices.producing, packagePitch(l.slices, componentValues(l.slices.attributes, 'producer'), p), p, T0) * (1 + MODEL.door * Math.min(10, at(contacts, family)));
      const d = dr('raise', 1, T0);
      const days: number[] = [];
      for (let i = 0; i < 60; i += 1) if (d.float() < chance) days.push(i);
      return { closed: Object.keys(project(dispatch(l, raiseMoney, { project: 1, days: 60 })).raised), expected: days.length };
    };
    for (const [c, f] of [[0, 'outside'], [4, 'outside'], [9, 'acting'], [30, 'outside']] as const) {
      const { closed, expected } = raisedIn(c, f);
      expect(closed.length, `${c} ${f}`).toBe(Math.min(3, expected));
    }
  });

  it('network.meet: the contacts a writer makes open doors to the money', () => {
    // Over twenty lives, the days each takes to close its sources: the doors widen each day's chance, so the same draws close sooner.
    const closed = (days: number) =>
      Array.from({ length: 20 }, (_, i) => {
        const base = developed(70, 20, (i + 1).toString(16).padStart(16, '0'));
        const met = days === 0 ? base : dispatch(base, meetPeople, { days });
        return Object.keys(project(dispatch(met, raiseMoney, { project: 1, days: 40 })).raised).length;
      });
    falsifyAny({ feature: 'network.meet', claim: 'downstream', says: 'a writer who spent 200 days among the trade raises a production\'s money with more doors open', base: 0, twin: 200, outcome: closed });
  });

  it('identity.make: a family in the business opens a door to the market', () => {
    falsifyAny({ feature: 'identity.make', claim: 'bites', says: 'a family in the business is a door open to the market, one outside it is not', base: 'outside', twin: 'producing', outcome: (family: 'outside' | 'producing') => doors({ identity: identity({ family }), career: { contacts: 0, documents: {} } }) });
  });
});

describe("a production's record", () => {
  const film = (project: number, started: number, chosen: boolean): Film => ({ id: project, project, form: 'feature', episodes: 1, country: 'US', agreement: 'dga', budget: 1, minutes: null, started, prepDays: 1, shootDays: 1, cutDays: 1, fee: null, plan: { story: 0, performances: 0, images: 0 }, needed: null, shot: null, cut: null, quality: 50, festivals: { cannes: chosen, tiff: false } });
  const released = (id: number, at: number, cinema = true) => production({ id, release: { at, quality: 50, audience: cinema, doubled: null } });
  const since = addMonths('Europe/London', T0, -84);

  it("counts each production that found an audience in the PGA's seven years: released in cinemas, or its film chosen by a festival", () => {
    const s = { projects: [released(1, T0), released(2, since - 1), released(3, T0, false), production({ id: 4 })] };
    expect(record(s, T0)).toBe(1);
    expect(record(s, T0, { films: [film(4, since, true)] })).toBe(2);
    expect(record(s, T0, { films: [film(4, since - 1, true)] })).toBe(1);
    expect(record(s, T0, { films: [film(4, T0, false)] })).toBe(1);
    // A production released and chosen counts once.
    expect(record(s, T0, { films: [film(1, T0, true), film(3, T0, true)] })).toBe(2);
    expect(record({ projects: [] }, T0, { films: [film(4, T0, true), film(5, T0, true)] })).toBe(2);
    expect(factor(s, 50, production({ material: 50 }), T0, { films: [film(4, T0, true)] })).toBeCloseTo(0.5 + 0.5 + 2 * MODEL.record, 12);
  });

  it('directing.submit: a film a festival chose helps the next production raise its money', () => {
    const taken = (chosen: boolean) => factor({ projects: [production({ id: 2 })] }, 50, production({ id: 3 }), T0, { films: [film(2, T0, chosen)] });
    falsifyAny({ feature: 'directing.submit', claim: 'downstream', says: "a feature a festival chose counts toward how financiers take the life's next production; one refused does not", base: false, twin: true, outcome: taken });
  });
});

describe("paying the life from a production's budget", () => {
  const shootUS = (roles: string[], budget = '5000000', writing = 70) => {
    const l = dispatch(dispatch(writer(writing, 'feature', 60), developScript, { ...DEVELOP, roles }), planProject, { project: 1, budget });
    return dispatch(funded(l), shootProject, { project: 1, account: ACCOUNT });
  };

  it("pays the life's script its agreement's minimum on the first day of photography, from the budget, through the production's account, taxed once", () => {
    const l = shootUS(['writer', 'producer']);
    const p = project(l);
    expect(p.costs.map((c) => [c.role, c.what, c.amount])).toEqual([['writer', 'the script', FEES.feature], ...(p.shot?.fee === null || p.shot?.fee?.minor === 0 ? [] : [['producer', "producer's fee", p.shot?.fee]])]);
    expect(l.slices.tax.paid[0]).toMatchObject({ what: 'the script', work: 'author', country: 'US', gross: (FEES.feature as { minor: number }).minor });
    expect(minorIn(l.slices.ledger, 'world:production:1:USD')).toBe(-p.costs.reduce((t, c) => t + c.amount.minor, 0));
    expect(left(p)).toBe(500_000_000 - p.costs.reduce((t, c) => t + c.amount.minor, 0));
    // Where nothing sets the script's pay, nothing is paid for it.
    const th = dispatch(dispatch(writer(70, 'feature', 60), developScript, { ...DEVELOP, market: 'TH' }), planProject, { project: 1, budget: '5000000' });
    expect(project(dispatch(funded(th), shootProject, { project: 1, account: ACCOUNT })).costs.filter((c) => c.role === 'writer')).toEqual([]);
  });

  it("pays the producer's fee only where the life produces, and asks the producer's permit only then", () => {
    const optioned = (roles: string[]) => dispatch(funded(dispatch(dispatch(life({ producer: 100 }), optionMaterial, { format: 'film', roles, account: ACCOUNT, days: 1, genre: 'drama', market: 'GB' }), planProject, { project: 1, budget: '2000000' })), shootProject, { project: 1, account: ACCOUNT });
    expect(project(optioned(['producer'])).costs.map((c) => c.role)).toEqual(['producer']);
    expect(project(optioned(['actor'])).costs).toEqual([]);
    expect(project(optioned(['actor'])).shot).not.toBeNull();
    const none = (l: Life<Lives>): Life<Lives> => ({ ...l, slices: { ...l.slices, permits: { applications: [] } } });
    const ready = (roles: string[]) => none(funded(dispatch(dispatch(life({ producer: 60 }), optionMaterial, { format: 'film', roles, account: ACCOUNT, days: 1, genre: 'drama', market: 'GB' }), planProject, { project: 1, budget: '2000000' })));
    expect(() => dispatch(ready(['producer']), shootProject, { project: 1, account: ACCOUNT })).toThrow('the person may not work in GB without a permit');
    expect(project(dispatch(ready(['actor']), shootProject, { project: 1, account: ACCOUNT })).shot).not.toBeNull();
    expect(() => dispatch(dispatch(ready(['actor']), shootProject, { project: 1, account: ACCOUNT }), shootProject, { project: 1, account: ACCOUNT })).toThrow('project 1 is shot');
  });

  it("refuses a payment the budget can't cover, or one in another currency", () => {
    expect(() => shootUS(['writer'], '173214.99')).toThrow("project 1's budget can't pay the script");
    expect(project(shootUS(['writer'], '173215')).costs.map((c) => c.amount)).toEqual([FEES.feature]);
    const l = shootUS(['writer']);
    const s = structuredClone(l.slices);
    const c = { now: T0, draws: () => dr('x'), schedule: () => undefined } as never;
    expect(() => payOut(s, projectOf(s.producing, 1), 'actor', money('GBP', 100), 'a part', ACCOUNT, c)).toThrow("project 1's budget is in USD, not GBP");
  });
});

describe('what a production comes out as', () => {
  const shot = { at: 0, days: 32, overrun: usd('0'), fee: null, quality: 70 };
  const film = (quality: number | null): Film => ({ id: 1, project: 1, form: 'feature', episodes: 1, country: 'US', agreement: 'dga', budget: 1, minutes: null, started: 0, prepDays: 1, shootDays: 1, cutDays: 1, fee: null, plan: { story: 0, performances: 0, images: 0 }, needed: null, shot: null, cut: null, quality, festivals: {} });
  const part = (quality: number | null) => ({ id: 1, at: 0, project: 1, part: { agreement: 'sag-aftra' as const, budget: 1, seats: 0, lines: 0, term: 'day' as const, length: 1, rehearsal: 0, asks: [] }, gender: 'open' as const, ethnicity: 'open' as const, ages: [0, 120] as const, language: 'en', work: quality === null ? null : { at: 0, quality, pay: null } });
  const s = (films: Film[], parts: ReturnType<typeof part>[]) => ({ directing: { films }, acting: { parts } });

  it("is the four roles' results, a quarter each, a role the life doesn't hold at the hired standard", () => {
    const all = production({ material: 80, shot });
    expect(qualityOf(s([film(60)], [part(90), { ...part(40), id: 2 }]), all)).toBeCloseTo((80 + 70 + 60 + 65) / 4, 12);
    expect(qualityOf(s([], []), { ...all, roles: ['writer'] })).toBeCloseTo((80 + 3 * HIRED) / 4, 12);
    expect(qualityOf(s([], []), { ...all, roles: ['producer'] })).toBeCloseTo((70 + 3 * HIRED) / 4, 12);
    expect(qualityOf(s([film(10)], []), { ...all, roles: ['director'] })).toBeCloseTo((10 + 3 * HIRED) / 4, 12);
    expect(qualityOf(s([], [part(20)]), { ...all, roles: ['actor'] })).toBeCloseTo((20 + 3 * HIRED) / 4, 12);
    // Another production's film and parts aren't this one's.
    expect(qualityOf(s([{ ...film(10), project: 2 }, film(90)], [{ ...part(0), project: 2 }, part(30)]), all)).toBeCloseTo((80 + 70 + 90 + 30) / 4, 12);
  });

  it("is refused until each role the life holds has done its work: the shoot, the director's cut, every part cast played", () => {
    const all = production({ shot });
    expect(() => qualityOf(s([film(60)], [part(90)]), { ...all, shot: null })).toThrow("project 1 isn't shot");
    expect(() => qualityOf(s([film(null)], [part(90)]), all)).toThrow("project 1 isn't cut");
    expect(() => qualityOf(s([], [part(90)]), all)).toThrow("project 1 isn't cut");
    expect(() => qualityOf(s([film(60)], []), all)).toThrow("project 1's parts aren't all played");
    expect(() => qualityOf(s([film(60)], [part(90), { ...part(null), id: 2 }]), all)).toThrow("project 1's parts aren't all played");
    expect(qualityOf(s([film(null)], [part(null)]), { ...all, roles: ['writer'] })).toBe((50 + 3 * HIRED) / 4);
  });

  it('is what the release reads, and keeps', () => {
    const l = withProject(life({ producer: 60 }), production({ market: 'GB', roles: ['producer'], plan: { budget: money('GBP', 200_000_000), needed: 32, scheduled: 32, fee: null, credit: null }, raised: { equity: money('GBP', 200_000_000) }, shot }));
    expect(project(dispatch(l, releaseFilm, { project: 1 })).release?.quality).toBe((70 + 3 * HIRED) / 4);
  });
});
