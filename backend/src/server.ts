import Fastify from 'fastify';
import cors from '@fastify/cors';
import simulationRoutes from './routes/simulationRoutes';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: '*',
});

fastify.get('/', async () => {
  return { hello: 'CivicSim API' };
});

// Register all routes
fastify.register(simulationRoutes);

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
