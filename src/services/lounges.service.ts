import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    BaseEntity,
    DeleteResponse
} from '../types/common.types';

// Lounge related interfaces
export interface Lounge extends BaseEntity {
    name: string;
    description: string;
    image: string;
    bannerImage?: string;
    tags: string[];
    isActive: boolean;
    sortOrder: number;
    userCount?: number;
    createdBy?: string;
    createdByIp?: string;
    updatedBy?: string;
    updatedByIp?: string;
}

export interface LoungeQueryParams extends QueryParams {
    isActive?: boolean;
    tags?: string[];
}

export interface CreateLoungePayload {
    name: string;
    description: string;
    tags: string[];
    sortOrder?: number;
}

export interface UpdateLoungePayload extends Partial<CreateLoungePayload> {
    isActive?: boolean;
}

export interface LoungeStatusUpdate {
    isActive: boolean;
}

export interface LoungeStatsResponse {
    totalLounges: number;
    activeLounges: number;
    inactiveLounges: number;
    totalUsers: number;
}

export interface LoungeUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isActive: boolean;
    joinedAt: string;
    vibeDescription?: string;
}

export interface AvailableAmenity {
    id: string;
    name: string;
    icon?: string;
    category: string;
    isActive: boolean;
}

class LoungesService extends BaseService<Lounge> {
    constructor() {
        super({
            baseEndpoint: '/v1/lounges',
            cacheTags: ['lounges']
        });
    }

    /**
     * Get lounges list with filtering
     */
    async getLounges(params: LoungeQueryParams = {}): Promise<ApiListResponse<Lounge>> {
        return this.getAll(params);
    }

    /**
     * Get lounge details by ID
     */
    async getLoungeById(id: string): Promise<ApiResponse<Lounge>> {
        return this.getById(id);
    }

    /**
     * Create new lounge with image uploads
     */
    async createLounge(data: CreateLoungePayload, images: FileList | File[]): Promise<ApiResponse<Lounge>> {
        const formData = new FormData();

        // Add lounge data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Add images
        Array.from(images).forEach((file, index) => {
            if (index === 0) {
                formData.append('mainImage', file);
            }
            formData.append('images', file);
        });

        return this.uploadFile(this.baseEndpoint, formData);
    }

    /**
     * Update lounge with optional image uploads
     */
    async updateLounge(id: string, data: UpdateLoungePayload, images?: FileList | File[]): Promise<ApiResponse<Lounge>> {
        if (images && images.length > 0) {
            const formData = new FormData();

            // Add lounge data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            });

            // Add images
            Array.from(images).forEach((file, index) => {
                if (index === 0) {
                    formData.append('mainImage', file);
                }
                formData.append('images', file);
            });

            return this.uploadFile(`${this.baseEndpoint}/${id}`, formData);
        } else {
            return this.update(id, data);
        }
    }

    /**
     * Update lounge status (active/verified)
     */
    async updateLoungeStatus(id: string, statusData: LoungeStatusUpdate): Promise<ApiResponse<Lounge>> {
        return this.updateStatus(id, statusData);
    }

    /**
     * Delete lounge
     */
    async deleteLounge(id: string): Promise<DeleteResponse> {
        return this.delete(id);
    }

    /**
     * Get lounge statistics
     */
    async getLoungeStats(): Promise<ApiResponse<LoungeStatsResponse>> {
        const response = await api.get<ApiResponse<LoungeStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }

    /**
     * Get available amenities list
     */
    async getAvailableAmenities(): Promise<ApiListResponse<AvailableAmenity>> {
        const response = await api.get<ApiListResponse<AvailableAmenity>>('/v1/amenities');
        return this.handleResponse(response);
    }

    /**
     * Upload additional images to existing lounge
     */
    async uploadLoungeImages(loungeId: string, images: FileList | File[]): Promise<ApiResponse<{ images: string[] }>> {
        const formData = new FormData();

        Array.from(images).forEach((file) => {
            formData.append('images', file);
        });

        return this.uploadFile(`${this.baseEndpoint}/${loungeId}/images`, formData);
    }

    /**
     * Remove image from lounge
     */
    async removeLoungeImage(loungeId: string, imageUrl: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.delete<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/${loungeId}/images`,
            { data: { imageUrl } }
        );
        return this.handleResponse(response);
    }

    /**
     * Set main image for lounge
     */
    async setMainImage(loungeId: string, imageUrl: string): Promise<ApiResponse<Lounge>> {
        const response = await api.patch<ApiResponse<Lounge>>(
            `${this.baseEndpoint}/${loungeId}/main-image`,
            { mainImage: imageUrl }
        );
        return this.handleResponse(response);
    }

    /**
     * Get lounge bookings
     */
    async getLoungeBookings(loungeId: string, params: QueryParams = {}): Promise<ApiListResponse<any>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/${loungeId}/bookings${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<any>>(url);
        return this.handleResponse(response);
    }

    /**
     * Get lounge reviews
     */
    async getLoungeReviews(loungeId: string, params: QueryParams = {}): Promise<ApiListResponse<any>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/${loungeId}/reviews${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<any>>(url);
        return this.handleResponse(response);
    }

    /**
     * Verify lounge (admin action)
     */
    async verifyLounge(loungeId: string, isVerified: boolean): Promise<ApiResponse<Lounge>> {
        const response = await api.patch<ApiResponse<Lounge>>(
            `${this.baseEndpoint}/${loungeId}/verify`,
            { isVerified }
        );
        return this.handleResponse(response);
    }

    /**
     * Get lounge availability for specific date range
     */
    async getLoungeAvailability(loungeId: string, startDate: string, endDate: string): Promise<ApiResponse<any>> {
        const response = await api.get<ApiResponse<any>>(
            `${this.baseEndpoint}/${loungeId}/availability?startDate=${startDate}&endDate=${endDate}`
        );
        return this.handleResponse(response);
    }

    /**
     * Export lounges data
     */
    async exportLounges(params: LoungeQueryParams = {}): Promise<Blob> {
        const queryString = this.buildQueryString({ ...params, export: 'csv' });
        const response = await api.get(`${this.baseEndpoint}/export?${queryString}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get users joined to a specific lounge
     */
    async getLoungeUsers(loungeId: string, params: QueryParams = {}): Promise<ApiListResponse<LoungeUser>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/${loungeId}/users${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<LoungeUser>>(url);
        return this.handleResponse(response);
    }
}

export const loungesService = new LoungesService();