import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// Helper function to authenticate the protected route using JWT token via Authentication fastify plugin
export const authenticate = (server: FastifyInstance) => ({
    onRequest: (req: FastifyRequest, reply: FastifyReply) => server.authenticate(req, reply)
});