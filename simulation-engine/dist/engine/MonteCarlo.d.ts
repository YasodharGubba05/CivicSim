import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
import { EconomicMetrics } from '../models/Metrics';
export interface MonteCarloResult {
    meanMetrics: EconomicMetrics[];
    scenarios: EconomicMetrics[][];
}
export declare class MonteCarlo {
    private numRuns;
    private years;
    private baseCitizens;
    private baseBusinesses;
    private govSettings;
    constructor(numRuns: number, years: number, baseCitizens: Citizen[], baseBusinesses: Business[], govSettings: Government);
    run(): MonteCarloResult;
}
