import { prisma } from "../plugins/prisma";

export const usageRepository = {
  findAll: async () => {
    return await prisma.usageData.findMany({});
  },

  findBySubscriberId: async (subscriberId: number) => {
    return await prisma.usageData.findMany({ where: { subscriberId } });
  },

  findByPhoneNumber: async (phoneNumber: string) => {
    return await prisma.usageData.findMany({
      where: {
        subscriber: {
          phoneNumber: phoneNumber
        },

      },
      include: {
        subscriber: {
          select: {
            id: true,
            phoneNumber: true,
            planId: true,
          },
        },
      },
    })
  },

  insertUsageData: async (subscriberId: number, date: string, usageInMb: number) => {
    return await prisma.usageData.create({
      data: {
        subscriberId: subscriberId,
        date: date,
        usageInMb: usageInMb
      }
    });

  }
};