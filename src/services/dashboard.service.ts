import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    BaseEntity
} from '../types/common.types';

// Dashboard Statistics Interfaces
export interface DashboardStats {
    users: {
        total: number;
        active: number;
        online: number;
        recentSignups: number;
        engagementRate: number;
    };
    matches: {
        total: number;
        successful: number;
        successRate: number;
    };
    plans: {
        total: number;
        active: number;
    };
    activity: {
        datePlans: number;
        lounges: number;
        transactions: number;
        notifications: number;
        unblurRequests: number;
    };
}

export interface UserRegistrationChart {
    labels: string[];
    data: number[];
    period: number;
}

export interface PlatformWiseUsers {
    platforms: Array<{
        platform: string;
        count: number;
        percentage: string;
    }>;
    total: number;
}

export interface RecentUser extends BaseEntity {
    name: string;
    email: string;
    avatar?: string;
    platform?: string;
    signupProvider: string;
    isActive: boolean;
    isOnline: boolean;
    timeAgo: string;
}

export interface UserActivityChart {
    labels: string[];
    activeUsers: number[];
    onlineUsers: number[];
    period: number;
}

export interface DatingStats {
    matches: {
        total: number;
        active: number;
        byType: Array<{
            _id: string;
            count: number;
        }>;
    };
    datePlans: {
        total: number;
        completed: number;
        popular: Array<{
            _id: string;
            count: number;
        }>;
    };
    unblurRequests: {
        total: number;
        approved: number;
        approvalRate: string;
    };
}

class DashboardService extends BaseService<any> {
    constructor() {
        super({
            baseEndpoint: '/v1/dashboard',
            cacheTags: ['dashboard']
        });
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        return this.makeRequest('/stats');
    }

    /**
     * Get user registration chart data
     */
    async getUserRegistrationChart(period: number = 30): Promise<ApiResponse<UserRegistrationChart>> {
        return this.makeRequest(`/user-registrations?period=${period}`);
    }

    /**
     * Get platform-wise user distribution
     */
    async getPlatformWiseUsers(): Promise<ApiResponse<PlatformWiseUsers>> {
        return this.makeRequest('/platform-users');
    }

    /**
     * Get recent registered users
     */
    async getRecentUsers(limit: number = 10): Promise<ApiResponse<RecentUser[]>> {
        return this.makeRequest(`/recent-users?limit=${limit}`);
    }

    /**
     * Get user activity chart
     */
    async getUserActivityChart(period: number = 7): Promise<ApiResponse<UserActivityChart>> {
        return this.makeRequest(`/user-activity?period=${period}`);
    }

    /**
     * Get dating statistics
     */
    async getDatingStats(): Promise<ApiResponse<DatingStats>> {
        return this.makeRequest('/dating-stats');
    }

    /**
     * Helper method for GET requests
     */
    private async makeRequest(endpoint: string): Promise<any> {
        const response = await api.get(`${this.baseEndpoint}${endpoint}`);
        return this.handleResponse(response);
    }
}

export const dashboardService = new DashboardService();