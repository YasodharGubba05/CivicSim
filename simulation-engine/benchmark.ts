import { Simulation, MonteCarlo, Citizen, Business, Government } from './src';

console.log('--- PolicySim Performance Benchmark ---');

const govSettings: Government = {
    id: 'gov',
    incomeTaxRate: 0.20,
    corporateTaxRate: 0.15,
    minimumWage: 15,
    subsidyPolicies: 0,
    universalBasicIncome: 0,
    budget: 1000000
};

// Target: 10,000 agents over 10 years in < 5 seconds
const NUM_CITIZENS = 10000;
const NUM_BUSINESSES = 500;
const YEARS = 10;
const MC_RUNS = 1;

console.log(`Generating ${NUM_CITIZENS} Citizens and ${NUM_BUSINESSES} Businesses...`);

const citizens: Citizen[] = Array.from({length: NUM_CITIZENS}).map((_, i) => ({
    id: `c_${i}`,
    age: 20 + Math.random() * 40,
    educationLevel: Math.random(),
    skillLevel: Math.random(),
    income: 0,
    savings: Math.random() * 10000,
    consumptionTendency: 0.5 + Math.random() * 0.5,
    employmentStatus: 'unemployed',
    employerId: null
}));

const businesses: Business[] = Array.from({length: NUM_BUSINESSES}).map((_, i) => ({
    id: `b_${i}`,
    revenue: Math.random() * 100000,
    productivity: Math.random(),
    workers: [],
    wageLevel: 40000 + Math.random() * 20000,
    operatingCosts: 0,
    prices: 10
}));

console.log(`Running Simulation for ${YEARS} years...`);
const start = performance.now();

const mc = new MonteCarlo(MC_RUNS, YEARS, citizens, businesses, govSettings);
const results = mc.run();

const end = performance.now();
const timeMs = end - start;
console.log(`Simulation complete in ${timeMs.toFixed(2)} ms.`);

if (timeMs < 5000) {
    console.log('✅ Performance target met (< 5000 ms).');
} else {
    console.log('❌ Performance target failed (> 5000 ms).');
}

console.log('Final Metrics:');
console.table(results.meanMetrics);
