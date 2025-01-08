import fastifyMultipart from '@fastify/multipart'
import { FastifyError, FastifyInstance } from 'fastify';
import importCSVRoutes from './import';
import plansRoutes from './plan';
import usageRoutes from './usage';
import auth from '../plugins/authentication';
import userRoutes from './user';
import billingRoutes from './billing';
import subscriberRoutes from './subscriber';
import { ApiResponse } from '../types';


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

  fastify.setErrorHandler(function (error: FastifyError, request, reply) {
    if (error.validation) {
      const res: ApiResponse<{}> = {
        success: false,
        error: error?.message
      }
      reply.status(error?.statusCode || 400).send(res)
    }
  })


}