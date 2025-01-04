import { Prisma } from "@prisma/client";
import { prisma } from "../plugins/prisma";
import { DataPlan, InsertUsageDbResult, Usage, UsageDetails } from "../types";

export async function getAllUsages(): Promise<Usage[]> {
    const usages = await prisma.usageData.findMany();
    return usages.map(usage => ({
        ...usage,
        id: usage.id.toString(),
        subscriberId: usage.subscriberId.toString()
    }));
}

export async function getAllUsagesBySubscriber(subscriberId: string): Promise<Usage[]> {
    const usagesBySubscriber = await prisma.usageData.findMany({
        where: {
            subscriberId: Number(subscriberId)
        }
    });

    return usagesBySubscriber.map(usage => ({
        ...usage,
        id: usage.id.toString(),
        subscriberId: usage.subscriberId.toString()
    }));
}

export async function getAllUsageByPhoneNumber(phoneNumber: string): Promise<UsageDetails[]> {
    const usagesByPhoneNumber = await prisma.usageData.findMany({
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

    return usagesByPhoneNumber.map(usage => ({
        id: usage.id.toString(),
        subscriberId: usage.subscriberId.toString(),
        date: usage.date,
        usageInMb: usage.usageInMb,
        phoneNumber: usage.subscriber.phoneNumber,
        planId: usage.subscriber.planId,
    }));
}

export async function insertUsageData(subscriberId: number, date: string, usageInMb: number): Promise<InsertUsageDbResult> {
    try {
        await prisma.usageData.create({
            data: {
                subscriberId: subscriberId,
                date: date,
                usageInMb: usageInMb
            }
        });

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

