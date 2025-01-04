import { FastifyInstance } from 'fastify';
import fastifyMultipart from 'fastify-multipart';
import importCSVRoutes from './importCSV';
import plansRoutes from './plan';
import usageRoutes from './usage';
import auth from '../plugins/authentication';
import userRoutes from './user';
import billingRoutes from './billing';


export default async function routes(fastify: FastifyInstance) {

  fastify.register(fastifyMultipart, {
    addToBody: true,
  });


  // Register the plugins 
  fastify.register(auth);

  await fastify.register(plansRoutes);
  await fastify.register(importCSVRoutes);
  await fastify.register(usageRoutes);
  await fastify.register(userRoutes)
  await fastify.register(billingRoutes);

}