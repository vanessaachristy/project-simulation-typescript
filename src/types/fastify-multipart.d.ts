declare module 'fastify-multipart' {
    import { FastifyPluginAsync } from 'fastify';

    interface MultipartOptions {
        limits?: {
            fileSize?: number;
        };
        addToBody?: boolean;
    }

    const fastifyMultipart: FastifyPluginAsync<MultipartOptions>;
    export = fastifyMultipart;
}