# Handoff

Layer in progress: 4

Where the rebuild stands, kept current at every checkpoint so an interrupted session resumes rather than restarts.
Read `CLAUDE.md` first.

## Where the build stands

- Branch `claude/quirky-gauss-gnub7q`, restarted from `main` at `25fe912` after the owner merged the rules. Nothing is
  deployed. The owner pulls and merges after each layer.
- The development tools are set up (`tools/setup/README.md`; `bash tools/setup/verify.sh` reports each one).
- 1221's rules, then SLATE's, are in `CLAUDE.md` and `.claude/rules/`, with `docs/STYLE.md` and `docs/GLOSSARY.md`,
  without SLATE's one-agent rule or 1221's Base44 deployment. Layer 6 (the voice) is dropped (2026-11-02).
- Layer 0 (the repository and the gate) is proven: the full gate green in a fresh clone of the branch at
  `80e8d7438f9b`, recorded in `registry/layers.json` (2026-11-02). The owner merged it (`ac96497`) and the branch
  restarted from `main` there.
- Layer 1 (the core) is proven: all six of SLATE's core engines, at the owner's word ("Every single one of them"), the
  full gate green in a fresh clone of the branch at `47bfeac7fda9`, recorded in `registry/layers.json` (2026-11-02).
  The owner merged it (`3ccce87`) and the branch restarted from `main` there.
- Layer 2 (the world) is proven: all six of SLATE's world engines, at the owner's word ("Every single one of them"),
  its research read again at every source and every blocker tried again; the full gate green in a fresh clone at
  `e3c205c47ce3`, recorded in `registry/layers.json` (2026-11-03). The owner merged it (`dd4e83a`) and the branch
  restarted from `main` there.
