import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    BaseEntity,
    DeleteResponse
} from '../types/common.types';

// Date Plan related interfaces
export interface DatePlan extends BaseEntity {
    description: string;
    proposedDate: string;
    proposedBy: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    proposedTo: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    matchId: string;
    templateUsed?: {
        _id: string;
        title: string;
        type: string;
        templateImage?: string;
    };
    isFromTemplate: boolean;
    status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
    respondedAt?: string;
    isActive: boolean;
}

export interface DatePlanQueryParams extends QueryParams {
    status?: string;
    proposedBy?: string;
    proposedTo?: string;
    matchId?: string;
    isFromTemplate?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export interface DatePlanStatsResponse {
    totalPlans: number;
    pendingPlans: number;
    acceptedPlans: number;
    completedPlans: number;
    cancelledPlans: number;
    expiredPlans: number;
    rejectedPlans: number;
    plansByStatus: Record<string, number>;
}

class DatePlansService extends BaseService<DatePlan> {
    constructor() {
        super({
            baseEndpoint: '/v1/date-plans',
            cacheTags: ['datePlans']
        });
    }

    /**
     * Get date plans list with filtering - using correct admin endpoint
     */
    async getDatePlans(params: DatePlanQueryParams = {}): Promise<ApiListResponse<DatePlan>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/list${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<DatePlan>>(url);
        return this.handleResponse(response);
    }

    /**
     * Get date plan details by ID - using correct admin endpoint
     */
    async getDatePlanById(id: string): Promise<ApiResponse<DatePlan>> {
        const response = await api.get<ApiResponse<DatePlan>>(`${this.baseEndpoint}/details/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Delete date plan - using correct admin endpoint
     */
    async deleteDatePlan(id: string): Promise<DeleteResponse> {
        const response = await api.delete<DeleteResponse>(`${this.baseEndpoint}/delete/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Update date plan status (activate/deactivate)
     */
    async updateDatePlanStatus(id: string, isActive: boolean): Promise<ApiResponse<DatePlan>> {
        const response = await api.patch<ApiResponse<DatePlan>>(
            `${this.baseEndpoint}/status/${id}`,
            { isActive }
        );
        return this.handleResponse(response);
    }

    /**
     * Get date plan statistics
     */
    async getDatePlanStats(): Promise<ApiResponse<DatePlanStatsResponse>> {
        const response = await api.get<ApiResponse<DatePlanStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }

    /**
     * Get date plans by status
     */
    async getDatePlansByStatus(status: string, params: DatePlanQueryParams = {}): Promise<ApiListResponse<DatePlan>> {
        const queryParams = { ...params, status };
        return this.getDatePlans(queryParams);
    }

    /**
     * Get date plans by user
     */
    async getDatePlansByUser(userId: string, params: DatePlanQueryParams = {}): Promise<ApiListResponse<DatePlan>> {
        const queryParams = { ...params, proposedBy: userId };
        return this.getDatePlans(queryParams);
    }

    /**
     * Get date plans by date range
     */
    async getDatePlansByDateRange(dateFrom: string, dateTo: string, params: DatePlanQueryParams = {}): Promise<ApiListResponse<DatePlan>> {
        const queryParams = { ...params, dateFrom, dateTo };
        return this.getDatePlans(queryParams);
    }
}

export const datePlansService = new DatePlansService();