import fastifyMultipart from '@fastify/multipart'
import { FastifyInstance } from 'fastify';
import importCSVRoutes from './import';
import plansRoutes from './plan';
import usageRoutes from './usage';
import auth from '../plugins/authentication';
import userRoutes from './user';
import billingRoutes from './billing';
import subscriberRoutes from './subscriber';


export default function routes(fastify: FastifyInstance) {

  // Register fastify multipart for handling file uploads
  fastify.register(fastifyMultipart);

  // Register the authentication plugin
  fastify.register(auth);

  fastify.register(plansRoutes);
  fastify.register(importCSVRoutes);
  fastify.register(usageRoutes);
  fastify.register(userRoutes)
  fastify.register(billingRoutes);
  fastify.register(subscriberRoutes);

}