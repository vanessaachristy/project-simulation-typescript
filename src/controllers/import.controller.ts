import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, ErrorEntry, ImportResponse, ImportResult, UsageCSVRow } from '../types';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { usageService } from '../services/usage.service';
import { subsriberService } from '../services/subscriber.service';


export const importController = {
    importCSV: async (request: FastifyRequest, _reply: FastifyReply) => {
        const filePath = path.join(__dirname, '../../data/usage.csv');

        if (!fs.existsSync(filePath)) {
            return _reply.status(400).send({ error: 'File not found' });
        }

        const results: ImportResult[] = [];
        const errors: ErrorEntry[] = [];
        const csvData: UsageCSVRow[] = [];

        // Asynchronously parse CSV data into an array
        await new Promise<void>((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(csvParser())
                .on('data', (row: UsageCSVRow) => {
                    csvData.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Insert each row sequentially into the db
        for (const row of csvData) {
            const { phone_number, plan_id, date, usage_in_mb } = row;
            const usageDate = new Date(Number(date));
            const stringDate = usageDate?.toISOString();

            // Validate date
            if (isNaN(usageDate.getTime())) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: 'Invalid date' });
                continue;
            }

            // Validate usage data
            if (isNaN(usage_in_mb) || usage_in_mb <= 0) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: 'Invalid usage data' });
                continue;
            }

            try {
                // Get subscriber ID or create one if not exists
                const subscriberId = await subsriberService.getSubscriberId(phone_number, plan_id);

                // Insert usage data
                const result = await usageService.insertUsageData(subscriberId, stringDate, Number(usage_in_mb));

                if (!result.success) {
                    errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: result.error || 'Unknown error' });
                } else {
                    results.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb });
                }
            } catch (error: any) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: error?.message || 'Unknown error' });
            }
        }

        const res: ApiResponse<ImportResponse> = {
            success: true,
            data: { imported: results.length, errorsLength: errors.length, errors }
        };
        _reply.send(res);
    }

}

