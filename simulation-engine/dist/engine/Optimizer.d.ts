import { Citizen } from '../models/Citizen';
import { Business } from '../models/Business';
import { Government } from '../models/Government';
/**
 * Basic Heuristic Optimizer
 * Tries variations of policy parameters to find the one that best maximizes a target function.
 */
export declare class Optimizer {
    static optimize(target: 'maximizeGdp' | 'minimizeUnemployment' | 'minimizeInequality', baseCitizens: Citizen[], baseBusinesses: Business[], baseGovSettings: Government): Government;
}
