import { FastifyInstance } from 'fastify';
import {
  simulationRunHandler,
  optimizationRunHandler,
  insightsHandler,
  historyHandler,
  simulationDeleteHandler,
} from '../controllers/simulationController';
import { verifyToken } from '../middleware/auth';

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

export default async function simulationRoutes(fastify: FastifyInstance) {
  fastify.post('/simulation/run', { schema: simulationRunSchema, preHandler: verifyToken }, simulationRunHandler);
  fastify.get('/simulation/history', { preHandler: verifyToken }, historyHandler);
  fastify.delete('/simulation/:id', { preHandler: verifyToken }, simulationDeleteHandler);
  fastify.post('/optimization/run', { schema: optimizationRunSchema, preHandler: verifyToken }, optimizationRunHandler);
  fastify.post('/insights/generate', insightsHandler);
}

