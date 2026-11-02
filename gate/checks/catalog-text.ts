import { PATHS } from '../lib/paths.ts';
import { isRecord, readJson, type Repo } from '../lib/repo.ts';
import { result, type CheckResult } from '../lib/types.ts';

/**
 * The words of every line the game says, held to 1221's five checks of player text (CLAUDE.md, Part 1; HANDOFF placed
 * them with `core.text`): `tools/plural-check.mjs`, `voice-check.mjs`, `tics.mjs`, `spelling.mjs` and `typos.mjs` in
 * `montrealroots/1221`. 1221 swept every string literal and JSX text in its source for them; here every word the player
 * reads is a line of the text catalog (the lint allows no other), so they read the catalog's lines and nothing else.
 *
 * A slot (`{name}`) is a value, not words: it is read as a count before a noun, and as a stand-in (U+FFFC) everywhere
 * else, so a slot's own name is never spelled, contracted or doubled.
 */

/** Nouns that need a singular form when the count is one; 1221's list, an irregular plural after its bar. */
export const COUNTABLE: readonly string[] = [
  'thing', 'item', 'day', 'time', 'piece', 'minute', 'hour', 'week', 'month', 'year',
  'night', 'seat', 'guest', 'copy|copies', 'person|people', 'room', 'car', 'offer',
  'note', 'shot', 'take', 'credit', 'episode', 'film', 'role', 'point', 'step',
];
// 1221's pattern took the noun as written, so its \b fell inside "days" and only "${n} day" was caught; here the plural
// is caught too. 1221's allowances (ordinals, figures to a decimal place, populations) named lines of its own files,
// none of which is here, so none came over: an allowance with nothing to allow is a word nothing reads.
const NOUNS = COUNTABLE.flatMap((n) => (n.includes('|') ? n.split('|') : [n, `${n}s`]));
const COUNT = new RegExp(`\\{[^}]*\\}\\s*(${NOUNS.join('|')})\\b(?!\\{)`, 'gi');

// Either case, because the word before is often the start of the sentence.
const notAfter = (words: readonly string[]) => `(?<!\\b(?:${words.flatMap((w) => [w, w.charAt(0).toUpperCase() + w.slice(1)]).join('|')}) )`;
const NOT_BEFORE_CLAUSE_END = `(?! *(?:[.,;:!?)\\]"’']|$))`;
/** After these, "it is", "you are" and "he is" are an object or a clause's end, not a subject to contract; 1221's list. */
export const PREPOSITIONS: readonly string[] = [
  'what', 'whatever', 'where', 'wherever', 'as', 'than', 'how', 'who', 'which', 'whichever', 'if',
  'of', 'after', 'before', 'about', 'for', 'in', 'on', 'at', 'with', 'to', 'from', 'like', 'by',
  'into', 'under', 'over', 'all', 'both', 'half', 'but', 'behind', 'beyond', 'without', 'against',
];
const AFTER = notAfter(PREPOSITIONS);

/**
 * Where a person would have contracted and the line didn't: 1221's voice-check, rule for rule, each with what it
 * becomes. 1221 held them to a budget of 40 across its source while it rewrote; this catalog starts written, so the
 * budget is none.
 */
