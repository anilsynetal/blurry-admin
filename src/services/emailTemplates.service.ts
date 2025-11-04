import api from './api';

export interface EmailTemplate {
    _id?: string;
    name: string;
    subject: string;
    html: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmailTemplatesResponse {
    status: string;
    message: string;
    data: EmailTemplate[];
}

export interface EmailTemplateResponse {
    status: string;
    message: string;
    data: EmailTemplate;
}

export const emailTemplatesService = {
    getAll: async (): Promise<EmailTemplatesResponse> => {
        const response = await api.get<EmailTemplatesResponse>('/v1/email-templates');
        return response.data;
    },

    getByName: async (name: string): Promise<EmailTemplateResponse> => {
        const response = await api.get<EmailTemplateResponse>(`/v1/email-templates/${name}`);
        return response.data;
    },

    create: async (template: Omit<EmailTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplateResponse> => {
        const response = await api.post<EmailTemplateResponse>('/v1/email-templates', template);
        return response.data;
    },

    update: async (name: string, template: Partial<EmailTemplate>): Promise<EmailTemplateResponse> => {
        const response = await api.put<EmailTemplateResponse>(`/v1/email-templates/${name}`, template);
        return response.data;
    },



    delete: async (name: string): Promise<{ status: string; message: string }> => {
        const response = await api.delete(`/v1/email-templates/${name}`);
        return response.data;
    },
};