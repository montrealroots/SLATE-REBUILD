import { describe, it } from 'vitest';
import { begin, dispatch, type Life } from '../../../src/core/frame/frame.ts';
import { daysFromCivil } from '../../../src/core/time/calendar.ts';
import { CLOCK_START, elapse, pause, play, type ClockSlice } from '../../../src/world/clock/clock.ts';
import { falsifyAny } from '../../support/falsify-core.ts';

/**
 * The clock's commands, falsified (CLAUDE.md, read, bite, downstream; the gate's effects check): change the input, and
 * the state it leaves changes, run through the frame as a life does. In SLATE these sat with the money engines' in
 * tests/money/effects.test.ts (layer 3); the clock is layer 2's, so they sit with it here.
 */
const T0 = daysFromCivil(2026, 1, 15) * 86_400 + 14 * 3600;
type S = { clock: ClockSlice };
const clockLife = (playing = false): Life<S> => begin('0123456789abcdef', T0, { clock: { ...CLOCK_START, playing } });

describe('the clock', () => {
  it('clock.play: played, real time moves the life on', () => {
    falsifyAny({ feature: 'clock.play', claim: 'bites', says: 'playing, five seconds pass', base: false, twin: true, outcome: (p) => elapse(p ? dispatch(clockLife(), play, null) : clockLife(), 5000).life.frame.now });
  });
  it('clock.pause: paused, real time moves the life on no more', () => {
    falsifyAny({ feature: 'clock.pause', claim: 'bites', says: 'paused, no time passes', base: false, twin: true, outcome: (p) => elapse(p ? dispatch(clockLife(true), pause, null) : clockLife(true), 5000).life.frame.now });
  });
  it('clock.counted: the real time played is counted, and the part of a second carried', () => {
    falsifyAny({ feature: 'clock.counted', claim: 'bites', says: 'more real time played, more counted', base: 1500, twin: 2700, outcome: (ms) => elapse(clockLife(true), ms).life.slices.clock });
  });
});
