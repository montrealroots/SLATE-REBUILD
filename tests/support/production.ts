import { minorUnits, money } from '../../src/core/money/money.ts';
import { currencyOf, HOME, MARKETS, type Project } from '../../src/person/producing/producing.ts';

/**
 * A production planned and financed by hand, for tests of a role's work on it where the producing isn't what is
 * tested: a film in a market (the US where none is named), the life holding every role, its budget (in minor units of
 * the market's currency) closed whole by equity. The producing engine's own tests hold how a production gets there.
 */
export function production(over: Partial<Project> = {}, budget = 500_000_000): Project {
  const market = over.market ?? 'US';
  // A market no producer works in (a test's) budgets in dollars.
  const b = money(market === HOME || Object.hasOwn(MARKETS, market) ? currencyOf(market) : 'USD', budget);
  return {
    id: 1,
    optioned: 0,
    format: 'film',
    series: null,
    minutes: null,
    roles: ['writer', 'producer', 'director', 'actor'],
    script: null,
    writing: null,
    genre: 'action',
    market,
    expires: null,
    options: [],
    material: 50,
    plan: { budget: b, needed: 32, scheduled: 32, fee: null, credit: null },
    applied: false,
    raised: { equity: b },
    shot: null,
    costs: [],
    release: null,
    ...over,
  };
}

/** A job as the directing engine's tests name it: its form, market, budget (major units), shooting days and running time. */
export interface Directed {
  form: 'feature' | 'hour' | 'half-hour';
  country?: string;
  budget?: number;
  shoot?: number;
  minutes?: number;
}

/**
 * The production a director's job is in: a feature's film or a one-episode series, made in the job's country (the US
 * where none), its budget the job's (a billion where it names none, so a fee never outruns it), its scheduled shooting days the job's (one where
 * none: the DGA sets an episode's), its running time the job's.
 */
export function directed(job: Directed, id = 1): Project {
  const market = job.country ?? 'US';
  const scale = 10 ** minorUnits(market === HOME || Object.hasOwn(MARKETS, market) ? currencyOf(market) : 'USD');
  const p = production({ id, market, roles: ['director'], format: job.form === 'feature' ? 'film' : 'series', series: job.form === 'feature' ? null : { form: job.form, episodes: 1 }, minutes: job.minutes ?? null }, Math.round((job.budget ?? 1_000_000_000) * scale));
  return { ...p, plan: { ...(p.plan as NonNullable<Project['plan']>), scheduled: job.shoot ?? 1 } };
}
