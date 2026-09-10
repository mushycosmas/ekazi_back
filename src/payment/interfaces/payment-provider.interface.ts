// src/payment/interfaces/payment-provider.interface.ts

// ============================================================
// PAYMENT CUSTOMER
// ============================================================

export interface PaymentCustomer {
    firstname: string;
    lastname: string;
    middlename?: string;
    email: string;
    phone: string;
    name?: string;
    client_id?: number;
}

// ============================================================
// COMMON PAYMENT INPUT
// ============================================================

export interface InitiatePaymentInput {
    reference: string;
    amount: number;
    phone: string;
    currency: string;
    callbackUrl: string;
    customer: PaymentCustomer;
    idempotencyKey?: string;
}

export interface VerifyPaymentInput {
    reference: string;
}

// ============================================================
// COMMON PAYMENT RESPONSE
// ============================================================

export interface PaymentProviderResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
    raw?: any;
    data?: any;
}

// ============================================================
// LIST PAYMENTS
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

// ============================================================
// BALANCE
// ============================================================

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

// ============================================================
// SEARCH PAYMENTS
// ============================================================

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

// ============================================================
// USSD PUSH
// ============================================================

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
//
// Only methods that are common to payment providers should
// be placed here.
//
// Snippe and Selcom both implement this interface.
//

export interface PaymentProvider {

    initiate(
        data: InitiatePaymentInput,
    ): Promise<PaymentProviderResponse>;

    verify(
        data: VerifyPaymentInput,
    ): Promise<PaymentProviderResponse>;

    listPayments(
        data: ListPaymentsInput,
    ): Promise<ListPaymentsResponse>;

    getBalance(): Promise<BalanceResponse>;

    searchPayments(
        data: SearchPaymentsInput,
    ): Promise<SearchPaymentsResponse>;

    triggerUssdPush(
        data: TriggerUssdPushInput,
    ): Promise<TriggerUssdPushResponse>;

    listOrders?(
        fromdate: string,
        todate: string,
    ): Promise<PaymentProviderResponse>;
}

// ============================================================
// SELCOM ORDER INPUT
// ============================================================

export interface SelcomOrderInput {
    vendor: string;
    order_id: string;
    buyer_email: string;
    buyer_name: string;
    buyer_phone: string;
    amount: number;
    currency: string;

    buyer_remarks?: string;
    merchant_remarks?: string;
    no_of_items?: number;

    redirect_url?: string;
    cancel_url?: string;
    webhook?: string;
}

// ============================================================
// SELCOM WALLET PAYMENT INPUT
// ============================================================

export interface SelcomWalletPaymentInput {
    transid: string;
    order_id: string;
    msisdn: string;
}

// ============================================================
// SELCOM ORDER STATUS INPUT
// ============================================================

export interface SelcomOrderStatusInput {
    reference: string;
}

// ============================================================
// SELCOM CANCEL ORDER INPUT
// ============================================================

export interface SelcomCancelOrderInput {
    reference: string;
}

// ============================================================
// SELCOM PAYMENT PROVIDER INTERFACE
// ============================================================
//
// SELCOM implements the common PaymentProvider interface
// plus these SELCOM-specific operations.
//

export interface SelcomProvider extends PaymentProvider {

    createOrder(
        data: SelcomOrderInput,
    ): Promise<PaymentProviderResponse>;

    walletPayment(
        data: SelcomWalletPaymentInput,
    ): Promise<PaymentProviderResponse>;

    selcompesaPayment(
        data: SelcomWalletPaymentInput,
    ): Promise<PaymentProviderResponse>;

    orderStatus(
        reference: string,
    ): Promise<PaymentProviderResponse>;

    cancelOrder(
        reference: string,
    ): Promise<PaymentProviderResponse>;
}