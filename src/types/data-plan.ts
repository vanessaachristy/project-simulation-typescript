export interface DataPlan {
  id: string;
  provider: string;
  name: string;
  dataFreeInGB: number;
  billingCycleInDays: number;
  price: number;
  excessChargePerMB: number;
}