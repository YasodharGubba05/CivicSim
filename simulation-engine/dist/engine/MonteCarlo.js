"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonteCarlo = void 0;
const Simulation_1 = require("./Simulation");
class MonteCarlo {
    constructor(numRuns, years, baseCitizens, baseBusinesses, govSettings) {
        this.numRuns = numRuns;
        this.years = years;
        this.baseCitizens = baseCitizens;
        this.baseBusinesses = baseBusinesses;
        this.govSettings = govSettings;
    }
    run() {
        let allScenarios = [];
        // Simple synchronous run for now - will be optimized/parallelized later
        for (let i = 0; i < this.numRuns; i++) {
            // deep copy base state so each run is independent
            const runCitizens = JSON.parse(JSON.stringify(this.baseCitizens));
            const runBusinesses = JSON.parse(JSON.stringify(this.baseBusinesses));
            const runGov = JSON.parse(JSON.stringify(this.govSettings));
            const sim = new Simulation_1.Simulation(runCitizens, runBusinesses, runGov);
            // Add random shocks?
            for (let y = 0; y < this.years; y++) {
                sim.runYear();
            }
            allScenarios.push(sim.metricsHistory);
        }
        // Aggregate Means
        const meanMetrics = [];
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
exports.MonteCarlo = MonteCarlo;
