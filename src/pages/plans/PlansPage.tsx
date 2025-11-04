import React, { useEffect, useState } from 'react';
import { plansService, Plan } from '../../services/plans.service';
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

const PlansPage: React.FC = () => {
    const { showToast } = useToast();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        credits: 100,
        matchesLimit: 50,
        isFree: false,
        billingCycle: 'monthly',
        badge: '',
        sortOrder: 1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await plansService.getAll();
            setPlans(response.data || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch plans'
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

    const handleCreatePlan = async () => {
        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const response = await plansService.create(formData);
            if (response.status === 'success') {
                await fetchPlans(); // Refresh the list
                setShowCreateModal(false);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Plan created successfully!'
                });
            }
        } catch (error) {
            console.error('Error creating plan:', error);
            const apiError = error as ApiError;
            handleValidationErrors(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditPlan = async () => {
        if (!selectedPlan?._id) return;

        setIsSubmitting(true);
        clearFieldErrors();
        try {
            const response = await plansService.update(selectedPlan._id, formData);
            if (response.status === 'success') {
                await fetchPlans(); // Refresh the list
                setShowEditModal(false);
                setSelectedPlan(null);
                resetForm();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Plan updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            const apiError = error as ApiError;
            handleValidationErrors(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlan = async (planId: string, planName: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `You are about to delete the plan <strong>"${planName}"</strong>.<br/>This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-html',
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            }
        });

        if (result.isConfirmed) {
            try {
                await plansService.delete(planId);
                await fetchPlans(); // Refresh the list

                // Success notification with SweetAlert2
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Plan has been deleted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });

                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Plan deleted successfully!'
                });
            } catch (error) {
                console.error('Error deleting plan:', error);
                const apiError = error as ApiError;

                // Error notification with SweetAlert2
                await Swal.fire({
                    title: 'Error!',
                    text: apiError.response?.data?.message || apiError.message || 'Failed to delete plan',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });

                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to delete plan'
                });
            }
        }
    };

    const togglePlanStatus = async (planId: string) => {
        const plan = plans.find(p => p._id === planId);
        if (!plan) return;

        try {
            await plansService.updateStatus(planId, !plan.isActive);
            await fetchPlans(); // Refresh the list
            showToast({
                type: 'success',
                title: 'Success',
                message: `Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully!`
            });
        } catch (error) {
            console.error('Error toggling plan status:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update plan status'
            });
        }
    };

    const openEditModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            credits: plan.credits,
            matchesLimit: plan.matchesLimit,
            isFree: plan.isFree,
            billingCycle: plan.billingCycle,
            badge: plan.badge || '',
            sortOrder: plan.sortOrder
        });
        setIsSubmitting(false);
        clearFieldErrors();
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            currency: 'USD',
            credits: 100,
            matchesLimit: 50,
            isFree: false,
            billingCycle: 'monthly',
            badge: '',
            sortOrder: 1
        });
        setIsSubmitting(false);
        clearFieldErrors();
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
                        <span className="text-muted fw-light">Admin /</span> Plans Management
                    </h4>
                </div>
            </div>

            {/* Action Bar */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Subscription Plans</h5>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <i className="bx bx-plus me-1"></i>
                                Add New Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="row">
                {plans.map((plan) => (
                    <div key={plan._id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                {plan.badge && (
                                    <div className="badge bg-label-primary mb-2">{plan.badge}</div>
                                )}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="mb-1">{plan.name}</h5>
                                        <p className="text-muted mb-0">{plan.description}</p>
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
                                                onClick={() => openEditModal(plan)}
                                            >
                                                <i className="bx bx-edit-alt me-1"></i> Edit
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => plan._id && togglePlanStatus(plan._id)}
                                            >
                                                <i className={`bx ${plan.isActive ? 'bx-x' : 'bx-check'} me-1`}></i>
                                                {plan.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                className="dropdown-item text-danger"
                                                onClick={() => plan._id && handleDeletePlan(plan._id, plan.name)}
                                            >
                                                <i className="bx bx-trash me-1"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span className="text-muted">$</span>
                                        <h1 className="mb-0 text-primary">{plan.price}</h1>
                                        <span className="text-muted">/{plan.billingCycle}</span>
                                    </div>
                                    {plan.isFree && (
                                        <small className="text-success fw-semibold">Free Forever</small>
                                    )}
                                </div>

                                <ul className="ps-3 mb-4">
                                    <li className="mb-2">
                                        <span className="fw-semibold">{plan.credits}</span> Credits
                                    </li>
                                    <li className="mb-2">
                                        <span className="fw-semibold">
                                            {plan.matchesLimit === -1 ? 'Unlimited' : plan.matchesLimit}
                                        </span> Matches
                                    </li>
                                    <li className="mb-2">
                                        <span className="fw-semibold">Priority</span> Support
                                    </li>
                                    <li className="mb-2">
                                        <span className="fw-semibold">Advanced</span> Filters
                                    </li>
                                </ul>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${plan.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <small className="text-muted">Order: {plan.sortOrder}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {plans.length === 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="bx bx-package display-4 text-muted mb-3"></i>
                                <h5>No Plans Found</h5>
                                <p className="text-muted">Get started by creating your first subscription plan</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <i className="bx bx-plus me-1"></i>
                                    Create Your First Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Plan Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Plan</h5>
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
                                                Plan Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter plan name"
                                                required
                                            />
                                            {fieldErrors.name && (
                                                <div className="invalid-feedback">{fieldErrors.name}</div>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Currency</label>
                                            <select
                                                className="form-select"
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Price <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Billing Cycle</label>
                                            <select
                                                className="form-select"
                                                value={formData.billingCycle}
                                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Credits</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.credits}
                                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Matches Limit</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.matchesLimit}
                                                onChange={(e) => setFormData({ ...formData, matchesLimit: parseInt(e.target.value) || 0 })}
                                                placeholder="-1 for unlimited"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Badge (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.badge}
                                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                                placeholder="e.g., Popular, Best Value"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.sortOrder}
                                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formData.isFree}
                                                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                            />
                                            <label className="form-check-label">Free Plan</label>
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
                                    onClick={handleCreatePlan}
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
                                            Create Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {showEditModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Plan</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Plan Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Currency</label>
                                            <select
                                                className="form-select"
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Price <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Billing Cycle</label>
                                            <select
                                                className="form-select"
                                                value={formData.billingCycle}
                                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Credits</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.credits}
                                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Matches Limit</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.matchesLimit}
                                                onChange={(e) => setFormData({ ...formData, matchesLimit: parseInt(e.target.value) || 0 })}
                                                placeholder="-1 for unlimited"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Badge (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.badge}
                                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                                placeholder="e.g., Popular, Best Value"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.sortOrder}
                                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={formData.isFree}
                                                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                            />
                                            <label className="form-check-label">Free Plan</label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditPlan}
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
                                            Update Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SweetAlert2 Custom Styles */}
            <style>{`
                .swal-custom-popup {
                    border-radius: 0.5rem !important;
                    font-family: 'Inter', sans-serif !important;
                }
                .swal-custom-title {
                    font-weight: 600 !important;
                    font-size: 1.5rem !important;
                }
                .swal-custom-html {
                    font-size: 1rem !important;
                    line-height: 1.5 !important;
                }
                .swal-confirm-btn {
                    font-weight: 500 !important;
                    padding: 0.5rem 1.5rem !important;
                    border-radius: 0.375rem !important;
                }
                .swal-cancel-btn {
                    font-weight: 500 !important;
                    padding: 0.5rem 1.5rem !important;
                    border-radius: 0.375rem !important;
                }

                /* Required field indicator */
                .text-danger {
                    color: #dc3545 !important;
                }
            `}</style>
        </div>
    );
};

export default PlansPage;
