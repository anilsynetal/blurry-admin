import api from './api.service';
import { BaseService } from './base.service';
import type { ApiResponse, ApiListResponse, QueryParams, BaseEntity } from '../types/common.types';

export interface Transaction extends BaseEntity {
    user: {
        _id: string;
        name: string;
        email: string;
    };
    plan?: {
        _id: string;
        name: string;
        price: number;
    };
    subscription?: {
        _id: string;
        subscriptionId: string;
        status: string;
    };
    transactionId: string;
    amount: number;
    currency: string;
    type: 'subscription_charge' | 'refund' | 'fee' | 'adjustment';
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    paymentMethod: string;
    gateway: string;
    metadata?: Record<string, any>;
    fee: number;
    netAmount: number;
    receiptUrl?: string;
    errorMessage?: string;
}

export interface TransactionQueryParams extends QueryParams {
    status?: string;
    type?: string;
    userId?: string;
    gateway?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface UpdateTransactionStatusPayload {
    status: Transaction['status'];
}

export interface ProcessRefundPayload {
    amount?: number;
    reason?: string;
}

export interface TransactionStatsResponse {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    statusBreakdown: Array<{
        _id: string;
        count: number;
        totalAmount: number;
    }>;
    typeBreakdown: Array<{
        _id: string;
        count: number;
        totalAmount: number;
    }>;
    revenue: {
        totalRevenue: number;
        totalFees: number;
    };
    monthlyRevenue: Array<{
        _id: {
            year: number;
            month: number;
        };
        revenue: number;
        transactions: number;
    }>;
}

class TransactionService extends BaseService<Transaction> {
    constructor() {
        super({
            baseEndpoint: '/v1/transactions',
            cacheTags: ['transactions']
        });
    }

    /**
     * Get transactions list with filtering
     */
    async getTransactions(params: TransactionQueryParams = {}): Promise<ApiListResponse<Transaction>> {
        return this.getAll(params);
    }

    /**
     * Get transaction details by ID
     */
    async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
        return this.getById(id);
    }

    /**
     * Get user's transactions
     */
    async getUserTransactions(userId: string, params: QueryParams = {}): Promise<ApiListResponse<Transaction>> {
        const response = await api.get<ApiListResponse<Transaction>>(`${this.baseEndpoint}/user/${userId}`, { params });
        return this.handleResponse(response);
    }

    /**
     * Update transaction status
     */
    async updateTransactionStatus(id: string, statusData: UpdateTransactionStatusPayload): Promise<ApiResponse<Transaction>> {
        const response = await api.patch<ApiResponse<Transaction>>(`${this.baseEndpoint}/${id}/status`, statusData);
        return this.handleResponse(response);
    }

    /**
     * Process refund
     */
    async processRefund(id: string, refundData: ProcessRefundPayload): Promise<ApiResponse<Transaction>> {
        const response = await api.post<ApiResponse<Transaction>>(`${this.baseEndpoint}/${id}/refund`, refundData);
        return this.handleResponse(response);
    }

    /**
     * Get transaction statistics
     */
    async getTransactionStats(): Promise<ApiResponse<TransactionStatsResponse>> {
        const response = await api.get<ApiResponse<TransactionStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }
}

export const transactionService = new TransactionService();