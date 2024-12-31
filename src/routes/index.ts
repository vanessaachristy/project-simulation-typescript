import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse, DataPlan } from '../types';
import { availableDataPlans } from '../config/seed';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/plans', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { provider } = request.query as { provider?: string };
    
    let plans: DataPlan[] = availableDataPlans;
    if (provider) {
      plans = plans.filter((plan) => plan.provider === provider);
    }

    const res: ApiResponse<DataPlan[]> = {
      success: true,
      data: plans,
    };

    return res;
  });
}