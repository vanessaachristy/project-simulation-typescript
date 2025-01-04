import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { UsageCSVRow, ErrorEntry, ApiResponse, ImportResult } from '../types'; // Update paths as needed
import { insertUsageData } from '../repositories/usage-repository';
import { getSubscriberId } from '../repositories/subscriber-repository';
import { authenticate } from '../helpers/authenticate';
import { importCSVHandler } from '../controllers/import.controller';

export default async function importCSVRoutes(fastify: FastifyInstance) {
    const filePath = path.join(__dirname, '../../data/usage.csv');

    // fastify.post('/import', { ...authenticate(fastify) },
    //     async (request: FastifyRequest, _reply: FastifyReply) => {
    //         if (!fs.existsSync(filePath)) {
    //             return _reply.status(400).send({ error: 'File not found' });
    //         }

    //         const results: UsageCSVRow[] = [];
    //         const errors: ErrorEntry[] = [];

    //         await new Promise((resolve, reject) => {
    //             const readStream = fs.createReadStream(filePath);
    //             readStream.pipe(csvParser())
    //                 .on('data', (row: UsageCSVRow) => {
    //                     const { phone_number, plan_id, date, usage_in_mb } = row;
    //                     const usageDate = new Date(Number(date));

    //                     if (isNaN(usageDate.getTime())) {
    //                         errors.push({ phone_number, plan_id, date, usage_in_mb, reason: 'Invalid date' });
    //                         return;
    //                     }

    //                     if (isNaN(usage_in_mb) || usage_in_mb <= 0) {
    //                         errors.push({ phone_number, plan_id, date, usage_in_mb, reason: 'Invalid usage data' });
    //                         return;
    //                     }

    //                     const subscriberId = getSubscriberId(phone_number, plan_id);

    //                     const result = insertUsageData(subscriberId.toString(), usageDate, usage_in_mb);

    //                     if (!result.success) {
    //                         errors.push({ phone_number, plan_id, date, usage_in_mb, reason: result.error || 'Unknown error' });
    //                     } else {
    //                         results.push({ phone_number, plan_id, date, usage_in_mb });
    //                     }
    //                 })
    //                 .on('end', resolve)
    //                 .on('error', reject);
    //         });

    //         const res: ApiResponse<ImportResult> = {
    //             success: true,
    //             data: { imported: results.length, errors }
    //         };

    //         return res;
    //     });

    fastify.post('/import', { ...authenticate(fastify) }, importCSVHandler);
}
