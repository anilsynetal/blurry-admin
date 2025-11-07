import React, { useState, useEffect } from 'react';
import { loungesService, Lounge, LoungeQueryParams, LoungeUser } from '../../services/lounges.service';
import { useToast } from '../../context/ToastContext';
import {
    LoadingSpinner,
    EmptyState,
    PageHeader,
    ActionBar,
    StatusBadge,
    ActionDropdown,
    TablePagination
} from '../../components/common';
import LoungeFormModal from './LoungeFormModal.tsx';
import LoungeDetailsModal from './LoungeDetailsModal.tsx';
import Swal from 'sweetalert2';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const LoungesPage: React.FC = () => {
    const { showToast } = useToast();

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4002';
        return `${baseUrl.replace('/api/admin', '')}/${imagePath}`;
    };

    // State management
    const [lounges, setLounges] = useState<Lounge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLounge, setSelectedLounge] = useState<Lounge | null>(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showUsersModal, setShowUsersModal] = useState(false);

    // Users modal state
    const [loungeUsers, setLoungeUsers] = useState<LoungeUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPagination, setUsersPagination] = useState({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10
    });

    // Form and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<LoungeQueryParams>({
        page: 1,
        limit: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 25
    });

    // Statistics
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchLounges();
        fetchStats();
    }, [filters]);

    const fetchLounges = async () => {
        try {
            setLoading(true);
            const queryParams = {
                ...filters,
                search: searchTerm
            };
            const response = await loungesService.getLounges(queryParams);

            setLounges(response.data || []);
            if (response.pagination) {
                setPagination({
                    totalRecords: response.pagination.totalRecords,
                    currentPage: response.pagination.currentPage,
                    totalPages: response.pagination.totalPages,
                    pageSize: response.pagination.pageSize
                });
            }
        } catch (error) {
            console.error('Error fetching lounges:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch lounges'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await loungesService.getLoungeStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchLounges();
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (limit: number) => {
        setFilters(prev => ({ ...prev, limit, page: 1 }));
    };

    const handleLoungeCreated = () => {
        fetchLounges();
        fetchStats();
        setShowCreateModal(false);
    };

    const handleLoungeUpdated = () => {
        fetchLounges();
        fetchStats();
        setShowEditModal(false);
        setSelectedLounge(null);
    };

    // Action handlers
    const openEditModal = (lounge: Lounge) => {
        setSelectedLounge(lounge);
        setShowEditModal(true);
    };

    const openDetailsModal = (lounge: Lounge) => {
        setSelectedLounge(lounge);
        setShowDetailsModal(true);
    };

    const openUsersModal = async (lounge: Lounge) => {
        setSelectedLounge(lounge);
        setShowUsersModal(true);
        await fetchLoungeUsers(lounge._id!);
    };

    const fetchLoungeUsers = async (loungeId: string, page: number = 1) => {
        try {
            setUsersLoading(true);
            const response = await loungesService.getLoungeUsers(loungeId, {
                page,
                limit: usersPagination.pageSize
            });

            setLoungeUsers(response.data || []);
            if (response.pagination) {
                setUsersPagination({
                    totalRecords: response.pagination.totalRecords,
                    currentPage: response.pagination.currentPage,
                    totalPages: response.pagination.totalPages,
                    pageSize: response.pagination.pageSize
                });
            }
        } catch (error) {
            console.error('Error fetching lounge users:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to fetch lounge users'
            });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleUsersPageChange = (page: number) => {
        if (selectedLounge?._id) {
            fetchLoungeUsers(selectedLounge._id, page);
        }
    };

    const handleToggleStatus = async (lounge: Lounge) => {
        try {
            const action = lounge.isActive ? 'deactivate' : 'activate';
            const result = await Swal.fire({
                title: 'Confirm Action',
                text: `Are you sure you want to ${action} this lounge?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Yes, ${action}`,
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await loungesService.updateLoungeStatus(lounge._id!, { isActive: !lounge.isActive });
                fetchLounges();
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: `Lounge ${action}d successfully`
                });
            }
        } catch (error) {
            console.error('Error toggling lounge status:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to update lounge status'
            });
        }
    };

    const handleDeleteLounge = async (lounge: Lounge) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                html: `You are about to delete the lounge <strong>"${lounge.name}"</strong>.<br/>This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await loungesService.deleteLounge(lounge._id!);
                fetchLounges();
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Lounge deleted successfully'
                });
            }
        } catch (error) {
            console.error('Error deleting lounge:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to delete lounge'
            });
        }
    };

    if (loading && lounges.length === 0) {
        return <LoadingSpinner size="lg" text="Loading lounges..." />;
    }

    return (
        <div>
            <PageHeader
                title="Lounges Management"
                breadcrumbs={['Admin', 'Lounges']}
            />

            {/* Statistics Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-primary">
                                            <i className="bx bx-building text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Lounges</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.totalLounges}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-success">
                                            <i className="bx bx-check-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Active Lounges</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.activeLounges}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-danger">
                                            <i className="bx bx-x-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Inactive Lounges</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.inactiveLounges}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-info">
                                            <i className="bx bx-user-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Users</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.totalUsers}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionBar
                title="Lounges List"
                searchPlaceholder="Search lounges..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                actions={
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleSearch}
                        >
                            <i className="bx bx-search me-1"></i>
                            Search
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bx bx-plus me-1"></i>
                            Add Lounge
                        </button>
                    </div>
                }
                filters={
                    <div className="row">
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.isActive?.toString() || ''}
                                onChange={(e) => handleFilterChange('isActive',
                                    e.target.value === '' ? undefined : e.target.value === 'true')}
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.sortBy || 'createdAt'}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="name">Name</option>
                                <option value="sortOrder">Sort Order</option>
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Lounges Table */}
            {lounges.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Lounge</th>
                                            <th>Tags</th>
                                            <th>Sort Order</th>
                                            <th>User Count</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lounges.map((lounge) => (
                                            <tr key={lounge._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            {lounge.image ? (
                                                                <img
                                                                    src={getImageUrl(lounge.image)}
                                                                    alt={lounge.name}
                                                                    className="rounded"
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded bg-primary">
                                                                    {(lounge.name || 'U').charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{lounge.name || 'Unnamed Lounge'}</h6>
                                                            <small className="text-muted">
                                                                {(lounge.description || '').length > 50
                                                                    ? `${(lounge.description || '').substring(0, 50)}...`
                                                                    : (lounge.description || 'No description')
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        {lounge.tags && lounge.tags.length > 0 ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {lounge.tags.slice(0, 3).map((tag, index) => (
                                                                    <span key={index} className="badge bg-light text-dark">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                {lounge.tags.length > 3 && (
                                                                    <span className="badge bg-secondary">
                                                                        +{lounge.tags.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">No tags</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {lounge.sortOrder || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="badge bg-primary me-2">
                                                            {lounge.userCount || 0}
                                                        </span>
                                                        <small className="text-muted">users</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusBadge status={lounge.isActive ?? false} />
                                                </td>
                                                <td>
                                                    <div>
                                                        <span>{new Date(lounge.createdAt!).toLocaleDateString()}</span>
                                                        <div>
                                                            <small className="text-muted">
                                                                {new Date(lounge.createdAt!).toLocaleTimeString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <ActionDropdown
                                                        onEdit={() => openEditModal(lounge)}
                                                        onDelete={() => handleDeleteLounge(lounge)}
                                                        onToggleStatus={() => handleToggleStatus(lounge)}
                                                        statusLabel={lounge.isActive ? 'Deactivate' : 'Activate'}
                                                        statusIcon={lounge.isActive ? 'bx-x' : 'bx-check'}
                                                        additionalActions={[
                                                            {
                                                                label: 'View Details',
                                                                icon: 'bx-show',
                                                                onClick: () => openDetailsModal(lounge)
                                                            },
                                                            {
                                                                label: 'View Users',
                                                                icon: 'bx-group',
                                                                onClick: () => openUsersModal(lounge),
                                                                variant: 'info'
                                                            }
                                                        ]}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
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
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No Lounges Found"
                    description="Get started by adding your first lounge or adjust your search criteria"
                    icon="bx-building"
                    actionButton={
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bx bx-plus me-1"></i>
                            Add First Lounge
                        </button>
                    }
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <LoungeFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleLoungeCreated}
                    mode="create"
                />
            )}

            {showEditModal && selectedLounge && (
                <LoungeFormModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedLounge(null);
                    }}
                    onSuccess={handleLoungeUpdated}
                    mode="edit"
                    lounge={selectedLounge}
                />
            )}

            {showDetailsModal && selectedLounge && (
                <LoungeDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedLounge(null);
                    }}
                    lounge={selectedLounge}
                />
            )}

            {/* Users Modal */}
            {showUsersModal && selectedLounge && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bx bx-group me-2"></i>
                                    Users in {selectedLounge.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowUsersModal(false);
                                        setSelectedLounge(null);
                                        setLoungeUsers([]);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {usersLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="text-muted mt-2">Loading users...</p>
                                    </div>
                                ) : loungeUsers.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th>Email</th>
                                                        <th>Joined At</th>
                                                        <th>Vibe Description</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loungeUsers.map((user) => (
                                                        <tr key={user._id}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="avatar avatar-sm me-3">
                                                                        {user.profilePicture ? (
                                                                            <img
                                                                                src={user.profilePicture}
                                                                                alt={user.name}
                                                                                className="rounded-circle"
                                                                            />
                                                                        ) : (
                                                                            <span className="avatar-initial rounded-circle bg-primary">
                                                                                {user.name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="mb-0">{user.name}</h6>
                                                                        <small className="text-muted">ID: {user._id}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{user.email}</td>
                                                            <td>
                                                                <div>
                                                                    <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
                                                                    <div>
                                                                        <small className="text-muted">
                                                                            {new Date(user.joinedAt).toLocaleTimeString()}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {user.vibeDescription ? (
                                                                    <span className="badge bg-light text-dark">
                                                                        {user.vibeDescription.length > 30
                                                                            ? `${user.vibeDescription.substring(0, 30)}...`
                                                                            : user.vibeDescription
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted">No description</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <StatusBadge status={user.isActive} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {usersPagination.totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <small className="text-muted">
                                                    Showing {((usersPagination.currentPage - 1) * usersPagination.pageSize) + 1} to{' '}
                                                    {Math.min(usersPagination.currentPage * usersPagination.pageSize, usersPagination.totalRecords)} of{' '}
                                                    {usersPagination.totalRecords} users
                                                </small>
                                                <nav>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        <li className={`page-item ${usersPagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handleUsersPageChange(usersPagination.currentPage - 1)}
                                                                disabled={usersPagination.currentPage === 1}
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>
                                                        {Array.from({ length: Math.min(5, usersPagination.totalPages) }, (_, i) => {
                                                            const page = i + 1;
                                                            return (
                                                                <li key={page} className={`page-item ${usersPagination.currentPage === page ? 'active' : ''}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => handleUsersPageChange(page)}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                        <li className={`page-item ${usersPagination.currentPage === usersPagination.totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handleUsersPageChange(usersPagination.currentPage + 1)}
                                                                disabled={usersPagination.currentPage === usersPagination.totalPages}
                                                            >
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bx bx-group display-4 text-muted"></i>
                                        <h6 className="text-muted">No Users Found</h6>
                                        <p className="text-muted">No users have joined this lounge yet.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer float-end ms-auto">
                                <div className="justify-content-between w-100">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowUsersModal(false);
                                            setSelectedLounge(null);
                                            setLoungeUsers([]);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoungesPage;