import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const userController = {

    login: async (request: FastifyRequest, reply: FastifyReply, fastify: FastifyInstance) => {
        const { user, password } = request.body as { user: string, password: string };

        // Validate if username & password are exist in user database

        // For simplicity we skip it and hardcode the check
        if (user === 'test' && password === 'password') {
            const token = fastify.jwt.sign({ user }); // Generate JWT token with the payload

            const res = {
                success: true,
                token: token
            };

            reply.header('Authorization', `Bearer ${token}`);

            return reply.send(res);
        } else {
            return reply.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    }
}

