export interface Citizen {
  id: string;
  age: number;
  educationLevel: number; // 0-1 (low-high)
  skillLevel: number; // 0-1
  income: number;
  savings: number;
  consumptionTendency: number; // 0-1
  employmentStatus: 'employed' | 'unemployed';
  employerId: string | null;
}
