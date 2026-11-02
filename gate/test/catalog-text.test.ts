import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  COUNTABLE, MISSPELLINGS, PREPOSITIONS, PROSE_1221, REAL_DOUBLED_NAMES, REAL_DOUBLES, REAL_NAMES, SAMENESS, SPELLINGS, TICS, VOICE,
  checkCatalogText, matchCase,
} from '../checks/catalog-text.ts';
import { all, fixture } from './fixture.ts';

const C = 'src/core/text/catalog.json';
const catalog = (lines: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(lines).map(([id, text]) => [id, { text, where: 'x', status: 'placeholder' }]));
const run = (lines: Record<string, unknown>, extra: Record<string, unknown> = {}) => checkCatalogText(fixture({ [C]: catalog(lines), ...extra }).repo);
const check = (lines: Record<string, unknown>, extra: Record<string, unknown> = {}) => all(run(lines, extra));
/** The findings for one line, by its words alone. */
const said = (text: string, extra: Record<string, unknown> = {}) => run({ 'a.b': text }, extra).findings.map((f) => f.message);
const sha = (v: unknown) => createHash('sha256').update(JSON.stringify(v instanceof Set ? [...v] : v)).digest('hex').slice(0, 16);

describe("the catalog's words: the lists, as 1221 kept them", () => {
  it('are 1221\'s, each held to its exact contents', () => {
    expect(COUNTABLE).toEqual([
      'thing', 'item', 'day', 'time', 'piece', 'minute', 'hour', 'week', 'month', 'year',
      'night', 'seat', 'guest', 'copy|copies', 'person|people', 'room', 'car', 'offer',
      'note', 'shot', 'take', 'credit', 'episode', 'film', 'role', 'point', 'step',
    ]);
    expect(PREPOSITIONS.join(' ')).toBe('what whatever where wherever as than how who which whichever if of after before about for in on at with to from like by into under over all both half but behind beyond without against');
    // Held to the lists as read from 1221's tools on 2026-11-02, less the identifier forms it marked with a trailing _.
    expect([Object.keys(SPELLINGS).length, sha(SPELLINGS)]).toEqual([150, 'cb1071415982c356']);
    expect([REAL_NAMES.length, sha(REAL_NAMES)]).toEqual([142, '1e6abba92b4e4239']);
    expect([Object.keys(MISSPELLINGS).length, sha(MISSPELLINGS)]).toEqual([150, 'e7edcbedd771e86f']);
    expect([...REAL_DOUBLES].join(' ')).toBe('bulgari had that is sang no so long well tam joseph dan winston hubba rules cayenne know armour black pago pom bon');
    expect(REAL_DOUBLED_NAMES).toEqual(['Sa Sa', 'Kai Kai', 'Duran Duran', 'Boutros Boutros', 'La La Land', 'Don Don Donki', 'Vuba Vuba', 'Kichi Kichi']);
    expect(TICS.map((t) => `${t.id} ${t.budget}`)).toEqual(['aphorism 12', 'dash-restate 6', 'whole-point 4', 'not-but 8', 'rather-than 12', 'nothing-opener 0', 'somebody 25', 'triad 3', 'which-is-why 8']);
    expect(sha(TICS.map((t) => [t.what, t.hint]))).toBe('8963a26700030300');
    expect(VOICE.map((v) => v.label)).toEqual(['x not', 'X not', 'will not', 'cannot', 'x is', 'X is', 'x are', 'X are', 'x will', 'x would', 'I am', 'I will', 'he is', 'let us']);
    expect([SAMENESS, PROSE_1221]).toEqual([{ floor: 20, share: 0.3 }, 26_517]);
  });
});

