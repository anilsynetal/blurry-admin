import React, { useEffect, useState } from 'react';
import { datePlanTemplatesService, DatePlanTemplate, CreateDatePlanTemplatePayload, UpdateDatePlanTemplatePayload } from '../../services/datePlanTemplates.service';
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

const DatePlanTemplatesPage: React.FC = () => {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState<DatePlanTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<DatePlanTemplate | null>(null);
    const [formData, setFormData] = useState<CreateDatePlanTemplatePayload>({
        title: '',
        description: '',
        type: 'coffee',
        costType: 'free',
        sortOrder: 0,
        isActive: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [templateImage, setTemplateImage] = useState<File | null>(null);
    const [iconImage, setIconImage] = useState<File | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await datePlanTemplatesService.getDatePlanTemplates();
            setTemplates(response.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch date plan templates'
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

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'coffee',
            costType: 'free',
            sortOrder: 0,
            isActive: true
        });
        setTemplateImage(null);
        setIconImage(null);
        setSelectedTemplate(null);
    };

    const handleCreateTemplate = async () => {
        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const images = templateImage || iconImage ? {
                templateImage: templateImage || undefined,
                iconImage: iconImage || undefined
            } : undefined;
            const response = await datePlanTemplatesService.createDatePlanTemplate(formData, images);
            if (response.status === 'success') {
                await fetchTemplates();
                setShowCreateModal(false);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Date plan template created successfully!'
                });
            }
        } catch (error) {
            handleValidationErrors(error as ApiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTemplate = async () => {
        if (!selectedTemplate) return;

        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const updateData: UpdateDatePlanTemplatePayload = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                costType: formData.costType,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive
            };

            const images = templateImage || iconImage ? {
                templateImage: templateImage || undefined,
                iconImage: iconImage || undefined
            } : undefined;
            const response = await datePlanTemplatesService.updateDatePlanTemplate(selectedTemplate._id!, updateData, images);

            if (response.status === 'success') {
                await fetchTemplates();
                setShowEditModal(false);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Date plan template updated successfully!'
                });
            }
        } catch (error) {
            handleValidationErrors(error as ApiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTemplate = async (template: DatePlanTemplate) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete "${template.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await datePlanTemplatesService.deleteDatePlanTemplate(template._id!);
                await fetchTemplates();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Date plan template deleted successfully!'
                });
            } catch (error) {
                const apiError = error as ApiError;
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to delete template'
                });
            }
        }
    };

    const handleStatusToggle = async (template: DatePlanTemplate) => {
        try {
            await datePlanTemplatesService.updateDatePlanTemplateStatus(template._id!, { isActive: !template.isActive });
            await fetchTemplates();
            showToast({
                type: 'success',
                title: 'Success',
                message: `Template ${!template.isActive ? 'activated' : 'deactivated'} successfully!`
            });
        } catch (error) {
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update template status'
            });
        }
    };

    const openEditModal = (template: DatePlanTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            title: template.title,
            description: template.description,
            type: template.type,
            costType: template.costType,
            sortOrder: template.sortOrder,
            isActive: template.isActive
        });
        setShowEditModal(true);
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        const baseUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:4002";
        return `${baseUrl.replace("/api/admin", "")}/${imagePath}`;
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
                        <span className="text-muted fw-light">Admin /</span> Date Plan Templates
                    </h4>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>Date Plan Templates</h5>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bx bx-plus me-1"></i> Add Template
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="table-responsive text-nowrap">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Cost Type</th>
                                        <th>Sort Order</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.length > 0 ? (
                                        templates.map((template) => (
                                            <tr key={template._id}>
                                                <td>
                                                    {template.templateImage && (
                                                        <img
                                                            src={getImageUrl(template.templateImage)}
                                                            alt={template.title}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            className="rounded"
                                                        />
                                                    )}
                                                </td>
                                                <td>{template.title}</td>
                                                <td>
                                                    <span className="badge bg-info">{template.type}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${template.costType === 'free' ? 'bg-success' : 'bg-warning'}`}>
                                                        {template.costType}
                                                    </span>
                                                </td>
                                                <td>{template.sortOrder}</td>
                                                <td>
                                                    <span className={`badge ${template.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {template.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn p-0 dropdown-toggle hide-arrow"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <i className="bx bx-dots-vertical-rounded"></i>
                                                        </button>
                                                        <div className="dropdown-menu">
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => openEditModal(template)}
                                                            >
                                                                <i className="bx bx-edit-alt me-1"></i> Edit
                                                            </button>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleStatusToggle(template)}
                                                            >
                                                                <i className={`bx ${template.isActive ? 'bx-pause' : 'bx-play'} me-1`}></i>
                                                                {template.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeleteTemplate(template)}
                                                            >
                                                                <i className="bx bx-trash me-1"></i> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">No date plan templates found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Date Plan Template</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Title *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Type *</label>
                                            <select
                                                className={`form-select ${fieldErrors.type ? 'is-invalid' : ''}`}
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            >
                                                <option value="coffee">Coffee</option>
                                                <option value="dinner">Dinner</option>
                                                <option value="lunch">Lunch</option>
                                                <option value="drinks">Drinks</option>
                                                <option value="movie">Movie</option>
                                                <option value="walk">Walk</option>
                                                <option value="activity">Activity</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                            {fieldErrors.type && <div className="invalid-feedback">{fieldErrors.type}</div>}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        {fieldErrors.description && <div className="invalid-feedback">{fieldErrors.description}</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Cost Type</label>
                                            <select
                                                className={`form-select ${fieldErrors.costType ? 'is-invalid' : ''}`}
                                                value={formData.costType}
                                                onChange={(e) => setFormData({ ...formData, costType: e.target.value as any })}
                                            >
                                                <option value="free">Free</option>
                                                <option value="low_cost">Low Cost</option>
                                                <option value="medium">Medium</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                            {fieldErrors.costType && <div className="invalid-feedback">{fieldErrors.costType}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                className={`form-control ${fieldErrors.sortOrder ? 'is-invalid' : ''}`}
                                                value={formData.sortOrder}
                                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            />
                                            {fieldErrors.sortOrder && <div className="invalid-feedback">{fieldErrors.sortOrder}</div>}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Template Image</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setTemplateImage(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Icon Image</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setIconImage(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateTemplate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedTemplate && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Date Plan Template</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Title *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Type *</label>
                                            <select
                                                className={`form-select ${fieldErrors.type ? 'is-invalid' : ''}`}
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            >
                                                <option value="coffee">Coffee</option>
                                                <option value="dinner">Dinner</option>
                                                <option value="lunch">Lunch</option>
                                                <option value="drinks">Drinks</option>
                                                <option value="movie">Movie</option>
                                                <option value="walk">Walk</option>
                                                <option value="activity">Activity</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                            {fieldErrors.type && <div className="invalid-feedback">{fieldErrors.type}</div>}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        {fieldErrors.description && <div className="invalid-feedback">{fieldErrors.description}</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Cost Type</label>
                                            <select
                                                className={`form-select ${fieldErrors.costType ? 'is-invalid' : ''}`}
                                                value={formData.costType}
                                                onChange={(e) => setFormData({ ...formData, costType: e.target.value as any })}
                                            >
                                                <option value="free">Free</option>
                                                <option value="low_cost">Low Cost</option>
                                                <option value="medium">Medium</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                            {fieldErrors.costType && <div className="invalid-feedback">{fieldErrors.costType}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                className={`form-control ${fieldErrors.sortOrder ? 'is-invalid' : ''}`}
                                                value={formData.sortOrder}
                                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            />
                                            {fieldErrors.sortOrder && <div className="invalid-feedback">{fieldErrors.sortOrder}</div>}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Template Image</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setTemplateImage(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Icon Image</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={(e) => setIconImage(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditTemplate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePlanTemplatesPage;