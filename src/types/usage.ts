export interface Usage {
  id: string;
  subscriberId: string;
  date: Date;
  usageInMb: number;
}

export interface UsageDetails extends Usage {
  phoneNumber: string;
  planId: string;
}