import { AxiosResponse } from 'axios';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    DeleteResponse,
    StatusUpdatePayload,
    BaseEntity
} from '../types/common.types';

export interface BaseServiceConfig {
    baseEndpoint: string;
    cacheTags?: string[];
}

export abstract class BaseService<T extends BaseEntity> {
    protected baseEndpoint: string;
    protected cacheTags: string[];

    constructor(config: BaseServiceConfig) {
        this.baseEndpoint = config.baseEndpoint;
        this.cacheTags = config.cacheTags || [];
    }

    /**
     * Build query string from params object
     */
    protected buildQueryString(params: QueryParams & Record<string, any>): string {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'boolean') {
                    queryParams.append(key, value.toString());
                } else if (Array.isArray(value)) {
                    value.forEach(item => queryParams.append(key, item.toString()));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        return queryParams.toString();
    }

    /**
     * Handle API response and extract data
     */
    protected handleResponse<R>(response: AxiosResponse<R>): R {
        return response.data;
    }

    /**
     * Get all records with optional filtering and pagination
     */
    async getAll(params: QueryParams & Record<string, any> = {}): Promise<ApiListResponse<T>> {
        const queryString = this.buildQueryString(params);
        const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
        const response = await api.get<ApiListResponse<T>>(url);
        return this.handleResponse(response);
    }

    /**
     * Get single record by ID
     */
    async getById(id: string): Promise<ApiResponse<T>> {
        const response = await api.get<ApiResponse<T>>(`${this.baseEndpoint}/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Create new record
     */
    async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>> {
        const response = await api.post<ApiResponse<T>>(this.baseEndpoint, data);
        return this.handleResponse(response);
    }

    /**
     * Update existing record
     */
    async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
        const response = await api.put<ApiResponse<T>>(`${this.baseEndpoint}/${id}`, data);
        return this.handleResponse(response);
    }

    /**
     * Update record status
     */
    async updateStatus(id: string, statusData: StatusUpdatePayload): Promise<ApiResponse<T>> {
        const response = await api.patch<ApiResponse<T>>(`${this.baseEndpoint}/${id}/status`, statusData);
        return this.handleResponse(response);
    }

    /**
     * Delete record
     */
    async delete(id: string): Promise<DeleteResponse> {
        const response = await api.delete<DeleteResponse>(`${this.baseEndpoint}/${id}`);
        return this.handleResponse(response);
    }

    /**
     * Upload file (for services that support file uploads)
     */
    protected async uploadFile(endpoint: string, formData: FormData): Promise<ApiResponse<any>> {
        // Use POST when uploading to the base endpoint (create),
        // and PUT when uploading to a specific resource endpoint (update).
        // Some backends expect multipart uploads on PUT for updates.
        const isCreate = endpoint === this.baseEndpoint || endpoint === `${this.baseEndpoint}`;
        let response;
        if (isCreate) {
            response = await api.post<ApiResponse<any>>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } else {
            response = await api.put<ApiResponse<any>>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return this.handleResponse(response);
    }

    /**
     * Get statistics (for services that support stats)
     */
    async getStats(): Promise<ApiResponse<Record<string, any>>> {
        const response = await api.get<ApiResponse<Record<string, any>>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }
}

/**
 * Service factory function to create instances with proper typing
 */
export function createService<T extends BaseEntity>(config: BaseServiceConfig): BaseService<T> {
    return new (class extends BaseService<T> { })(config);
}