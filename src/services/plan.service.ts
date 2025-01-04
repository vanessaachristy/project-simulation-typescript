import { prisma } from "../plugins/prisma";
import { planRepository } from "../repositories/plan.repository";
import { DataPlan } from "../types";



export const planService = {

    getAllPlans: async (): Promise<DataPlan[]> => {
        return planRepository.findAll();
    },

    getAllPlansByProvider: async (provider: string): Promise<DataPlan[]> => {
        return planRepository.findByProvider(provider);
    },

    getPlanById: async (id: string): Promise<DataPlan | null> => {
        return planRepository.findById(id);
    }

}