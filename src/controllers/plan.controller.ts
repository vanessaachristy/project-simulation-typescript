import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, DataPlan } from '../types';
import { getAllPlansByProvider, getAllPlans, getPlanById } from '../services/plan.service';

export const getPlansHandler = async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
        const { provider, id } = request.query as { provider?: string, id?: string };
        let plans: DataPlan[] = [];

        if (id) {
            const plan = await getPlanById(id);
            plans = plan ? [plan] : [];
        } else if (provider) {
            plans = await getAllPlansByProvider(provider);
        } else {
            plans = await getAllPlans();
        }

        const res: ApiResponse<DataPlan[]> = {
            success: true,
            data: plans
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
