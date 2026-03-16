import { Simulation } from './Simulation';
import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
import { EconomicMetrics } from '../models/Metrics';

export interface MonteCarloResult {
  meanMetrics: EconomicMetrics[];
  scenarios: EconomicMetrics[][]; // all raw paths
  // Future enhancements: stdDev, min, max
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
    let allScenarios: EconomicMetrics[][] = [];

    // Simple synchronous run for now - will be optimized/parallelized later
    for (let i = 0; i < this.numRuns; i++) {
        // deep copy base state so each run is independent
        const runCitizens = JSON.parse(JSON.stringify(this.baseCitizens));
        const runBusinesses = JSON.parse(JSON.stringify(this.baseBusinesses));
        const runGov = JSON.parse(JSON.stringify(this.govSettings));

        const sim = new Simulation(runCitizens, runBusinesses, runGov);
        
        // Add random shocks?
        for (let y = 0; y < this.years; y++) {
            sim.runYear();
        }

        allScenarios.push(sim.metricsHistory);
    }

    // Aggregate Means
    const meanMetrics: EconomicMetrics[] = [];
    for (let y = 0; y < this.years; y++) {
        const yearSlice = allScenarios.map(scen => scen[y]);
        
        let sumGdp = 0, sumUnemp = 0, sumMedInc = 0, sumInfl = 0, sumBudg = 0, sumGini = 0;
        yearSlice.forEach(m => {
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
            giniIndex: sumGini / N
        });
    }

    return {
        meanMetrics,
        scenarios: allScenarios
    };
  }
}