- Layer 3 (the person's papers and money) is proven: all nineteen of SLATE's layer 3 engines, at the owner's word
  ("Every single one of them"), its research taken through three waves and four web-search rounds (below); the full
  gate green on GitHub Actions in a fresh clone at `e8b573910dad`, recorded in `registry/layers.json` (2026-11-04).
  The owner merged it (`88256bf`) and the branch restarted from `main` there.
- Layer 4 (the person) is built but **not proven**: all ten of SLATE's layer 4 engines, at the owner's word
  (2026-11-04: "All ten"), identity, attributes, acting, directing, producing, work (the screenwriter's), genres,
  unions, permits and youth, brought over as SLATE wrote them with their compilers, research, 26 coverage matrices,
  2,107 register entries, 15 catalog lines, six deciders and 33 effects; every compiler's output is byte for byte
  SLATE's on the rebuild's data, until the owner's rulings of 2026-11-04 rebuilt it around the life's own productions (Assumptions): casting and spec sales went, then the actor's Auditioning attribute and Camera's self-taping part ("Remove them (Recommended)"), the writers' compiled hold-until-photography and option terms, and the headshot research, with R-5213 and R-5216 retired; the director's pitch joined the financing. Its research was taken through one wave on 2026-11-04 (thirteen research agents and their follow-ups on the blockers, the secondaries and a re-read of the found sources, then six integrators, one per engine: the actor's, director's, producer's and writer's markets, the youth rules and the work permits), merged as 1,669 entries rewritten, 18 new and 40 blockers closed; the register stands at 7,016 entries (4,288 found, 680 secondary, 2,032 blocked, 16 game). A series' or a play's fund, credit and release are still refused while their UK research (read 2026-11-04) is wired. Layers 5 to 7 have not started (6 is
  dropped).

What layer 3 holds, ported from SLATE (`montrealroots/SLATE` at `acf1874`), changed where a ruling or the sources say:

- The papers (`src/papers`: passports, ids, citizenship, visits, ages, work, numbers, residence, licence) and the money
  (`src/money`: banks, accounts, ledger, cards, credit, rates, means, formats, units, tax), with their compilers,
  research sources (`research/sources/papers`, `research/sources/money`, and `research/sources/person/ages`, which the
  ages engine reads), coverage matrices, catalog lines, the `money.account` decider and sixteen effects. Work permits
  (`papers.permits`) are layer 4's and did not come.
- Ids: layer 2's four new entries had taken R-4236 to R-4239, which SLATE's register already gives to two licences, a
  card and an island's cards; ours moved to R-9680 to R-9683, above SLATE's highest (R-9679), and every new id since
  starts above them (R-9684 to R-9723 so far).
- Player text the catalog-text check stopped and that was reworded: "licence" (British) to "license"; "you are taxed"
  to "you're taxed"; "{country} offers" (read as a count) to "{country} has no bank that offers a credit card".
- Five consumer anchors in accounts and tax named layer 4's commands (`acting.perform`, `directing.prep`,
  `script.pitch`, `producing.shoot`, `youth.release`); four came back with layer 4 on 2026-11-04, and `script.pitch`
  went with the spec sales the owner removed that night.
- Research wave 1 (2026-11-03, nine agents, five integrating, the lead holding the register and checking figures at
  their sources): every one of layer 3's 783 blockers re-attacked. Found, and their rows now researched: passports of
  Sierra Leone, Tuvalu, Turks and Caicos, Eswatini; work routes of Kuwait, Tuvalu, Eswatini; residence of South Korea,
  Costa Rica, Ecuador, Tuvalu; account numbers of Cape Verde; national numbers of Angola, Kosovo, Fiji; cards of the
  Isle of Man, Belize, Tanzania; credit records of Nigeria, Svalbard, San Marino; banks of Gabon, Somalia, São Tomé (the
  banks engine now holds a fee by average-balance band); nine licences (Marshall Islands, Tonga, Tuvalu, Bhutan, Cook
  Islands, Isle of Man, Jersey, Latvia, Turks and Caicos); ages of eight countries and the Bahamas, Belarus, Jersey,
  Kyrgyzstan; tax of Azerbaijan, Canada, Grenada, Georgia, Russia. Many more were found in part and stay blocked on
  what is missing. Held figures found out of date and fixed: North Macedonia's July 2026 contribution split, Grenada's
  insurable ceiling (5,200), Canada's provinces' and six US states' ages, SWIFT's IBAN Registry (release 103 changed
  BR, CZ, JO, PL, PT and ST; the 105 IBAN facts now stand on SWIFT's own registry, found, not secondary). Recorded for
  2027: Belgium's tax-free base, Angola's new personal income tax, Mongolia's bands. Rulings applied: a check algorithm
  stands only where a primary states it (Benin's, Côte d'Ivoire's, Senegal's, Algeria's and Mozambique's keys were
  worked out from real numbers only, so their checks stay blocked); a law not in force is not the rule (Samoa's credit
  register Act); a government's page about another country is a lead, not a source, unless it names the primary.
- The web-search pass, round 1 (2026-11-03, the same session once its search allowance answered again): nine agents,
  each held to 20 searches (about 176 in all), searched about 170 of the blockers wave 1 couldn't, and five integrated
  what they found. Found, and their rows now researched: Algeria's BNA card, Saint-Pierre and Miquelon's national
  number, the Marshall Islands' residence routes, the Maldives' licence, the ages of Belize, Israel, Jordan, Nicaragua,
  Suriname (21 until 1 May 2025, 18 since), Tunisia, Nepal, Seychelles, El Salvador, Tajikistan and Venezuela, and the
  tax of Chile, Liberia, Morocco (and Western Sahara with it), Peru and the Philippines. Some forty more were found in
  part and stay blocked on what is missing. Fixed on the way: Algeria's banks note gave BNA's packs as from 200 dinars
  a month, where BNA's conditions of November 2025 give 100; a comment held that Christmas Island's licences are
  Western Australia's, where Western Australia issues none there.
- The web-search pass, round 2 (2026-11-03, evening): nine agents again held to 20 searches each (about 178), and five
  integrators. Found, rows researched: the bank accounts of Mauritania (Bankily) and Yemen (Shamil Bank); the work
  routes of Kiribati and Cuba (Cuba's under Ley 173 and Decretos 136 and 137, in force from 1 November 2026, read in the
  Gaceta Oficial; Cuba's residence entry now stands on the same Gaceta, not a secondary); the ages of Brunei, Mali,
  Malawi and Sint Maarten; the tax of Micronesia, Jordan, Eswatini and Tonga. About fifty more found in part and
  recorded. An agent's misreading caught at integration: Cambodia's salary-tax scan is Sub-Decree No. 09, not 196, and
  its first band starts at KHR 1,300,000; it wasn't used.
- The web-search pass, round 3 (2026-11-03, night): nine agents held to 20 searches each, five integrators. Found, rows
  researched: Ghana's and Nunavut's licences (and so Canada's row), Kosrae's and Yap's; Papua New Guinea's TIN; South
  Georgia's tax number (none is issued: the Ordinance, its Regulations and its Guide read whole); Turkmenistan's
  Vnesheconombank cards; Jersey's tax (no relief for authors: the whole Income Tax Law read); the ages of the Comoros,
  Yemen (majority 15, Civil Law art. 50), Angola and Cuba. About fifty more found in part. Held back by the lead:
  Chuuk's licence, read only in the 2001 draft Chuuk State Code, which its own index says is not yet enacted, so it
  stays blocked (papers.licence.blocked.FM.03), the draft a lead. Rulings this round: a value taken from WebFetch is a
  model's summary, so it is read verbatim before use; a fact resting on a primary read whole and found silent stands;
  a length seen on real numbers or a form's grid is a lead.
- The web-search pass, round 4 (2026-11-03, late night): seven agents held to 20 searches each, four integrators, and
  every layer 3 blocker now has a web search dated 2026-11-03. Found, rows researched: Saint Helena's cards (none: the
  Bank of St Helena, its own About Us page says the only banking facility on the island, issues no credit card, by its
  tariff of 1 April 2026); the tax of Bermuda, the Caribbean Netherlands, Luxembourg and Puerto Rico (no rule for
  authors: each law read whole) and Libya (Law 7/2010 art. 33 exempts writing books, a secondary copy naming the
  Gazette); the ages of the Central African Republic (majority 18), Tanzania (work from 14, s. 77 of the Law of the
  Child Act) and Chad (majority 21). An error found and fixed: Laos' Law No. 88/NA (Official Gazette, published
  19 June 2026; art. 38(4.4), read by the lead on the page image) taxes a resident performer's income above the minimum
  wage at 5%, not the 10% the engine held, and copyright at 5%; non-resident artists stay at 10% (art. 48). Its start
  is recorded both ways (art. 74's 1 September 2025 on its conditions; 1 July 2026 by law firms): either puts 5% in
  force today. North Korea's working age: the engine keeps 16; Korean press reports a 2024 revision raised it to 17,
  recorded as a lead with no text found.
- An error found and fixed in this session's own tools: the Common Crawl lookup script read CloudFront's error pages as
  an empty index, so some archive attempts recorded "no captures" where the crawl holds captures. The lead fixed the
  script to fail loudly, re-ran all 301 such lookups (184 attempts), and found 17 attempts wrong; each now says so in
  the past tense and is followed by its re-run, whose captures two agents opened (robots.txt files, bot-check pages and
  redirects, and pages without the fact: no fact changed). PacLII's and the BPK's robots.txt bar Common Crawl's
  crawler, so the Wayback Machine is the only archive route for them.
- Wave 2, first pass (2026-11-03, night): eleven agents (15 searches each) sought the primary behind each of layer 3's
  737 facts held at second hand; seven integrators, one per engine. The primary was reached for every figure of 149
  entries, for some of 158, and for none of 430. 120 entries now stand on primaries alone (citizenship 47, visits 21,
  work, banks and numbers 20, ages and licence 10, tax and credit 9, residence and passports 7, ids 6); every
  secondary source that answered was re-read and dated 2026-11-03. Errors found and fixed (the primary read by the
  integrator, the lead re-reading Mauritania's and Nigeria's): Mauritania's working age 16, not 14 (Loi 2024-48, art.
  153); Dominica's naturalisation 7 years, not 8, Ghana's 6, Mauritius' 6, Tanzania's 8; Kosovo's Law 10/L-023 (Gazette,
  6 May 2026) ends birthright for permanent residents' children; Costa Rica's and Bahrain's birthright conditional;
  Nepal's descent from either parent; Panama's renunciation; Montenegro's decree 158/2026 (from 1 November 2026: Belarus,
  Russia, Saudi Arabia and Turkey need a visa) and about forty other countries' visa lists; Latvia's permit fee EUR 160,
  not 100; Bulgaria's single permit three years, not one; Libya's credit register (the Central Bank's 2023 regulation:
  negative records kept 10 years), where the engine held none; Vietnam's first VND 20 million of each royalty untaxed
  (Law 109/2025); Gabon's capped allowance; Argentina's first DNI free; Moldova's, Mongolia's and Turkey's card fees;
  Czechia's birth number now checked (divisible by eleven, s. 13; the numbers engine's check mutation-tested 78 of 78).
  Greece's Z.3 route for actors (Migration Code art. 70) was added to residence. Held back by the lead: Fiji's birthright
  (the immigration ministry says unconditional, GLOBALCIT none, the Act unread, so none stays) and Kyrgyzstan's credit
  keep (the National Bank's rules of January 2025 say five years, but predate the 2026 law the press reports at two, so
  two stays).
