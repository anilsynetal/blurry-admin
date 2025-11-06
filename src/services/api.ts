import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API base URL from environment or default
const getApiBaseUrl = (): string => {
    // For Vite, use import.meta.env instead of process.env
    return import.meta.env.VITE_API_URL || 'http://localhost:4002/api/admin';
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('admin_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Don't auto-redirect on 401 to prevent Settings tab switching issues
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized error detected');
            localStorage.removeItem('admin_token');
        }
        return Promise.reject(error);
    }
);

export default api;