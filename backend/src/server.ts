import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db } from './firebase';

// Import our simulation engine as a package
import { Simulation, MonteCarlo, Optimizer, Citizen, Business, Government } from 'simulation-engine';

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

      // Build a realistically bootstrapped population
      // ~95% employment rate to start, matching a healthy economy baseline
      const NUM_CITIZENS = 1000;
      const NUM_BUSINESSES = 50;
      const INITIAL_EMPLOYMENT_RATE = 0.95;

      const businesses: Business[] = Array.from({ length: NUM_BUSINESSES }).map((_, i) => ({
          id: `b_${i}`,
          revenue: 50000 + Math.random() * 100000,
          productivity: 0.5 + Math.random() * 0.5,
          workers: [] as string[],
          wageLevel: 35000 + Math.random() * 25000,
          operatingCosts: 0,
          prices: 10 + Math.random() * 5,
      }));

      const citizens: Citizen[] = Array.from({ length: NUM_CITIZENS }).map((_, i) => {
          const skill = 0.3 + Math.random() * 0.7;
          const employed = Math.random() < INITIAL_EMPLOYMENT_RATE;
          let employerId: string | null = null;
          if (employed) {
              // Assign to a random business
              const biz = businesses[i % NUM_BUSINESSES];
              employerId = biz.id;
              biz.workers.push(`c_${i}`);
          }
          return {
              id: `c_${i}`,
              age: 22 + Math.random() * 38,
              educationLevel: 0.3 + Math.random() * 0.7,
              skillLevel: skill,
              income: employed ? 0 : 0, // will be calculated in first year
              savings: 2000 + Math.random() * 20000,
              consumptionTendency: 0.5 + Math.random() * 0.4,
              employmentStatus: employed ? 'employed' : 'unemployed',
              employerId,
          };
      });


      // In a real backend, this would be an async job placed on a queue (e.g. BullMQ)
      const mc = new MonteCarlo(10, 10, citizens, businesses, govSettings);
      const results = mc.run();

      // Compute confidence bands (min/max) across all 10 scenario runs per year
      const confidenceBand = results.meanMetrics.map((mean, yearIdx) => {
          const yearSlice = results.scenarios.map(scen => scen[yearIdx]);
          return {
              year: mean.year,
              gdpMean:          mean.gdp,
              gdpMin:           Math.min(...yearSlice.map(m => m.gdp)),
              gdpMax:           Math.max(...yearSlice.map(m => m.gdp)),
              unemploymentMean: mean.unemploymentRate,
              unemploymentMin:  Math.min(...yearSlice.map(m => m.unemploymentRate)),
              unemploymentMax:  Math.max(...yearSlice.map(m => m.unemploymentRate)),
              incomeMean:       mean.medianIncome,
              incomeMin:        Math.min(...yearSlice.map(m => m.medianIncome)),
              incomeMax:        Math.max(...yearSlice.map(m => m.medianIncome)),
          };
      });

      // Store results asynchronously
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

      return { success: true, id: resultId, results: results.meanMetrics, confidenceBand };

  } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

/**
 * Endpoint to run a policy optimization
 */
fastify.post('/optimization/run', async (request, reply) => {
  try {
      const body = request.body as any || {};
      const target = body.target || 'maximizeGdp';
      const baseGovSettings: Government = {
          id: 'gov',
          incomeTaxRate: body.baseIncomeTaxRate ?? 0.20,
          corporateTaxRate: body.baseCorporateTaxRate ?? 0.15,
          minimumWage: body.baseMinimumWage ?? 15,
          subsidyPolicies: body.baseSubsidyPolicies ?? 0,
          universalBasicIncome: body.baseUniversalBasicIncome ?? 0,
          budget: 1000000
      };

      // Mock population for optimization baseline
      const citizens: Citizen[] = Array.from({length: 200}).map((_, i) => ({
          id: `c_${i}`, age: 30, educationLevel: 0.5, skillLevel: 0.5, income: 0,
          savings: 1000, consumptionTendency: 0.8, employmentStatus: 'unemployed', employerId: null
      }));

      const businesses: Business[] = Array.from({length: 10}).map((_, i) => ({
          id: `b_${i}`, revenue: 50000, productivity: 0.5, workers: [],
          wageLevel: 45000, operatingCosts: 0, prices: 10
      }));

      // In real code, this could be long-running
      const optimizedGov = Optimizer.optimize(target, citizens, businesses, baseGovSettings);
      
      return { success: true, optimizedPolicy: optimizedGov };
  } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

/**
 * Endpoint to generate mock LLM insights
 */
fastify.post('/insights/generate', async (request, reply) => {
  try {
      const body = request.body as any || {};
      const metrics = body.metrics;
      
      // In a real app, send `metrics` to OpenAI/Anthropic API to get a summary
      const mockInsight = "Based on the simulation results, implementing a Universal Basic Income led to a 15% increase in baseline consumption among lower-income brackets, though it slightly elevated the inflation rate. The current Gini coefficient suggests moderate inequality.";
      
      return { success: true, insight: mockInsight };
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
