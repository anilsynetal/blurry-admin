import { BaseService } from './base.service';
import type { ApiListResponse, QueryParams } from '../types/common.types';

export interface UserLoungeDetail {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
        isActive: boolean;
    };
    lounge: {
        _id: string;
        name: string;
        description: string;
        image: string;
        isActive: boolean;
    };
    joinedAt: string;
    vibeDescription: string;
    loungeSwitchesCount: number;
}

export interface UserLoungeDetailsQueryParams extends QueryParams {
    search?: string;
    userId?: string;
    loungeId?: string;
}

class UserLoungeDetailsService extends BaseService<UserLoungeDetail> {
    constructor() {
        super({
            baseEndpoint: '/v1/lounges/users/details',
            cacheTags: ['user-lounge-details']
        });
    }

    /**
     * Get user lounge details with filtering
     */
    async getUserLoungeDetails(params: UserLoungeDetailsQueryParams = {}): Promise<ApiListResponse<UserLoungeDetail>> {
        return this.getAll(params);
    }
}

export const userLoungeDetailsService = new UserLoungeDetailsService();