describe("the catalog's words", () => {
  it('note a catalog not yet written, and leave one that can\'t be read to the text inventory', () => {
    const none = checkCatalogText(fixture({}).repo);
    expect([none.check, none.notes, all(none)]).toEqual(['catalog-text', ['no text catalog yet'], []]);
    const broken = checkCatalogText(fixture({ [C]: '{' }).repo);
    expect([all(broken), broken.notes]).toEqual([[], ['0 lines of prose; 0 counts before a noun, 0 uncontracted, 0 tics over budget, 0 lists opening alike, 0 British spellings, 0 typos']]);
    expect(all(checkCatalogText(fixture({ [C]: [] }).repo))).toEqual([]);
    expect(check({ 'a.b': 3, 'a.c': null })).toEqual([]);
    expect(all(checkCatalogText(fixture({ [C]: { 'a.b': 'do not' } }).repo))).toEqual([]);
  });
  it('pass the lines as written, and count what they read', () => {
    const r = run({ 'life.damaged': "The file's damaged.", 'life.full': "There isn't room on this device, so nothing changed. Let go of a life you don't need.", 'life.ok': 'OK' });
    expect(all(r)).toEqual([]);
    expect(r.notes).toEqual(['2 lines of prose; 0 counts before a noun, 0 uncontracted, 0 tics over budget, 0 lists opening alike, 0 British spellings, 0 typos']);
  });
  it('fail a count before a countable noun, singular or plural, and leave one that agrees on its own', () => {
    const plural = (m: string) => `a count before a noun reads wrong at one or at more ("1 days", "2 day"): "${m}"; give one and more a line each, or put the noun in the slot`;
    expect(said('{n} days left, {n} day, {n}copies, {n} People, and {count}  thing.')).toEqual([plural('{n} days'), plural('{n} day'), plural('{n}copies'), plural('{n} People'), plural('{count}  thing')]);
    expect(said('{n} person and {n} copy')).toEqual([plural('{n} person'), plural('{n} copy')]);
    expect(said('{n} day{s} left, {n} dayz, {name} has a role, the {n}th day, {} step')).toEqual([plural('{} step')]);
    expect(run({ 'a.b': '{n} days' }).notes[0]).toContain('1 counts before a noun');
  });
  it('fail a form a person would contract, saying what it becomes', () => {
    const c = (from: string, to: string) => `a person would contract "${from}": "${to}"`;
    expect(said('You do not know. Do not go. It will not stop. Will not stop. I cannot. Cannot go.')).toEqual([
      c('do not', "don't"), c('Do not', "Don't"), c('will not', "won't"), c('Will not', "Won't"), c('cannot', "can't"), c('Cannot', "Can't"),
    ]);
    expect(said('Undo not, I do nothing, and do not only that, but do not onlyx; goodwill not; cannotx; cannot only.')).toEqual([c('do not', "don't")]);
    expect(said('and it is here, so there is time, but that is it')).toEqual([c('it is', "it's"), c('there is', "there's")]);
    expect(said('Here is the key. That is so. There is one.')).toEqual([c('Here is', "Here's"), c('That is', "That's"), c('There is', "There's")]);
    expect(said('half of it is technique, Of it is, it is to be, it is.')).toEqual([]);
    expect(said('it is tomorrow')).toEqual([c('it is', "it's")]);
    for (const end of ['.', ',', ';', ':', '!', '?', ')', ']', '"', '’', "'", '']) expect(said(`what it is${end}`)).toEqual([]);
    for (const end of ['.', ',', ';', ':', '!', '?', ')', ']', '"', '’', "'", '']) expect(said(`and it is${end}`)).toEqual([]);
    expect(said('and it is  x')).toEqual([c('it is', "it's")]);
    expect(said('and you are late; They are here. we are. as you are told. Who you are')).toEqual([c('you are', "you're"), c('They are', "They're")]);
    expect(said('you will see, You will. They would go, we would.')).toEqual([c('you will', "you'll"), c('They would', "they'd".replace('they', 'They'))]);
    expect(said('I am late, I am not, I am only, I am nothing, I will go. Iam.')).toEqual([c('I am', "I'm"), c('I am', "I'm"), c('I will', "I'll")]);
    expect(said('and she is late, he is. what he is now, as she is told')).toEqual([c('she is', "she's")]);
    expect(said('let us talk. Let us begin. Let us know, let us say, let us be, let us see, let us go, let us have, let us goes')).toEqual([c('let us', "let's"), c('Let us', "Let's"), c('let us', "let's")]);
    expect(said('it is {place}')).toEqual([c('it is', "it's")]);
  });
  it('fail a habit over its share of 1221\'s budget, held to the density 1221 allowed', () => {
    const lines = (n: number, odd: Record<string, string>) => ({ ...Object.fromEntries(Array.from({ length: n }, (_, i) => [`p.l${i}`, `plain words here number ${i}`])), ...odd });
    // 25 in 26,517 lines: one "somebody" is allowed from 1,061 lines of prose, and none in 1,060.
    expect(all(run(lines(1060, { 'q.a': 'ask somebody', 'q.b': 'OK' })))).toEqual([]);
    expect(all(run(lines(1059, { 'q.a': 'ask somebody', 'q.b': 'OK', 'q.c': 'ABC' })))).toEqual([
      `red ${C} | "somebody", 1 times in 1060 lines, where 1221's budget (25 in 26,517 lines) allows 0 (q.a): A person, a name, "you", "they": anything but the same word again.`,
    ]);
    const tic = (id: string, n: number, ids: string, prose: number) => {
      const t = TICS.find((x) => x.id === id);
      return `red ${C} | ${String(t?.what)}, ${n} times in ${prose} lines, where 1221's budget (${String(t?.budget)} in 26,517 lines) allows 0 (${ids}): ${String(t?.hint)}`;
    };
    expect(check({ 'a.a': 'a word, which is plain', 'a.b': 'more,and that makes it, which means so', 'a.c': 'which is fine, which island' })).toEqual([tic('aphorism', 3, 'a.a, a.b', 3)]);
    expect(check({ 'a.a': 'a word — which and—and it', 'a.b': 'a — whichever' })).toEqual([tic('dash-restate', 2, 'a.a', 2)]);
    expect(check({ 'a.a': "the whole point and the entire thing, That's the whole", 'a.b': 'that’s the entire', 'a.c': 'the whole problem, the whole of it', 'a.d': 'the whole pointe, the wholes thing' })).toEqual([tic('whole-point', 6, 'a.a, a.b, a.c', 4)]);
    expect(check({ 'a.a': "isn't a test, it's a game", 'a.b': 'is not a pet it is', 'a.c': 'aren’t free, they’re', 'a.d': "wasn't so, it's", 'a.e': "isn't it's", 'a.f': `isn't ${'x'.repeat(61)} it's`, 'a.g': "isn't now. it's" })).toEqual([`red ${C} a.b | a person would contract "is not": "isn't"`, tic('not-but', 4, 'a.a, a.b, a.c, a.d', 7)]);
    expect(check({ 'a.a': 'rather than that, Rather than this', 'a.b': 'rather thank' })).toEqual([tic('rather-than', 2, 'a.a', 2)]);
    expect(check({ 'a.a': 'Nothing works.', 'a.b': 'So it goes. Nothing more!  Nothing else', 'a.c': 'nothing here, a Nothing, Nothingness. so.Nothing' })).toEqual([tic('nothing-opener', 3, 'a.a, a.b', 3)]);
    expect(check({ 'a.a': 'Somebody and somebody', 'a.b': 'somebodys' })).toEqual([tic('somebody', 2, 'a.a', 2)]);
    expect(check({ 'a.a': 'no time, no money, no luck', 'a.b': 'no a, no b and no c', 'a.c': 'No xyz, no yes no zed', 'a.d': 'no xyz, no yes, so no zed' })).toEqual([tic('triad', 3, 'a.a, a.b, a.c', 4)]);
    expect(check({ 'a.a': 'which is why and Which is how', 'a.b': 'which is whyx' })).toEqual([tic('which-is-why', 2, 'a.a', 2)]);
  });
  it('fail a list where three lines in ten open on one word', () => {
    const list = (n: number, same: number, word = 'This') => Object.fromEntries(Array.from({ length: n }, (_, i) => [`l.l${i}`, `${i < same ? word : `Other${String.fromCharCode(97 + i)}`} line says something here ${i}`]));
    expect(check(list(20, 6))).toEqual([`red ${C} l.* | 6 of the 20 lines of l.* open on "This": vary how they begin`]);
    expect(check(list(20, 5))).toEqual([]);
    expect(check(list(19, 19))).toEqual([]);
    expect(check(list(20, 20, 'This,'))).toEqual([`red ${C} l.* | 20 of the 20 lines of l.* open on "This": vary how they begin`]);
    expect(check(list(20, 20, 'Don’t'))).toEqual([`red ${C} l.* | 20 of the 20 lines of l.* open on "Don’t": vary how they begin`]);
    // Too short, opening on a capital and a capital, with no word between spaces, or opening on one letter, it isn't counted.
    const short = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`s.l${i}`, i < 5 ? 'This is a short line' : i < 10 ? `THis line says something here ${i}` : i < 15 ? `This-line-says-something-here-${i}x` : `A line says something here ${i}`]));
    expect(check(short)).toEqual([]);
    expect(check({ ...list(20, 6), ...Object.fromEntries(Object.entries(list(20, 6, 'That')).map(([k, v]) => [k.replace('l.', 'm.'), v])) })).toEqual([
      `red ${C} l.* | 6 of the 20 lines of l.* open on "This": vary how they begin`,
      `red ${C} m.* | 6 of the 20 lines of m.* open on "That": vary how they begin`,
    ]);
    expect(run(list(20, 6)).notes[0]).toContain('1 lists opening alike');
  });
  it('fail a British spelling, the case carried, and leave real names, addresses and titles as their owners spell them', () => {
    const b = (w: string, to: string) => `"${w}" is British; SLATE spells it "${to}"`;
    expect(said('The colour, Colour, COLOUR, colours and colourful grey theatre.')).toEqual([b('colour', 'color'), b('Colour', 'Color'), b('COLOUR', 'COLOR'), b('colours', 'colors'), b('colourful', 'colorful'), b('grey', 'gray'), b('theatre', 'theater')]);
    expect(said('discoloured {colour} Under Armour, Earl Grey, Point Grey and Greyhound; www.colour.com/x, https://grey.org, centre.gov.uk/a; the Labour Code, Ministry of Labour, Labour (Amendment)')).toEqual([]);
    expect(said('armour, and Labour')).toEqual([b('armour', 'armor'), b('Labour', 'Labor')]);
    expect(said('Grey Street Kitchen, grey', { 'registry/names.json': { source: 'x', asWritten: [{ name: 'Grey Street Kitchen', why: 'theirs' }, 'Grey', null, { name: '' }, { why: 'no name' }], shownAsLabels: [] } })).toEqual([b('grey', 'gray')]);
    expect(said('Grey Street Kitchen', { 'registry/names.json': { source: 'x', asWritten: 'x' } })).toEqual([b('Grey', 'Gray')]);
    expect(said('Grey Street Kitchen', { 'registry/names.json': [] })).toEqual([b('Grey', 'Gray')]);
    expect(said('Theatre Royal and the Theatre Royal theatre')).toEqual([b('theatre', 'theater')]);
    expect(run({ 'a.b': 'grey' }).notes[0]).toContain('1 British spellings');
  });
  it('carry a word\'s case onto its replacement', () => {
    expect([matchCase('COLOUR', 'color'), matchCase('Colour', 'color'), matchCase('colour', 'color'), matchCase('X', 'abc'), matchCase('x', 'abc')]).toEqual(['COLOR', 'Color', 'color', 'Abc', 'abc']);
  });
  it('fail a misspelling and a word typed twice, and leave the real doubles alone', () => {
    expect(said('I recieve, Recieve and RECIEVE it; recieved.')).toEqual(['"recieve" is misspelled: "receive"', '"Recieve" is misspelled: "Receive"', '"RECIEVE" is misspelled: "RECEIVE"', '"recieved" is misspelled: "received"']);
    expect(said('the the end. The the end. go  go')).toEqual(['a word typed twice: "the the"', 'a word typed twice: "The the"', 'a word typed twice: "go  go"']);
    expect(said('had had, that that, Bulgari Bulgari, Sa Sa, La La Land, Chung Chung-hoon, a a, {x} {x}, thethe the, there the')).toEqual([]);
    expect(run({ 'a.b': 'the the' }).notes[0]).toContain('1 typos');
  });
  it('report every finding at its line, with every rule counted in the note', () => {
    expect(check({ 'a.b': 'do not', 'a.c': 'grey' })).toEqual([`red ${C} a.b | a person would contract "do not": "don't"`, `red ${C} a.c | "grey" is British; SLATE spells it "gray"`]);
    expect(run({ 'a.b': 'do not' }).notes[0]).toContain('1 uncontracted');
    expect(run({ 'a.b': 'Nothing here.' }).notes[0]).toContain('1 tics over budget');
  });
});

