import { FastifyInstance } from 'fastify';
import { authenticate } from '../helpers/authenticate';
import { billingController } from '../controllers/billing.controller';
import { validationSchema } from '../config/validationSchema';

export default async function billingRoutes(fastify: FastifyInstance) {

    fastify.get('/billing', { ...authenticate(fastify), schema: validationSchema.billing }, billingController.getBilling);
}
