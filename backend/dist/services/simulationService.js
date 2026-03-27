"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = runSimulation;
exports.runOptimization = runOptimization;
exports.generateInsight = generateInsight;
exports.getSimulationHistory = getSimulationHistory;
exports.deleteSimulation = deleteSimulation;
const simulation_engine_1 = require("simulation-engine");
const firebase_1 = require("../firebase");
// ── Population Factory ─────────────────────────────────────────────────────
const NUM_CITIZENS = 1000;
const NUM_BUSINESSES = 50;
const INITIAL_EMPLOYMENT_RATE = 0.95;
function buildPopulation(govSettings) {
    const businesses = Array.from({ length: NUM_BUSINESSES }).map((_, i) => ({
        id: `b_${i}`,
        revenue: 50000 + Math.random() * 100000,
        productivity: 0.5 + Math.random() * 0.5,
        workers: [],
        wageLevel: 35000 + Math.random() * 25000,
        operatingCosts: 0,
        prices: 10 + Math.random() * 5,
    }));
    const citizens = Array.from({ length: NUM_CITIZENS }).map((_, i) => {
        const skill = 0.3 + Math.random() * 0.7;
        const employed = Math.random() < INITIAL_EMPLOYMENT_RATE;
        let employerId = null;
        if (employed) {
            const biz = businesses[i % NUM_BUSINESSES];
            employerId = biz.id;
            biz.workers.push(`c_${i}`);
        }
        return {
            id: `c_${i}`,
            age: 22 + Math.random() * 38,
            educationLevel: 0.3 + Math.random() * 0.7,
            skillLevel: skill,
            income: 0,
            savings: 2000 + Math.random() * 20000,
            consumptionTendency: 0.5 + Math.random() * 0.4,
            employmentStatus: employed ? 'employed' : 'unemployed',
            employerId,
        };
    });
    return { citizens, businesses };
}
// ── Service Functions ──────────────────────────────────────────────────────
async function runSimulation(body, userId) {
    const govSettings = {
        id: 'gov',
        incomeTaxRate: body.incomeTaxRate ?? 0.20,
        corporateTaxRate: body.corporateTaxRate ?? 0.15,
        minimumWage: body.minimumWage ?? 15,
        subsidyPolicies: body.subsidyPolicies ?? 0,
        universalBasicIncome: body.universalBasicIncome ?? 0,
        budget: 1000000,
    };
    const { citizens, businesses } = buildPopulation(govSettings);
    const mc = new simulation_engine_1.MonteCarlo(10, 10, citizens, businesses, govSettings);
    const results = mc.run();
    // Compute confidence bands
    const confidenceBand = results.meanMetrics.map((mean, yearIdx) => {
        const yearSlice = results.scenarios.map((scen) => scen[yearIdx]);
        return {
            year: mean.year,
            gdpMean: mean.gdp,
            gdpMin: Math.min(...yearSlice.map((m) => m.gdp)),
            gdpMax: Math.max(...yearSlice.map((m) => m.gdp)),
            unemploymentMean: mean.unemploymentRate,
            unemploymentMin: Math.min(...yearSlice.map((m) => m.unemploymentRate)),
            unemploymentMax: Math.max(...yearSlice.map((m) => m.unemploymentRate)),
            incomeMean: mean.medianIncome,
            incomeMin: Math.min(...yearSlice.map((m) => m.medianIncome)),
            incomeMax: Math.max(...yearSlice.map((m) => m.medianIncome)),
        };
    });
    // Persist to Firestore (best-effort)
    let resultId = 'mock_id_' + Date.now();
    try {
        const docRef = await firebase_1.db.collection('simulation_runs').add({
            name: body.name || `Simulation ${new Date().toLocaleDateString()}`,
            userId: userId || null,
            createdAt: new Date().toISOString(),
            policies: {
                incomeTaxRate: govSettings.incomeTaxRate,
                corporateTaxRate: govSettings.corporateTaxRate,
                minimumWage: govSettings.minimumWage,
                subsidyPolicies: govSettings.subsidyPolicies,
                universalBasicIncome: govSettings.universalBasicIncome,
            },
            meanMetrics: results.meanMetrics,
        });
        resultId = docRef.id;
    }
    catch {
        // Firestore may not be configured — that's okay
    }
    return { success: true, id: resultId, results: results.meanMetrics, confidenceBand };
}
async function runOptimization(body) {
    const target = body.target || 'maximizeGdp';
    const baseGov = {
        id: 'gov',
        incomeTaxRate: body.baseIncomeTaxRate ?? 0.20,
        corporateTaxRate: body.baseCorporateTaxRate ?? 0.15,
        minimumWage: body.baseMinimumWage ?? 15,
        subsidyPolicies: body.baseSubsidyPolicies ?? 0,
        universalBasicIncome: body.baseUniversalBasicIncome ?? 0,
        budget: 1000000,
    };
    const { citizens, businesses } = buildPopulation(baseGov);
    const optimizedGov = simulation_engine_1.Optimizer.optimize(target, citizens, businesses, baseGov);
    return { success: true, optimizedPolicy: optimizedGov };
}
function generateInsight(body) {
    const metrics = body.metrics || [];
    if (!Array.isArray(metrics) || metrics.length === 0) {
        return { success: true, insight: "Insufficient data to generate specific insights." };
    }
    const start = metrics[0];
    const end = metrics[metrics.length - 1];
    const gdpGrowth = ((end.gdp - start.gdp) / start.gdp) * 100;
    let insight = `Over the simulated period, GDP changed by ${gdpGrowth > 0 ? '+' : ''}${gdpGrowth.toFixed(2)}%. `;
    if (gdpGrowth > 5) {
        insight += "The economic policies show strong growth potential. ";
    }
    else if (gdpGrowth < 0) {
        insight += "The economy experienced a contraction under these policies. ";
    }
    else {
        insight += "The economy saw modest changes in output. ";
    }
    insight += `Unemployment went from ${(start.unemploymentRate * 100).toFixed(1)}% to ${(end.unemploymentRate * 100).toFixed(1)}%. `;
    if (end.unemploymentRate > 0.1) {
        insight += "High final unemployment suggests a need for targeted job creation policies or lower corporate burdens to stimulate hiring.";
    }
    else if (end.unemploymentRate < 0.04) {
        insight += "The labor market remained effectively at full employment, indicating strong business health but potential risk for inflationary wage spirals.";
    }
    return { success: true, insight };
}
async function getSimulationHistory(userId) {
    try {
        let query = firebase_1.db.collection('simulation_runs').orderBy('createdAt', 'desc').limit(20);
        if (userId) {
            query = firebase_1.db.collection('simulation_runs').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(20);
        }
        const snapshot = await query.get();
        const runs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { success: true, runs };
    }
    catch {
        return { success: true, runs: [] };
    }
}
async function deleteSimulation(id, userId) {
    try {
        const ref = firebase_1.db.collection('simulation_runs').doc(id);
        const snap = await ref.get();
        if (!snap.exists) {
            return { success: false, error: 'Not found' };
        }
        const data = snap.data();
        if (userId && data?.userId && data.userId !== userId) {
            return { success: false, error: 'Forbidden' };
        }
        await ref.delete();
        return { success: true };
    }
    catch {
        return { success: false, error: 'Failed to delete' };
    }
}
