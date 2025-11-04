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
     * Get date plans list with filtering
     */
    async getDatePlans(params: DatePlanQueryParams = {}): Promise<ApiListResponse<DatePlan>> {
        return this.getAll(params);
    }

    /**
     * Get date plan details by ID
     */
    async getDatePlanById(id: string): Promise<ApiResponse<DatePlan>> {
        return this.getById(id);
    }

    /**
     * Delete date plan
     */
    async deleteDatePlan(id: string): Promise<DeleteResponse> {
        return this.delete(id);
    }

    /**
     * Get date plan statistics
     */
    async getDatePlanStats(): Promise<ApiResponse<DatePlanStatsResponse>> {
        const response = await api.get<ApiResponse<DatePlanStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }
}

export const datePlansService = new DatePlansService();