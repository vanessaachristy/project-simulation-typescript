import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, Usage, UsageDetails } from '../types';
import { usageService } from '../services/usage.service';

export const usageController = {
    getUsages: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { subscriberId, phoneNumber, startDate, endDate } = request.query as {
                subscriberId?: string,
                phoneNumber?: string,
                startDate?: string,
                endDate?: string
            };

            let usages: Usage[] | UsageDetails[];


            // // Validate startDate and endDate format
            // if (startDate && isNaN(Date.parse(startDate)) || endDate && isNaN(Date.parse(endDate))) {
            //     const res: ApiResponse<any> = {
            //         success: false,
            //         error: "Start and  date format should be YYYY-MM-DD"
            //     };
            //     return reply.status(400).send(res);
            // }

            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            // Get usages by different query from usage service
            if (subscriberId) {
                usages = await usageService.getAllUsagesBySubscriber(subscriberId);

                if (usages.length === 0) {
                    const res: ApiResponse<any> = {
                        success: false,
                        data: {
                            subscriberId: subscriberId,
                        },
                        error: "No usage data found for the provided subscriber ID."
                    };
                    return reply.status(404).send(res);
                }
            } else if (phoneNumber) {
                usages = await usageService.getAllUsageByPhoneNumber(phoneNumber);

                if (usages.length === 0) {
                    const res: ApiResponse<any> = {
                        success: false,
                        data: {
                            phoneNumber: phoneNumber,
                        },
                        error: "No usage data found for the provided phone number."
                    };
                    return reply.status(404).send(res);
                }
            } else {
                usages = await usageService.getAllUsages();
            }

            // Apply date range filter if provided
            if (start && end) {
                if (start > end) {
                    const res: ApiResponse<any> = {
                        success: false,
                        error: "Invalid start and end date parameter. Start date should be before end date."
                    };
                    return reply.status(404).send(res);
                }
                usages = usages.filter(usage => {
                    return usage.date >= start && usage.date <= end;
                });
            } else if (start) {
                usages = usages.filter(usage => {
                    return usage.date >= start;
                });
            } else if (end) {
                usages = usages.filter(usage => {
                    return usage.date <= end;
                });
            }

            const res: ApiResponse<Usage[] | UsageDetails[]> = {
                success: true,
                data: usages.sort((a, b) => b.date.getTime() - a.date.getTime())
            };

            reply.send(res);

        } catch (error) {
            const res: ApiResponse<{}> = {
                success: false,
                error: (error as any)?.message || "Internal server error"
            };

            reply.status((error as any)?.statusCode || 500).send(res);
        }
    }



};
