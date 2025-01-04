import { FastifyInstance } from 'fastify';
import path from 'path';
import { authenticate } from '../helpers/authenticate';
import { importController } from '../controllers/import.controller';

export default async function importCSVRoutes(fastify: FastifyInstance) {
    fastify.post('/import', {
        ...authenticate(fastify)
    }, importController.importCSV);
}
