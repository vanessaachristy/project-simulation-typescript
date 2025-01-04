import { Prisma } from "@prisma/client";
import { InsertUsageDbResult, Usage, UsageDetails } from "../types";
import { usageRepository } from "../repositories/usage-repository";


export const usageService = {

    getAllUsages: async (): Promise<Usage[]> => {
        const usages = await usageRepository.findAll();
        return usages.map(usage => ({
            ...usage,
            id: usage.id.toString(),
            subscriberId: usage.subscriberId.toString()
        }));
    },

    getAllUsagesBySubscriber: async (subscriberId: string): Promise<Usage[]> => {
        const usagesBySubscriber = await usageRepository.findBySubscriberId(Number(subscriberId));
        return usagesBySubscriber.map(usage => ({
            ...usage,
            id: usage.id.toString(),
            subscriberId: usage.subscriberId.toString()
        }));
    },

    getAllUsageByPhoneNumber: async (phoneNumber: string): Promise<UsageDetails[]> => {
        const usagesByPhoneNumber = await usageRepository.findByPhoneNumber(phoneNumber);
        return usagesByPhoneNumber.map(usage => ({
            id: usage.id.toString(),
            subscriberId: usage.subscriberId.toString(),
            date: usage.date,
            usageInMb: usage.usageInMb,
            phoneNumber: usage.subscriber.phoneNumber,
            planId: usage.subscriber.planId,
        }));
    },

    insertUsageData: async (subscriberId: number, date: string, usageInMb: number): Promise<InsertUsageDbResult> => {
        try {
            await usageRepository.insertUsageData(subscriberId, date, usageInMb);
            return { success: true };
        } catch (err: any) {
            // Handle unique (subscribeId, date) constraint
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    return { success: false, error: "There is a unique constraint violation. Existing subscriberId and date already exist." };
                }
            }
            return { success: false, error: err?.message || "Error occured during insertion" };
        }
    }
};
