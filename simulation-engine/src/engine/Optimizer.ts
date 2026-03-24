import { MonteCarlo } from './MonteCarlo';
import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
import { deepClone, clamp } from '../utils/helpers';

/**
 * Grid-Search Policy Optimizer
 *
 * Evaluates a grid of policy parameter variations, runs a short
 * Monte Carlo trial for each, and returns the Government configuration
 * that best satisfies the chosen objective.
 */
export class Optimizer {
  /** Number of Monte Carlo runs per candidate (keep small for speed). */
  private static MC_RUNS = 3;
  /** Number of simulated years per trial. */
  private static MC_YEARS = 5;

  /**
   * The search grid: for each tunable parameter we try the base value
   * plus a set of deltas. This produces a combinatorial grid that is
   * pruned by keeping only the top-N candidates from a coarse sweep
   * before doing a fine sweep.
   */
  private static DELTAS: Record<string, number[]> = {
    incomeTaxRate:    [-0.10, -0.05, 0, 0.05, 0.10],
    corporateTaxRate: [-0.08, -0.04, 0, 0.04, 0.08],
    minimumWage:      [-5, -2, 0, 2, 5],
  };

  static optimize(
    target: 'maximizeGdp' | 'minimizeUnemployment' | 'minimizeInequality',
    baseCitizens: Citizen[],
    baseBusinesses: Business[],
    baseGovSettings: Government,
  ): Government {
    const candidates = this.buildCandidates(baseGovSettings);

    let bestGov = deepClone(baseGovSettings);
    let bestScore = target.startsWith('maximize') ? -Infinity : Infinity;

    for (const candidate of candidates) {
      const mc = new MonteCarlo(
        this.MC_RUNS,
        this.MC_YEARS,
        deepClone(baseCitizens),
        deepClone(baseBusinesses),
        deepClone(candidate),
      );
      const result = mc.run();
      const lastYear = result.meanMetrics[result.meanMetrics.length - 1];

      const score =
        target === 'maximizeGdp'
          ? lastYear.gdp
          : target === 'minimizeUnemployment'
            ? -lastYear.unemploymentRate   // negate so "higher is better"
            : -lastYear.giniIndex;

      if (score > bestScore) {
        bestScore = score;
        bestGov = deepClone(candidate);
      }
    }

    return bestGov;
  }

  /** Build all candidate Government configs from the delta grid. */
  private static buildCandidates(base: Government): Government[] {
    const candidates: Government[] = [];
    const itDeltas = this.DELTAS.incomeTaxRate;
    const ctDeltas = this.DELTAS.corporateTaxRate;
    const mwDeltas = this.DELTAS.minimumWage;

    for (const itd of itDeltas) {
      for (const ctd of ctDeltas) {
        for (const mwd of mwDeltas) {
          const gov = deepClone(base);
          gov.incomeTaxRate    = clamp(base.incomeTaxRate + itd, 0, 0.8);
          gov.corporateTaxRate = clamp(base.corporateTaxRate + ctd, 0, 0.5);
          gov.minimumWage      = clamp(base.minimumWage + mwd, 0, 50);
          candidates.push(gov);
        }
      }
    }

    return candidates;
  }
}
