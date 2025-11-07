import React, { useEffect, useState } from 'react';
import { emailTemplatesService, EmailTemplate } from '../../services/emailTemplates.service';
import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';

interface ValidationError {
    field: string;
    message: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            data?: ValidationError[];
        };
    };
    message?: string;
}

const EmailTemplatesPage: React.FC = () => {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        html: '',
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await emailTemplatesService.getAll();
            setTemplates(response.data || []);
        } catch (error) {
            console.error('Error fetching email templates:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch email templates'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleValidationErrors = (error: ApiError) => {
        const validationErrors = error.response?.data?.data;
        if (validationErrors && Array.isArray(validationErrors)) {
            const errors: Record<string, string> = {};
            validationErrors.forEach((err: ValidationError) => {
                errors[err.field] = err.message;
            });
            setFieldErrors(errors);
        } else {
            // Show general error toast for non-validation errors
            showToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || error.message || 'An error occurred'
            });
        }
    };

    const clearFieldErrors = () => {
        setFieldErrors({});
    };

    const handleDeleteTemplate = async (templateName: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `You are about to delete the email template <strong>"${templateName}"</strong>.<br/>This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true
        });

        if (result.isConfirmed) {
            try {
                await emailTemplatesService.delete(templateName);
                await fetchTemplates();

                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Email template has been deleted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });

                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Email template deleted successfully!'
                });
            } catch (error) {
                console.error('Error deleting email template:', error);
                const apiError = error as ApiError;

                await Swal.fire({
                    title: 'Error!',
                    text: apiError.response?.data?.message || apiError.message || 'Failed to delete email template',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });

                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to delete email template'
                });
            }
        }
    };



    const handleCreateTemplate = async () => {
        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const response = await emailTemplatesService.create(formData);
            if (response.status === 'success') {
                await fetchTemplates();
                setShowCreateModal(false);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Email template created successfully!'
                });
            }
        } catch (error) {
            console.error('Error creating email template:', error);
            const apiError = error as ApiError;
            handleValidationErrors(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTemplate = async () => {
        if (!selectedTemplate?.name) return;

        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const response = await emailTemplatesService.update(selectedTemplate.name, formData);
            if (response.status === 'success') {
                await fetchTemplates();
                setShowEditModal(false);
                setSelectedTemplate(null);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Email template updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating email template:', error);
            const apiError = error as ApiError;
            handleValidationErrors(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreviewTemplate = async (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setPreviewLoading(true);
        setShowPreviewModal(true);

        try {
            const response = await emailTemplatesService.preview(template.name);
            if (response.status === 'success') {
                setPreviewHtml(response.data.html);
            }
        } catch (error) {
            console.error('Error previewing email template:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to preview email template'
            });
            setShowPreviewModal(false);
        } finally {
            setPreviewLoading(false);
        }
    }; const openEditModal = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            html: template.html,
            isActive: template.isActive || true
        });
        setIsSubmitting(false);
        clearFieldErrors();
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            subject: '',
            html: '',
            isActive: true
        });
        setIsSubmitting(false);
        clearFieldErrors();
        setPreviewHtml('');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="row mb-4">
                <div className="col-12">
                    <h4 className="fw-bold py-3 mb-4">
                        <span className="text-muted fw-light">Admin /</span> Email Templates
                    </h4>
                </div>
            </div>

            {/* Action Bar */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Email Templates Management</h5>
                            <div className="d-flex gap-2">
                                <div className="btn-group" role="group">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setViewMode('table')}
                                    >
                                        <i className="bx bx-table"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <i className="bx bx-grid-alt"></i>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <i className="bx bx-plus me-1"></i>
                                    Add New Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Display */}
            {viewMode === 'table' ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Subject</th>
                                                <th>Status</th>
                                                <th>Last Updated</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {templates.map((template, index) => (
                                                <tr key={template._id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bx bx-envelope me-2 text-primary"></i>
                                                            <span className="fw-semibold">{template.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-truncate" style={{ maxWidth: '300px' }}>
                                                            {template.subject}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${template.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                            {template.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(template.updatedAt)}</td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <button
                                                                type="button"
                                                                className="btn p-0 dropdown-toggle hide-arrow"
                                                                data-bs-toggle="dropdown"
                                                            >
                                                                <i className="bx bx-dots-vertical-rounded"></i>
                                                            </button>
                                                            <div className="dropdown-menu">
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => handlePreviewTemplate(template)}
                                                                >
                                                                    <i className="bx bx-show-alt me-1"></i> Preview
                                                                </button>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => openEditModal(template)}
                                                                >
                                                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                                                </button>
                                                                <div className="dropdown-divider"></div>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => handleDeleteTemplate(template.name)}
                                                                >
                                                                    <i className="bx bx-trash me-1"></i> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {templates.map((template) => (
                        <div key={template._id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 className="mb-1">{template.name}</h5>
                                            <small className="text-muted">{formatDate(template.updatedAt)}</small>
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                type="button"
                                                className="btn p-0 dropdown-toggle hide-arrow"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </button>
                                            <div className="dropdown-menu">
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => handlePreviewTemplate(template)}
                                                >
                                                    <i className="bx bx-show-alt me-1"></i> Preview
                                                </button>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => openEditModal(template)}
                                                >
                                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                                </button>
                                                <div className="dropdown-divider"></div>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={() => handleDeleteTemplate(template.name)}
                                                >
                                                    <i className="bx bx-trash me-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="mb-2">Subject:</h6>
                                    <p className="text-muted mb-3">{template.subject}</p>

                                    <h6 className="mb-2">Preview:</h6>
                                    <div
                                        className="border rounded p-2 mb-3"
                                        style={{ height: '120px', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: template.html }}
                                    />

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`badge ${template.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {template.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openEditModal(template)}
                                        >
                                            <i className="bx bx-edit-alt me-1"></i>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {templates.length === 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="bx bx-envelope display-4 text-muted mb-3"></i>
                                <h5>No Email Templates Found</h5>
                                <p className="text-muted">Get started by creating your first email template</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <i className="bx bx-plus me-1"></i>
                                    Create Your First Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Template Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Email Template</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Template Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., welcome-email, reset-password"
                                                required
                                            />
                                            {fieldErrors.name ? (
                                                <div className="invalid-feedback">{fieldErrors.name}</div>
                                            ) : (
                                                <small className="text-muted">Use lowercase letters, numbers, and hyphens only</small>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Subject <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.subject ? 'is-invalid' : ''}`}
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                            {fieldErrors.subject && (
                                                <div className="invalid-feedback">{fieldErrors.subject}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            HTML Content <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className={`form-control ${fieldErrors.html ? 'is-invalid' : ''}`}
                                            rows={15}
                                            value={formData.html}
                                            onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                                            placeholder="Enter your HTML email template here..."
                                            style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                            required
                                        />
                                        {fieldErrors.html ? (
                                            <div className="invalid-feedback">{fieldErrors.html}</div>
                                        ) : (
                                            <small className="text-muted">
                                                You can use variables like {`{{name}}`}, {`{{email}}`}, {`{{link}}`} in your template
                                            </small>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <label className="form-check-label">Active Template</label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateTemplate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bx bx-plus me-1"></i>
                                            Create Template
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Template Modal */}
            {showEditModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Email Template</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Template Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled
                                            />
                                            <small className="text-muted">Template name cannot be changed</small>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Subject <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.subject ? 'is-invalid' : ''}`}
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                            {fieldErrors.subject && (
                                                <div className="invalid-feedback">{fieldErrors.subject}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            HTML Content <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className={`form-control ${fieldErrors.html ? 'is-invalid' : ''}`}
                                            rows={15}
                                            value={formData.html}
                                            onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                                            style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                            required
                                        />
                                        {fieldErrors.html ? (
                                            <div className="invalid-feedback">{fieldErrors.html}</div>
                                        ) : (
                                            <small className="text-muted">
                                                You can use variables like {`{{name}}`}, {`{{email}}`}, {`{{link}}`} in your template
                                            </small>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <label className="form-check-label">Active Template</label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditTemplate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bx bx-check me-1"></i>
                                            Update Template
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Template Modal */}
            {showPreviewModal && selectedTemplate && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bx bx-show-alt me-2"></i>
                                    Preview: {selectedTemplate.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedTemplate(null);
                                        setPreviewHtml('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Subject:</strong> {selectedTemplate.subject}
                                    </div>
                                    <div className="col-md-6">
                                        <span className={`badge ${selectedTemplate.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <i className="bx bx-info-circle me-2"></i>
                                    This preview shows the template with sample data. Variables like <code>{`{{name}}`}</code>, <code>{`{{email}}`}</code>, etc. are replaced with placeholder values.
                                </div>

                                {previewLoading ? (
                                    <div className="d-flex justify-content-center align-items-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading preview...</span>
                                        </div>
                                        <span className="ms-2">Loading preview...</span>
                                    </div>
                                ) : (
                                    <div className="border rounded p-3" style={{ minHeight: '400px', backgroundColor: '#f8f9fa' }}>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                                            style={{
                                                backgroundColor: 'white',
                                                padding: '20px',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedTemplate(null);
                                        setPreviewHtml('');
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        openEditModal(selectedTemplate);
                                        setPreviewHtml('');
                                    }}
                                >
                                    <i className="bx bx-edit-alt me-1"></i>
                                    Edit Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style>{`
                /* Required field indicator */
                .text-danger {
                    color: #dc3545 !important;
                }
                
                /* Preview modal styling */
                .modal-xl .modal-body {
                    max-height: 70vh;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
};

export default EmailTemplatesPage;