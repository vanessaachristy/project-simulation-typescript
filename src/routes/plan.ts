import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { planController } from '../controllers/plan.controller';

export default async function plansRoutes(fastify: FastifyInstance) {
    fastify.get('/plans', { ...authenticate(fastify) }, planController.getPlans);
}
