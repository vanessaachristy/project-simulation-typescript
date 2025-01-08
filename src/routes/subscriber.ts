import { FastifyInstance } from "fastify";
import { authenticate } from "../helpers/authenticate";
import { subscriberController } from "../controllers/subscriber.controller";
import { validationSchema } from "../config/validationSchema";


export default async function subscriberRoutes(fastify: FastifyInstance) {
    fastify.get('/subscribers', { ...authenticate(fastify), schema: validationSchema.subscriber }, subscriberController.getSubscriber);
}
