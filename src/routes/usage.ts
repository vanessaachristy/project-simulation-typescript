import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { usageController } from '../controllers/usage.controller';
import { validationSchema } from '../config/validationSchema';

export default async function usageRoutes(fastify: FastifyInstance) {

    fastify.get("/usage", { ...authenticate(fastify), schema: validationSchema.usage }, usageController.getUsages);
}
