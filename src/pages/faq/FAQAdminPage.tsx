import React, { useEffect, useState } from 'react';
import { FAQ } from '../../types/faq.types';
import { faqService } from '../../services/faq.service';
import {
    LoadingSpinner,
    EmptyState,
    PageHeader,
    ActionBar,
    StatusBadge,
    ActionDropdown,
    TablePagination
} from '../../components/common';

import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';


const FAQAdminPage: React.FC = () => {
    const { showToast } = useToast();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [form, setForm] = useState<Partial<FAQ>>({ question: '', answer: '' });
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 25
    });

    const fetchFAQs = async (params?: any) => {
        setLoading(true);
        const queryParams = {
            page: pagination.currentPage,
            limit: pagination.pageSize,
            ...params
        };
        const response = await faqService.getFAQs(queryParams);
        setFaqs(response.data || []);
        if (response.pagination) {
            setPagination({
                totalRecords: response.pagination.totalRecords || 0,
                currentPage: response.pagination.currentPage || 1,
                totalPages: response.pagination.totalPages || 1,
                pageSize: response.pagination.pageSize || 25
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFAQs();
        // eslint-disable-next-line
    }, [pagination.currentPage, pagination.pageSize]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFAQ) {
                await faqService.updateFAQ(editingFAQ._id, form);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'FAQ updated successfully'
                });
            } else {
                await faqService.createFAQ(form);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'FAQ created successfully'
                });
            }
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Error',
                message: error?.response?.data?.message || error?.message || 'Operation failed'
            });
        }
        setForm({ question: '', answer: '' });
        setEditingFAQ(null);
        setShowFormModal(false);
        fetchFAQs();
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFAQ(faq);
        setForm({ question: faq.question, answer: faq.answer });
        setShowFormModal(true);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `You are about to delete this FAQ.<br/>This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });
        if (!result.isConfirmed) return;
        try {
            await faqService.deleteFAQ(id);
            showToast({
                type: 'success',
                title: 'Success',
                message: 'FAQ deleted successfully'
            });
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Error',
                message: error?.response?.data?.message || error?.message || 'Failed to delete FAQ'
            });
        }
        fetchFAQs();
    };

    const handleToggleActive = async (id: string) => {
        try {
            await faqService.toggleFAQActive(id);
            showToast({
                type: 'success',
                title: 'Success',
                message: 'FAQ status updated'
            });
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Error',
                message: error?.response?.data?.message || error?.message || 'Failed to update status'
            });
        }
        fetchFAQs();
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size: number) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
    };

    return (
        <div>
            <PageHeader
                title="FAQ Management"
                breadcrumbs={["Admin", "FAQ"]}
            />
            <ActionBar
                title="FAQs List"
                searchPlaceholder="Search question..."
                actions={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => { setShowFormModal(true); setEditingFAQ(null); setForm({ question: '', answer: '' }); }}
                    >
                        <i className="bx bx-plus me-1"></i>
                        Add FAQ
                    </button>
                }

            />
            {loading ? (
                <LoadingSpinner size="lg" text="Loading FAQs..." />
            ) : faqs.length > 0 ? (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.map(faq => (
                                    <tr key={faq._id}>
                                        <td>{faq.question}</td>
                                        <td>{faq.answer}</td>
                                        <td>
                                            <StatusBadge status={faq.isActive} />
                                        </td>
                                        <td>
                                            <ActionDropdown
                                                onEdit={() => handleEdit(faq)}
                                                onDelete={() => handleDelete(faq._id)}
                                                onToggleStatus={() => handleToggleActive(faq._id)}
                                                statusLabel={faq.isActive ? 'Deactivate' : 'Activate'}
                                                statusIcon={faq.isActive ? 'bx-x' : 'bx-check'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer">
                        <TablePagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            pageSize={pagination.pageSize}
                            totalRecords={pagination.totalRecords}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No FAQs Found"
                    description="Try adjusting your search or filters."
                    icon="bx-help-circle"
                    actionButton={
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => { setShowFormModal(true); setEditingFAQ(null); setForm({ question: '', answer: '' }); }}
                        >
                            <i className="bx bx-plus me-1"></i>
                            Add FAQ
                        </button>
                    }
                />
            )}
            {/* FAQ Form Modal */}
            {showFormModal && (
                <div className="modal show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h5>
                                    <button type="button" className="btn-close" onClick={() => { setShowFormModal(false); setEditingFAQ(null); setForm({ question: '', answer: '' }); }}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Question</label>
                                        <input
                                            name="question"
                                            className="form-control"
                                            placeholder="Question"
                                            value={form.question || ''}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Answer</label>
                                        <textarea
                                            name="answer"
                                            className="form-control"
                                            placeholder="Answer"
                                            value={form.answer || ''}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowFormModal(false); setEditingFAQ(null); setForm({ question: '', answer: '' }); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editingFAQ ? 'Update FAQ' : 'Add FAQ'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQAdminPage;
