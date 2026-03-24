"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = simulationRoutes;
const simulationController_1 = require("../controllers/simulationController");
const simulationRunSchema = {
    body: {
        type: 'object',
        properties: {
            incomeTaxRate: { type: 'number', minimum: 0, maximum: 1 },
            corporateTaxRate: { type: 'number', minimum: 0, maximum: 1 },
            minimumWage: { type: 'number', minimum: 0 },
            subsidyPolicies: { type: 'number', minimum: 0 },
            universalBasicIncome: { type: 'number', minimum: 0 }
        }
    }
};
const optimizationRunSchema = {
    body: {
        type: 'object',
        properties: {
            target: { type: 'string', enum: ['maximizeGdp', 'minimizeUnemployment', 'minimizeInequality'] },
            baseIncomeTaxRate: { type: 'number', minimum: 0, maximum: 1 },
            baseCorporateTaxRate: { type: 'number', minimum: 0, maximum: 1 },
            baseMinimumWage: { type: 'number', minimum: 0 },
            baseSubsidyPolicies: { type: 'number', minimum: 0 },
            baseUniversalBasicIncome: { type: 'number', minimum: 0 }
        }
    }
};
async function simulationRoutes(fastify) {
    fastify.post('/simulation/run', { schema: simulationRunSchema }, simulationController_1.simulationRunHandler);
    fastify.get('/simulation/history', simulationController_1.historyHandler);
    fastify.post('/optimization/run', { schema: optimizationRunSchema }, simulationController_1.optimizationRunHandler);
    fastify.post('/insights/generate', simulationController_1.insightsHandler);
}
