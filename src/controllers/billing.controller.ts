import { FastifyReply, FastifyRequest } from "fastify";
import { ApiResponse, Usage, UsageDetails } from "../types";
import { usageService } from "../services/usage.service";
import { planService } from "../services/plan.service";
import { billingService } from "../services/billing.service";
import { BillingReport } from "../types/billing";

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

        const { fullBillingCycles, billingScopeStart, billingScopeEnd, totalCost, billing } = await billingService.calculateTotalCost(billingNumOfDays, planInfo, usages);

        const res: ApiResponse<BillingReport> = {
            success: true,
            data: {
                phoneNumber: phoneNumber,
                fullBillingCycles: fullBillingCycles,
                planInfo: planInfo,
                billingStartDate: billingScopeStart.toLocaleDateString(),
                billingEndDate: billingScopeEnd.toLocaleDateString(),
                totalCost: Number(totalCost.toFixed(2)),
                billingDetails: billing
            }
        };

        _reply.send(res);

    }
}
