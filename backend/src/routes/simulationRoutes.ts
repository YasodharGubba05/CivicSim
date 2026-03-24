import { FastifyInstance } from 'fastify';
import {
  simulationRunHandler,
  optimizationRunHandler,
  insightsHandler,
  historyHandler,
} from '../controllers/simulationController';

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

export default async function simulationRoutes(fastify: FastifyInstance) {
  fastify.post('/simulation/run', { schema: simulationRunSchema }, simulationRunHandler);
  fastify.get('/simulation/history', historyHandler);
  fastify.post('/optimization/run', { schema: optimizationRunSchema }, optimizationRunHandler);
  fastify.post('/insights/generate', insightsHandler);
}
