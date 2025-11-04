import api from './api.service';
import { BaseService } from './base.service';
import type { ApiResponse, ApiListResponse, QueryParams, BaseEntity } from '../types/common.types';

export interface Subscription extends BaseEntity {
    user: {
        _id: string;
        name: string;
        email: string;
    };
    plan: {
        _id: string;
        name: string;
        price: number;
        billingCycle: string;
    };
    subscriptionId: string;
    status: 'active' | 'cancelled' | 'expired' | 'paused';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    credits: number;
    matchesLimit: number;
    loungeSwitches: 'limited' | 'unlimited';
    loungeSwitchesLimit?: number;
    renewalDate?: string;
    cancelAtPeriodEnd: boolean;
    isActive: boolean;
}

export interface SubscriptionQueryParams extends QueryParams {
    status?: string;
    userId?: string;
    planId?: string;
}

export interface UpdateSubscriptionStatusPayload {
    status: Subscription['status'];
    cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionStatsResponse {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    statusBreakdown: Array<{
        _id: string;
        count: number;
    }>;
    revenue: {
        totalRevenue: number;
        totalTransactions: number;
    };
}

class SubscriptionService extends BaseService<Subscription> {
    constructor() {
        super({
            baseEndpoint: '/v1/subscriptions',
            cacheTags: ['subscriptions']
        });
    }

    /**
     * Get subscriptions list with filtering
     */
    async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<ApiListResponse<Subscription>> {
        return this.getAll(params);
    }

    /**
     * Get subscription details by ID
     */
    async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
        return this.getById(id);
    }

    /**
     * Get user's subscriptions
     */
    async getUserSubscriptions(userId: string, params: QueryParams = {}): Promise<ApiListResponse<Subscription>> {
        const response = await api.get<ApiListResponse<Subscription>>(`${this.baseEndpoint}/user/${userId}`, { params });
        return this.handleResponse(response);
    }

    /**
     * Update subscription status
     */
    async updateSubscriptionStatus(id: string, statusData: UpdateSubscriptionStatusPayload): Promise<ApiResponse<Subscription>> {
        const response = await api.patch<ApiResponse<Subscription>>(`${this.baseEndpoint}/${id}/status`, statusData);
        return this.handleResponse(response);
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(id: string): Promise<ApiResponse<Subscription>> {
        const response = await api.post<ApiResponse<Subscription>>(`${this.baseEndpoint}/${id}/cancel`);
        return this.handleResponse(response);
    }

    /**
     * Reactivate subscription
     */
    async reactivateSubscription(id: string): Promise<ApiResponse<Subscription>> {
        const response = await api.post<ApiResponse<Subscription>>(`${this.baseEndpoint}/${id}/reactivate`);
        return this.handleResponse(response);
    }

    /**
     * Get subscription statistics
     */
    async getSubscriptionStats(): Promise<ApiResponse<SubscriptionStatsResponse>> {
        const response = await api.get<ApiResponse<SubscriptionStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }
}

export const subscriptionService = new SubscriptionService();