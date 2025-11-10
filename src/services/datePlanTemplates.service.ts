import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    BaseEntity,
    DeleteResponse
} from '../types/common.types';

// Date Plan Template related interfaces
export interface DatePlanTemplate extends BaseEntity {
    title: string;
    description: string;
    duration?: string;
    type: 'coffee' | 'dinner' | 'lunch' | 'drinks' | 'movie' | 'walk' | 'activity' | 'custom';
    costType?: 'free' | 'low_cost' | 'medium' | 'premium';
    templateImage?: string;
    isActive?: boolean;
    sortOrder?: number;
    userCount?: number;
    totalUsage?: number;
    createdBy?: string;
    createdByIp?: string;
    updatedBy?: string;
    updatedByIp?: string;
}

export interface DatePlanTemplateQueryParams extends QueryParams {
    isActive?: boolean;
    type?: string;
    costType?: string;
}

export interface CreateDatePlanTemplatePayload {
    title: string;
    description: string;
    duration?: string;
    type: DatePlanTemplate['type'];
    costType?: DatePlanTemplate['costType'];
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateDatePlanTemplatePayload extends Partial<CreateDatePlanTemplatePayload> {
    isActive?: boolean;
}

export interface DatePlanTemplateStatusUpdate {
    isActive: boolean;
}

export interface DatePlanTemplateStatsResponse {
    totalTemplates: number;
    activeTemplates: number;
    templatesByType: Record<string, number>;
    templatesByCostType: Record<string, number>;
}

export interface DatePlanTemplateUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isActive: boolean;
    usageCount: number;
    lastUsed: string;
    totalPlans: number;
    recentPlans: Array<{
        _id: string;
        description: string;
        proposedDate: string;
        status: string;
        createdAt: string;
    }>;
}

class DatePlanTemplatesService extends BaseService<DatePlanTemplate> {
    constructor() {
        super({
            baseEndpoint: '/v1/date-plan-templates',
            cacheTags: ['datePlanTemplates']
        });
    }

    /**
     * Get date plan templates list with filtering
     */
    async getDatePlanTemplates(params: DatePlanTemplateQueryParams = {}): Promise<ApiListResponse<DatePlanTemplate>> {
        return this.getAll(params);
    }

    /**
     * Get date plan template details by ID
     */
    async getDatePlanTemplateById(id: string): Promise<ApiResponse<DatePlanTemplate>> {
        return this.getById(id);
    }

    /**
     * Create new date plan template with image uploads
     */
    async createDatePlanTemplate(data: CreateDatePlanTemplatePayload, images?: { templateImage?: File }): Promise<ApiResponse<DatePlanTemplate>> {
        // Check if there are actual files to upload
        const hasTemplateImage = images?.templateImage instanceof File;

        if (hasTemplateImage) {
            const formData = new FormData();

            // Add template data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add images only if they are actual File objects
            if (hasTemplateImage) {
                formData.append('datePlanTemplateImage', images!.templateImage!);
            }

            return this.uploadFile(this.baseEndpoint, formData);
        } else {
            return this.create(data);
        }
    }

    /**
     * Update date plan template with optional image uploads
     */
    async updateDatePlanTemplate(id: string, data: UpdateDatePlanTemplatePayload, images?: { templateImage?: File }): Promise<ApiResponse<DatePlanTemplate>> {
        // Check if there are actual files to upload
        const hasTemplateImage = images?.templateImage instanceof File;

        if (hasTemplateImage) {
            const formData = new FormData();

            // Add template data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add images only if they are actual File objects
            if (hasTemplateImage) {
                formData.append('datePlanTemplateImage', images!.templateImage!);
            }

            return this.uploadFile(`${this.baseEndpoint}/${id}`, formData);
        } else {
            return this.update(id, data);
        }
    }

    /**
     * Update date plan template status (active/inactive)
     */
    async updateDatePlanTemplateStatus(id: string, statusData: DatePlanTemplateStatusUpdate): Promise<ApiResponse<DatePlanTemplate>> {
        return this.updateStatus(id, statusData);
    }

    /**
     * Delete date plan template
     */
    async deleteDatePlanTemplate(id: string): Promise<DeleteResponse> {
        return this.delete(id);
    }

    /**
     * Get date plan template statistics
     */
    async getDatePlanTemplateStats(): Promise<ApiResponse<DatePlanTemplateStatsResponse>> {
        const response = await api.get<ApiResponse<DatePlanTemplateStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }

    /**
     * Get users who used a specific date plan template
     */
    async getDatePlanTemplateUsers(templateId: string, params: QueryParams = {}): Promise<ApiListResponse<DatePlanTemplateUser>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/${templateId}/users${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<DatePlanTemplateUser>>(url);
        return this.handleResponse(response);
    }
}

export const datePlanTemplatesService = new DatePlanTemplatesService();