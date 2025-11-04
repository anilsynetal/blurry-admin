import api from './api.service';

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    status: string;
    message: string;
    data: {
        user: AdminUser;
        token: string;
    };
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        console.log('Attempting login with:', credentials);
        console.log('API base URL:', api.defaults.baseURL);
        const response = await api.post<LoginResponse>('/v1/auth/login', credentials);
        console.log('Login response:', response);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/v1/auth/logout');
    },

    logoutAll: async (): Promise<void> => {
        await api.post('/v1/auth/logout-all');
    },

    forgotPassword: async (email: string): Promise<{ status: string; message: string }> => {
        const response = await api.post('/v1/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data: { token: string; password: string }): Promise<{ status: string; message: string }> => {
        const response = await api.post('/v1/auth/reset-password', data);
        return response.data;
    },

    changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ status: string; message: string }> => {
        const response = await api.post('/v1/auth/change-password', data);
        return response.data;
    },
};