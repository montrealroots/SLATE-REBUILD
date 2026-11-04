import { describe, expect, it } from 'vitest';
import { allocate, money, type Money } from '../../../src/core/money/money.ts';
import { begin, commandIndex, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { daysFromCivil, SECONDS_PER_DAY } from '../../../src/core/time/calendar.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { ATTRIBUTES, ATTRIBUTES_START, chooseAttributes, componentValues, DAILY, skillOf, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import {
  cutFilm,
  cutNeeded,
  DIRECTING_START,
  EPISODES,
  FEATURE,
  FEATURE_SHOOT,
  FESTIVALS,
  filmOf,
  stagePay,
  finish,
  LEVELS,
  levelOf,
  onSet,
  PARTS,
  partSkill,
  PLANNED,
  POOL,
  jobOf,
  prepFilm,
  type PrepArgs,
  selectionChance,
  shootFilm,
  shootNeeded,
  STEEP,
  submitFilm,
  type DirectingSlice,
  type Festival,
  type Film,
  type Part,
  MODEL_LINE,
} from '../../../src/person/directing/directing.ts';
import { spread } from '../../../src/person/work/work.ts';
import { t } from '../../../src/core/text/text.ts';
import type { IdentitySlice } from '../../../src/person/identity/identity.ts';
import { ACTING_START, type ActingSlice } from '../../../src/person/acting/acting.ts';
import { HIRED, PRODUCING_START, projectOf, type Project, type ProducingSlice } from '../../../src/person/producing/producing.ts';
import { directed, type Directed } from '../../support/production.ts';
import type { PermitsSlice } from '../../../src/person/permits/permits.ts';
import { permitsEverywhere } from '../../support/permits.ts';
import { identity } from '../../support/person.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { ACCOUNT, minorIn, purse } from '../../support/purse.ts';
import { authoriseWork, YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';

type D = { attributes: AttributesSlice; directing: DirectingSlice; identity: IdentitySlice; acting: ActingSlice; producing: ProducingSlice; permits: PermitsSlice; youth: YouthSlice } & ReturnType<typeof purse>;
const SEED = '0123456789abcdef';
const seedOf = (i: number) => i.toString(16).padStart(16, '0');
const u = (seed: string, ...keys: (string | number)[]) => draws(seedFromText(seed), 'directing.work', ...keys).float();
const clamp = (n: number) => Math.min(100, Math.max(0, n));
const mean = (xs: number[]) => xs.reduce((t, x) => t + x, 0) / xs.length;
const grown = (from: number, days: number) => 100 - (100 - from) * (1 - DAILY) ** days;
const BROAD = ['vision', 'working-with-actors', 'visual-craft', 'editing', 'script-sense', 'leadership', 'communication'];
const covers = (broad: string) => (ATTRIBUTES.director.find((a) => a.id === broad)?.covers ?? []).map((c) => c.id);
const of = (v: Record<string, number>, id: string) => skillOf(v, 'director', id);

/** A job as these tests name it: its production's form, country, budget, shooting days and running time; the contract's agreement, prep and cut. */
type Job = Directed & { agreement?: string; prep?: number; cut?: number };
const STUDIO: Job = { form: 'feature', budget: 20_000_000, shoot: 40 };
/** Preps a job in a production of its own, made as the job names it (tests/support/production.ts). */
const prepWith = (l: Life<D>, args: Job, account: string | null = ACCOUNT): Life<D> => {
  const { agreement, prep, cut, ...job } = args;
  const id = l.slices.producing.projects.length + 1;
  const withIt = { ...l, slices: { ...l.slices, producing: { projects: [...l.slices.producing.projects, directed(job, id)] } } };
  return dispatch(withIt, prepFilm, { project: id, ...(account === null ? {} : { account }), ...(agreement === undefined ? {} : { agreement }), ...(prep === undefined ? {} : { prep }), ...(cut === undefined ? {} : { cut }) } as PrepArgs);
};
const made = (all: number, each: Record<string, number> = {}, seed = SEED): Life<D> =>
  dispatch(begin(seed, 0, { attributes: structuredClone(ATTRIBUTES_START), directing: structuredClone(DIRECTING_START), identity: adult(), acting: structuredClone(ACTING_START), producing: structuredClone(PRODUCING_START), permits: permitsEverywhere(), youth: structuredClone(YOUTH_START), ...purse() }), chooseAttributes, { role: 'director', all, each });
const prepped = (all: number, args: Job = STUDIO, each: Record<string, number> = {}, seed = SEED) => prepWith(made(all, each, seed), args);
const shot = (all: number, args: Job = STUDIO, each: Record<string, number> = {}, seed = SEED) => dispatch(prepped(all, args, each, seed), shootFilm, { film: 1, account: ACCOUNT });
/** The production shot by hand, its producing's result at the hired standard, as producing.shoot leaves it. */
const madeWhole = (l: Life<D>): Life<D> => ({ ...l, slices: { ...l.slices, producing: { projects: l.slices.producing.projects.map((p) => ({ ...p, shot: { at: 0, days: 40, overrun: money('USD', 0), fee: null, quality: 50 } })) } } });
const cutOf = (all: number, args: Job = STUDIO, each: Record<string, number> = {}, seed = SEED) => madeWhole(dispatch(shot(all, args, each, seed), cutFilm, { film: 1, account: ACCOUNT }));
const film = (l: Life<D>, id = 1): Film => filmOf(l.slices.directing, id);
const v = (l: Life<D>) => componentValues(l.slices.attributes, 'director');
const held = (l: Life<D>) => l.slices.attributes['director'] as Record<string, number>;
const values = (all: number, each: Record<string, number> = {}) => v(made(all, each));
/** The made person, born before the epoch these lives start at, so of age throughout (person.youth reads the age). */
const adult = (over: Parameters<typeof identity>[0] = {}) => identity({ born: { date: '1950-06-14', country: 'US', region: 'US.CA' }, ...over });

describe("a film's parts", () => {
  it('come from the broad attributes the owner names: the story from Vision and Script Sense, performances, images, the cut', () => {
    expect(PARTS).toEqual({ story: ['vision', 'script-sense'], performances: ['working-with-actors'], images: ['visual-craft'], cut: ['editing'] });
    expect(PLANNED).toEqual(['story', 'performances', 'images']);
    expect(ATTRIBUTES.director.map((a) => a.id)).toEqual(BROAD);
    const w = values(40, { vision: 90, 'script-sense': 10, editing: 70 });
    expect(partSkill(w, 'story')).toBeCloseTo(mean([...covers('vision'), ...covers('script-sense')].map((id) => of(w, id))), 10);
    expect(partSkill(w, 'cut')).toBeCloseTo(mean(covers('editing').map((id) => of(w, id))), 10);
    expect(partSkill(w, 'cut')).toBeGreaterThan(65);
  });

  it('are moved by every broad attribute of the part, and by none of the others but through a facet a source ties', () => {
    for (const p of Object.keys(PARTS) as Part[]) {
      for (const id of PARTS[p]) expect(partSkill(values(50, { [id]: 90 }), p), `${p} by ${id}`).toBeGreaterThan(partSkill(values(50, { [id]: 20 }), p));
    }
    expect(partSkill(values(50, { leadership: 90 }), 'cut')).toBe(partSkill(values(50, { leadership: 20 }), 'cut'));
  });

  it('spread less as the director gets better', () => {
    expect(spread(100)).toBe(3);
    expect(spread(0)).toBe(18);
    expect(spread(50)).toBe(10.5);
  });
});

describe('the DGA terms', () => {
  it("are the 2026-27 rate card's, the Basic Agreement's and the Low Budget Sideletter's", () => {
    expect(EPISODES).toEqual({ hour: { rate: 58808, prep: 7, shoot: 8, cut: 4 }, 'half-hour': { rate: 34629, prep: 3, shoot: 4, cut: 2 } });
    expect(FEATURE).toEqual({ prep: 14, weeks: 13 });
    expect(FEATURE_SHOOT).toBe(32);
    expect(LEVELS.map((l) => [l.upTo, l.weekly])).toEqual([
      [3_000_000, null],
      [4_000_000, 8321],
      [8_500_000, 18911],
      [11_000_000, 22693],
      [Infinity, 25214],
    ]);
  });

  it('set a feature by its budget: pay, prep and the Director\'s Cut at every level\'s edge', () => {
    const at = (budget: number, shoot: number) => film(prepped(60, { form: 'feature', budget, shoot }));
    const usd = (weekly: number) => ({ currency: 'USD', minor: weekly * 13 * 100 });
    expect(at(1, 10)).toMatchObject({ budget: 1, prepDays: 14, shootDays: 10, cutDays: 20, fee: null });
    expect(at(3_000_000, 30)).toMatchObject({ cutDays: 30, fee: null });
    expect(at(3_000_000, 20).cutDays).toBe(20);
    expect(at(3_000_001, 30)).toMatchObject({ cutDays: 56, fee: usd(8321) });
    expect(at(4_000_000, 90)).toMatchObject({ cutDays: 56, fee: usd(8321) });
    expect(at(4_000_001, 30)).toMatchObject({ cutDays: 70, fee: usd(18911) });
    expect(at(8_500_000, 160)).toMatchObject({ cutDays: 70, fee: usd(18911) });
    expect(at(8_500_001, 30)).toMatchObject({ cutDays: 70, fee: usd(22693) });
    expect(at(11_000_000, 160)).toMatchObject({ cutDays: 70, fee: usd(22693) });
    expect(at(11_000_001, 140)).toMatchObject({ cutDays: 70, fee: usd(25214) });
    expect(at(11_000_001, 150).cutDays).toBe(75);
    expect(at(11_000_001, 151).cutDays).toBe(75.5);
    expect(usd(25214).minor).toBe(32778200);
    expect(levelOf(11_000_000).weekly).toBe(22693);
  });

  it("set an episode by the show: the network program rate, the guaranteed prep and shoot, the episode's cut", () => {
    expect(film(prepped(60, { form: 'hour' }))).toMatchObject({ form: 'hour', budget: null, prepDays: 7, shootDays: 8, cutDays: 4, fee: { currency: 'USD', minor: 5880800 } });
    expect(film(prepped(60, { form: 'half-hour' }))).toMatchObject({ form: 'half-hour', budget: null, prepDays: 3, shootDays: 4, cutDays: 2, fee: { currency: 'USD', minor: 3462900 } });
  });
});

describe("the director's fee", () => {
  it('is paid as the work is done: each stage its days\' share, into the account named, less what the country takes', () => {
    const f = film(prepped(60));
    const fee = f.fee as Money;
    const shares = ['prep', 'shoot', 'cut'].map((x) => (stagePay(f, x as 'prep') as Money).minor);
    expect(shares).toEqual(allocate(fee, [f.prepDays * 100, f.shootDays * 100, f.cutDays * 100]).map((x) => x.minor));
    expect(shares.reduce((a, b) => a + b, 0)).toBe(fee.minor);
    // Half a day's cut weighs as half a day.
    expect(stagePay({ fee: money('USD', 100), prepDays: 0, shootDays: 1, cutDays: 0.5 }, 'cut')).toEqual(money('USD', 33));
    expect(stagePay({ ...f, fee: null }, 'prep')).toBeNull();
    const stages = [prepped(60), shot(60), cutOf(60)];
    const paid = stages.map((l) => l.slices.tax.paid.map((p) => [p.what, p.work, p.country, p.gross]));
    expect(paid[2]).toEqual([['prep', 'director', 'US', shares[0]], ['shoot', 'director', 'US', shares[1]], ['cut', 'director', 'US', shares[2]]]);
    expect(paid.map((x) => x.length)).toEqual([1, 2, 3]);
    // A US director is an employee: Social Security and Medicare are withheld on each share, on the year's pay so far.
    const last = stages[2] as Life<D>;
    const social = last.slices.tax.paid.reduce((t, p) => t + p.social, 0);
    // In ten-thousandths of a cent: 6.2% to $184,500, 1.45% on all, 0.9% above $200,000; each share rounded to the cent.
    const c = (x: number) => 620 * Math.min(x, 18_450_000) + 145 * x + 90 * Math.max(0, x - 20_000_000);
    const [a, b] = shares as [number, number];
    expect(last.slices.tax.paid.map((p) => p.social)).toEqual([c(a), c(a + b) - c(a), c(fee.minor) - c(a + b)].map((x) => Math.round(x / 10_000)));
    expect([minorIn(last.slices.ledger, ACCOUNT), minorIn(last.slices.ledger, 'world:social:US:USD'), minorIn(last.slices.ledger, 'world:production:1:USD')]).toEqual([100_000_000 + fee.minor - social, social, -fee.minor]);
    // Each stage's share is paid from the production's budget, which is so much less.
    expect(projectOf(last.slices.producing, 1).costs.map((x) => [x.role, x.what, x.amount.minor])).toEqual([['director', 'prep', shares[0]], ['director', 'shoot', shares[1]], ['director', 'cut', shares[2]]]);
    // A fee left to negotiation pays nothing, and asks no account.
    const low = prepWith(made(60), { form: 'feature', budget: 1, shoot: 10 }, null);
    expect([film(low).fee, low.slices.tax.paid]).toEqual([null, []]);
    expect(() => prepWith(made(60), STUDIO, null)).toThrow('no account undefined is held at a bank');
  });
});

describe('prep', () => {
  it('plans each part at what the director can do in it, within the spread', () => {
    for (let i = 1; i <= 12; i += 1) {
      const lvl = [0, 100, 30, 70][i % 4] as number;
      const seed = seedOf(i);
      const l = prepped(lvl, STUDIO, { vision: Math.min(100, lvl + 5) }, seed);
      const w = values(lvl, { vision: Math.min(100, lvl + 5) });
      for (const p of PLANNED) {
        const k = partSkill(w, p);
        expect(film(l).plan[p], `${seed} ${p}`).toBeCloseTo(clamp(k + spread(k) * (2 * u(seed, 'plan', 1, p) - 1)), 10);
      }
    }
    expect(film(prepped(100)).plan).toEqual(film(prepped(100)).plan);
    for (const x of Object.values(film(prepped(100)).plan)) expect(x).toBeGreaterThanOrEqual(97);
  });

  it('holds a plan to 0 and 100', () => {
    const tops = Array.from({ length: 12 }, (_, i) => film(prepped(100, STUDIO, {}, seedOf(i + 1))).plan);
    expect(tops.flatMap((p) => Object.values(p)).some((x) => x === 100)).toBe(true);
    const bottoms = Array.from({ length: 12 }, (_, i) => film(prepped(0, STUDIO, {}, seedOf(i + 1))).plan);
    expect(bottoms.flatMap((p) => Object.values(p)).some((x) => x === 0)).toBe(true);
  });

  it('records the film and teaches what prep used, over its days', () => {
    const l = prepped(50, { form: 'hour' });
    expect(film(l)).toMatchObject({ id: 1, started: 0, needed: null, shot: null, cut: null, quality: null, festivals: {} });
    for (const id of ['vision', 'script-sense', 'working-with-actors', 'visual-craft']) expect(held(l)[id], id).toBeCloseTo(grown(50, 7), 10);
    for (const id of ['editing', 'leadership', 'communication']) expect(held(l)[id], id).toBe(50);
    expect(film(prepWith(l, { form: 'half-hour' }), 2)).toMatchObject({ id: 2, project: 2, form: 'half-hour', episodes: 1 });
  });

  it("preps the production's own job once it is financed: its form, country, budget and schedule the production's", () => {
    const l = prepped(60);
    expect(film(l)).toMatchObject({ project: 1, form: 'feature', episodes: 1, country: 'US', agreement: 'dga', budget: 20_000_000, shootDays: 40 });
    // A series' every episode: each its job's days and fee, the series all of them, its shooting days needed each episode's.
    const series = (episodes: number) => {
      const base = made(60);
      const p = directed({ form: 'hour' });
      return film(dispatch({ ...base, slices: { ...base.slices, producing: { projects: [{ ...p, series: { form: 'hour', episodes } }] } } }, prepFilm, { project: 1, account: ACCOUNT }));
    };
    expect(series(1)).toMatchObject({ form: 'hour', episodes: 1, prepDays: 7, shootDays: 8, cutDays: 4, fee: money('USD', 5_880_800) });
    expect(series(6)).toMatchObject({ form: 'hour', episodes: 6, prepDays: 42, shootDays: 48, cutDays: 24, fee: money('USD', 6 * 5_880_800) });
    expect(jobOf({ ...directed({ form: 'hour', shoot: 20 }), series: { form: 'hour', episodes: 6 } } as Project & { plan: { scheduled: number } }, {}).job.shoot).toBe(3);
    expect(jobOf({ ...directed({ form: 'hour', shoot: 2 }), series: { form: 'hour', episodes: 6 } } as Project & { plan: { scheduled: number } }, {}).job.shoot).toBe(1);
    expect(jobOf(directed({ form: 'feature', shoot: 20, minutes: 95 }) as Project & { plan: { scheduled: number } }, { agreement: 'x', prep: 3, cut: 4 })).toEqual({ job: { form: 'feature', country: 'US', budget: 1_000_000_000, shoot: 20, minutes: 95, agreement: 'x', prep: 3, cut: 4 }, times: 1 });
    const needed = (episodes: number) => dispatch({ ...made(60), slices: { ...made(60).slices, producing: { projects: [{ ...directed({ form: 'hour' }), series: { form: 'hour', episodes } }] } } }, prepFilm, { project: 1, account: ACCOUNT });
    const w = v(needed(3) as Life<D>);
    expect(film(dispatch(needed(3) as Life<D>, shootFilm, { film: 1, account: ACCOUNT })).needed).toBeCloseTo(3 * shootNeeded(w, { form: 'hour' }), 10);
  });

  it("is refused where the production isn't financed, the life doesn't direct it, it is prepped already, the DGA's terms are given, or before the attributes are chosen", () => {
    const base = made(50);
    const withP = (over: Partial<Project>) => ({ ...base, slices: { ...base.slices, producing: { projects: [{ ...directed(STUDIO), ...over }] } } });
    expect(() => dispatch(withP({ raised: {} }), prepFilm, { project: 1, account: ACCOUNT })).toThrow("project 1 isn't financed");
    expect(() => dispatch(withP({ roles: ['producer', 'actor'] }), prepFilm, { project: 1, account: ACCOUNT })).toThrow("the life doesn't direct project 1");
    expect(() => dispatch(dispatch(withP({}), prepFilm, { project: 1, account: ACCOUNT }), prepFilm, { project: 1, account: ACCOUNT })).toThrow('project 1 is prepped');
    expect(() => dispatch(withP({}), prepFilm, { project: 2, account: ACCOUNT })).toThrow("there's no project 2");
    for (const over of [{ agreement: 'dga' }, { prep: 10 }, { cut: 10 }]) expect(() => dispatch(withP({}), prepFilm, { project: 1, account: ACCOUNT, ...over }), JSON.stringify(over)).toThrow("the DGA sets a US job's agreement, prep and cut");
    const bare = { ...withP({}), slices: { ...withP({}).slices, attributes: structuredClone(ATTRIBUTES_START) } };
    expect(() => dispatch(bare, prepFilm, { project: 1, account: ACCOUNT })).toThrow("the director's attributes haven't been chosen");
    expect(() => filmOf(DIRECTING_START, 1)).toThrow("there's no film 1");
    // Two productions, each prepped once.
    expect(film(prepWith(prepped(60), { form: 'hour' }), 2)).toMatchObject({ project: 2, form: 'hour' });
  });

  it('directing.prep: a director with more Vision plans a better story', () => {
    falsifyAny({ feature: 'directing.prep', claim: 'bites', says: 'a director at 90 in Vision plans a better story than one at 20', base: 20, twin: 90, outcome: (n) => film(prepped(50, STUDIO, { vision: n })).plan.story });
  });
});

describe('the shoot', () => {
  it("needs the trade's schedule from a director at 50 in holding it, a quarter less at 100, a quarter more at 0", () => {
    expect(shootNeeded(values(50), { form: 'feature' })).toBeCloseTo(32, 10);
    expect(shootNeeded(values(100), { form: 'feature' })).toBeCloseTo(24, 10);
    expect(shootNeeded(values(0), { form: 'feature' })).toBeCloseTo(40, 10);
    expect(shootNeeded(values(50), { form: 'hour' })).toBeCloseTo(8, 10);
    expect(shootNeeded(values(50), { form: 'half-hour' })).toBeCloseTo(4, 10);
    const w = values(30, { leadership: 80, 'visual-craft': 10 });
    expect(shootNeeded(w, { form: 'feature' })).toBeCloseTo(32 * (1.25 - (0.5 * (0.6 * of(w, 'time-management') + 0.4 * of(w, 'plan-each-shot-framing-composition-camera-movement-sound-act'))) / 100), 10);
    expect(shootNeeded(values(50, { 'visual-craft': 100 }), { form: 'hour' })).toBeLessThan(shootNeeded(values(50), { form: 'hour' }));
  });

  it('is carried by the set: 0.8 of the plan from a director at 0 in leading and talking to it, all of it at 100', () => {
    expect(onSet(values(0))).toBeCloseTo(0.8, 10);
    expect(onSet(values(100))).toBeCloseTo(1, 10);
    const w = values(50, { communication: 90 });
    expect(onSet(w)).toBeCloseTo(0.8 + (0.2 * mean(['lead-cast-and-crew', 'coordination', 'speech-clarity', 'active-listening'].map((id) => of(w, id)))) / 100, 10);
    expect(onSet(values(50, { leadership: 90 }))).toBeGreaterThan(onSet(values(50)));
  });

  it('loses what a short schedule leaves undone, Adaptability carrying more of it', () => {
    expect(finish(values(0), 60, 60)).toBe(1);
    expect(finish(values(0), 90, 60)).toBe(1);
    expect(finish(values(0), 30, 60)).toBeCloseTo(0.7, 10);
    expect(finish(values(100), 30, 60)).toBeCloseTo(0.85, 10);
  });

  it('brings each planned part to the screen exactly as far as the schedule and the set carry it', () => {
    for (const [lvl, days] of [
      [40, 20],
      [40, 60],
      [90, 25],
      [0, 1],
    ] as const) {
      const before = prepped(lvl, { form: 'feature', budget: 20_000_000, shoot: days }, { leadership: lvl + 10 });
      const w = v(before);
      const after = film(dispatch(before, shootFilm, { film: 1, account: ACCOUNT }));
      const needed = shootNeeded(w, after);
      expect(after.needed).toBeCloseTo(needed, 10);
      for (const p of PLANNED) expect(after.shot?.[p], `${lvl} ${days} ${p}`).toBeCloseTo(film(before).plan[p] * finish(w, days, needed) * onSet(w), 10);
    }
    const top = film(shot(100, { form: 'feature', budget: 20_000_000, shoot: 24 }));
    expect(top.shot).toEqual(top.plan);
  });

  it('teaches Working With Actors, Visual Craft, Leadership and Communication over its days', () => {
    const before = prepped(50, { form: 'hour' });
    const after = dispatch(before, shootFilm, { film: 1, account: ACCOUNT });
    for (const id of ['working-with-actors', 'visual-craft', 'leadership', 'communication']) expect(held(after)[id], id).toBeCloseTo(grown(held(before)[id] as number, 8), 10);
    for (const id of ['vision', 'script-sense', 'editing']) expect(held(after)[id], id).toBe(held(before)[id]);
  });

  it('is refused for a film shot already', () => {
    expect(() => dispatch(shot(50), shootFilm, { film: 1, account: ACCOUNT })).toThrow('film 1 is shot');
    expect(() => dispatch(made(50), shootFilm, { film: 1, account: ACCOUNT })).toThrow("there's no film 1");
  });

  it('directing.shoot: more days on the schedule bring more to the screen', () => {
    falsifyAny({ feature: 'directing.shoot', claim: 'bites', says: 'a feature shot in 40 days holds more of its plan than one shot in 15', base: 15, twin: 40, outcome: (n) => film(shot(50, { form: 'feature', budget: 20_000_000, shoot: n })).shot?.performances });
  });
});

describe('the cut', () => {
  it('needs a day for each shooting day from a director at 0 in Editing, a day for every two at 100', () => {
    expect(cutNeeded(values(0), 40)).toBeCloseTo(40, 10);
    expect(cutNeeded(values(100), 40)).toBeCloseTo(20, 10);
    const w = values(30, { editing: 80 });
    expect(cutNeeded(w, 8)).toBeCloseTo(8 * (1 - (0.5 * partSkill(w, 'cut')) / 100), 10);
  });

  it("is made in the Director's Cut the DGA guarantees, exactly, and the film is its four parts' mean", () => {
    const cases: [number, Job][] = [
      [20, { form: 'hour' }],
      [100, { form: 'hour' }],
      [0, { form: 'half-hour' }],
      [60, { form: 'feature', budget: 3_500_000, shoot: 120 }],
      [100, STUDIO],
    ];
    cases.forEach(([lvl, args], i) => {
      const seed = seedOf(i + 1);
      const before = shot(lvl, args, {}, seed);
      const w = v(before);
      const b = film(before);
      const k = partSkill(w, 'cut');
      const c = clamp(k * finish(w, b.cutDays, cutNeeded(w, b.shootDays)) + spread(k) * (2 * u(seed, 'cut', 1) - 1));
      const after = film(dispatch(before, cutFilm, { film: 1, account: ACCOUNT }));
      expect(after.cut, String(i)).toBeCloseTo(c, 10);
      expect(after.quality, String(i)).toBeCloseTo(mean([b.shot?.story ?? 0, b.shot?.performances ?? 0, b.shot?.images ?? 0, c]), 10);
    });
  });

  it('holds the cut to 0 and 100', () => {
    const cuts = (lvl: number) => Array.from({ length: 12 }, (_, i) => film(cutOf(lvl, { form: 'hour' }, {}, seedOf(i + 1))).cut);
    expect(cuts(100).some((x) => x === 100)).toBe(true);
    expect(cuts(0).some((x) => x === 0)).toBe(true);
  });

  it("is shorter than the footage needs for an hour's four days from a director below the top, enough at 100", () => {
    const w = values(40);
    expect(finish(w, 4, cutNeeded(w, 8))).toBeLessThan(1);
    expect(finish(values(100), 4, cutNeeded(values(100), 8))).toBe(1);
    const lowLevel = film(cutOf(30, { form: 'feature', budget: 3_500_000, shoot: 100 })).cut ?? 0;
    const fullLevel = film(cutOf(30, { form: 'feature', budget: 4_500_000, shoot: 100 })).cut ?? 0;
    expect(fullLevel).toBeGreaterThan(lowLevel);
  });

  it('teaches Editing over the days of the cut', () => {
    const before = shot(50, { form: 'hour' });
    const after = dispatch(before, cutFilm, { film: 1, account: ACCOUNT });
    expect(held(after)['editing']).toBeCloseTo(grown(50, 4), 10);
    expect(held(after)['vision']).toBe(held(before)['vision']);
  });

  it('is refused before the shoot and once cut', () => {
    expect(() => dispatch(prepped(50), cutFilm, { film: 1, account: ACCOUNT })).toThrow("film 1 isn't shot");
    expect(() => dispatch(cutOf(50), cutFilm, { film: 1, account: ACCOUNT })).toThrow('film 1 is cut');
  });

  it('comes out at the top from a director at 100 throughout, around half from one at 50, poorly from one at 10', () => {
    const q = (lvl: number) => mean(Array.from({ length: 10 }, (_, i) => film(cutOf(lvl, { form: 'feature', budget: 20_000_000, shoot: 40 }, {}, seedOf(i + 1))).quality ?? 0));
    expect(film(cutOf(100)).quality).toBeGreaterThanOrEqual(97);
    expect(q(50)).toBeGreaterThan(38);
    expect(q(50)).toBeLessThan(55);
    expect(q(10)).toBeLessThan(15);
  });

  it('directing.cut: a better editor cuts better', () => {
    falsifyAny({ feature: 'directing.cut', claim: 'bites', says: 'a director at 90 in Editing cuts an hour better than one at 20', base: 20, twin: 90, outcome: (n) => film(cutOf(50, { form: 'hour' }, { editing: n })).cut });
  });
});

describe('festivals', () => {
  it("choose at each festival's own rate for a film at the pool's middle, more for better, never past certain", () => {
    expect(FESTIVALS).toEqual({ sundance: 90 / 4255, cannes: 72 / 2541, berlinale: 252 / 8085, tiff: 285 / 9020 });
    expect(POOL).toBe(50);
    expect(STEEP).toBe(5);
    expect(selectionChance('cannes', 50)).toBeCloseTo(72 / 2541, 12);
    expect(selectionChance('sundance', 100)).toBeCloseTo((90 / 4255) * 32, 12);
    expect(selectionChance('sundance', 25)).toBeCloseTo((90 / 4255) / 32, 12);
    expect(selectionChance('tiff', 100)).toBe(1);
    expect(selectionChance('berlinale', 0)).toBe(0);
  });

  it('take a finished feature by the draw on its chance, once each', () => {
    let hits = 0;
    for (let i = 1; i <= 24; i += 1) {
      const seed = seedOf(i);
      let l = cutOf(i % 2 === 0 ? 100 : 70, STUDIO, {}, seed);
      for (const f of Object.keys(FESTIVALS) as Festival[]) {
        // The life directs alone: the script, the producing and the acting count at the hired standard.
        const expected = u(seed, 'festival', 1, f) < selectionChance(f, (3 * HIRED + (film(l).quality ?? 0)) / 4);
        l = dispatch(l, submitFilm, { film: 1, festival: f });
        expect(film(l).festivals[f], `${seed} ${f}`).toBe(expected);
        if (expected) hits += 1;
      }
    }
    expect(hits).toBeGreaterThan(0);
    expect(hits).toBeLessThan(96);
  });

  it('are refused for a festival there is not, an episode, a film not cut, or a second time', () => {
    expect(() => dispatch(cutOf(60), submitFilm, { film: 1, festival: 'venice' as Festival })).toThrow("there's no festival venice");
    expect(() => dispatch(cutOf(60, { form: 'hour' }), submitFilm, { film: 1, festival: 'cannes' })).toThrow('film 1 is an episode');
    expect(() => dispatch(shot(60), submitFilm, { film: 1, festival: 'cannes' })).toThrow("film 1 isn't cut");
    expect(() => dispatch(dispatch(cutOf(60), submitFilm, { film: 1, festival: 'cannes' }), submitFilm, { film: 1, festival: 'cannes' })).toThrow('film 1 went to cannes');
  });

  it('directing.submit: a better film is chosen more often', () => {
    const chosen = (lvl: number) => Array.from({ length: 30 }, (_, i) => film(dispatch(cutOf(lvl, STUDIO, {}, seedOf(i + 1)), submitFilm, { film: 1, festival: 'cannes' })).festivals['cannes']).filter(Boolean).length;
    falsifyAny({ feature: 'directing.submit', claim: 'bites', says: 'thirty films by a director at 100 reach Cannes more often than thirty by one at 40', base: 40, twin: 100, outcome: chosen });
  });
});

describe('the director', () => {
  it('reads every broad attribute somewhere in the work', () => {
    const outcome = (each: Record<string, number>) => {
      const l = dispatch(cutOf(50, STUDIO, each), submitFilm, { film: 1, festival: 'cannes' });
      return film(l);
    };
    const base = outcome({});
    for (const id of BROAD) expect(outcome({ [id]: 90 }), id).not.toEqual(base);
  });

  it('is the same for the same life and differs for another', () => {
    expect(film(cutOf(50))).toEqual(film(cutOf(50)));
    expect(film(cutOf(50, STUDIO, {}, 'fedcba9876543210'))).not.toEqual(film(cutOf(50)));
  });

  it("tells the player its own figures are the game's", () => {
    expect(MODEL_LINE).toBe('directing.model');
    expect(t(MODEL_LINE)).toContain("SLATE's own reckoning");
  });

  it('is run through the frame, each command declaring what it reads and writes', () => {
    expect(commandIndex().filter((x) => x.id.startsWith('directing.'))).toEqual([
      { id: 'directing.prep', reads: ['identity'], writes: ['attributes', 'directing', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'] },
      { id: 'directing.shoot', reads: ['identity', 'acting', 'permits'], writes: ['attributes', 'directing', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'] },
      { id: 'directing.cut', reads: ['identity', 'acting', 'permits'], writes: ['attributes', 'directing', 'producing', 'accounts', 'ledger', 'tax', 'schedule', 'youth'] },
      { id: 'directing.submit', reads: ['producing', 'acting'], writes: ['directing'] },
    ]);
  });
});

describe('a minor director (person.youth)', () => {
  const NOW = daysFromCivil(2026, 11, 2) * SECONDS_PER_DAY;
  const teen = (): Life<D> =>
    dispatch(begin(SEED, NOW, { attributes: structuredClone(ATTRIBUTES_START), directing: structuredClone(DIRECTING_START), identity: identity({ born: { date: '2011-03-10', country: 'FR', region: '' }, citizenship: ['FR'], grewUp: { country: 'FR', region: '' } }), acting: structuredClone(ACTING_START), producing: structuredClone(PRODUCING_START), permits: permitsEverywhere(), youth: structuredClone(YOUTH_START), ...purse('EUR') }), chooseAttributes, { role: 'director', all: 50, each: {} });
  const ARGS: Job = { form: 'feature', country: 'FR', agreement: 'idcc-3097', prep: 10, shoot: 20, cut: 10 };
  it("is engaged at prep only with what France's law needs first, each stage's pécule held, the days at the young worker's hours", () => {
    expect(() => prepWith(teen(), ARGS)).toThrow('that work in France needs permit first');
    const p = prepWith(dispatch(teen(), authoriseWork, { country: 'FR', role: 'director' }), ARGS);
    expect(p.slices.youth.granted).toMatchObject([{ role: 'director', used: true }]);
    expect(p.slices.attributes['director']?.['vision']).toBeCloseTo(grown(50, 10 * (35 / 40)), 10);
    const s = dispatch(p, shootFilm, { film: 1, account: ACCOUNT });
    const v = componentValues(p.slices.attributes, 'director');
    const film = s.slices.directing.films[0];
    expect(film?.shot?.['story']).toBeCloseTo((film?.plan['story'] as number) * finish(v, 20 * (35 / 40), shootNeeded(v, { form: 'feature' })) * onSet(v), 10);
    expect(s.slices.attributes['director']?.['leadership']).toBeCloseTo(grown(p.slices.attributes['director']?.['leadership'] as number, 20 * (35 / 40)), 10);
    const c = dispatch(s, cutFilm, { film: 1, account: ACCOUNT });
    expect(c.slices.attributes['director']?.['editing']).toBeCloseTo(grown(s.slices.attributes['director']?.['editing'] as number, 10 * (35 / 40)), 10);
    expect(c.slices.directing.films[0]?.cut).toBeCloseTo(Math.min(100, Math.max(0, partSkill(componentValues(s.slices.attributes, 'director'), 'cut') * finish(componentValues(s.slices.attributes, 'director'), 10 * (35 / 40), cutNeeded(componentValues(s.slices.attributes, 'director'), 20)) + spread(partSkill(componentValues(s.slices.attributes, 'director'), 'cut')) * (2 * u(SEED, 'cut', 1) - 1))), 10);
    expect(c.slices.youth.held.map((h) => h.engagement)).toEqual(['director:1', 'director:1', 'director:1']);
  });
});