- Wave 2, second pass (2026-11-03, late night): ten agents re-sought the primary for the 431 facts the first pass
  didn't reach, by other routes (embassies' and consulates' pages, the French state's open-data copy of its legal
  database, gazette mirrors, Common Crawl, OCR in 68 languages); seven integrators. 69 more entries now stand on
  primaries alone. Errors found and fixed: Fiji's birthright is unconditional (Citizenship of Fiji Act 2009, s. 6, read
  on laws.gov.fj by the agent and re-read by the lead; the first pass's hold, made only because the Act hadn't been
  read, was reversed); Oman's naturalisation 15 years, not 20 (Royal Decree 17/2025), Senegal's 10, not 5; Bhutan's
  descent needs both parents (held as either parent, the form having no such value, the note saying so); Mauritania's
  and Yemen's descent through the father; Laos lets performers work from 12 (Ministerial Agreement 4677 of 2023,
  gazetted 10 July 2026); Nepal's child band runs to 18; Guinea's and the Maldives' first identity card free;
  Morocco's child card ends before 12, and every minor's passport costs 500 DH; Burundi's passport 300,000 BIF;
  Rwanda's negative credit kept 5 years, not 7 (Law 73/2018); about twenty visa lists (Cambodia, Belarus, Namibia,
  Sierra Leone, Libya, Tunisia among them). Zimbabwe's age of majority stands on ZimLII's copy of the Act, now cited
  as secondary.