describe("the catalog's words, at their edges", () => {
  const note = (prose: number, n: Partial<Record<'count' | 'voice' | 'tics' | 'same' | 'brit' | 'typo', number>>) =>
    `${prose} lines of prose; ${n.count ?? 0} counts before a noun, ${n.voice ?? 0} uncontracted, ${n.tics ?? 0} tics over budget, ${n.same ?? 0} lists opening alike, ${n.brit ?? 0} British spellings, ${n.typo ?? 0} typos`;
  it('count each rule\'s findings, and only lines with a run of three lower-case letters as prose', () => {
    expect(run({ 'a.a': '{n} days', 'a.b': 'Go OK', 'a.c': 'ABC go' }).notes).toEqual([note(1, { count: 1 })]);
    expect(run({ 'a.a': 'do not go', 'a.b': 'and do not' }).notes).toEqual([note(2, { voice: 2 })]);
    expect(run({ 'a.a': 'grey and grey' }).notes).toEqual([note(1, { brit: 2 })]);
    expect(run({ 'a.a': 'recieve', 'a.b': 'the the' }).notes).toEqual([note(2, { typo: 2 })]);
    expect(run({ 'a.a': 'Nothing here, somebody.' }).notes).toEqual([note(1, { tics: 2 })]);
    const same = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`l.l${i}`, `This line says something here ${i}`]));
    expect(run(same).notes).toEqual([note(20, { same: 1 })]);
  });
  it('take a preposition before "it is" in either case, and only as a whole word', () => {
    expect(said('Of it is here. What it is here. As you are here')).toEqual([]);
    expect(said('Roof it is here')).toEqual(['a person would contract "it is": "it\'s"']);
  });
  it('take "I am" only when no "not" or "only" follows', () => {
    expect([said('I am late'), said('I am not'), said('I am only'), said('I am nothing'), said('I am onlyx')]).toEqual([["a person would contract \"I am\": \"I'm\""], [], [], ["a person would contract \"I am\": \"I'm\""], ["a person would contract \"I am\": \"I'm\""]]);
  });
  it('take an aphorism with any space before its verb', () => {
    expect(said('a word, which  is it')).toHaveLength(1);
    expect(said('a word,which\tmeans it')).toHaveLength(1);
  });
  it('leave every kind of address and law\'s title as its owner spells it, and blank a name without joining what is round it', () => {
    for (const text of [
      'see http://grey.org now', 'see https://grey.org now', 'see www.grey.example now', 'see foo.grey-x.gov/a now', 'see grey.gov.uk/x now',
      'the Harbour Labour Code', 'the Harbour  Labour Code', 'the Labour  Code', 'Labour Act', 'Labour Law', 'Labour Laws', 'Labour Relations',
      'Labour Council', 'Labour Department', 'Labour Force Survey', 'Labour Standards', 'Labour Protection', 'Labour Restructuring Fund',
      'Labour and Social Affairs', 'the Supreme Labour Council', 'Social Security Organisation', 'Social Insurance Organisation', 'Security Organisation',
      'Organisation of Working Time', 'Labour & Employment', 'Ministry of Labour', 'Minister of Social, Family Labour', 'Department of Labour', 'Law on Labour', 'Labour (Amendment)',
      'the Workers’ Labour Code', 'the O’Neill Labour Code', 'Harbour Labour Code',
      'see http://x.org/colour now', 'see www.x.colour now', 'see a.colour.bb.gov/x now', 'see x.gov/a/colour now',
      'Labour and Social Behaviour', 'Labour and  Social Behaviour', 'Labour and Social  Behaviour', 'Labour and Social Family Behaviour', 'Labour & Xcolour',
    ]) expect([text, said(text)]).toEqual([text, []]);
    expect(said('colEarl Greyour')).toEqual([]);
    expect(said('see grey.gov now, Labour Codes, Labourx Code')).toEqual(['"grey" is British; SLATE spells it "gray"', '"Labour" is British; SLATE spells it "Labor"']);
  });
  it('read a list\'s openers trimmed, from twenty characters, opening on a capital and a lower-case letter, with a word between spaces', () => {
    const list = (opener: (i: number) => string, same = 6) => Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`l.l${i}`, i < same ? opener(i) : `Other${String.fromCharCode(97 + i)} line says something here ${i}`]));
    const red = (n: number, word: string) => [`red ${C} l.* | ${n} of the 20 lines of l.* open on "${word}": vary how they begin`];
    expect(check(list(() => 'This is a long line.'))).toEqual(red(6, 'This'));
    expect(check(list(() => 'This is a long line'))).toEqual([]);
    expect(check(list((i) => `  This line says something here ${i}`))).toEqual(red(6, 'This'));
    expect(check(list((i) => `this line says something here ${i}`))).toEqual([]);
    expect(check(list((i) => `this Line says something here ${i}`))).toEqual([]);
    expect(check(list(() => 'Thisisalongword here'))).toEqual([]);
    expect(check(list((i) => `It line says something here ${i}`))).toEqual(red(6, 'It'));
    expect(check(list((i) => `A line says something here ${i}`))).toEqual([]);
    const two = { ...Object.fromEntries(Object.entries(list((i) => `That line says something here ${i}`)).map(([k, v]) => [k.replace('l.', 'm.'), v])), ...list((i) => `This line says something here ${i}`) };
    expect(check(two)).toEqual([...red(6, 'This'), `red ${C} m.* | 6 of the 20 lines of m.* open on "That": vary how they begin`]);
  });
});

