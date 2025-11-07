import api from './api';

export interface SMTPConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
}

export interface StripeConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecretKey: string;
}

export interface SettingsResponse {
    status: string;
    message: string;
    data: any;
}

export const settingsService = {
    // SMTP Configuration
    getSmtpConfig: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/smtp');
        return response.data;
    },

    updateSmtpConfig: async (config: SMTPConfig): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings/smtp', config);
        return response.data;
    },

    // Privacy Policy
    getPrivacyPolicy: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/privacy-policy');
        return response.data;
    },

    updatePrivacyPolicy: async (content: string): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings/privacy-policy', { content });
        return response.data;
    },

    // Terms and Conditions
    getTermsAndConditions: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/terms-and-conditions');
        return response.data;
    },

    updateTermsAndConditions: async (content: string): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings/terms-and-conditions', { content });
        return response.data;
    },

    // Stripe Configuration
    getStripeConfig: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/stripe');
        return response.data;
    },

    updateStripeConfig: async (config: StripeConfig): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings/stripe', config);
        return response.data;
    },

    // General Settings
    getAllSettings: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings');
        return response.data;
    },

    updateSettings: async (settings: Record<string, any>): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings', settings);
        return response.data;
    },
};