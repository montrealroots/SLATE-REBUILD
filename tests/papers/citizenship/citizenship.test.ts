import { describe, expect, it } from 'vitest';
import { money } from '../../../src/core/money/money.ts';
import { t } from '../../../src/core/text/text.ts';
import { COUNTRY_CODES } from '../../../src/world/gazetteer/gazetteer.ts';
import data from '../../../src/papers/citizenship/citizenship.json';
import { aboutNaturalisation, atBirth, KEEP_UNKNOWN_LINE, keepingUnknown, keepsCitizenship, nationality, naturalisation, naturalise, NONE_LINE, UNKEPT_LINE } from '../../../src/papers/citizenship/citizenship.ts';

describe('citizenship', () => {
  it("is each state's own, and a territory's is its state's", () => {
    expect(COUNTRY_CODES.filter(keepsCitizenship)).toEqual(Object.keys(data).sort());
    expect([keepsCitizenship('DE'), keepsCitizenship('AQ')]).toEqual([true, false]);
    // Germany since 27 June 2024: five years, other citizenships kept either way; 255 euros, a language and a civics test.
    expect(naturalisation('DE')).toStrictEqual({ years: 5, renounce: false, fee: money('EUR', 25_500), test: ['language', 'civics'] });
    expect(naturalisation('JP')).toStrictEqual({ years: 5, renounce: true });
    expect(naturalisation('CA')).toStrictEqual({ years: 3, renounce: false, fee: money('CAD', 65_300), test: ['language', 'civics'] });
    expect(naturalisation('CN')).toBe('none');
    // Read in the law on 2026-11-03, where the dataset had them otherwise: Dominica's seven years (not eight), Ghana's six
    // (not five), Panama's renunciation (art. 10(1)); Kosovo's 2026 law gives no birthright to permanent residents' children.
    // Fiji's birthright was held none, the dataset's reading, while the Act couldn't be read; the second pass read s. 6 the
    // same night and it is unconditional. Oman's 2025 law asks fifteen years (not twenty), Senegal's Ministry of Justice
    // ten (not five), the Maldives' Act renunciation (not unknown); Mauritania's and Yemen's codes pass it by the father.
    expect([naturalisation('DM'), naturalisation('GH'), naturalisation('PA')]).toStrictEqual([{ years: 7, renounce: false }, { years: 6, renounce: false }, { years: 5, renounce: true }]);
    expect([naturalisation('OM'), naturalisation('SN'), naturalisation('MV')]).toStrictEqual([{ years: 15, renounce: true }, { years: 10, renounce: false }, { years: 12, renounce: true }]);
    expect([atBirth('XK')?.soil, atBirth('CR')?.soil, atBirth('FJ')?.soil, atBirth('NP')?.descent]).toEqual(['none', 'conditional', 'unconditional', 'either parent']);
    expect([atBirth('MR')?.descent, atBirth('YE')?.descent]).toEqual(['father', 'father']);
    expect([naturalisation('AQ'), nationality('AQ')]).toEqual([undefined, undefined]);
    // A territory's people hold their state's nationality under its rules; Svalbard's residence doesn't count.
    expect([nationality('GP'), nationality('GU'), nationality('HK'), nationality('DE')]).toEqual(['FR', 'US', 'CN', 'DE']);
    expect(naturalisation('GP')).toStrictEqual(naturalisation('FR'));
    expect(naturalisation('HK')).toBe('none');
    expect([nationality('SJ'), naturalisation('SJ'), naturalisation('NO')]).toEqual(['NO', 'none', { years: 8, renounce: false }]);
    // What naturalising does to the citizenships held.
    expect(naturalise(['FR'], 'DE')).toStrictEqual({ held: ['FR', 'DE'], unsure: [] });
    expect(naturalise(['GP'], 'DE')).toStrictEqual({ held: ['FR', 'DE'], unsure: [] });
    expect(naturalise(['JP'], 'US')).toStrictEqual({ held: ['US'], unsure: [] });
    expect(naturalise(['US', 'FR'], 'JP')).toStrictEqual({ held: ['JP'], unsure: [] });
    expect(naturalise(['GU', 'US'], 'FR')).toStrictEqual({ held: ['US', 'FR'], unsure: [] });
    expect(naturalise(['DE'], 'DE')).toStrictEqual({ held: ['DE'], unsure: [] });
    expect(naturalise([], 'GU')).toStrictEqual({ held: ['US'], unsure: [] });
    // Where no one is naturalised by residence, or a rule isn't kept, there's no answer.
    for (const [held, into] of [[['US'], 'SJ'], [['US'], 'CN'], [['US'], 'AQ'], [['AQ'], 'DE']] as const) expect(naturalise(held, into)).toBeUndefined();
  });

  it("tells the player what the game doesn't know", () => {
    expect([UNKEPT_LINE, NONE_LINE, KEEP_UNKNOWN_LINE]).toEqual(['citizenship.unkept', 'citizenship.none', 'citizenship.keep-unknown']);
    expect(aboutNaturalisation('AQ')).toBe(t(UNKEPT_LINE, { country: 'Antarctica' }));
    expect(aboutNaturalisation('AQ')).toBe("How Antarctica naturalises, and whether its citizens keep its citizenship when they take another, aren't known to this game yet.");
    expect(aboutNaturalisation('CN')).toBe("China doesn't naturalise anyone on residence alone.");
    // A territory under a state that naturalises no one is named by its state; one whose residence doesn't count, by itself.
    expect(aboutNaturalisation('HK')).toBe(t(NONE_LINE, { country: 'China' }));
    expect(aboutNaturalisation('SJ')).toBe(t(NONE_LINE, { country: 'Svalbard and Jan Mayen' }));
    expect([aboutNaturalisation('DE'), aboutNaturalisation('GP')]).toEqual([undefined, undefined]);
    // San Marino's own loss rule isn't known, so its citizenship kept is unsure. (The Maldives' renunciation was the one
    // unknown until its Act was read on 2026-11-03; a state whose renunciation isn't known is held in the forms' test.)
    const sm = naturalise(['FR', 'SM', 'JP'], 'DE');
    expect(sm).toStrictEqual({ held: ['FR', 'SM', 'DE'], unsure: ['SM'] });
    expect(keepingUnknown({ held: ['FR', 'DE'], unsure: ['FR'] })).toEqual([t(KEEP_UNKNOWN_LINE, { country: 'France' })]);
    expect(keepingUnknown(sm as NonNullable<typeof sm>)).toEqual(["Whether you'd keep your San Marino citizenship isn't known to this game yet."]);
    expect(keepingUnknown({ held: ['DE'], unsure: [] })).toEqual([]);
  });
});