- Leads for Wave 3 or a later pass: residence fees found in other engines' sources (Morocco's card at 100 DH a year,
  Viet Nam's, Costa Rica's US$30, South Sudan's cards); Angola's citizenship tests (language, civics), which its law
  states and the form holds but weren't brought in; laws reported but unread (Cuba's Ley 172/2024, Kuwait's 2024 and
  2026 amendments, Lesotho's 2018 dual-citizenship gazette, Belarus' Instruction 291 of June 2026, Nicaragua's Ley
  987, Mali's biometric card of 2023, Tonga's 2020 revised Act); Guyana's list (Germany left out, set to need a visa)
  and the United States' visa waiver list (Romania) to confirm; a second reader for the Dhivehi (Maldives) and Khmer
  (Cambodia) texts.
- Wave 3 (2026-11-03, night): every source of layer 3's 3,258 found facts read before that day was read again. A
  script fetched all 5,522 addresses and checked each quoted fragment verbatim: 5,220 sources matched and were re-dated
  by the lead (the 12 addresses cited twice in one entry with mixed results were left to the agents); nine agents, one
  per engine, read the 1,668 that didn't match by hand (pages drawn by script, PDF columns, scans by OCR, moved pages),
  and two release agents re-read the World Inequality Database (its bulk file of 30 October 2026: all 2,588 quoted rows
  unchanged, the series still ending at 2024) and the Treasury's and central banks' exchange rates (latest record date
  still 2026-09-30). 3,143 of the 3,258 now have every source read on 2026-11-03; the other 180 sources answered with a
  bot check, a failed connection or an expired certificate (none was got past), keep their earlier dates, and their
  files say what was tried; such a fact stays found on its earlier read, as it isn't contradicted. Changes from the
  sources as they stand: Saudi Arabia's AlJazira card rate 2.9% a month (was 2.20%); Belarus' card rates (the
  refinancing rate fell); Uruguay's OCA rate 55% from 1 November 2026 (was 61%); Argentina's Banco Nación card fees
  from the bank's own schedule (11,447.81 a month and 203,534.10 a year, the central bank's register still showing the
  older); OP's account fee in Finland rising to 2.60 euros from 2027; Singapore's identity card registered at school
  ready in a month; Mauritania's lost 64-page passport 12,000 MRU; Ireland's passport terms (10 years for an adult, 5
  for a child, from the Department's fees page); British Columbia's full licence from 20, not 21 (ICBC's learner
  stage now one year; re-read by the lead); Western Australia's exchange list gaining 14 countries from 31 October
  2026; Uruguay's UR for October 2026; South Sudan's pound from 30 October 2026; Denmark's 2027 tax scale, dated
  2027-01-01 (its municipal rate is the 23.39% Copenhagen's own budget annex assumed, the adopted rate unread). WID's
  codes were written wrongly in the notes (ahwealj992 for ahweal992j) and are corrected.
- The register: 4,933 entries, 3,562 found, 592 secondary, 779 blocked (layer 3: 3,258 found, 550 secondary, 686
  blocked).


What layer 2 holds, ported from SLATE's world (`montrealroots/SLATE` at `acf1874`), changed where a ruling or today's
sources say:

- `world.gazetteer` (`src/world/gazetteer`): every country and territory (252), first-level region (3,865) and
  populated place, read from today's GeoNames release, as the owner ruled: the dump of 2026-11-02, 171,750 places in
  246 countries, where SLATE's of 2026-10-26 had 171,654 (104 added, 8 removed, 133 changed). The place axis is held to
  171,750 (register R-0032 to R-0034).
- `world.map` (`src/world/map`): Natural Earth's outlines and every place marked on them.
- `world.clock` (`src/world/clock`): real time in the town's local time, play, pause and advance; its three commands'
  falsifiers moved beside it (`tests/world/clock/effects.test.ts`) from SLATE's layer 3 test.
- `world.weather` (`src/world/weather`): each town's climate from its station's normals, the day's weather drawn
  around them by four deciders, the forecast.
- `world.holidays` (`src/world/holidays`): every country's public holidays in its own calendars. The calendars compile
  on ICU 78.3, this Node's, not SLATE's 77.1: one Hebrew year moved (5806, from Kislev, and 1 Tishri 5807 to
  2046-10-01), the fix of ICU-23069, which Calendrical Calculations' rules and Hebcal confirm (register R-0106).
- `world.prices` (`src/world/prices`): each country's price level from the World Bank's ICP figures.
- The catalog-text check stopped one of SLATE's lines ("so every day there is kept as an ordinary one", a place and a
  passive, not a "there's"); it now says "each day in {country} is kept as an ordinary one".
- 1221's geo-check is held by the place axis and each engine's run over every place of the map.
- Research, read again on 2026-11-02 at every one of the layer's 1,082 sources, every blocker tried again by all five
  methods (eight research agents in parallel, three integrating, the lead verifying at the sources and holding the
  register). Of 108 blockers, 15 were found: Andorra's and the Falklands' normals and parts of South Georgia's,
  Saint-Martin's and Montserrat's (averaged from the services' own records by WMO-1203, as R-0073 did); St Kitts and
  Nevis's and the Northern Mariana Islands' price levels (Saipan's index standing for the Commonwealth); the holidays of
  Prince Edward Island, Yukon, Haryana, Andaman and Nicobar, South Australia, Kelantan, the Isle of Man, Tanzania, the
  Bahamas, St Vincent and Brunei. Laos, Myanmar, Suriname, Gambia, Punjab and Kedah were found in part and stay blocked
  on what's missing; Niue's normals (2 to 5 years) fall short of the WMO's rule. Held data found wrong and fixed: Ghana's
  Boxing Day 2026 is observed Monday 28 December; Egypt lacked Sinai Liberation Day, 25 April 2026 (its entry, held at
  second hand, now stands on the Cabinet's own decisions); India lacked six of the Reserve Bank's days. Newly
  published and added: Oklahoma's 2027, Kyrgyzstan's 27 January 2027. Primaries found for CZ, GE, HR, BY and KH. The
  register: 441 entries, 306 found, 42 secondary, 93 blocked; 893 sources that read the same are dated 2026-11-02.
- What couldn't be reached today, recorded in each entry: web.archive.org (every archive attempt; Common Crawl's
  copies stood in where it held one), and pages behind bot checks or failing TLS (Lithuania's e-seimas, PacLII,
  gazettes.africa, the Marshall Islands' statistics office, Rwanda's and Botswana's data portals, the Bureau of
  Meteorology). None was forced.

What layer 1 holds, ported from SLATE's core (`montrealroots/SLATE` at `acf1874`), changed only where a ruling or
today's sources say:

- `core.time` (`src/core/time`): the calendar's arithmetic, time zones compiled from IANA's tzdata as zic compiles
  them, sunrise and sunset by NOAA's method, local time. On tzdata 2026f (2026-10-27), not SLATE's 2026e: Cuba stays on
  -04 through 2027-11-07, and Brazil's 1965 and 1966 DST ends are corrected. Its signature is good from Paul Eggert's
  key; against 2026e only the Cuba and Brazil rule sets differ; zic's transition code is line for line the same
  (register R-0001, R-0003, R-0005). Every zone is held to zic and zdump, and to the ICU zones in Node (tz 2026e), where
  only America/Havana may now differ.
- `core.rng` (`src/core/rng`): SplitMix64 streams keyed by the life's seed and a named decider through FNV-1a 64. No
  decider is registered yet; each comes with the engine that reads it.
- `core.money` (`src/core/money`): amounts in whole minor units, ISO 4217's 155 currencies in use (list one of
  2026-09-17, byte for byte what SIX publishes today).
- `core.frame` (`src/core/frame`): a life's state, commands, scheduled kinds, the passing of time, notices.
- `core.text` (`src/core/text`): the text catalog (seven lines so far, the device store's) and Title Case.
- `core.persistence` (`src/core/persistence`): lives on this device only (the owner, 2026-11-02): IndexedDB with
  local storage behind it, gzip, a copy before every write. SLATE's Base44 server store, its backend functions and
  their catalog lines and coverage rows did not come over, nor the store's `where`, which nothing read without them;
  the schema version is pinned in one place. A life saved, opened and played on is tested on the frame alone
  (`tests/core/persistence/continue.test.ts`); SLATE's version played a layer 3 card, which comes back with it.
- Two checks join the gate: title-case (SLATE's, reading the rule from `src/core/text/case.ts`, with
  `registry/names.json`) and catalog-text (1221's plural-check, voice-check, tics, spelling and typos, over the
  catalog's lines: 27 countable nouns, 14 contraction rules at a budget of zero, 9 tics and lists that open alike at
  1221's density per line of prose, 150 British spellings with 142 real names left as written, 150 misspellings and
  doubled words). The tools that compile time zones and currencies come with their tests (`tests/tools/tzdb.test.ts`,
  `tests/core/money/money.test.ts`) and are mutation-tested; the USNO reader (`tools/research/usno-sun.ts`) is not.
- Research: all 27 register entries read again on 2026-11-02 at their sources, each dated so. Beside the tz release,
  every one says what SLATE read: the 108 USNO sun answers are identical, the ISO 4217 list is byte for byte the same,
  and the calendar, NOAA, SplitMix64, FNV-1a and Amendment 170 sources hold the figures the register cites.

What layer 0 holds, ported from SLATE's gate as it stood on 2026-11-02 (`montrealroots/SLATE` at `acf1874`), which
SLATE proved at a 100% mutation score:

- The toolchain, pinned exactly and matched in the lockfile, the same 88 package versions as SLATE's: TypeScript
  6.0.3, React 19.3.0, Vite 8.3.4, Vitest 4.1.12, ESLint 10.12.0 with typescript-eslint 8.71.1, Stryker 10.0.0, tsx
  4.23.15; Node 22.23.4 (`.nvmrc`); npm 11.6.2 (`packageManager`). `.npmrc` saves exact versions and holds the
  engines strictly.
- The owner's documents (`CLAUDE.md` and everything under `docs/`) locked by SHA-256 in
  `registry/owner-docs.lock.json`.
- The gate (`gate/`): `npm run gate` on every commit (`.githooks/pre-commit`; red stops the commit, and
  `.githooks/commit-msg` writes the verdict into the message as a `Gate:` trailer), `npm run gate:full` (adds the
  audit and mutation testing; proves a layer; `.github/workflows/gate.yml` runs it on every push, in a clean clone),
  and `npm run gate:write` (rewrites `matrix/`). Its checks, each with fixture tests that show it biting:
  - toolchain: every package exactly pinned, the tools the build order names present, the lockfile agreeing, npm
    and Node pinned, an override never a second spelling of a pin.
  - owner-docs: the owner's documents unchanged, and nothing joining `docs/` unlocked.
  - build-order: every source file in a layer; no layer started before the one under it is proven; proofs
    contiguous (a dropped layer passed over, and never proven) and at commits this branch carries; imports only
    downward, and never outside `src/`. New here: a layer can be dropped, with who dropped it and when
    (`registry/layers.json`, layer 6).
  - text-inventory: every player-facing line in the text catalog (from layer 1, `core.text`), each said somewhere in
    the source, none in the engine's vocabulary (`registry/voice.json`); placeholder wording is unfinished work from
    layer 7, since there is no voice layer to rewrite it in (SLATE held it from its layer 6).
  - research-register: every entry found (primary source, page, date read, value), secondary (naming the primary it
    quotes), blocked (all five methods tried and dated, and the line telling the player what isn't modeled), or the
    game's own figure (its reason and its label to the player); no fact held twice; no date after today.
  - typecheck, lint (SLATE's own rules: no raw text in JSX, every control names its feature, every value shown sits
    inside an element naming its feature; no `Math.random`, `Date.now` or `new Date()` in the app), tests.
  - feature-matrix: every feature on a page (`data-feature`), with `@slate:reads`, `@slate:bites` and
    `@slate:downstream` anchors resolved to file and line (downstream outside the files that draw it), and a passing
    falsifier (`tests/support/falsify.ts`) for the bite and the downstream effect, whose outcome is state, never a
    sentence.
  - effects: every command, scheduled kind and notice declared in `src/` registered with what it changes, read by a
    consumer anchored at a file and line (or awaiting a named later layer), and each command and kind falsified.
  - coverage: every engine declared with its matrices; one row per key of each axis, no more, no fewer; the country
    axis held to 252 and the place axis to its count; an engine that reads a place covers the country axis and names
    a passing test over every place; every row researched, proven, blocked or the game's, cited and held by a passing
    test, or pending (incomplete); every blocker cited by a row.
  - handoff: this file's sections, and the layer it names agreeing with the ledger.
  - doc-refs, new here, from `montrealroots/1221`'s `tools/doc-refs.mjs`: every file a doc names is there (this file, the README, the
    rules in `.claude/rules/`, the tools' docs; not the owner's locked documents, which name 1221's and SLATE's
    files). Its first run found two stale names in `.claude/rules/title-case.md`, now fixed.
  - generated: everything in `matrix/` exactly what the checks produce.
  - audit and mutation (full gate only): any known advisory red; Stryker over the gate's own code, static constants
    included, break threshold 100%.

1221's 23 gate checks, each placed (`CLAUDE.md`, Part 1, rules 6 and 7):

- Here now: doc-refs (as its own check); text-inventory and surfaces (the text inventory); effects, sweep and wired
  (the feature matrix and the effects check, which allow no unread declaration at all, so `montrealroots/1221`'s `docs/UNWIRED.json`
  ratchet has nothing to count: its count is held at zero); coverage and completion-matrix (the coverage
  matrices and the research register); deciders (the lint's ban on `Math.random`, and the seeded decider in
  layer 1).
- With layer 1's `core.text`, here now: title-case and label-sweep (SLATE's one title-case check); plural-check,
  voice-check, tics, spelling and typos (the catalog-text check). 1221's `typos.mjs` named punctuation slips in its
  header but held none, and voice-check's four stiff shapes were counted there and never failed it (the tics hold
  them), so none came over; nor did 1221's allowances, which named lines of its own files.
- With layer 2's gazetteer: geo-check (the place axis and the all-places test).
- Not brought: devmap, traceability, capabilities, inventory, student-matrix and guide-quotes held 1221's own
  documents (its dev map, its capabilities list, its catalogs, the school's student matrix, the guide's quotes); the
  School, the tutorial and the manual are out of the first build, and the rest is held by the matrices above.

## Next step

Layer 4's first research wave is integrated (2026-11-04). What is left before it is proven, with the research rounds
run as layers 2 and 3 had them (the briefs in `research/rounds/`: change the date, the scratchpad path and the groups,
keep the rules):

1. A series and a play are made in the UK since 2026-11-04 (the AVEC, Theatre Tax Relief, Arts Council England's
   project grants, the stage director's and playwright's minimums; the pick-up and recoup chances the game's own, told).
   Left: a production in the UK names no nation, so England's Arts Council stands for all four (the nations' own funds
   and Screen Scotland's and Creative Wales' series terms are read but not wired); the actor's minimums at subsidised and
   West End theatres aren't researched, so the life can't act there, nor act in and direct one play; when the ITC's
   2026/27 year begins isn't stated (the game reads it from 1 April, the agreement's revision day); then the other
   markets' series and plays, a research wave of its own.
