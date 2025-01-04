import { FastifyReply, FastifyRequest } from "fastify";
import { ApiResponse, Usage, UsageDetails } from "../types";
import { usageService } from "../services/usage.service";
import { planService } from "../services/plan.service";

export const billingController = {
    getBilling: async (request: FastifyRequest, _reply: FastifyReply) => {
        const { phoneNumber, days } = request.query as { phoneNumber: string, days: number };


        let usages: UsageDetails[]
        if (phoneNumber) {
            usages = await usageService.getAllUsageByPhoneNumber(phoneNumber);
        } else {
            usages = [];
        }

        if (usages.length === 0) {
            const res: ApiResponse<any> = {
                success: false,
                data: {
                    phoneNumber: phoneNumber,
                },
                error: "No usage data found for the provided phone number."
            };
            return _reply.status(404).send(res);
        }

        const billingNumOfDays = days || 30; // Default to 30 days if not provided

        const planInfo = await planService.getPlanById(usages[0].planId);

        if (!planInfo) {
            const res: ApiResponse<any> = {
                success: false,
                data: {
                    phoneNumber: phoneNumber,
                },
                error: "Plan information not found"
            };
            return _reply.status(404).send(res);
        }

        const cycleInDays = planInfo.billingCycleInDays;

        // Calculate the full number of billing cycles
        let fullBillingCycles = Math.floor(billingNumOfDays / cycleInDays);

        // Determine the end of today (last day of the billing cycle)
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Last moment of the current day

        // Calculate the start of the billing period for exactly full billing cycles (30 full days)
        const billingScopeStart = new Date(endOfToday.getTime() - (fullBillingCycles * cycleInDays) * 24 * 60 * 60 * 1000);
        billingScopeStart.setHours(0, 0, 0, 0); // Set the start to midnight of the first day of the cycle

        const billingScopeStartTs = billingScopeStart.getTime();

        // Filter usages within the determined billing period (start to end)
        const filteredUsages = usages.filter((usage: Usage) => new Date(usage.date).getTime() >= billingScopeStartTs);

        // Calculate the total cost for each full billing cycle
        let totalCost = 0;

        const billing = [];

        for (let i = 0; i < fullBillingCycles; i++) {
            const cycleStartTs = billingScopeStartTs + i * cycleInDays * 24 * 60 * 60 * 1000;
            const cycleEndTs = cycleStartTs + cycleInDays * 24 * 60 * 60 * 1000;

            // Filter usages for the specific cycle period
            const cycleUsages = filteredUsages.filter((usage: Usage) => {
                const usageTs = new Date(usage.date).getTime();
                return usageTs >= cycleStartTs && usageTs < cycleEndTs;
            });

            // Calculate the total data usage in MB for the cycle
            const cycleUsageInMb = cycleUsages.reduce((acc: number, usage: Usage) => acc + usage.usageInMb, 0);

            // Calculate excess data usage and the corresponding cost
            const excessDataInMb = Math.max(0, cycleUsageInMb - planInfo?.dataFreeInGb * 1024);
            const costOfExcessData = Number((excessDataInMb * planInfo?.excessChargePerMb).toFixed(2));

            // Calculate the total cost for this billing cycle (base cost + excess data cost)
            const costOfBillingCycle = Number((planInfo?.price + costOfExcessData).toFixed(2));

            // Add the cycle cost to the total
            totalCost += costOfBillingCycle;

            // Record the cycle details for response
            billing.push({
                cycleStartDate: new Date(cycleStartTs).toLocaleDateString(),
                cycleEndDate: new Date(cycleEndTs).toLocaleDateString(),
                cycleUsageInMb: cycleUsageInMb,
                excessDataInMb: excessDataInMb,
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
                billingStartDate: billingScopeStart.toLocaleDateString(),
                billingEndDate: endOfToday.toLocaleDateString(),
                totalCost: Number(totalCost.toFixed(2)),
                billingDetails: billing
            }
        };

        _reply.send(res);

    }
}
