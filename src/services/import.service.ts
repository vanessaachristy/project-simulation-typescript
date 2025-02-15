import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { ErrorEntry, ImportResult, UsageCSVRow } from "../types";
import { usageService } from "./usage.service";
import { subscriberService } from "./subscriber.service";
import { getFileNameWithTimestamp } from "../helpers/util";

export const importService = {

    // writeFile and parseAndProcessCSVFromPath are used when we want to store the uploaded file locally/remotely for audit trail or reprocess file
    writeFile: async (file: NodeJS.ReadableStream, filename: string): Promise<string> => {
        const filePath = getFileNameWithTimestamp(filename);


        await new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filePath);
            file.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        if (!fs.existsSync(filePath)) {
            throw new Error("Error processing file");
        } else {
            return filePath;
        }
    },

    // parseAndProcessCSVFromFile CSV is used when we want to directly parse and process CSV file without storing it
    parseAndProcessCSVFromFileStream: async (file: NodeJS.ReadableStream): Promise<{ results: ImportResult[], errors: ErrorEntry[] }> => {
        const results: ImportResult[] = [];
        const errors: ErrorEntry[] = [];
        const csvData: UsageCSVRow[] = [];

        //  Push CSV data into array 
        await new Promise<void>((resolve, reject) => {
            let headersValidated = false;
            file.pipe(csvParser())
                .on('data', (row: UsageCSVRow) => {

                    // Validate column header of the CSV file
                    if (!headersValidated) {
                        const requiredHeaders = ['phone_number', 'plan_id', 'date', 'usage_in_mb'];
                        const headers = Object.keys(row);
                        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

                        if (missingHeaders.length > 0) {
                            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
                        }
                        headersValidated = true;
                    }
                    csvData.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Parse and insert each CSV data into database
        for (const row of csvData) {
            const { phone_number, plan_id, date, usage_in_mb } = row;
            const validDate = !isNaN(date) && Number(date) > 0

            // Validate usage date and usage number
            if (!validDate || isNaN(usage_in_mb) || usage_in_mb <= 0) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: date.toString(), usageInMb: usage_in_mb, reason: 'Invalid usage data' });
                continue;
            }

            const usageDate = new Date(Number(date));
            const stringDate = usageDate.toISOString();

            try {
                const subscriberId = await subscriberService.getOrCreateSubscriberId(phone_number, plan_id);
                const result = await usageService.insertUsageData(subscriberId, stringDate, Number(usage_in_mb));
                if (!result.success) { // i.e. DB duplicate constraint error 
                    errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: result.error || 'Error while inserting data' });
                } else {
                    results.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb });
                }
            } catch (error: any) {
                errors.push({ phoneNumber: phone_number, planId: plan_id, date: stringDate, usageInMb: usage_in_mb, reason: error?.message || 'Database error' });
            }
        }

        return { results, errors };
    }

}
