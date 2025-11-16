import api from './api';

export interface SMTPConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
    testEmail?: string;
}

export interface StripeConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecretKey: string;
}

export interface AppSettings {
    unblurPercentage: number;
    email: string;
    afterUnblurPercentage?: number;
}

export interface InvitationConfig {
    inviteTitle: string;
    inviteDescription: string;
    bannerImage: string | null;
    bannerImageFile?: File;
    referrerCreditAmount: number;
    referredCreditAmount: number;
    isEnabled: boolean;
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

    // App Settings (Admin endpoints)
    getAppSettings: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/app-config');
        return response.data;
    },

    updateAppSettings: async (config: AppSettings): Promise<SettingsResponse> => {
        const response = await api.put<SettingsResponse>('/v1/settings/app-config', config);
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

    // Invitation Configuration
    getInvitationConfig: async (): Promise<SettingsResponse> => {
        const response = await api.get<SettingsResponse>('/v1/settings/invitation-config');
        return response.data;
    },

    updateInvitationConfig: async (config: InvitationConfig): Promise<SettingsResponse> => {
        // Create FormData if file is present
        if (config.bannerImageFile) {
            const formData = new FormData();
            formData.append('inviteTitle', config.inviteTitle);
            formData.append('inviteDescription', config.inviteDescription);
            formData.append('referrerCreditAmount', config.referrerCreditAmount.toString());
            formData.append('referredCreditAmount', config.referredCreditAmount.toString());
            formData.append('isEnabled', config.isEnabled.toString());
            formData.append('bannerImage', config.bannerImageFile);

            const response = await api.put<SettingsResponse>('/v1/settings/invitation-config', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } else {
            // Regular JSON update without file
            const { bannerImageFile, ...configData } = config;
            const response = await api.put<SettingsResponse>('/v1/settings/invitation-config', configData);
            return response.data;
        }
    },

    // Test SMTP Connection (send test email)
    testSmtpConnection: async (data: { userEmail: string }): Promise<SettingsResponse> => {
        const response = await api.post<SettingsResponse>('/v1/settings/smtp/test', data);
        return response.data;
    },
};