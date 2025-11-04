import React, { useEffect, useState } from 'react';
import { datePlansService, DatePlan } from '../../services/datePlans.service';
import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const DatePlansPage: React.FC = () => {
    const { showToast } = useToast();
    const [plans, setPlans] = useState<DatePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<DatePlan | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await datePlansService.getDatePlans();
            setPlans(response.data || []);
        } catch (error) {
            console.error('Error fetching date plans:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch date plans'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (plan: DatePlan) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete this date plan?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await datePlansService.deleteDatePlan(plan._id!);
                await fetchPlans();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Date plan deleted successfully!'
                });
            } catch (error) {
                const apiError = error as ApiError;
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to delete date plan'
                });
            }
        }
    };

    const openDetailsModal = (plan: DatePlan) => {
        setSelectedPlan(plan);
        setShowDetailsModal(true);
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        const baseUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:4002";
        return `${baseUrl.replace("/api/admin", "")}/${imagePath}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
            confirmed: 'info',
            in_progress: 'primary',
            completed: 'success',
            cancelled: 'secondary',
            expired: 'dark'
        };
        return statusColors[status as keyof typeof statusColors] || 'secondary';
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
                        <span className="text-muted fw-light">Admin /</span> Date Plans
                    </h4>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>Date Plans</h5>
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
                                        <th>Proposed Date</th>
                                        <th>Proposed By</th>
                                        <th>Proposed To</th>
                                        <th>Status</th>
                                        <th>Template</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length > 0 ? (
                                        plans.map((plan) => (
                                            <tr key={plan._id}>
                                                <td>{formatDate(plan.proposedDate)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {plan.proposedBy.profilePicture && (
                                                            <img
                                                                src={getImageUrl(plan.proposedBy.profilePicture)}
                                                                alt={plan.proposedBy.name}
                                                                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                                                            />
                                                        )}
                                                        {plan.proposedBy.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {plan.proposedTo.profilePicture && (
                                                            <img
                                                                src={getImageUrl(plan.proposedTo.profilePicture)}
                                                                alt={plan.proposedTo.name}
                                                                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                                                            />
                                                        )}
                                                        {plan.proposedTo.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getStatusBadge(plan.status)}`}>
                                                        {plan.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {plan.templateUsed ? (
                                                        <div className="d-flex align-items-center">
                                                            {plan.templateUsed.templateImage && (
                                                                <img
                                                                    src={getImageUrl(plan.templateUsed.templateImage)}
                                                                    alt={plan.templateUsed.title}
                                                                    style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '10px' }}
                                                                    className="rounded"
                                                                />
                                                            )}
                                                            {plan.templateUsed.title}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Custom</span>
                                                    )}
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
                                                                onClick={() => openDetailsModal(plan)}
                                                            >
                                                                <i className="bx bx-show me-1"></i> View Details
                                                            </button>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeletePlan(plan)}
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
                                            <td colSpan={6} className="text-center">No date plans found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedPlan && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Date Plan Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedPlan(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6>Basic Information</h6>
                                        <p><strong>Description:</strong> {selectedPlan.description}</p>
                                        <p><strong>Proposed Date:</strong> {formatDate(selectedPlan.proposedDate)}</p>
                                        <p><strong>Status:</strong>
                                            <span className={`badge bg-${getStatusBadge(selectedPlan.status)} ms-2`}>
                                                {selectedPlan.status.replace('_', ' ')}
                                            </span>
                                        </p>
                                        <p><strong>From Template:</strong> {selectedPlan.isFromTemplate ? 'Yes' : 'No'}</p>
                                        {selectedPlan.respondedAt && (
                                            <p><strong>Responded At:</strong> {formatDate(selectedPlan.respondedAt)}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <h6>Participants</h6>
                                        <div className="mb-3">
                                            <strong>Proposed By:</strong>
                                            <div className="d-flex align-items-center mt-1">
                                                {selectedPlan.proposedBy.profilePicture && (
                                                    <img
                                                        src={getImageUrl(selectedPlan.proposedBy.profilePicture)}
                                                        alt={selectedPlan.proposedBy.name}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                                    />
                                                )}
                                                <span>{selectedPlan.proposedBy.name}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Proposed To:</strong>
                                            <div className="d-flex align-items-center mt-1">
                                                {selectedPlan.proposedTo.profilePicture && (
                                                    <img
                                                        src={getImageUrl(selectedPlan.proposedTo.profilePicture)}
                                                        alt={selectedPlan.proposedTo.name}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                                    />
                                                )}
                                                <span>{selectedPlan.proposedTo.name}</span>
                                            </div>
                                        </div>
                                        {selectedPlan.templateUsed && (
                                            <div>
                                                <strong>Template Used:</strong>
                                                <div className="d-flex align-items-center mt-1">
                                                    {selectedPlan.templateUsed.templateImage && (
                                                        <img
                                                            src={getImageUrl(selectedPlan.templateUsed.templateImage)}
                                                            alt={selectedPlan.templateUsed.title}
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                                            className="rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <div>{selectedPlan.templateUsed.title}</div>
                                                        <small className="text-muted">{selectedPlan.templateUsed.type}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedPlan(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePlansPage;