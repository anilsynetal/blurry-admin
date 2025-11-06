import axios from 'axios';
import { AdminUser } from '../context/SimpleAdminContext';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL + "/v1" || 'http://localhost:4002/api/admin/v1';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor to add auth token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't auto-redirect on 401 to prevent Settings tab switching issues
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized error in authService');
            localStorage.removeItem('admin_token');
        }
        return Promise.reject(error);
    }
);

interface LoginResponse {
    status: string;
    message: string;
    data?: {
        user: AdminUser;
        token: string;
    };
}

interface ValidationResponse {
    success: boolean;
    message: string;
    user?: AdminUser;
}

interface ForgotPasswordResponse {
    status: string;
    message: string;
    data?: any;
}

export const authService = {
    // Login admin user
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post('/auth/login', {
                email,
                password
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    // Validate current token (simplified - just check if token exists)
    async validateToken(): Promise<ValidationResponse> {
        const token = localStorage.getItem('admin_token');
        if (token) {
            // For now, just assume token is valid if it exists
            // In production, you'd want to verify with the server
            return {
                success: true,
                message: 'Token valid',
                user: {
                    _id: 'admin',
                    name: 'Admin User',
                    email: 'admin@blurry.com',
                    role: 'admin'
                }
            };
        } else {
            return {
                success: false,
                message: 'No token found'
            };
        }
    },

    // Forgot password
    async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
        try {
            const response = await axios.post('/auth/forgot-password', {
                email
            });
            return response.data;
        } catch (error: any) {
            // Return error response in same format
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to send reset email',
                data: null
            };
        }
    },

    // Logout (clear local token)
    logout(): void {
        localStorage.removeItem('admin_token');
    }
};