export interface Government {
  id: 'gov';
  incomeTaxRate: number; // e.g. 0.20 for 20%
  corporateTaxRate: number; 
  minimumWage: number;
  subsidyPolicies: number; // total budget allocated for subsidies
  universalBasicIncome: number; // per citizen amount
  budget: number; // currently accumulated wealth/deficit
}
