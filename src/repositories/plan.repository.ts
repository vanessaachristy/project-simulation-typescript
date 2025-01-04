import { prisma } from "../plugins/prisma";

export const planRepository = {
    findAll: async () => {
        return await prisma.dataPlan.findMany({});
    },

    findById: async (id: string) => {
        return await prisma.dataPlan.findUnique({ where: { id } });
    },

    findByProvider: async (provider: string) => {
        return await prisma.dataPlan.findMany({ where: { provider } });
    },
};