import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, ImportResponse } from '../types';
import { importService } from '../services/import.service';


export const importController = {
    importCSV: async (request: FastifyRequest, _reply: FastifyReply) => {

        // Check if the request is multipart / file uploaded
        if (!request.isMultipart()) {
            const res: ApiResponse<{}> = {
                success: false,
                error: "No file uploaded"
            };
            return _reply.status(400).send(res);
        }

        const data = await request.file();

        if (!data) {
            const res: ApiResponse<{}> = {
                success: false,
                error: "No file uploaded"
            };
            return _reply.send(res)
        };

        const { file, filename } = data;

        try {
            // Call import service to handle file streams and do the insertion 
            const filePath = await importService.processFile(file, filename);
            const { results, errors } = await importService.parseAndProcessCSV(filePath);
            const res: ApiResponse<ImportResponse> = {
                success: true,
                data: { imported: results.length, errorsLength: errors.length, errors }
            };
            _reply.send(res);

        } catch (error: any) {

            const res: ApiResponse<{}> = {
                success: false,
                error: (error as any)?.message || "Internal server error"
            };

            _reply.status((error as any)?.statusCode || 500).send(res);
        }

    }

}