export const VOICE: readonly { label: string; re: RegExp; say: (m: RegExpMatchArray) => string }[] = [
  { label: 'x not', re: /\b(do|does|did|is|are|was|were|have|has|had|would|should|could|must) not\b(?! only\b)/g, say: (m) => `${m[1]}n't` },
  { label: 'X not', re: /\b(Do|Does|Did|Is|Are|Was|Were|Have|Has|Had|Would|Should|Could|Must) not\b(?! only\b)/g, say: (m) => `${m[1]}n't` },
  { label: 'will not', re: /\b(w|W)ill not\b/g, say: (m) => `${m[1]}on't` },
  { label: 'cannot', re: /\b(c|C)annot\b(?! only\b)/g, say: (m) => `${m[1]}an't` },
  // "here is" and "that is" after a preposition are an adverb and an object ("half of it is technique"), not a subject.
  { label: 'x is', re: new RegExp(`${AFTER}\\b(it|that|there) is\\b(?! to\\b)${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'s` },
  { label: 'X is', re: new RegExp(`\\b(It|That|There|Here) is\\b(?! to\\b)${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'s` },
  { label: 'x are', re: new RegExp(`${AFTER}\\b(you|we|they) are\\b${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'re` },
  { label: 'X are', re: new RegExp(`\\b(You|We|They) are\\b${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'re` },
  { label: 'x will', re: new RegExp(`\\b(you|we|they|You|We|They) will\\b${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'ll` },
  { label: 'x would', re: new RegExp(`\\b(you|we|they|You|We|They) would\\b${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'d` },
  { label: 'I am', re: /\bI am\b(?! (?:not|only)\b)/g, say: () => "I'm" },
  { label: 'I will', re: /\bI will\b/g, say: () => "I'll" },
  { label: 'he is', re: new RegExp(`${AFTER}\\b(he|she) is\\b${NOT_BEFORE_CLAUSE_END}`, 'g'), say: (m) => `${m[1]}'s` },
  { label: 'let us', re: /\b(l|L)et us\b(?! (?:know|say|be|see|go|have)\b)/g, say: (m) => `${m[1]}et's` },
];

/**
 * The habits that make prose sound like a machine: 1221's tics, each with its budget. 1221 set each budget over the
 * 26,517 lines of prose its source held when the sweep ended (measured 2026-11-02 at 1221's last commit to tics.mjs,
 * d6eba5d, by its own reading of what is prose), as what was left after the sweep. A catalog that grows from seven lines
 * is held to the same density, not the same count: a tic may appear as often per line as 1221 allowed, rounded down, so
 * the first lines may carry none and the finished game no more than 1221's did.
 */
export const PROSE_1221 = 26_517;
export const TICS: readonly { id: string; what: string; hint: string; re: RegExp; budget: number }[] = [
  { id: 'aphorism', what: 'a clause tacked on to explain what the sentence just meant', hint: 'End the sentence. Say the next thing plainly, or don’t say it.', re: /,\s*(which|and that)\s+(is|was|are|makes|means)\b/gi, budget: 12 },
  { id: 'dash-restate', what: 'an em dash, then a restatement of what came before it', hint: 'A dash should add, not rephrase. Cut it or make it a new sentence.', re: /—\s*(which|and that|and it)\b/gi, budget: 6 },
  { id: 'whole-point', what: '"the whole point / the whole thing / the entire point"', hint: 'Everything can’t be the whole point of everything.', re: /\b(the (whole|entire) (point|thing|problem|of it)|that['’]s the (whole|entire))\b/gi, budget: 4 },
  { id: 'not-but', what: 'defining something by what it isn’t before saying what it is', hint: 'Say what it is. The contrast is only worth it once or twice.', re: /\b(isn['’]t|is not|aren['’]t|wasn['’]t)\b[^.;!?]{2,60}?\b(it['’]s|they['’]re|it is)\b/gi, budget: 8 },
  { id: 'rather-than', what: '"rather than"', hint: 'Often just "not". Sometimes the clause can go entirely.', re: /\brather than\b/gi, budget: 12 },
  { id: 'nothing-opener', what: 'a sentence that opens with "Nothing"', hint: 'Turn it round: say what there is, or who does what.', re: /(^|[.!?]\s+)Nothing\b/g, budget: 0 },
  { id: 'somebody', what: '"somebody"', hint: 'A person, a name, "you", "they": anything but the same word again.', re: /\bsomebody\b/gi, budget: 25 },
  // Stryker disable next-line Regex: how far the last word is read doesn't change whether, or how often, three negatives are found.
  { id: 'triad', what: 'three negatives in a row: "no x, no y, no z"', hint: 'Two is a pair. Three is a drum.', re: /\bno [a-z]+, no [a-z]+,? (and )?no [a-z]+/gi, budget: 3 },
  { id: 'which-is-why', what: '"which is why" / "which is how"', hint: 'Start a sentence with "That’s why", or drop the join.', re: /\bwhich is (why|how)\b/gi, budget: 8 },
];
/** 1221's sameness: a list of twenty lines or more where three in ten open on one word. Here a list is an id's first part. */
export const SAMENESS = { floor: 20, share: 0.3 } as const;

/** British spelling on the left, what SLATE says on the right: 1221's list. */
export const SPELLINGS: Readonly<Record<string, string>> = {
  jewellery: 'jewelry', jeweller: 'jeweler', jewellers: 'jewelers', jewelleries: 'jewelries', jewelled: 'jeweled',
  colour: 'color', colours: 'colors', coloured: 'colored', colouring: 'coloring',
  colourway: 'colorway', colourways: 'colorways', colourless: 'colorless', colourful: 'colorful',
  favourite: 'favorite', favourites: 'favorites', favour: 'favor', favours: 'favors', favoured: 'favored',
  neighbour: 'neighbor', neighbours: 'neighbors', neighbourhood: 'neighborhood', neighbourhoods: 'neighborhoods',
  behaviour: 'behavior', behaviours: 'behaviors',
  honour: 'honor', honours: 'honors', honoured: 'honored',
  flavour: 'flavor', flavours: 'flavors', flavoured: 'flavored',
  humour: 'humor', rumour: 'rumor', rumours: 'rumors', armour: 'armor',
  vapour: 'vapor', odour: 'odor', odours: 'odors', savour: 'savor', savoury: 'savory',
  endeavour: 'endeavor', harbour: 'harbor', harbours: 'harbors',
  labour: 'labor', labours: 'labors', laboured: 'labored',
  grey: 'gray', greys: 'grays', greying: 'graying', greyed: 'grayed',
  centre: 'center', centres: 'centers', centred: 'centered',
  theatre: 'theater', theatres: 'theaters',
  metre: 'meter', metres: 'meters', kilometre: 'kilometer', kilometres: 'kilometers',
  litre: 'liter', litres: 'liters', fibre: 'fiber', fibres: 'fibers',
  sombre: 'somber', lustre: 'luster', calibre: 'caliber', manoeuvre: 'maneuver',
  realise: 'realize', realised: 'realized', realising: 'realizing',
  organise: 'organize', organised: 'organized', organising: 'organizing', organisation: 'organization',
  recognise: 'recognize', recognised: 'recognized', recognising: 'recognizing',
  apologise: 'apologize', apologised: 'apologized', apologising: 'apologizing',
  analyse: 'analyze', analysed: 'analyzed', analysing: 'analyzing',
  memorise: 'memorize', memorised: 'memorized', criticise: 'criticize', criticised: 'criticized',
  emphasise: 'emphasize', emphasised: 'emphasized', specialise: 'specialize', specialised: 'specialized',
  summarise: 'summarize', summarised: 'summarized',
  defence: 'defense', offence: 'offense', pretence: 'pretense', licence: 'license', licences: 'licenses', licenced: 'licensed',
  practise: 'practice', practising: 'practicing',
  travelled: 'traveled', travelling: 'traveling', traveller: 'traveler', travellers: 'travelers',
  cancelled: 'canceled', cancelling: 'canceling', modelled: 'modeled', modelling: 'modeling',
  marvellous: 'marvelous', signalled: 'signaled', fuelled: 'fueled', refuelled: 'refueled',
  catalogue: 'catalog', catalogues: 'catalogs', catalogued: 'cataloged',
  programme: 'program', programmes: 'programs',
  cheque: 'check', cheques: 'checks', kerb: 'curb', kerbs: 'curbs',
  tyre: 'tire', tyres: 'tires', aluminium: 'aluminum', moustache: 'mustache',
  pyjamas: 'pajamas', storey: 'story', storeys: 'stories', plough: 'plow',
  draught: 'draft', draughts: 'drafts', speciality: 'specialty', specialities: 'specialties',
  aeroplane: 'airplane', whilst: 'while', amongst: 'among', learnt: 'learned',
  spelt: 'spelled', dreamt: 'dreamed', sceptical: 'skeptical', scepticism: 'skepticism',
  mould: 'mold', moulded: 'molded', smoulder: 'smolder', smouldering: 'smoldering',
  gemmologist: 'gemologist', gemmology: 'gemology',
  fulfil: 'fulfill', fulfils: 'fulfills', fulfilment: 'fulfillment',
};
// 1221's list also held `jewellery_` and `jewel_`, the forms of identifiers it left alone; a line holds no identifier.

/**
 * Names spelled the way their owners spell them, each found on the owner's own signage when 1221 listed it: anything
 * inside one is left alone. With them, the names `registry/names.json` lists as written.
 */
export const REAL_NAMES: readonly string[] = [
  'Kalyan Jewellers', 'Chow Tai Fook Jewellery', 'PC Jeweller', 'Joyalukkas', 'Silverbend Jewellers', 'Halliwell Goldsmiths',
  'Theatre Royal', 'Canadian Theatre Agreement', 'Professional Association of Canadian Theatres', 'Old Vic', 'National Theatre', 'Barbican Centre', 'Capuchin Day Centre', 'Centre Pompidou',
  'Point Grey', 'Grey Dog Software',
  'Southbank Centre', 'Sydney Theatre', 'Abbey Theatre', 'Lyric Theatre', 'Apollo Theatre',
  'Dolby Theatre', 'Pantages Theatre', 'Chinese Theatre', 'Egyptian Theatre', 'Yale Repertory Theatre',
  'Text Book Centre', 'Home Centre', 'Centrepoint', 'Community Care Centre',
  'AMC Theatres', 'Marcus Theatres', 'Landmark Theatres', 'Alamo Drafthouse', 'Harkins Theatres', 'Shaw Theatres',
  'Bell Centre', 'National Centre For The Performing Arts', 'Bolshoi Theatre', 'Theatre Square', 'Centre National du Cinéma',
  'Harbourfront Centre', 'Nautical Centre', 'Private Pilot Licence', 'Euro Traveller',
  'Rockefeller Center', 'Lincoln Center', 'Kennedy Center',
  'Labour Party', 'Colour Supplies', 'Grey Goose', 'Earl Grey', 'Greyhound',
  'Harbour Bridge', 'Darling Harbour', 'Circular Quay', 'Pearl Harbor',
  'Colorful Standard', 'Grey Label', 'Metre Cube',
  'Under Armour', 'Run Favourite', 'Nail Colour',
  'HeatGear Armour', 'ColdGear Armour', 'Armour Fleece', 'Gameday Armour',
  'Micro Colour', 'Face Colour', 'Cream Colour Base', 'Duo Fibre', 'Fibre Gel', 'Bravia Theatre',
  'National Driver Licence Service', 'Driving Licence Testing Centre', 'Defence Health',
  'Provisional Driving Licence', 'Full Driving Licence', 'Full Licence', 'Provisional Licence', 'Learner Licence',
  'Restricted Licence', 'Unrestricted Licence', 'Novice Licence', 'Driver’s Licence', 'G1 Licence', 'G2 Licence',
  'G Licence', 'P1 Licence', 'P2 Licence', 'M1 Licence', 'M2 Licence', 'M Licence', 'Class 6 Licence',
  'UK Theatre', 'Regional Theatre',
  'Manhattan Theatre Club', 'Biltmore Theatre', 'Steppenwolf Theatre Company', 'Royal Court Theatre', 'Theatre Upstairs', 'Jerwood Theatre Downstairs', 'Studio Theatre', 'Williamstown Theatre Festival', 'Vineyard Theatre', 'Laura Pels Theatre', 'Chichester Festival Theatre', 'Denver Center Theatre Company', 'National Theatre of Scotland', 'Soho Theatre', 'Almeida Theatre', 'Ricketson Theatre', 'Theatre Communications Group',
  'Noël Coward Theatre', 'Royal George Theatre', 'Norwegian Touring Theatre', 'Royal Shakespeare Theatre', 'Harold Pinter Theatre', 'Duke of York’s Theatre', 'Garrick Theatre', 'Sam Bass Community Theatre', 'Roman Theatre', 'Hen and Chickens Theatre', 'Mick Lally Theatre', 'Swan Theatre',
  'Bulgari Aluminium', 'Aluminium Watch', 'Aluminium Chronograph', 'Calibre 321', 'Grey Side Of The Moon', 'Grey Mother Of Pearl',
  'Lip Colour', 'Eye Colour', 'Traveller Jacket',
  'Cuenta de Cheques', 'cuentas-cheques', 'cheque-accounts', 'Special Defence Contribution',
  'special-defence-contribution', 'Youth Programme', 'bankers-association/organisation',
  'al-centre',
];
// 1221 listed Nail Colour twice; it's here once.

/** A web address and the title of a law or a public body are spelled by their owners: 1221's two patterns. */
const ADDRESS = /https?:\/\/\S+|\bwww\.\S+|\b[\w-]+(?:\.[\w-]+)*\.(?:gov|org|com|net|edu|int|gouv|go|co|ac)(?:\.[a-z]{2})?\/\S*/gi;
const TITLES = /\b(?:[A-Z][\w'’]*\s+){0,4}Labour\s+(?:Code|Act|Law|Laws|Relations|Council|Department|Force Survey|Standards|Protection|Restructuring Fund|and\s+[A-Z]\w+(?:\s+[A-Z]\w+)*)\b|\bSupreme Labour Council\b|\b(?:Social (?:Security|Insurance)|Security) Organisation\b|\bOrganisation of Working Time\b|\bLabour (?:and|&) \w+|\bMinist(?:ry|er) of [\w, ]*Labour\b|\bDepartment of Labour\b|\bLaw on Labour\b|\bLabour \(/g;

/** Straightforwardly wrong in any register: 1221's list (its `perhaps_` was a placeholder it never matched). */
export const MISSPELLINGS: Readonly<Record<string, string>> = {
  recieve: 'receive', recieved: 'received', seperate: 'separate', seperately: 'separately',
  occured: 'occurred', occuring: 'occurring', occurence: 'occurrence',
  definately: 'definitely', accomodate: 'accommodate', accomodation: 'accommodation',
  neccessary: 'necessary', necesary: 'necessary', existance: 'existence',
  independant: 'independent', persistant: 'persistent', consistant: 'consistent',
  begining: 'beginning', comittee: 'committee', commited: 'committed',
  embarass: 'embarrass', enviroment: 'environment', goverment: 'government',
  immediatly: 'immediately', occassion: 'occasion', priviledge: 'privilege',
  reccomend: 'recommend', refered: 'referred', reffered: 'referred',
  succesful: 'successful', successfull: 'successful', tommorow: 'tomorrow',
  untill: 'until', wierd: 'weird', acheive: 'achieve', acheived: 'achieved',
  beleive: 'believe', calender: 'calendar', cemetary: 'cemetery',
  concious: 'conscious', dissapear: 'disappear', dissapoint: 'disappoint',
  fourty: 'forty', gaurd: 'guard', greatful: 'grateful', harrass: 'harass',
  independance: 'independence', maintainance: 'maintenance', maintenence: 'maintenance',
  managable: 'manageable', millenium: 'millennium', noticable: 'noticeable',
  occassionally: 'occasionally', paralell: 'parallel', perseverence: 'perseverance',
  posession: 'possession', prefered: 'preferred', propoganda: 'propaganda',
  publically: 'publicly', questionaire: 'questionnaire', relevent: 'relevant',
  rythm: 'rhythm', supercede: 'supersede', tendancy: 'tendency', threshhold: 'threshold',
  truely: 'truly', unfortunatly: 'unfortunately', vaccuum: 'vacuum', writting: 'writing',
  arguement: 'argument', assasin: 'assassin', basicly: 'basically', bizzare: 'bizarre',
  buisness: 'business', cieling: 'ceiling', collegue: 'colleague', comming: 'coming',
  completly: 'completely', comparision: 'comparison', decieve: 'deceive',
  desicion: 'decision', diffrent: 'different', dilemna: 'dilemma', dispell: 'dispel',
  ecstacy: 'ecstasy', embarassed: 'embarrassed', experiance: 'experience',
  familar: 'familiar', finaly: 'finally', foriegn: 'foreign', freind: 'friend',
  gratefull: 'grateful', happend: 'happened', heirarchy: 'hierarchy',
  humourous: 'humorous', hygeine: 'hygiene', ignorence: 'ignorance',
  incidently: 'incidentally', inteligent: 'intelligent', intresting: 'interesting',
  knowlege: 'knowledge', liason: 'liaison', libary: 'library', lightening: 'lightning',
  loosing: 'losing', miniture: 'miniature', mischevious: 'mischievous',
  neice: 'niece', occurr: 'occur', oppurtunity: 'opportunity', paticular: 'particular',
  peice: 'piece', personel: 'personnel', posible: 'possible',
  practicaly: 'practically', preceeding: 'preceding', pronounciation: 'pronunciation',
  recomend: 'recommend', reguardless: 'regardless', religous: 'religious',
  repetion: 'repetition', restaraunt: 'restaurant', rediculous: 'ridiculous',
  sacrafice: 'sacrifice', secratary: 'secretary', seige: 'siege', similiar: 'similar',
  sincerly: 'sincerely', speach: 'speech', stoping: 'stopping', strengh: 'strength',
  suprise: 'surprise', surprized: 'surprised', temperment: 'temperament',
  thier: 'their', tounge: 'tongue', tradgedy: 'tragedy', tyrany: 'tyranny',
  underate: 'underrate', usualy: 'usually', vegatable: 'vegetable', vehical: 'vehicle',
  visable: 'visible', wether: 'whether', wilfull: 'wilful', withold: 'withhold',
  yeild: 'yield', teh: 'the', adn: 'and', taht: 'that', hte: 'the',
};

/** Words that really are said twice ("had had", "that that"), and names that say one twice: 1221's, each checked there. */
export const REAL_DOUBLES: ReadonlySet<string> = new Set([
  'bulgari', 'had', 'that', 'is', 'sang', 'no', 'so', 'long', 'well',
  'tam', 'joseph', 'dan', 'winston', 'hubba', 'rules', 'cayenne', 'know', 'armour', 'black', 'pago', 'pom', 'bon',
]);
export const REAL_DOUBLED_NAMES: readonly string[] = ['Sa Sa', 'Kai Kai', 'Duran Duran', 'Boutros Boutros', 'La La Land', 'Don Don Donki', 'Vuba Vuba', 'Kichi Kichi'];
// 1221 took a doubled word only in the case it was typed twice ("the the"); "The the" opens a sentence just as wrongly.
const DOUBLED = /\b([A-Za-z]{2,})\s+\1\b/gi;

// Whole words only, so the order of the list can't make one word match inside a longer one.
const words = (list: readonly string[]) => new RegExp(`\\b(${list.join('|')})\\b`, 'gi');
const BRITISH = words(Object.keys(SPELLINGS));
const WRONG = words(Object.keys(MISSPELLINGS));
const SLOT = /\{[^}]*\}/g;

/** The replacement in the case the line wrote: COLOUR to COLOR, Colour to Color, colour to color. */
export function matchCase(source: string, replacement: string): string {
  if (source === source.toUpperCase() && source.length > 1) return replacement.toUpperCase();
  if (source.charAt(0) === source.charAt(0).toUpperCase()) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
}

/** A text with its addresses, its laws' titles and its real names blanked, each kept to its length. */
// Stryker disable next-line ArrowFunction: put back as nothing or as a comma, a name still parts the words round it.
const hide = (found: string) => ' '.repeat(found.length);
const blank = (text: string, names: readonly string[]) => names.reduce((t, n) => t.split(n).join(hide(n)), [ADDRESS, TITLES].reduce((t, re) => t.replace(re, hide), text));

export function checkCatalogText(repo: Repo): CheckResult {
  const r = result('catalog-text');
  // A catalog that can't be read, or isn't an object, is the text inventory's to report.
  const raw = repo.exists(PATHS.catalog) ? readJson(repo, PATHS.catalog) : undefined;
  if (raw === undefined) {
    r.note('no text catalog yet');
    return r;
  }
  const value = (raw as { value?: unknown }).value;
  const catalog = isRecord(value) ? value : {};
  const listed = (readJson(repo, PATHS.names) as { value?: unknown }).value;
  // Stryker disable next-line ArrayDeclaration: a list put in place of none holds a string, which the filter below drops.
  const asWritten: unknown[] = isRecord(listed) && Array.isArray(listed['asWritten']) ? listed['asWritten'] : [];
  // A name that isn't a word (none, or empty) blanks nothing; the title-case check reports it.
  const names = [...REAL_NAMES, ...asWritten.filter(isRecord).map((n) => String(n['name']))];

  const counts = { count: 0, voice: 0, tics: 0, spelling: 0, typos: 0, sameness: 0 };
  const prose: [string, string][] = [];
  const openers = new Map<string, Map<string, number>>();
  for (const [id, entry] of Object.entries(catalog)) {
    const text = isRecord(entry) ? entry['text'] : undefined;
    if (typeof text !== 'string') continue;
    const at = `${PATHS.catalog} ${id}`;
    const red = (rule: keyof typeof counts, message: string) => {
      counts[rule] += 1;
      r.red(message, at);
    };
    for (const m of text.matchAll(COUNT)) {
      red('count', `a count before a noun reads wrong at one or at more ("1 days", "2 day"): "${m[0]}"; give one and more a line each, or put the noun in the slot`);
    }
    const said = text.replace(SLOT, '￼');
    for (const v of VOICE) for (const m of said.matchAll(v.re)) red('voice', `a person would contract "${m[0]}": "${v.say(m)}"`);

    for (const m of blank(said, names).matchAll(BRITISH)) red('spelling', `"${m[0]}" is British; SLATE spells it "${matchCase(m[0], SPELLINGS[m[0].toLowerCase()] as string)}"`);
    for (const m of said.matchAll(WRONG)) red('typos', `"${m[0]}" is misspelled: "${matchCase(m[0], MISSPELLINGS[m[0].toLowerCase()] as string)}"`);
    for (const m of said.matchAll(DOUBLED)) {
      const word = (m[1] as string).toLowerCase();
      const end = m.index + m[0].length;
      if (REAL_DOUBLES.has(word) || said.charAt(end) === '-' || REAL_DOUBLED_NAMES.some((n) => said.startsWith(n, m.index))) continue;
      red('typos', `a word typed twice: "${m[0]}"`);
    }

    if (!/[a-z]{3}/.test(said)) continue;
    prose.push([id, said]);
    const one = said.trim();
    // 1221 also asked for an opening word of two letters or more; one that opens on a capital and a lower-case letter has.
    const word = (one.split(/\s/)[0] as string).replace(/[^A-Za-z’']/g, '');
    if (one.length >= 20 && /^[A-Z][a-z]/.test(one) && /\s[a-z]+\s/.test(one)) {
      const list = id.split('.')[0] as string;
      const tally = openers.get(list) ?? new Map<string, number>();
      openers.set(list, tally.set(word, (tally.get(word) ?? 0) + 1));
    }
  }
  for (const t of TICS) {
    const found = prose.flatMap(([id, said]) => Array.from(said.matchAll(t.re), () => id));
    const allowed = Math.floor((t.budget * prose.length) / PROSE_1221);
    if (found.length <= allowed) continue;
    counts.tics += 1;
    r.red(`${t.what}, ${found.length} times in ${prose.length} lines, where 1221's budget (${t.budget} in ${PROSE_1221.toLocaleString('en-US')} lines) allows ${allowed} (${[...new Set(found)].join(', ')}): ${t.hint}`, PATHS.catalog);
  }
  for (const [list, tally] of [...openers].sort()) {
    const written = [...tally.values()].reduce((n, k) => n + k, 0);
    const [word, n] = [...tally].sort((a, b) => b[1] - a[1])[0] as [string, number];
    if (written < SAMENESS.floor || n / written < SAMENESS.share) continue;
    counts.sameness += 1;
    r.red(`${n} of the ${written} lines of ${list}.* open on "${word}": vary how they begin`, `${PATHS.catalog} ${list}.*`);
  }
  r.note(`${prose.length} lines of prose; ${counts.count} counts before a noun, ${counts.voice} uncontracted, ${counts.tics} tics over budget, ${counts.sameness} lists opening alike, ${counts.spelling} British spellings, ${counts.typos} typos`);
  return r;
}
