import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, Usage, UsageDetails } from '../types';
import { usageService } from '../services/usage.service';

export const usageController = {
    getUsages: async (request: FastifyRequest, _reply: FastifyReply) => {
        try {
            const { subscriberId, phoneNumber, startDate, endDate } = request.query as {
                subscriberId?: string,
                phoneNumber?: string,
                startDate?: string,
                endDate?: string
            };

            let usages: Usage[] | UsageDetails[];

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
                    return _reply.status(404).send(res);
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
                    return _reply.status(404).send(res);
                }
            } else {
                usages = await usageService.getAllUsages();
            }

            // Apply date range filter if provided
            if (start && end) {
                usages = usages.filter(usage => {
                    const usageDate = new Date(usage.date);
                    return usageDate >= start && usageDate <= end;
                });
            } else if (start) {
                usages = usages.filter(usage => {
                    const usageDate = new Date(usage.date);
                    return usageDate >= start;
                });
            } else if (end) {
                usages = usages.filter(usage => {
                    const usageDate = new Date(usage.date);
                    return usageDate <= end;
                });
            }

            const res: ApiResponse<Usage[] | UsageDetails[]> = {
                success: true,
                data: usages
            };

            _reply.send(res);

        } catch (error) {
            const res: ApiResponse<{}> = {
                success: false,
                error: (error as any)?.message || "Internal server error"
            };

            _reply.status((error as any)?.statusCode || 500).send(res);
        }
    }



};
