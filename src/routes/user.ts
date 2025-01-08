import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { userController } from '../controllers/user.controller';
import { validationSchema } from '../config/validationSchema';

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/login', { schema: validationSchema.login }, (request: FastifyRequest, reply: FastifyReply) => userController.login(request, reply, fastify));

}
