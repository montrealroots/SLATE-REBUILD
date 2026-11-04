import { describe, expect, it } from 'vitest';
import { begin, commandIndex, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { draws, seedFromText } from '../../../src/core/rng/rng.ts';
import { ATTRIBUTES_START, broadOf, chooseAttributes, componentOf, componentValues, DAILY, facetSkill, skillOf, type AttributesSlice } from '../../../src/person/attributes/attributes.ts';
import { bestOf, CAREER_START, contactChance, DOCUMENT_DAYS, documentSkill, meetPeople, PITCH, pitchOf, quality, summariseScript, type CareerSlice, type Document } from '../../../src/person/work/career.ts';
import { PARTS, partScore, readScript, SCRIPTS_START, spread, writeScript, type Form, type Script, type ScriptsSlice } from '../../../src/person/work/work.ts';
import type { GenresSlice } from '../../../src/person/genres/genres.ts';
import type { IdentitySlice } from '../../../src/person/identity/identity.ts';
import { falsifyAny } from '../../support/falsify-core.ts';
import { identity } from '../../support/person.ts';
import { purse } from '../../support/purse.ts';
import { YOUTH_START, type YouthSlice } from '../../../src/person/youth/youth.ts';

type Career = { attributes: AttributesSlice; scripts: ScriptsSlice; career: CareerSlice; identity: IdentitySlice; genres: GenresSlice; youth: YouthSlice } & ReturnType<typeof purse>;
const SEED = '0123456789abcdef';
const u = (...keys: (string | number)[]) => draws(seedFromText(SEED), 'work.career', ...keys);
const clamp = (n: number) => Math.min(100, Math.max(0, n));
const grown = (from: number, days: number) => 100 - (100 - from) * (1 - DAILY) ** days;
const of = (v: Record<string, number>, id: string) => skillOf(v, 'screenwriter', id);

/** Levels set by component, held by the broad attribute that covers each (a later one wins where two share it). */
const toBroad = (each: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(each).map(([id, n]) => [broadOf('screenwriter', id).id, n]));
/** The made person, born before the epoch these lives start at, so of age throughout (person.youth reads the age). */
const adult = (over: Parameters<typeof identity>[0] = {}) => identity({ born: { date: '1950-06-14', country: 'US', region: 'US.CA' }, ...over });
const made = (all: number, each: Record<string, number> = {}, at = 0): Life<Career> =>
  dispatch(begin(SEED, at, { attributes: structuredClone(ATTRIBUTES_START), scripts: structuredClone(SCRIPTS_START), career: structuredClone(CAREER_START), identity: adult(), genres: { loved: ['drama'] }, youth: structuredClone(YOUTH_START), ...purse() }), chooseAttributes, { role: 'screenwriter', all, each: toBroad(each) });
const withScript = (all: number, form: Form = 'feature', each: Record<string, number> = {}) => dispatch(made(all, each), writeScript, { form, genre: 'drama', days: 200 });
const v = (l: Life<Career>) => componentValues(l.slices.attributes, 'screenwriter');
const docs = (l: Life<Career>, id = 1) => l.slices.career.documents[String(id)];
const script = (l: Life<Career>, id = 1) => l.slices.scripts.written[id - 1] as Script;
describe("a script's documents", () => {
  it('are the ten the sources name, each its own facet of Synopsis, written in its own time', () => {
    expect(Object.keys(DOCUMENT_DAYS)).toEqual(componentOf('screenwriter', 'synopsis').facets.map((f) => f.id));
    expect(DOCUMENT_DAYS.treatment).toBe(21.5);
    expect(PITCH).toEqual(['logline', 'short-synopsis', 'one-page-synopsis', 'pitch-document', 'treatment']);
    const w = v(made(60, { synopsis: 90, premise: 20 }));
    const logline = componentOf('screenwriter', 'synopsis').facets.find((f) => f.id === 'logline');
    expect(logline?.draws).toEqual(['premise']);
    expect(documentSkill(w, 'logline')).toBeCloseTo(0.7 * (0.75 * 90 + 0.25 * 20) + 0.3 * of(w, 'writing'), 10);
    expect(documentSkill(w, 'statement-of-intent')).toBeCloseTo(0.7 * 90 + 0.3 * of(w, 'writing'), 10);
    expect(() => documentSkill(w, 'novel' as Document)).toThrow("there's no document novel");
    expect(facetSkill(w, logline!, 'synopsis')).toBeCloseTo(72.5, 10); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });

  it('come out as the writer is, worth half when rushed to nothing, within the spread', () => {
    const before = withScript(60, 'feature', { synopsis: 80 });
    const vb = v(before);
    const k = documentSkill(vb, 'treatment');
    const needed = Math.ceil(DOCUMENT_DAYS.treatment / (0.5 + (0.5 * (0.6 * of(vb, 'writing') + 0.4 * of(vb, 'time-management'))) / 100));
    for (const days of [1, 60]) {
      const l = dispatch(before, summariseScript, { script: 1, document: 'treatment', days });
      expect(docs(l)?.['treatment'], String(days)).toBeCloseTo(clamp(k * (0.5 + 0.5 * Math.min(1, days / needed)) + spread(k) * (2 * u('document', 1, 'treatment', 0).float() - 1)), 10);
      expect(v(l)['synopsis']).toBeCloseTo(grown(vb['synopsis'] as number, days), 10);
    }
    expect(docs(dispatch(dispatch(before, summariseScript, { script: 1, document: 'logline', days: 1 }), summariseScript, { script: 1, document: 'outline', days: 1 }))).toEqual({ logline: expect.any(Number), outline: expect.any(Number) });
    expect(() => dispatch(before, summariseScript, { script: 2, document: 'logline', days: 1 })).toThrow("there's no script 2");
    expect(() => dispatch(before, summariseScript, { script: 1, document: 'logline', days: 0 })).toThrow('the days given are a whole number of at least 1 (0)');
  });

  it('script.summarise: a better hand at Synopsis writes a better logline', () => {
    falsifyAny({ feature: 'script.summarise', claim: 'bites', says: 'a writer at 90 in Synopsis writes a better logline than at 20', base: 20, twin: 90, outcome: (n) => docs(dispatch(withScript(60, 'feature', { synopsis: n }), summariseScript, { script: 1, document: 'logline', days: 3 }))?.['logline'] });
  });
});

describe('networking', () => {
  it('makes a contact a day as often as Networking, Speaking and Social Perceptiveness make it likely', () => {
    expect(contactChance(v(made(0)))).toBeCloseTo(0.05, 10);
    expect(contactChance(v(made(100)))).toBeCloseTo(0.5, 10);
    const w = v(made(50, { networking: 100 }));
    expect(contactChance(w)).toBeCloseTo(0.05 + (0.45 * (0.6 * of(w, 'networking') + 0.2 * of(w, 'speaking') + 0.2 * of(w, 'social-perceptiveness'))) / 100, 10);
    const base = made(50);
    const p = contactChance(v(base));
    for (const n of [1, 7, 40]) {
      const d = u('network', 0);
      let e = 0;
      for (let i = 0; i < n; i += 1) if (d.float() < p) e += 1;
      expect(dispatch(base, meetPeople, { days: n }).slices.career.contacts, String(n)).toBe(e);
    }
    for (let n = 1; n <= 40; n += 1) {
      const d = u('network', 0);
      let e = 0;
      for (let i = 0; i < n; i += 1) if (d.float() < p) e += 1;
      expect(dispatch(base, meetPeople, { days: n }).slices.career.contacts).toBe(e);
    }
    expect(v(dispatch(base, meetPeople, { days: 40 }))['networking']).toBeCloseTo(grown(50, 40), 10);
    expect(() => dispatch(base, meetPeople, { days: 0 })).toThrow(RangeError);
  });

  it('network.meet: a better networker meets more people', () => {
    falsifyAny({ feature: 'network.meet', claim: 'bites', says: 'a writer at 100 in Networking makes more contacts in 60 days than one at 0', base: 0, twin: 100, outcome: (n) => dispatch(made(50, { networking: n }), meetPeople, { days: 60 }).slices.career.contacts });
  });
});

describe("the writer's pitch to a production's financiers", () => {
  it("weighs the script on its last grade, or its parts' mean where none has graded it", () => {
    const l = withScript(70);
    expect(quality(script(l))).toBeCloseTo(PARTS.reduce((t, p) => t + partScore(script(l), p), 0) / PARTS.length, 10);
    const graded = script(dispatch(l, readScript, { script: 1, reader: 'black-list' }));
    expect(quality(graded)).toBe((graded.reads.at(-1)?.overall ?? 0) * 10);
  });

  it('is Pitching, Speaking and Persuasion, and the best of the five documents a pitch puts forward', () => {
    const w = v(made(50, { pitching: 80, speaking: 30 }));
    for (const d of [{}, { logline: 40 }, { treatment: 90, logline: 40 }, { outline: 100 }, { 'short-synopsis': 70 }, { 'one-page-synopsis': 60 }, { 'pitch-document': 55 }]) {
      expect(pitchOf(w, d), JSON.stringify(d)).toBeCloseTo(0.5 * of(w, 'pitching') + 0.2 * of(w, 'speaking') + 0.2 * of(w, 'persuasion') + 0.1 * bestOf(d, PITCH), 10);
    }
    expect([bestOf({}, PITCH), bestOf({ outline: 100 }, PITCH), bestOf({ treatment: 90, logline: 40 }, PITCH), bestOf({ logline: 40 }, ['outline'])]).toEqual([0, 0, 90, 0]);
    expect(pitchOf(w, { 'pitch-document': 100 })).toBeGreaterThan(pitchOf(w, {}));
    expect(pitchOf(v(made(50, { persuasion: 90 })), {})).toBeGreaterThan(pitchOf(v(made(50, { persuasion: 10 })), {}));
  });
});

describe('the solo writer', () => {
  it('works alone, with no room, run through the frame, each command declaring what it reads and writes', () => {
    expect(commandIndex().filter((x) => x.id.startsWith('room.'))).toEqual([]);
    expect(CAREER_START).toEqual({ contacts: 0, documents: {} });
    // Nothing sells or options a script to another's production (the owner, 2026-11-04: "Remove spec sales too").
    expect(commandIndex().filter((x) => x.id.startsWith('script.') || x.id.startsWith('network.')).map((x) => x.id)).toEqual(['script.write', 'script.revise', 'script.read', 'script.summarise', 'network.meet']);
    expect(commandIndex().filter((x) => ['script.summarise', 'network.meet'].includes(x.id))).toEqual([
      { id: 'script.summarise', reads: ['scripts'], writes: ['attributes', 'career'] },
      { id: 'network.meet', reads: [], writes: ['attributes', 'career'] },
    ]);
  });
});
