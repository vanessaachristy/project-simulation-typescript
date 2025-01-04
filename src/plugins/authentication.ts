import { fastifyPlugin } from "fastify-plugin";
import { FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { auth } from "../config/auth";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    }
}

const authPlugin: FastifyPluginCallback = (server, opts, done) => {
    server.register(fastifyJwt, { secret: auth.jwtSecret });

    server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await request.jwtVerify();

        } catch (err) {
            reply.send(err)
        }
    });

    done();
};

// register the JWT authentication plugin to works globally
export default fastifyPlugin(authPlugin);

