import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { getBillingHandler } from '../controllers/billing.controller';

export default async function billingRoutes(fastify: FastifyInstance) {

    fastify.get('/billing', { ...authenticate(fastify) }, getBillingHandler);
}
