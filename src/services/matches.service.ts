import api from './api.service';
import { BaseService } from './base.service';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/common.types';

export interface Match {
    _id: string;
    requester: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
        isActive: boolean;
    };
    requestee: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
        isActive: boolean;
    };
    status: 'pending' | 'approved' | 'denied' | 'matched' | 'expired';
    isMatched: boolean;
    matchedAt?: string;
    message: string;
    respondedAt?: string;
    isBlocked: boolean;
    blockedAt?: string;
    blockReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MatchQueryParams extends QueryParams {
    search?: string;
    status?: string;
    userId?: string;
    isMatched?: boolean;
    isBlocked?: boolean;
}

export interface UpdateMatchStatusPayload {
    status: Match['status'];
}

export interface ToggleMatchBlockPayload {
    isBlocked: boolean;
    blockReason?: string;
}

class MatchService extends BaseService<Match> {
    constructor() {
        super({
            baseEndpoint: '/v1/matches',
            cacheTags: ['matches']
        });
    }

    /**
     * Get matches with filtering
     */
    async getMatches(params: MatchQueryParams = {}): Promise<ApiListResponse<Match>> {
        return this.getAll(params);
    }

    /**
     * Get match details by ID
     */
    async getMatchById(id: string): Promise<{ data: Match }> {
        return this.getById(id);
    }

    /**
     * Get user matches
     */
    async getUserMatches(userId: string, params: QueryParams = {}): Promise<ApiListResponse<Match>> {
        const response = await api.get<ApiListResponse<Match>>(`${this.baseEndpoint}/user/${userId}`, { params });
        return this.handleResponse(response);
    }

    /**
     * Update match status
     */
    async updateMatchStatus(id: string, statusData: UpdateMatchStatusPayload): Promise<ApiResponse<Match>> {
        const response = await api.patch<ApiResponse<Match>>(`${this.baseEndpoint}/${id}/status`, statusData);
        return this.handleResponse(response);
    }

    /**
     * Block/unblock match
     */
    async toggleMatchBlock(id: string, blockData: ToggleMatchBlockPayload): Promise<ApiResponse<Match>> {
        const response = await api.patch<ApiResponse<Match>>(`${this.baseEndpoint}/${id}/block`, blockData);
        return this.handleResponse(response);
    }

    /**
     * Get match statistics
     */
    async getMatchStats(): Promise<ApiResponse<Record<string, any>>> {
        const response = await api.get<ApiResponse<Record<string, any>>>(`${this.baseEndpoint}/stats`);
        return this.handleResponse(response);
    }
}

export const matchService = new MatchService();