// Common types used across all services and components
export interface ApiResponse<T = any> {
    status: string;
    message: string;
    data: T;
}

export interface ApiListResponse<T = any> extends ApiResponse<T[]> {
    pagination?: Pagination;
}

export interface Pagination {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
    isActive?: boolean;
    status?: string;
    type?: string;
    [key: string]: any;
}

export interface BaseEntity {
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StatusUpdatePayload {
    isActive?: boolean;
    status?: string;
}

export interface DeleteResponse {
    status: string;
    message: string;
}

export interface StatsResponse {
    status: string;
    message: string;
    data: Record<string, any>;
}

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormState<T> {
    data: T;
    errors: ValidationError[];
    isLoading: boolean;
    isSubmitting: boolean;
}

// Table configuration
export interface TableColumn<T = any> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
    key: string;
    title: string;
    icon?: React.ReactNode;
    onClick: (record: T) => void;
    disabled?: (record: T) => boolean;
    type?: 'primary' | 'danger' | 'default';
}