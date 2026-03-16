export interface Business {
  id: string;
  revenue: number;
  productivity: number; // 0-1
  workers: string[]; // array of citizen ids
  wageLevel: number;
  operatingCosts: number;
  prices: number; // pricing of goods
}
