"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationRunHandler = simulationRunHandler;
exports.optimizationRunHandler = optimizationRunHandler;
exports.insightsHandler = insightsHandler;
exports.historyHandler = historyHandler;
const simulationService_1 = require("../services/simulationService");
async function simulationRunHandler(request, reply) {
    try {
        const body = request.body || {};
        const result = await (0, simulationService_1.runSimulation)(body);
        return result;
    }
    catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
async function optimizationRunHandler(request, reply) {
    try {
        const body = request.body || {};
        const result = await (0, simulationService_1.runOptimization)(body);
        return result;
    }
    catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
async function insightsHandler(request, reply) {
    try {
        const body = request.body || {};
        const result = (0, simulationService_1.generateInsight)(body);
        return result;
    }
    catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
async function historyHandler(request, reply) {
    try {
        const result = await (0, simulationService_1.getSimulationHistory)();
        return result;
    }
    catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
