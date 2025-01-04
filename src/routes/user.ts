import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { userController } from '../controllers/user.controller';

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/login', (request: FastifyRequest, reply: FastifyReply) => userController.login(request, reply, fastify));

}
