import api from './api';

export interface Plan {
    _id?: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    credits: number;
    matchesLimit: number;
    isFree: boolean;
    billingCycle: string;
    badge?: string;
    sortOrder: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Pagination {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export interface PlansResponse {
    status: string;
    message: string;
    data: Plan[];
    pagination?: Pagination;
}

export interface PlanResponse {
    status: string;
    message: string;
    data: Plan;
}

export interface PlanQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
}

export const plansService = {
    getAll: async (params: PlanQueryParams = {}): Promise<PlansResponse> => {
        const queryParams = new URLSearchParams();

        // Add pagination params
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        // Add search and sorting
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        // Add filters
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

        const response = await api.get<PlansResponse>(`/v1/plans?${queryParams.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<PlanResponse> => {
        const response = await api.get<PlanResponse>(`/v1/plans/${id}`);
        return response.data;
    },

    create: async (plan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlanResponse> => {
        const response = await api.post<PlanResponse>('/v1/plans', plan);
        return response.data;
    },

    update: async (id: string, plan: Partial<Plan>): Promise<PlanResponse> => {
        const response = await api.put<PlanResponse>(`/v1/plans/${id}`, plan);
        return response.data;
    },

    updateStatus: async (id: string, isActive: boolean): Promise<PlanResponse> => {
        const response = await api.patch<PlanResponse>(`/v1/plans/${id}/status`, { isActive });
        return response.data;
    },

    delete: async (id: string): Promise<{ status: string; message: string }> => {
        const response = await api.delete(`/v1/plans/${id}`);
        return response.data;
    },
};