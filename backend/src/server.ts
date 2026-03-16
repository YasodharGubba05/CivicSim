import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db } from './firebase';

// Import our simulation engine as a package
import { Simulation, MonteCarlo, Citizen, Business, Government } from 'simulation-engine';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: '*'
});

fastify.get('/', async (request, reply) => {
  return { hello: 'CivicSim API' };
});

/**
 * Endpoint to run a basic simulation
 */
fastify.post('/simulation/run', async (request, reply) => {
  // Parse body for base settings
  try {
      const body = request.body as any || {};
      const govSettings: Government = {
          id: 'gov',
          incomeTaxRate: body.incomeTaxRate ?? 0.20,
          corporateTaxRate: body.corporateTaxRate ?? 0.15,
          minimumWage: body.minimumWage ?? 15,
          subsidyPolicies: body.subsidyPolicies ?? 0,
          universalBasicIncome: body.universalBasicIncome ?? 0,
          budget: 1000000
      };

      // Mock population
      const citizens: Citizen[] = Array.from({length: 1000}).map((_, i) => ({
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

      const businesses: Business[] = Array.from({length: 50}).map((_, i) => ({
          id: `b_${i}`,
          revenue: Math.random() * 100000,
          productivity: Math.random(),
          workers: [],
          wageLevel: 40000 + Math.random() * 20000,
          operatingCosts: 0,
          prices: 10
      }));

      // In a real backend, this would be an async job placed on a queue (e.g. BullMQ)
      const mc = new MonteCarlo(10, 10, citizens, businesses, govSettings);
      const results = mc.run();

      // Example of storing results asynchronously
      let resultId = 'mock_id_' + Date.now();
      try {
          const resultDocRef = await db.collection('simulation_runs').add({
             createdAt: new Date().toISOString(),
             meanMetrics: results.meanMetrics
          });
          resultId = resultDocRef.id;
      } catch (dbErr) {
          fastify.log.warn('Could not write to Firestore (likely missing credentials). Returning mock results.');
      }

      return { success: true, id: resultId, results: results.meanMetrics };
  } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
