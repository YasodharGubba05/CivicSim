import { FastifyRequest, FastifyReply } from 'fastify';
import {
  runSimulation,
  runOptimization,
  generateInsight,
  getSimulationHistory,
  deleteSimulation,
  type SimulationRunRequest,
  type OptimizationRunRequest,
  type InsightsRequest,
} from '../services/simulationService';

export async function simulationRunHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body as SimulationRunRequest) || {};
    const result = await runSimulation(body, request.uid, request.userEmail);
    return result;
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}

export async function optimizationRunHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body as OptimizationRunRequest) || {};
    const result = await runOptimization(body);
    return result;
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}

export async function insightsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body as InsightsRequest) || {};
    const result = generateInsight(body);
    return result;
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}

export async function historyHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await getSimulationHistory(request.uid);
    return result;
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}

export async function simulationDeleteHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const result = await deleteSimulation(id, request.uid);
    return result;
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