2. What the integrators found and the engines can't read yet: Azerbaijan's rebate in dollars (the engine holds one
   currency a market), Canada's DGC 2026-28 and Mexico's STPC director rates, the DGA reaching the US Virgin Islands
   and the Northern Mariana Islands, Austria's stage minimums, Uruguay's and Ecuador's rate tables, the Hebrew
   theatre agreement; and for `papers.work` (layer 3) the exempt days the permit research found (Latvia 14, Hungary 10,
   Uruguay 90, Iceland's four weeks against the 90 days held, Singapore's ended performing-artiste scheme).
3. Older blockers still carry attempts recorded as "not tried"; each is to be tried and recorded as made. Research
   figures only casting and spec sales read (the actor's and screenwriter's calibration counts, R-4620's shares of
   parts, R-4622's spec deals, wealth by occupation and writing programmes) are to be taken out where nothing reads them.
4. Then the further web-search rounds on what stays blocked, and prove layer 4 on CI (`npm run gate:full`) and record it.
5. Left from layer 3, each the owner's call: a fifth web-search round on its 686 blockers; a third pass on its 550
   facts held at second hand; the four statistics offices the national-accounts search didn't reach (Gabon,
   Equatorial Guinea, Guinea-Bissau, Eritrea); the 180 sources that answered only with a bot check or a failed
   connection on 2026-11-03; the sweep for newer editions of dated fee schedules.

