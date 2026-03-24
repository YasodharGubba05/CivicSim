"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const simulationRoutes_1 = __importDefault(require("./routes/simulationRoutes"));
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(cors_1.default, {
    origin: '*',
});
fastify.get('/', async () => {
    return { hello: 'CivicSim API' };
});
// Register all routes
fastify.register(simulationRoutes_1.default);
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000', 10);
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening at http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
