import { FAQ } from '../types/faq.types';
import { BaseService } from './base.service';
import api from './api.service';

export interface FAQQueryParams {
    search?: string;
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

class FAQService extends BaseService<FAQ> {
    constructor() {
        super({ baseEndpoint: '/v1/faqs', cacheTags: ['faqs'] });
    }

    async getFAQs(params: FAQQueryParams = {}): Promise<any> {
        return this.getAll(params);
    }

    async createFAQ(faq: Partial<FAQ>): Promise<FAQ> {
        const response = await api.post<{ status: string; data: FAQ }>(this.baseEndpoint, faq);
        return response.data.data;
    }

    async updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ> {
        const response = await api.put<{ status: string; data: FAQ }>(`${this.baseEndpoint}/${id}`, faq);
        return response.data.data;
    }

    async deleteFAQ(id: string): Promise<any> {
        const response = await api.delete<{ status: string; message: string }>(`${this.baseEndpoint}/${id}`);
        return response.data;
    }

    async toggleFAQActive(id: string): Promise<FAQ> {
        const response = await api.patch<{ status: string; data: FAQ }>(`${this.baseEndpoint}/${id}/active`);
        return response.data.data;
    }
}

export const faqService = new FAQService();
