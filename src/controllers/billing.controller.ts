import { FastifyReply, FastifyRequest } from "fastify";
import { ApiResponse, Usage, UsageDetails } from "../types";
import { usageService } from "../services/usage.service";
import { planService } from "../services/plan.service";

export const billingController = {
    getBilling: async (request: FastifyRequest, _reply: FastifyReply) => {
        const { phoneNumber } = request.query as { phoneNumber?: string };

        let usages: UsageDetails[]
        if (phoneNumber) {
            usages = await usageService.getAllUsageByPhoneNumber(phoneNumber);
        } else {
            usages = [];
        }

        let billing = [];
        const billingNumOfDays = 30;

        const planInfo = await planService.getPlanById(usages[0].planId);

        if (usages.length !== 0 && planInfo !== null) {

            const cycleInDays = planInfo.billingCycleInDays;

            let fullBillingCycles = Math.floor(billingNumOfDays / cycleInDays);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            // Assume that the current date is always the last day of the current billing cycle.

            // The start of the billing cycle for exactly 30 full days
            const billingScopeStart = new Date(endOfToday.getTime() - (billingNumOfDays - 1) * 24 * 60 * 60 * 1000);
            billingScopeStart.setHours(0, 0, 0, 0); // Set start to midnight of the day


            const billingScopeStartTs = billingScopeStart.getTime();

            const filteredUsages = usages
                .filter((usage: Usage) => new Date(usage.date).getTime() >= billingScopeStartTs);

            let totalCost = 0;

            for (let i = 0; i < fullBillingCycles; i++) {
                const cycleStartTs = billingScopeStartTs + i * cycleInDays * 24 * 60 * 60 * 1000;
                const cycleEndTs = cycleStartTs + cycleInDays * 24 * 60 * 60 * 1000;

                const cycleUsages = filteredUsages.filter((usage: Usage) => {
                    const usageTs = new Date(usage.date).getTime();
                    return usageTs >= cycleStartTs && usageTs < cycleEndTs;
                });

                const cycleUsageInMb = cycleUsages.reduce((acc: number, usage: Usage) => acc + usage.usageInMb, 0);
                const excessDataInMb = Math.max(0, cycleUsageInMb - planInfo?.dataFreeInGb * 1024);
                const costOfExcessData = Number((excessDataInMb * planInfo?.excessChargePerMb).toFixed(2));
                const costOfBillingCycle = Number((planInfo?.price + costOfExcessData).toFixed(2));

                totalCost += Number((costOfBillingCycle).toFixed(2));

                billing.push({
                    cycleStartTs: new Date(cycleStartTs).toLocaleString(),
                    cycleEndTs: new Date(cycleEndTs).toLocaleString(),
                    cycleUsageInMb: cycleUsageInMb,
                    excessDataInMb: Math.max(0, cycleUsageInMb - planInfo?.dataFreeInGb * 1024),
                    costOfExcessData: costOfExcessData,
                    costOfBillingCycle: costOfBillingCycle
                });
            }

            const res: ApiResponse<any> = {
                success: true,
                data: {
                    phoneNumber: phoneNumber,
                    fullBillingCycles: fullBillingCycles,
                    planInfo: planInfo,
                    billingStartDate: billingScopeStart.toLocaleString(),
                    billingEndDate: endOfToday.toLocaleString(),
                    totalCost: totalCost,
                    billingDetails: billing
                }
            };

            _reply.send(res);

        } else {


            const res: ApiResponse<any> = {
                success: false,
                data: {
                    phoneNumber: phoneNumber,
                    planInfo: planInfo,
                },
                error: "Invalid phone number usages data"
            };


        }

    }
}
