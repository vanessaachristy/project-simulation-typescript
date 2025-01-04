export interface UsageCSVRow {
    phone_number: string;
    plan_id: string;
    date: number;
    usage_in_mb: number;
}

export interface InsertUsageDbResult {
    success: boolean;
    error?: string;
}

export interface ImportResult {
    phoneNumber: string;
    planId: string;
    date: string;
    usageInMb: number;
}

export interface ErrorEntry extends ImportResult {
    reason: string;
}

export interface ImportResponse {
    imported: number;
    errorsLength: number;
    errors: ErrorEntry[];
}