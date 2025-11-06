import { BaseService } from './base.service';
import api from './api.service';
import {
    ApiResponse,
    ApiListResponse,
    QueryParams,
    BaseEntity,
    DeleteResponse
} from '../types/common.types';

// Notification related interfaces
export interface Notification extends BaseEntity {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'promotion' | 'system';
    priority: 'low' | 'normal' | 'high';
    image?: string;
    isBroadcast: boolean;
    isRead: boolean;
    recipients?: string[]; // User IDs for targeted notifications
    totalRecipients?: number;
    deliveryCount: number;
    push: boolean; // Whether to send push notification
    pushSent?: boolean;
    pushSentAt?: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
    createdBy: string;
    createdByDetails?: {
        username: string;
        email: string;
    };
}

export interface NotificationQueryParams extends QueryParams {
    type?: string;
    priority?: string;
    isBroadcast?: boolean;
    push?: boolean;
    pushSent?: boolean;
    isExpired?: boolean;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateBroadcastPayload {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success' | 'promotion' | 'system';
    priority?: 'low' | 'normal' | 'high';
    image?: string;
    push?: boolean;
    expiresAt?: string;
    data?: Record<string, any>;
}

export interface CreateTargetedNotificationPayload extends CreateBroadcastPayload {
    recipients: string[]; // Array of user IDs
}

export interface NotificationStatsResponse {
    totalNotifications: number;
    broadcastNotifications: number;
    targetedNotifications: number;
    pushNotifications: number;
    deliveredNotifications: number;
    failedNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    expiredNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByPriority: Record<string, number>;
    monthlyStats: Array<{
        month: string;
        total: number;
        broadcast: number;
        targeted: number;
        delivered: number;
    }>;
    recentActivity: Array<{
        date: string;
        sent: number;
        delivered: number;
        read: number;
    }>;
}

export interface DeliveryStatsResponse {
    notificationId: string;
    totalRecipients: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
    deliveryRate: number;
    readRate: number;
    deliveryDetails: Array<{
        userId: string;
        username: string;
        email: string;
        delivered: boolean;
        deliveredAt?: string;
        read: boolean;
        readAt?: string;
        error?: string;
    }>;
}

class NotificationsService extends BaseService<Notification> {
    constructor() {
        super({
            baseEndpoint: '/v1/notifications',
            cacheTags: ['notifications']
        });
    }

    /**
     * Get notifications list with filtering
     */
    async getNotifications(params: NotificationQueryParams = {}): Promise<ApiListResponse<Notification>> {
        return this.getAll(params);
    }

    /**
     * Get notification details by ID
     */
    async getNotificationById(id: string): Promise<ApiResponse<Notification>> {
        return this.getById(id);
    }

    /**
     * Create broadcast notification (sent to all users)
     */
    async createBroadcast(data: CreateBroadcastPayload): Promise<ApiResponse<Notification>> {
        const response = await api.post<ApiResponse<Notification>>(
            `${this.baseEndpoint}/broadcast`,
            data
        );
        return this.handleResponse(response);
    }

    /**
     * Create targeted notification (sent to specific users)
     */
    async createTargetedNotification(data: CreateTargetedNotificationPayload): Promise<ApiResponse<Notification>> {
        // Transform recipients to userIds for backend compatibility
        const backendData = {
            ...data,
            userIds: data.recipients
        };
        // Remove recipients field as backend doesn't expect it
        delete (backendData as any).recipients;

        const response = await api.post<ApiResponse<Notification>>(
            `${this.baseEndpoint}/users`,
            backendData
        );
        return this.handleResponse(response);
    }

    /**
     * Delete notification
     */
    async deleteNotification(id: string): Promise<DeleteResponse> {
        return this.delete(id);
    }

    /**
     * Get notification statistics
     */
    async getNotificationStats(): Promise<ApiResponse<NotificationStatsResponse>> {
        const response = await api.get<ApiResponse<NotificationStatsResponse>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }

    /**
     * Get delivery statistics for a specific notification
     */
    async getDeliveryStats(notificationId: string): Promise<ApiResponse<DeliveryStatsResponse>> {
        const response = await api.get<ApiResponse<DeliveryStatsResponse>>(
            `${this.baseEndpoint}/${notificationId}/delivery-stats`
        );
        return this.handleResponse(response);
    }

    /**
     * Resend failed notifications
     */
    async resendNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/${notificationId}/resend`
        );
        return this.handleResponse(response);
    }

    /**
     * Mark notification as expired
     */
    async expireNotification(notificationId: string): Promise<ApiResponse<Notification>> {
        const response = await api.patch<ApiResponse<Notification>>(
            `${this.baseEndpoint}/${notificationId}/expire`
        );
        return this.handleResponse(response);
    }

    /**
     * Get notification templates (if available)
     */
    async getNotificationTemplates(): Promise<ApiListResponse<any>> {
        const response = await api.get<ApiListResponse<any>>(`${this.baseEndpoint}/templates`);
        return this.handleResponse(response);
    }

    /**
     * Test notification (send to admin only)
     */
    async testNotification(data: CreateBroadcastPayload): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/test`,
            data
        );
        return this.handleResponse(response);
    }

    /**
     * Upload notification image
     */
    async uploadNotificationImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
        const formData = new FormData();
        formData.append('image', file);

        return this.uploadFile(`${this.baseEndpoint}/upload-image`, formData);
    }

    /**
     * Get notification analytics for dashboard
     */
    async getNotificationAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<any>> {
        const response = await api.get<ApiResponse<any>>(
            `${this.baseEndpoint}/analytics?period=${period}`
        );
        return this.handleResponse(response);
    }

    /**
     * Schedule notification for later delivery
     */
    async scheduleNotification(data: CreateBroadcastPayload & { scheduledFor: string }): Promise<ApiResponse<Notification>> {
        const response = await api.post<ApiResponse<Notification>>(
            `${this.baseEndpoint}/schedule`,
            data
        );
        return this.handleResponse(response);
    }

    /**
     * Cancel scheduled notification
     */
    async cancelScheduledNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.patch<ApiResponse<{ message: string }>>(
            `${this.baseEndpoint}/${notificationId}/cancel`
        );
        return this.handleResponse(response);
    }

    /**
     * Get user notification preferences
     */
    async getUserNotificationPreferences(userId: string): Promise<ApiResponse<any>> {
        const response = await api.get<ApiResponse<any>>(
            `${this.baseEndpoint}/users/${userId}/preferences`
        );
        return this.handleResponse(response);
    }
}

export const notificationsService = new NotificationsService();