import { DataPlan } from "@prisma/client"

export interface BillingReport {
    phoneNumber: string;
    fullBillingCycles: number;
    planInfo: DataPlan;
    billingStartDate: string;
    billingEndDate: string;
    totalCost: number;
    billingDetails: CycleDetails[]
}

export interface CycleDetails {
    cycleStartDate: string;
    cycleEndDate: string;
    cycleUsageInMb: number;
    excessDataInMb: number;
    costOfExcessData: number;
    costOfBillingCycle: number;
}