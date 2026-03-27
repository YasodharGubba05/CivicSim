"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = simulationRoutes;
const simulationController_1 = require("../controllers/simulationController");
const auth_1 = require("../middleware/auth");
const simulationRunSchema = {
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
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
    fastify.post('/simulation/run', { schema: simulationRunSchema, preHandler: auth_1.verifyToken }, simulationController_1.simulationRunHandler);
    fastify.get('/simulation/history', { preHandler: auth_1.verifyToken }, simulationController_1.historyHandler);
    fastify.delete('/simulation/:id', { preHandler: auth_1.verifyToken }, simulationController_1.simulationDeleteHandler);
    fastify.post('/optimization/run', { schema: optimizationRunSchema, preHandler: auth_1.verifyToken }, simulationController_1.optimizationRunHandler);
    fastify.post('/insights/generate', simulationController_1.insightsHandler);
}
