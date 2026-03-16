export interface Citizen {
    id: string;
    age: number;
    educationLevel: number;
    skillLevel: number;
    income: number;
    savings: number;
    consumptionTendency: number;
    employmentStatus: 'employed' | 'unemployed';
    employerId: string | null;
}
