import React, { useState, useEffect } from 'react';
import { usersService, User, UserQueryParams } from '../../services/users.service';
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
import UserFormModal from './UserFormModal.tsx';
import UserDetailsModal from './UserDetailsModal.tsx';
import Swal from 'sweetalert2';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const UsersPage: React.FC = () => {
    const { showToast } = useToast();

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        const baseUrl =
            (import.meta as any).env.VITE_API_URL || "http://localhost:4002";
        return `${baseUrl.replace("/api/admin", "")}/${imagePath}`;
    };

    // State management
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    // TODO: Implement password change modal
    // const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Form and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<UserQueryParams>({
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
        fetchUsers();
        fetchStats();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = {
                ...filters,
                search: searchTerm
            };
            const response = await usersService.getUsers(queryParams);

            setUsers(response.data || []);
            if (response.pagination) {
                setPagination({
                    totalRecords: response.pagination.totalRecords || 0,
                    currentPage: response.pagination.currentPage || 1,
                    totalPages: response.pagination.totalPages || 1,
                    pageSize: response.pagination.pageSize || 25
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch users'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await usersService.getUserStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchUsers();
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

    const handleUserCreated = () => {
        fetchUsers();
        fetchStats();
        setShowCreateModal(false);
    };

    const handleUserUpdated = () => {
        fetchUsers();
        fetchStats();
        setShowEditModal(false);
        setSelectedUser(null);
    };

    // const openEditModal = (user: User) => {
    //     setSelectedUser(user);
    //     setShowEditModal(true);
    // };

    const openDetailsModal = (user: User) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleToggleStatus = async (user: User) => {
        try {
            const action = user.isActive ? 'deactivate' : 'activate';
            const result = await Swal.fire({
                title: 'Confirm Action',
                text: `Are you sure you want to ${action} this user?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Yes, ${action}`,
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await usersService.updateUserStatus(user._id!, { isActive: !user.isActive });
                fetchUsers();
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: `User ${action}d successfully`
                });
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to update user status'
            });
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                html: `You are about to delete user <strong>"${user.name}"</strong>.<br/>This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await usersService.deleteUser(user._id!);
                fetchUsers();
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'User deleted successfully'
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to delete user'
            });
        }
    };

    // const handleSendPasswordReset = async (_user: User) => {
    //     // This feature is not currently supported by the backend
    //     showToast({
    //         type: 'info',
    //         title: 'Feature Not Available',
    //         message: 'Password reset feature is not currently available'
    //     });
    // };

    // const handleSendEmailVerification = async (_user: User) => {
    //     // This feature is not currently supported by the backend
    //     showToast({
    //         type: 'info',
    //         title: 'Feature Not Available',
    //         message: 'Email verification feature is not currently available'
    //     });
    // };

    if (loading && users.length === 0) {
        return <LoadingSpinner size="lg" text="Loading users..." />;
    }

    return (
        <div>
            <PageHeader
                title="Users Management"
                breadcrumbs={['Admin', 'Users']}
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
                                            <i className="bx bx-user text-white"></i>
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
                                        <small className="text-muted d-block">Active Users</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.activeUsers}</h3>
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
                                            <i className="bx bx-user-plus text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Inactive Users</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.inactiveUsers}</h3>
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
                                        <span className="avatar-initial rounded bg-warning">
                                            <i className="bx bx-shield-check text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">New Last 30 Days</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.newUsersLast30Days}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionBar
                title="Users List"
                searchPlaceholder="Search users..."
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
                        {/* <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bx bx-plus me-1"></i>
                            Add User
                        </button> */}
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
                                value={filters.isEmailVerified?.toString() || ''}
                                onChange={(e) => handleFilterChange('isEmailVerified',
                                    e.target.value === '' ? undefined : e.target.value === 'true')}
                            >
                                <option value="">All Verification</option>
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>
                        </div>

                    </div>
                }
            />

            {/* Users Table */}
            {users.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Verified</th>
                                            <th>Last Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={getImageUrl(user.avatar)}
                                                                    alt={user.name}
                                                                    className="rounded-circle"
                                                                />
                                                            ) : (
                                                                <span className="avatar-initial rounded-circle bg-primary">
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{user.name}</h6>
                                                            <small className="text-muted">
                                                                {user.name}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span>{user.email}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.role === 'super_admin' ? 'bg-danger' :
                                                        user.role === 'admin' ? 'bg-warning' : 'bg-info'
                                                        }`}>
                                                        {user.role.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusBadge status={user.isActive} />
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={user.isEmailVerified}
                                                        trueLabel="Verified"
                                                        falseLabel="Unverified"
                                                        trueVariant="success"
                                                        falseVariant="warning"
                                                    />
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {user.lastLogin ?
                                                            new Date(user.lastLogin).toLocaleDateString() :
                                                            'Never'
                                                        }
                                                    </small>
                                                </td>
                                                <td>
                                                    <ActionDropdown
                                                        onDelete={() => handleDeleteUser(user)}
                                                        onToggleStatus={() => handleToggleStatus(user)}
                                                        statusLabel={user.isActive ? 'Deactivate' : 'Activate'}
                                                        statusIcon={user.isActive ? 'bx-x' : 'bx-check'}
                                                        additionalActions={[
                                                            {
                                                                label: 'View Details',
                                                                icon: 'bx-show',
                                                                onClick: () => openDetailsModal(user)
                                                            },
                                                            // {
                                                            //     label: 'Change Password',
                                                            //     icon: 'bx-key',
                                                            //     onClick: () => openPasswordModal(user)
                                                            // },
                                                            // {
                                                            //     label: 'Send Password Reset',
                                                            //     icon: 'bx-mail-send',
                                                            //     onClick: () => handleSendPasswordReset(user)
                                                            // },
                                                            // ...(!user.isEmailVerified ? [{
                                                            //     label: 'Send Verification',
                                                            //     icon: 'bx-envelope',
                                                            //     onClick: () => handleSendEmailVerification(user)
                                                            // }] : [])
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
                    title="No Users Found"
                    description=""
                    icon="bx-user"
                    actionButton={
                        <>   </>
                    }
                />
            )}

            {/* Modals */}
            {showCreateModal && (
                <UserFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleUserCreated}
                    mode="create"
                />
            )}

            {showEditModal && selectedUser && (
                <UserFormModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={handleUserUpdated}
                    mode="edit"
                    user={selectedUser}
                />
            )}

            {showDetailsModal && selectedUser && (
                <UserDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            )}

            {/* TODO: Add Password Change Modal */}
        </div>
    );
};

export default UsersPage;