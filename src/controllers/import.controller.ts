import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, ErrorEntry, ImportResponse, ImportResult, UsageCSVRow } from '../types';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { usageService } from '../services/usage.service';
import { subsriberService } from '../services/subscriber.service';


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

        // Handle file stream (e.g., write locally with name YYYY-MM-DD_hh-hh-ss-filename)
        const formattedDate = new Date().toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];

        const filePath = path.join(__dirname, '../../data/', `${formattedDate}-${filename}`);

        await new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filePath);
            file.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
        });


        if (!fs.existsSync(filePath)) {
            const res: ApiResponse<{}> = {
                success: false,
                error: "Error processing file"
            };
            return _reply.status(400).send(res);
        }

        const results: ImportResult[] = [];
        const errors: ErrorEntry[] = [];
        const csvData: UsageCSVRow[] = [];

        // Parse CSV data into an array
        await new Promise<void>((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            let headersValidated = false;
            readStream.pipe(csvParser())
                .on('data', (row: UsageCSVRow) => {

                    // Validate column header of the CSV file
                    if (!headersValidated) {
                        const requiredHeaders = ['phone_number', 'plan_id', 'date', 'usage_in_mb'];
                        const headers = Object.keys(row);
                        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
                        if (missingHeaders.length > 0) {
                            const res: ApiResponse<{}> = {
                                success: false,
                                error: "Missing required columns"
                            };
                            return _reply.status(400).send(res);
                        }
                        headersValidated = true;
                    }

                    csvData.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        const insertPromises = csvData.map(async (row) => {
            const { phone_number, plan_id, date, usage_in_mb } = row;
            const usageDate = new Date(Number(date));
            const stringDate = usageDate?.toISOString();

            // Validate date and usage
            if (isNaN(usageDate.getTime()) || isNaN(usage_in_mb) || usage_in_mb <= 0) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: 'Invalid usage data' });
                return;
            }

            try {
                const subscriberId = await subsriberService.getSubscriberId(phone_number, plan_id);
                const result = await usageService.insertUsageData(subscriberId, stringDate, Number(usage_in_mb));

                if (!result.success) {
                    errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: result.error || 'Unknown error' });
                } else {
                    results.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb });
                }
            } catch (error: any) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: error?.message || 'Unknown error' });
            }
        });

        // Execute all insertions concurrently
        await Promise.all(insertPromises);


        const res: ApiResponse<ImportResponse> = {
            success: true,
            data: { imported: results.length, errorsLength: errors.length, errors }
        };
        _reply.send(res);
    }

}

