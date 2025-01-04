import { prisma } from "../plugins/prisma";



export const subscriberRepository = {
    findAll: async () => {
        return await prisma.subscriber.findMany({});
    },

    findBySubscriberId: async (id: number) => {
        return await prisma.usageData.findUnique({ where: { id } });
    },

    findByPhoneNumber: async (phoneNumber: string) => {
        return prisma.subscriber.findUnique({
            where: {
                phoneNumber: phoneNumber,
            },
        });

    },

    insertSubscriber: async (phoneNumber: string, planId: string) => {
        return await prisma.subscriber.create({
            data: {
                phoneNumber: phoneNumber,
                planId: planId,
            },
        });


    }
};