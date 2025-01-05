import { FastifyInstance } from "fastify";
import { authenticate } from "../helpers/authenticate";
import { subscriberController } from "../controllers/subscriber.controller";


export default async function subscriberRoutes(fastify: FastifyInstance) {
    fastify.get('/subscribers', { ...authenticate(fastify) }, subscriberController.getSubscriber);
}
