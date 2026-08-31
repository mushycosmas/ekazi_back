 // src/payment/interfaces/payment-provider.interface.ts

export interface PaymentCustomer {
    firstname: string;
    lastname: string;
    middlename?: string;
    email: string;
    phone: string;
    name?: string;
    client_id?: number;
}

export interface InitiatePaymentInput {
    reference: string;
    amount: number;
    phone: string;
    currency: string;
    callbackUrl: string;
    customer: PaymentCustomer;
    idempotencyKey?: string; // Added for Snippe
}

export interface VerifyPaymentInput {
    reference: string;
}

export interface PaymentProviderResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
    raw?: any;
    data?: any; // Added for consistency
}

// ============================================================
// NEW INTERFACES
// ============================================================

export interface ListPaymentsInput {
    limit: number;
    offset: number;
}

export interface ListPaymentsResponse {
    success: boolean;
    data: {
        payments: any[];
        total: number;
        limit: number;
        offset: number;
    };
    message?: string;
}

export interface BalanceResponse {
    success: boolean;
    data: {
        balance: number;
        currency: string;
        available: number;
        pending: number;
        updated_at: string;
    };
    message?: string;
}

export interface SearchPaymentsInput {
    reference: string;
}

export interface SearchPaymentsResponse {
    success: boolean;
    data: {
        payments: any[];
    };
    message?: string;
}

export interface TriggerUssdPushInput {
    reference: string;
}

export interface TriggerUssdPushResponse {
    success: boolean;
    data: {
        status: string;
        message: string;
        reference: string;
    };
    message?: string;
}

// ============================================================
// MAIN PAYMENT PROVIDER INTERFACE
// ============================================================

export interface PaymentProvider {
    // Existing methods
    initiate(data: InitiatePaymentInput): Promise<PaymentProviderResponse>;
    verify(data: VerifyPaymentInput): Promise<PaymentProviderResponse>;
    
    // New methods
    listPayments(data: ListPaymentsInput): Promise<ListPaymentsResponse>;
    getBalance(): Promise<BalanceResponse>;
    searchPayments(data: SearchPaymentsInput): Promise<SearchPaymentsResponse>;
    triggerUssdPush(data: TriggerUssdPushInput): Promise<TriggerUssdPushResponse>;
}