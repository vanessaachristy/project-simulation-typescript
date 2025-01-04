import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { usageController } from '../controllers/usage.controller';

export default async function usageRoutes(fastify: FastifyInstance) {

    fastify.get("/usage", { ...authenticate(fastify) }, usageController.getUsages);
}
