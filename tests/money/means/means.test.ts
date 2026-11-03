import { describe, expect, it } from 'vitest';
import { money } from '../../../src/core/money/money.ts';
import { t } from '../../../src/core/text/text.ts';
import { aboutIncome, aboutMeans, FAMILIES, meansOf, PUBLIC_LINE, SAVINGS_UNKEPT_LINE, UNKEPT_LINE } from '../../../src/money/means/means.ts';
import type { CountryCode } from '../../../src/world/gazetteer/gazetteer.ts';
import data from '../../../src/money/means/means.json';

describe('means', () => {
  it("give each family's first morning, from its band of the country's adults", () => {
    expect(FAMILIES).toEqual(['nothing', 'scraping', 'modest', 'comfortable', 'wealthy', 'inherited']);
    // Norway: no survey read gives deposits by wealth band, so nothing in savings, and the player told so; its bottom
    // fifth's net wealth below nothing is a debt.
    const no = data.countries.NO;
    expect(meansOf('NO', 'modest')).toStrictEqual({ checking: money('NOK', no.families.modest.checking), savings: money('NOK', 0), debt: money('NOK', 0), year: 2024 });
    expect(meansOf('NO', 'nothing')?.debt).toStrictEqual(money('NOK', no.families.nothing.debt));
    expect(aboutMeans('NO')).toBe(t(SAVINGS_UNKEPT_LINE, { country: 'Norway' }));
    expect(aboutMeans('NO')).toBe("What a family in Norway keeps in the bank isn't known to this game yet, so it gives nothing in savings.");
    // The United States: the Fed's Distributional Financial Accounts, the middle fifth half in the bottom half's band
    // (11,498 dollars a household) and half in the next 40%'s (94,153): 52,825.50.
    expect(meansOf('US', 'modest')?.savings).toStrictEqual(money('USD', 5_282_550));
    expect(aboutMeans('US')).toBeUndefined();
    // Hungary's survey is published in euros, its WID figures in forints.
    expect([meansOf('HU', 'modest')?.savings.currency, meansOf('HU', 'modest')?.checking.currency]).toEqual(['EUR', 'HUF']);
    expect(meansOf('US', 'inherited')?.checking.currency).toBe('USD');
    // A month of the family's own income: the database's post-tax national income times the country's ratio of
    // households' disposable income to national income. Norway's middle fifth, 86,104.00 kroner a month before, times
    // 2,030,778 over 4,560,822 (Statistics Norway, 2024, net): 38,339.17. Qatar's, 9,603.18 riyals, times 185,158 over
    // 625,940 million (UN Tables 4.6 and 4.1, 2019, gross): 2,840.70. Guatemala's, 3,200.48 quetzales, times 0.952
    // (2024, gross): 3,046.19. The United States', 5,676.92 dollars, times 0.856 (2024, net): 4,860.02.
    expect([meansOf('NO', 'modest')?.checking, meansOf('QA', 'modest')?.checking, meansOf('GT', 'modest')?.checking, meansOf('US', 'modest')?.checking]).toStrictEqual([money('NOK', 3_833_917), money('QAR', 284_070), money('GTQ', 304_619), money('USD', 486_002)]);
    // Each family up the bands has more a month, in every country the game knows.
    for (const [code, m] of Object.entries(data.countries)) {
      const months = FAMILIES.map((f) => m.families[f].checking);
      expect(months, code).toEqual([...months].sort((a, b) => a - b));
    }
  });

  it("tell the player where a family's income counts public spending", () => {
    expect(PUBLIC_LINE).toBe('means.income-public');
    // Argentina: no national accounts' ratio held, so a family's income is the database's post-tax national income as
    // it stands, 1,152,793.44 pesos a month for the middle fifth.
    expect([meansOf('AR', 'modest')?.checking, aboutIncome('AR')]).toStrictEqual([money('ARS', 115_279_344), t(PUBLIC_LINE, { country: 'Argentina' })]);
    expect(aboutIncome('AR')).toBe("In Argentina, a family's income in this game includes public spending such as schools and health care, so it's more than a family there really takes home.");
    // Where a ratio is held, nothing to tell; nor where the family's means aren't known (the player's told that).
    expect([aboutIncome('US'), aboutIncome('QA'), aboutIncome('VA')]).toEqual([undefined, undefined, undefined]);
    const told = Object.entries(data.countries).filter(([code]) => aboutIncome(code as CountryCode) !== undefined).length;
    expect([told, Object.keys(data.countries).length]).toEqual([141, 215]);
  });

  it("tell the player what the game doesn't know", () => {
    expect([UNKEPT_LINE, SAVINGS_UNKEPT_LINE]).toEqual(['means.unkept', 'means.savings-unkept']);
    // The Vatican: the database gives none of its figures.
    expect(meansOf('VA', 'modest')).toBeUndefined();
    expect(aboutMeans('VA')).toBe(t(UNKEPT_LINE, { country: 'Vatican' }));
    expect(aboutMeans('VA')).toBe("What a family in Vatican has to give isn't known to this game yet.");
  });
});
