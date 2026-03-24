import { Simulation } from './Simulation';
import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
import { EconomicMetrics } from '../models/Metrics';
import { deepClone } from '../utils/helpers';

export interface MonteCarloResult {
  meanMetrics: EconomicMetrics[];
  scenarios: EconomicMetrics[][]; // all raw paths
}

export class MonteCarlo {
  constructor(
     private numRuns: number,
     private years: number,
     private baseCitizens: Citizen[],
     private baseBusinesses: Business[],
     private govSettings: Government
  ) {}

  run(): MonteCarloResult {
    const allScenarios: EconomicMetrics[][] = [];

    for (let i = 0; i < this.numRuns; i++) {
      // Deep-copy base state so each run is independent
      const runCitizens = deepClone(this.baseCitizens);
      const runBusinesses = deepClone(this.baseBusinesses);
      const runGov = deepClone(this.govSettings);

      const sim = new Simulation(runCitizens, runBusinesses, runGov);

      for (let y = 0; y < this.years; y++) {
        // Apply random economic shocks before each year
        this.applyShocks(sim);
        sim.runYear();
      }

      allScenarios.push(sim.metricsHistory);
    }

    // Aggregate means
    const meanMetrics: EconomicMetrics[] = [];
    for (let y = 0; y < this.years; y++) {
      const yearSlice = allScenarios.map((scen) => scen[y]);

      let sumGdp = 0, sumUnemp = 0, sumMedInc = 0, sumInfl = 0, sumBudg = 0, sumGini = 0;
      yearSlice.forEach((m) => {
        sumGdp += m.gdp;
        sumUnemp += m.unemploymentRate;
        sumMedInc += m.medianIncome;
        sumInfl += m.inflationRate;
        sumBudg += m.governmentBudget;
        sumGini += m.giniIndex;
      });

      const N = this.numRuns;
      meanMetrics.push({
        year: y + 1,
        gdp: sumGdp / N,
        unemploymentRate: sumUnemp / N,
        medianIncome: sumMedInc / N,
        inflationRate: sumInfl / N,
        governmentBudget: sumBudg / N,
        giniIndex: sumGini / N,
      });
    }

    return { meanMetrics, scenarios: allScenarios };
  }

  /**
   * Apply random per-year economic shocks to introduce realistic variance
   * across Monte Carlo runs. Each shock is small enough to be plausible
   * but large enough to spread the confidence band meaningfully.
   */
  private applyShocks(sim: Simulation): void {
    // Productivity shock: ±0–8% swing across all businesses
    const prodShock = 1 + (Math.random() - 0.5) * 0.16;
    sim.businesses.forEach((b) => {
      b.productivity = Math.max(0.1, Math.min(1, b.productivity * prodShock));
    });

    // Demand shock: ±0–6% consumer confidence swing
    const demandShock = 1 + (Math.random() - 0.5) * 0.12;
    sim.citizens.forEach((c) => {
      c.consumptionTendency = Math.max(0.1, Math.min(1, c.consumptionTendency * demandShock));
    });

    // Wage drift: ±0–3% adjustment
    const wageDrift = 1 + (Math.random() - 0.5) * 0.06;
    sim.businesses.forEach((b) => {
      b.wageLevel = Math.max(1000, b.wageLevel * wageDrift);
    });
  }
}
