import { fastifyPlugin } from "fastify-plugin";
import { FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { auth } from "../config/auth";
import { ApiResponse } from "../types";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    }
}

const authPlugin: FastifyPluginCallback = (server, opts, done) => {
    server.register(fastifyJwt,
        {
            secret: auth.jwtSecret,
            sign: { expiresIn: auth.jwtExpiresIn },
        });

    server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await request.jwtVerify();

        } catch (err: any) {
            const res: ApiResponse<{}> = {
                success: false,
                error: err?.message || "Unauthorized access with invalid token."
            }
            reply.status(401).send(res);
        }
    });

    done();
};

// register the JWT authentication plugin to works globally
export default fastifyPlugin(authPlugin);

