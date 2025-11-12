export interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
