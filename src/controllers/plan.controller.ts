import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, DataPlan } from '../types';
import { planService } from '../services/plan.service';

export const planController = {
    getPlans: async (request: FastifyRequest, _reply: FastifyReply) => {
        try {
            const { provider, id } = request.query as { provider?: string, id?: string };
            let plans: DataPlan[] = [];

            if (id) {
                const plan = await planService.getPlanById(id);
                plans = plan ? [plan] : [];
            } else if (provider) {
                plans = await planService.getAllPlansByProvider(provider);
            } else {
                plans = await planService.getAllPlans();
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

}
