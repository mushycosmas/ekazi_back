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
}

export interface VerifyPaymentInput {
    reference: string;
}

export interface PaymentProviderResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
    raw?: any;
}

export interface PaymentProvider {
    initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse>;

    verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse>;
}