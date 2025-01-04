import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { getPlansHandler } from '../controllers/plan.controller';

export default async function plansRoutes(fastify: FastifyInstance) {
    fastify.get('/plans', { ...authenticate(fastify) }, getPlansHandler);
}
