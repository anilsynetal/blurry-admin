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
    type: 'coffee' | 'dinner' | 'lunch' | 'drinks' | 'movie' | 'walk' | 'activity' | 'custom';
    costType?: 'free' | 'low_cost' | 'medium' | 'premium';
    templateImage?: string;
    icon?: string;
    isActive?: boolean;
    sortOrder?: number;
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
    async createDatePlanTemplate(data: CreateDatePlanTemplatePayload, images?: { templateImage?: File; iconImage?: File }): Promise<ApiResponse<DatePlanTemplate>> {
        if (images && (images.templateImage || images.iconImage)) {
            const formData = new FormData();

            // Add template data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add images
            if (images.templateImage) {
                formData.append('datePlanTemplateImage', images.templateImage);
            }
            if (images.iconImage) {
                formData.append('iconImage', images.iconImage);
            }

            return this.uploadFile(this.baseEndpoint, formData);
        } else {
            return this.create(data);
        }
    }

    /**
     * Update date plan template with optional image uploads
     */
    async updateDatePlanTemplate(id: string, data: UpdateDatePlanTemplatePayload, images?: { templateImage?: File; iconImage?: File }): Promise<ApiResponse<DatePlanTemplate>> {
        if (images && (images.templateImage || images.iconImage)) {
            const formData = new FormData();

            // Add template data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add images
            if (images.templateImage) {
                formData.append('datePlanTemplateImage', images.templateImage);
            }
            if (images.iconImage) {
                formData.append('iconImage', images.iconImage);
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
}

export const datePlanTemplatesService = new DatePlanTemplatesService();