import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { begin, defineCommand, defineKind, defineNotice, dispatch, pass, type Life } from '../../../src/core/frame/frame.ts';
import { DeviceStore, indexedStore, PACKED } from '../../../src/core/persistence/local.ts';
import type { Decider } from '../../../src/core/rng/rng.ts';
import { daysFromCivil } from '../../../src/core/time/calendar.ts';
import { SEED, kept } from './support.ts';

const at = (y: number, m: number, d: number, h = 9) => daysFromCivil(y, m, d) * 86_400 + h * 3600;
const MONTH = 30 * 86_400;

/**
 * SLATE's KEEP entry 1 test, on the core alone: a life saved partway through opens as it was and plays on identical.
 * SLATE held it with a real card of its catalog (layer 3), which isn't here yet, so this life is played on the frame
 * itself: a wage that comes each month, drawn from the life's seed, schedules the next and leaves a notice, and the
 * player spends from it. It's a played life, not an idle one: draws made, items come and gone, the schedule holding the
 * next one when it's saved. Layer 3 brings the card's own test back beside this one.
 */
interface Purse {
  purse: { minor: number; paid: number };
}
const PAID = defineNotice('test.continue.paid');
const wage = defineKind<Purse>({
  kind: 'test.continue.wage',
  wants: false,
  reads: [],
  writes: ['purse', 'schedule', 'notices'],
  happen: (s, item, ctx) => {
    const amount = 100_000 + ctx.draws('test.continue.wage' as Decider, item.at).below(50_000);
    s.purse.minor += amount;
    s.purse.paid += 1;
    ctx.notify(PAID, amount);
    ctx.schedule('test.continue.wage', item.at + MONTH);
  },
});
const start = defineCommand<Purse>({ id: 'test.continue.start', reads: [], writes: ['schedule'], run: (_s, _a, ctx) => void ctx.schedule(wage.kind, ctx.now + MONTH) });
const spend = defineCommand<Purse, number>({ id: 'test.continue.spend', reads: [], writes: ['purse'], run: (s, minor) => void (s.purse.minor -= minor) });

describe('a life saved, opened and played on', () => {
  it('ends where the life never saved ends', async () => {
    let life: Life<Purse> = begin(SEED, at(2026, 1, 15), { purse: { minor: 0, paid: 0 } });
    life = dispatch(life, start, null);
    life = pass(life, at(2026, 4, 20)).life;
    life = dispatch(life, spend, 12_050);
    expect(life.frame.notices.filter((n) => n.kind === PAID)).toHaveLength(3);
    expect(life.frame.schedule).toHaveLength(1);

    const factory = new IDBFactory();
    await new DeviceStore(indexedStore(factory)).save({ ...kept(1), life: life as unknown as Life });
    expect((await indexedStore(factory).getItem('slate.life.1'))?.startsWith(PACKED)).toBe(true);
    const opened = (await new DeviceStore(indexedStore(factory)).load(1))?.life as unknown as Life<Purse>;
    expect(opened).toEqual(life);

    const playOn = (from: Life<Purse>) => dispatch(pass(dispatch(pass(from, at(2026, 6, 1)).life, spend, 5_000), at(2027, 4, 20)).life, spend, 1_000);
    const never = playOn(life);
    expect(playOn(opened)).toEqual(never);
    // The year played on moved the life: twelve more wages, each drawn, and the purse they left.
    expect(never.frame.notices.filter((n) => n.kind === PAID)).toHaveLength(15);
    expect(never.slices.purse.minor).not.toBe(life.slices.purse.minor);
    const wages = never.frame.notices.filter((n) => n.kind === PAID).map((n) => n.data);
    expect(new Set(wages).size).toBe(wages.length);
  });
});
