import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    BaseEntity,
    DeleteResponse
} from '../types/common.types';

// User related interfaces
export interface User extends BaseEntity {
    username: string;
    email: string;
    name: string;
    mobile?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    avatar?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    };
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    preferences?: {
        language?: 'en' | 'es' | 'fr' | 'de' | 'hi';
        theme?: 'light' | 'dark' | 'auto';
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
    };
    role: 'app_user' | 'admin' | 'super_admin' | 'user';
    isActive: boolean;
    isEmailVerified: boolean;
    isDeleted: boolean;
    lastLogin?: string;
}

export interface AdminProfile extends BaseEntity {
    username: string;
    email: string;
    name: string;
    mobile?: string;
    avatar?: string;
    role: 'admin' | 'super_admin';
    lastLogin?: string;
}

export interface UserQueryParams extends QueryParams {
    isActive?: boolean;
    isEmailVerified?: boolean;
    role?: string;
    gender?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface UserStatusUpdate {
    isActive?: boolean;
}

export interface ChangePasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

export interface AdminPasswordPayload extends ChangePasswordPayload {
    currentPassword: string;
}

export interface UpdateAdminProfilePayload {
    name?: string;
    mobile?: string;
    email?: string;
    username?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
}

export interface UserStatsResponse {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    newUsersLast30Days: number;
}

class UsersService extends BaseService<User> {
    constructor() {
        super({
            baseEndpoint: '/v1/users',
            cacheTags: ['users']
        });
    }

    /**
     * Get users list with advanced filtering
     */
    async getUsers(params: UserQueryParams = {}): Promise<ApiListResponse<User>> {
        return this.getAll(params);
    }

    /**
     * Get deleted users list
     */
    async getDeletedUsers(params: UserQueryParams = {}): Promise<ApiListResponse<User>> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseEndpoint}/deleted${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<ApiListResponse<User>>(url);
        return this.handleResponse(response);
    }

    /**
     * Get user details by ID
     */
    async getUserById(id: string): Promise<ApiResponse<User>> {
        return this.getById(id);
    }

    /**
     * Update user information
     */
    async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
        return this.update(id, data);
    }

    /**
     * Update user status (active/blocked)
     */
    async updateUserStatus(id: string, statusData: UserStatusUpdate): Promise<ApiResponse<User>> {
        return this.updateStatus(id, statusData);
    }

    /**
     * Change user password (admin operation)
     */
    async changeUserPassword(id: string, passwordData: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>> {
        const response = await api.patch<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/${id}/password`,
            passwordData
        );
        return this.handleResponse(response);
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(id: string): Promise<DeleteResponse> {
        return this.delete(id);
    }

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<ApiResponse<UserStatsResponse>> {
        const response = await api.get<ApiResponse<UserStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }

    // Admin Profile Management
    /**
     * Get admin profile
     */
    async getAdminProfile(): Promise<ApiResponse<AdminProfile>> {
        const response = await api.get<ApiResponse<AdminProfile>>(`${this.baseEndpoint}/profile`);
        return this.handleResponse(response);
    }

    /**
     * Update admin profile
     */
    async updateAdminProfile(data: UpdateAdminProfilePayload): Promise<ApiResponse<AdminProfile>> {
        const response = await api.put<ApiResponse<AdminProfile>>(`${this.baseEndpoint}/profile`, data);
        return this.handleResponse(response);
    }

    /**
     * Change admin password
     */
    async changeAdminPassword(passwordData: AdminPasswordPayload): Promise<ApiResponse<{ message: string }>> {
        const response = await api.patch<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/profile/password`,
            {
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            }
        );
        return this.handleResponse(response);
    }
}

export const usersService = new UsersService();