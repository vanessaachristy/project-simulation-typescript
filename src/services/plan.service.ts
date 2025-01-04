import { prisma } from "../plugins/prisma";
import { DataPlan } from "../types";

export async function getAllPlans(): Promise<DataPlan[]> {
    return prisma.dataPlan.findMany();
}

export async function getAllPlansByProvider(provider: string): Promise<DataPlan[]> {
    return prisma.dataPlan.findMany({
        where: {
            provider: provider
        }
    })
}

export async function getPlanById(id: string): Promise<DataPlan | null> {
    return prisma.dataPlan.findUnique({
        where: {
            id: id
        }
    });
}