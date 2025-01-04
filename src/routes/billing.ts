import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { billingController } from '../controllers/billing.controller';

export default async function billingRoutes(fastify: FastifyInstance) {

    fastify.get('/billing', { ...authenticate(fastify) }, billingController.getBilling);
}
