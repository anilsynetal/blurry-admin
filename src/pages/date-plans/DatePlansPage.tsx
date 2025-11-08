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
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        isFromTemplate: '',
        dateRange: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalRecords: 0
    });
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchPlans();
        fetchStats();
    }, []);

    // Add useEffect to refetch when filters change
    useEffect(() => {
        const hasActiveFilters = filters.status || filters.isFromTemplate || filters.dateRange;
        if (hasActiveFilters) {
            fetchPlans(1);
        }
    }, [filters]);

    const fetchPlans = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: pagination.pageSize,
                search: searchTerm,
                status: filters.status || undefined,
                isFromTemplate: filters.isFromTemplate || undefined
            };

            const response = await datePlansService.getDatePlans(params);
            setPlans(response.data || []);
            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                pageSize: response.pagination?.pageSize || 10,
                totalRecords: response.pagination?.totalRecords || 0
            });
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

    const fetchStats = async () => {
        try {
            const response = await datePlansService.getDatePlanStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = () => {
        fetchPlans(1);
    };

    const handlePageChange = (page: number) => {
        fetchPlans(page);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize }));
        fetchPlans(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            isFromTemplate: '',
            dateRange: ''
        });
        setSearchTerm('');
        fetchPlans(1);
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

            {/* Statistics Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-primary">
                                            <i className="bx bx-heart text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Plans</small>
                                        <h3 className="mb-0">{stats.totalPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-warning">
                                            <i className="bx bx-time text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Pending</small>
                                        <h3 className="mb-0">{stats.pendingPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-success">
                                            <i className="bx bx-check text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Completed</small>
                                        <h3 className="mb-0">{stats.completedPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-info">
                                            <i className="bx bx-check-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Accepted</small>
                                        <h3 className="mb-0">{stats.acceptedPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-danger">
                                            <i className="bx bx-x text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Cancelled</small>
                                        <h3 className="mb-0">{stats.cancelledPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-secondary">
                                            <i className="bx bx-minus-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Rejected</small>
                                        <h3 className="mb-0">{stats.rejectedPlans}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Bar with Search and Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Date Plans List</h5>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleSearch}
                                    >
                                        <i className="bx bx-search me-1"></i>
                                        Search
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={handleClearFilters}
                                    >
                                        <i className="bx bx-refresh me-1"></i>
                                        Clear Filters
                                    </button>
                                    {(filters.status || filters.isFromTemplate || searchTerm) && (
                                        <span className="badge bg-info">
                                            {Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)} filter(s) active
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="row">
                                <div className="col-md-3">
                                    <label className="form-label small">Search</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search by description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Status</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Template Usage</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={filters.isFromTemplate}
                                        onChange={(e) => handleFilterChange('isFromTemplate', e.target.value)}
                                    >
                                        <option value="">All Plans</option>
                                        <option value="true">From Template</option>
                                        <option value="false">Custom Plans</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Page Size</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={pagination.pageSize}
                                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                    >
                                        <option value="10">10 per page</option>
                                        <option value="25">25 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="card-footer">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted">
                                                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords} entries
                                            </small>
                                        </div>
                                        <nav>
                                            <ul className="pagination pagination-sm mb-0">
                                                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                        disabled={pagination.currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    let pageNumber;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNumber = i + 1;
                                                    } else {
                                                        const start = Math.max(1, pagination.currentPage - 2);
                                                        const end = Math.min(pagination.totalPages, start + 4);
                                                        pageNumber = start + i;
                                                        if (pageNumber > end) return null;
                                                    }

                                                    return (
                                                        <li key={pageNumber} className={`page-item ${pagination.currentPage === pageNumber ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pageNumber)}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        </li>
                                                    );
                                                })}

                                                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                        disabled={pagination.currentPage === pagination.totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="table-responsive text-nowrap">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Description</th>
                                        <th>Proposed Date</th>
                                        <th>Proposed By</th>
                                        <th>Proposed To</th>
                                        <th>Status</th>
                                        <th>Template</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length > 0 ? (
                                        plans.map((plan) => (
                                            <tr key={plan._id}>
                                                <td>
                                                    <span className="font-monospace small">
                                                        {plan._id?.slice(-8) || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ maxWidth: '200px' }}>
                                                        <div className="text-truncate fw-semibold">
                                                            {plan.description || 'No description'}
                                                        </div>
                                                        {plan.isFromTemplate && (
                                                            <small className="badge bg-light text-dark">From Template</small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-semibold">{formatDate(plan.proposedDate)}</div>
                                                        <small className="text-muted">
                                                            {new Date(plan.proposedDate) > new Date() ?
                                                                <span className="text-success">Upcoming</span> :
                                                                <span className="text-muted">Past</span>
                                                            }
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-2">
                                                            {plan.proposedBy?.profilePicture ? (
                                                                <img
                                                                    src={getImageUrl(plan.proposedBy.profilePicture)}
                                                                    alt={plan.proposedBy?.name}
                                                                    className="rounded-circle"
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded-circle bg-primary">
                                                                    {plan.proposedBy?.name?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{plan.proposedBy?.name || 'Unknown User'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-2">
                                                            {plan.proposedTo?.profilePicture ? (
                                                                <img
                                                                    src={getImageUrl(plan.proposedTo.profilePicture)}
                                                                    alt={plan.proposedTo?.name}
                                                                    className="rounded-circle"
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded-circle bg-secondary">
                                                                    {plan.proposedTo?.name?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{plan.proposedTo?.name || 'Unknown User'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getStatusBadge(plan.status)}`}>
                                                        {plan.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    {plan.respondedAt && (
                                                        <div>
                                                            <small className="text-muted d-block">
                                                                Responded: {new Date(plan.respondedAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {plan.templateUsed ? (
                                                        <div className="d-flex align-items-center">
                                                            {plan.templateUsed.templateImage && (
                                                                <img
                                                                    src={getImageUrl(plan.templateUsed.templateImage)}
                                                                    alt={plan.templateUsed.title}
                                                                    style={{ width: '24px', height: '24px', objectFit: 'cover', marginRight: '8px' }}
                                                                    className="rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-semibold small">{plan.templateUsed.title}</div>
                                                                <small className="text-muted">{plan.templateUsed.type}</small>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-light text-dark">Custom</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {plan.createdAt ? formatDate(plan.createdAt) : 'N/A'}
                                                    </small>
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
                                            <td colSpan={9} className="text-center py-4">
                                                {(filters.status || filters.isFromTemplate || searchTerm) ?
                                                    'No date plans match your current filters.' :
                                                    'No date plans found'}
                                            </td>
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
                                        <h6 className="mb-3">Basic Information</h6>
                                        <div className="mb-3">
                                            <strong>ID:</strong>
                                            <span className="font-monospace ms-2">{selectedPlan._id}</span>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Description:</strong>
                                            <div className="mt-1 p-2 bg-light rounded">
                                                {selectedPlan.description || 'No description provided'}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Proposed Date:</strong>
                                            <div className="mt-1">
                                                {formatDate(selectedPlan.proposedDate)}
                                                {new Date(selectedPlan.proposedDate) > new Date() && (
                                                    <span className="badge bg-success ms-2">Upcoming</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Status:</strong>
                                            <span className={`badge bg-${getStatusBadge(selectedPlan.status)} ms-2`}>
                                                {selectedPlan.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <strong>From Template:</strong>
                                            <span className={`badge ms-2 ${selectedPlan.isFromTemplate ? 'bg-info' : 'bg-secondary'}`}>
                                                {selectedPlan.isFromTemplate ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        {selectedPlan.respondedAt && (
                                            <div className="mb-3">
                                                <strong>Responded At:</strong>
                                                <div className="mt-1">{formatDate(selectedPlan.respondedAt)}</div>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <strong>Created:</strong>
                                            <div className="mt-1">{selectedPlan.createdAt ? formatDate(selectedPlan.createdAt) : 'N/A'}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Last Updated:</strong>
                                            <div className="mt-1">{selectedPlan.updatedAt ? formatDate(selectedPlan.updatedAt) : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="mb-3">Participants</h6>
                                        <div className="mb-4">
                                            <strong>Proposed By:</strong>
                                            <div className="card mt-2">
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar me-3">
                                                            {selectedPlan.proposedBy?.profilePicture ? (
                                                                <img
                                                                    src={getImageUrl(selectedPlan.proposedBy.profilePicture)}
                                                                    alt={selectedPlan.proposedBy.name}
                                                                    className="rounded-circle"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded-circle bg-primary">
                                                                    {selectedPlan.proposedBy?.name?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{selectedPlan.proposedBy?.name || 'Unknown User'}</div>
                                                            <small className="text-muted font-monospace">
                                                                ID: {selectedPlan.proposedBy?._id || 'N/A'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <strong>Proposed To:</strong>
                                            <div className="card mt-2">
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar me-3">
                                                            {selectedPlan.proposedTo?.profilePicture ? (
                                                                <img
                                                                    src={getImageUrl(selectedPlan.proposedTo.profilePicture)}
                                                                    alt={selectedPlan.proposedTo.name}
                                                                    className="rounded-circle"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded-circle bg-secondary">
                                                                    {selectedPlan.proposedTo?.name?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{selectedPlan.proposedTo?.name || 'Unknown User'}</div>
                                                            <small className="text-muted font-monospace">
                                                                ID: {selectedPlan.proposedTo?._id || 'N/A'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedPlan.templateUsed && (
                                            <div className="mb-3">
                                                <strong>Template Used:</strong>
                                                <div className="card mt-2">
                                                    <div className="card-body p-3">
                                                        <div className="d-flex align-items-center">
                                                            {selectedPlan.templateUsed.templateImage && (
                                                                <img
                                                                    src={getImageUrl(selectedPlan.templateUsed.templateImage)}
                                                                    alt={selectedPlan.templateUsed.title}
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                    className="rounded me-3"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="fw-semibold">{selectedPlan.templateUsed.title}</div>
                                                                <small className="text-muted">Type: {selectedPlan.templateUsed.type}</small>
                                                                <div>
                                                                    <small className="text-muted font-monospace">
                                                                        ID: {selectedPlan.templateUsed._id}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedPlan.matchId && (
                                            <div className="mb-3">
                                                <strong>Match ID:</strong>
                                                <div className="mt-1">
                                                    <span className="font-monospace">{selectedPlan.matchId}</span>
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