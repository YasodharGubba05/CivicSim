import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
import { EconomicMetrics } from '../models/Metrics';
export declare class Simulation {
    citizens: Citizen[];
    businesses: Business[];
    government: Government;
    metricsHistory: EconomicMetrics[];
    currentYear: number;
    constructor(initialCitizens: Citizen[], initialBusinesses: Business[], initialGovSettings: Government);
    runYear(): void;
    calculateMetrics(): EconomicMetrics;
}