## Verification evidence

- Layer 3's proof: `npm run gate:full` green in a fresh clone of the branch at `e8b573910dad` on GitHub Actions (run
  41751636700, job 126317853090), after `npx -y npm@11.6.2 ci`: every check green; 1,699 of 1,699 tests, every place
  of the map through all thirty-one engines among them; the register's 4,933 entries clean; audit 0 advisories;
  mutation 100.00% (19,724 of 19,724 mutants killed, static mutants included); 14,555 s. The run before it, 41721795427
  at `69f3993`, scored 99.99%: one mutant survived in `tools/money/means/coverage.ts` (an empty array a stray key could
  replace unseen, the national-accounts change having been mutation-tested on its compiler alone); `e8b5739` killed it,
  53 of 53 in that file. The commit after the proof changed `registry/layers.json`, `HANDOFF.md` and the generated `matrix/LAYERS.md` alone.
- Layer 2's proof: `npm run gate:full` green in a fresh clone of the branch at `e3c205c47ce3` on GitHub Actions (run
  41547356832), after `npx -y npm@11.6.2 ci`: every check green; 1,369 of 1,369 tests, every place of the map through
  all six engines among them; audit 0 advisories; mutation 100.00% (9,815 of 9,815 mutants killed, static mutants
  included); 9,697 s. The session's own fresh-clone run was stopped twice before it finished, once by the container's
  restart and once at the two-hour limit of a background command; CI's run is the same command in a clean clone. The
  next commit, `b41aafe`, changed `HANDOFF.md` alone.
