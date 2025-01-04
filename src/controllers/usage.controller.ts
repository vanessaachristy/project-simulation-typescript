import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, DataPlan, Usage, UsageDetails } from '../types';
import { getAllPlansByProvider, getAllPlans, getPlanById } from '../services/plan.service';
import { getAllUsageByPhoneNumber, getAllUsages, getAllUsagesBySubscriber } from '../services/usage.service';

export const getUsagesHandler = async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
        const { subscriberId, phoneNumber } = request.query as { subscriberId?: string, phoneNumber?: string };
        let usages: Usage[] | UsageDetails[];
        if (subscriberId) {
            usages = await getAllUsagesBySubscriber(subscriberId);
        } else if (phoneNumber) {
            usages = await getAllUsageByPhoneNumber(phoneNumber);
        } else {
            usages = await getAllUsages();
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
