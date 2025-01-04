import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { loginHandler } from '../controllers/user.controller';

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/login', (request: FastifyRequest, reply: FastifyReply) => loginHandler(request, reply, fastify));

}