- Layer 1's proof: `npm run gate:full` green in a fresh clone of the branch at `47bfeac7fda9`, after
  `npx -y npm@11.6.2 ci`: every check green; 1,181 of 1,181 tests, the zic and zdump oracle and the ICU comparison
  among them; audit 0 advisories; mutation 100.00% (5,745 of 5,745 mutants killed, static mutants included); 778 s. It
  passed on the first full run.
- Layer 0's proof: `npm run gate:full` green in a fresh clone of the branch at `80e8d7438f9b`, after
  `npx -y npm@11.6.2 ci`: every check green; 225 of 225 tests; audit 0 advisories; mutation 100.00% (2,668 of 2,668
  mutants killed, static mutants included); 357 s.
- The full gate before it, at `b173964`, scored 99.89% (2,669 of 2,672), here and in CI run 1: three mutants
  survived (one equivalent in doc-refs, an ordering no test gave in effects, a key no test held absent in the
  layer ledger). `80e8d74` killed them; a mutation run over the three files killed all 571 of their mutants before
  the proof.

## Assumptions

- Own productions only (the owner, 2026-11-04: "Remember there is no casting because we're going to be in our own
  film if we every act"; and, asked, "Remove spec sales too" and "Union minimum from budget"): an actor plays only in a
  film the life itself produces or directs, with no breakdowns, submissions or auditions; a script is written for the
  life's own productions, never sold or optioned to another's; and a part one plays in one's own film is paid from
  that film's budget at the union's minimum for the part, through the production's accounts, tax and union rules.
  SLATE's ruling of 2026-11-01 had said the same and left casting and spec sales standing until the own-production
  work was built; layer 4 takes them out now.
- The four roles work as one (the owner, 2026-11-04: "Remember them 4 should work in cohesiveness"): screenwriter,
  producer, director and actor work on one and the same own production, each stage read by the next: the script the
  life writes is what its production develops, the production is the film it directs, and the parts in that film are
  the ones it may play. Asked on 2026-11-04, the owner ruled: the life holds any roles on a production, at least one ("Any
  roles, at least one"), a role it doesn't hold filled at a standard the game sets and says is its own; the production
  may make the life's own script or option others' material ("Both."); productions may be films, TV or stage ("Films,
  TV and stage"); and the work's quality is the average of the four roles' results ("Equal blend of four"). The lead
  decided from the rulings: a production names its country, by default the life's home; the director's and producer's
  pay come from the budget as the actor's does; the producer's financing replaces the "debut leads to a second" draw;
  the life's company signs with a union where the union's rules let a producer sign. Gender: a part is written for men,
  women, either or a non-binary performer, and the life plays a part written for its sex or for either, a they/them
  life any (the owner's ruling of 2026-11-01: "Actor (Male) Actress (Female) and for They/Them it could be either or").
- `src/person/work/career.ts` is the screenwriter's networking and selling, not the first SLATE's career engine (its
  `pro.*` engine), which stays out of the first build.

- The family means' income (the owner, 2026-11-03, after WID's own ratio proved unavailable: "National-accounts
  ratio"): WID's post-tax national income bands (adiinc992j) are scaled by each country's ratio of households'
  disposable income to national income from its official national accounts (the UN Statistics Division's tables or
  the statistics office's own); where none is published, the unscaled figure is kept and the player is told it
  includes public spending. Done for 83 countries on 2026-11-03 (74 from the UN Statistics Division's, Eurostat's,
  the OECD's and Statistics Norway's tables, 9 more from the statistics offices' own: Georgia, Thailand, Taiwan,
  Tunisia, Togo, Saudi Arabia, Singapore, the Philippines, Tajikistan) (ratios from 0.296, Qatar, to 0.952, Guatemala; the
  latest year from 2019 on, an older ratio recorded but not held; a net derived as gross less fixed-capital use
  stands, labelled; gross or households-with-NPISH stands where nothing narrower is published for that year); the
  other 132 keep the unscaled figure and the player's line (means.income-public) says it includes public spending.
  The other 132 were searched in their own statistics offices and central banks that night and publish no household
  disposable income account from 2019 on, or didn't answer (each file says which); Gabon's, Equatorial Guinea's,
  Guinea-Bissau's and Eritrea's offices weren't reached by that search and are left to a later pass.

- Slovakia's citizenship keeps the simple form (the owner, 2026-11-03: "Keep the simple form for Slovakia"): loss on
  taking another citizenship is held as no, though Act 40/1993 s. 9(16) takes it unless the person had five years'
  residence in the other state; the exception isn't modelled.

- Node 22.23.4 is pinned, the version this session runs and tests on, not SLATE's 22.22.0; both satisfy the engines
  range SLATE set (`>=22.13.0 <23`).
- The place axis holds 171,654, SLATE's count from the GeoNames release of 2026-10-26, until layer 2's gazetteer reads
  its own release and the count is set to it (the owner, 2026-11-02: not the 170,911; "today's GeoNames release").
- `registry/voice.json` keeps SLATE's banned patterns (the engine's vocabulary out of the player's sight), sourced to
  `CLAUDE.md` and `docs/STYLE.md`.
- `registry/pages.json` is empty: SLATE's pages were decided in its own documents, which are not here; each page is
  registered when the owner brings its screen over, in layer 5.

## Blockers and open issues

- This session's web-search allowance (200 searches, shared by every agent) is spent; it is why layer 3's research
  continues in a new session. Hosts that refuse this environment, recorded in the entries as each attempt's result:
  web.archive.org (Common Crawl's data.commoncrawl.org stood in), Légifrance, swift.com, the Bureau of Meteorology, and
  sites behind bot checks; none was forced.
- The full gate now takes about 2 h 40 min (9,815 mutants), longer than a session's background command may run, so
  layers are proven on CI from here; CI's job may run 340 minutes. CI also logs an error that the step summary
  (1,661k) is over GitHub's 1,024k; it fails nothing.
- None for layer 0.
- CI's actions moved from v4 (Node.js 20, which GitHub had stopped running) to exact releases on Node.js 24, each
  confirmed in its own repository on 2026-11-02 at the owner's word: `actions/checkout@v7.0.1` (2026-07-17),
  `actions/setup-node@v7.1.0` and `actions/upload-artifact@v7.0.2` (both 2026-10-07). Every input the workflow uses
  is still there; checkout's v7 change (refusing fork code under `pull_request_target` and `workflow_run`) touches
  no trigger here; setup-node now caches npm's downloads itself; upload-artifact still zips by default.

## Questions for the owner

- Three price levels stay blocked though a near figure exists, each for a reason the register's rules give: South
  Sudan (the IMF's linked series disagrees with the statistics bureau's own late-2024 months), Turkmenistan (the Asian
  Development Bank's index, which it labels its own estimate), Turks and Caicos (yearly inflation rates only, no
  index). Say if any should stand.
- Kelantan's 2027 substitute days apply its 2026 rule before its 2027 instruction is published, and Tanzania's Eid
  al-Hajj and Maulid 2026 are the stock exchange's dates pending the moon's sighting, as every lunar holiday is until
  announced. Say if either should wait for the official notice instead.
