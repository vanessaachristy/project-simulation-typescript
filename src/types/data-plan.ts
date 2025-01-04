export interface DataPlan {
  id: string;
  provider: string;
  name: string;
  dataFreeInGb: number;
  billingCycleInDays: number;
  price: number;
  excessChargePerMb: number;
}