import React, { useState, useEffect } from 'react';
import { notificationsService, Notification, NotificationQueryParams } from '../../services/notifications.service';
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
import NotificationFormModal from './NotificationFormModal.tsx';
import NotificationDetailsModal from './NotificationDetailsModal.tsx';
import Swal from 'sweetalert2';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const NotificationsPage: React.FC = () => {
    const { showToast } = useToast();

    // State management
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Modal states
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [showTargetedModal, setShowTargetedModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Form and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<NotificationQueryParams>({
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
        fetchNotifications();
        fetchStats();
    }, [filters]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const queryParams = {
                ...filters,
                search: searchTerm
            };
            const response = await notificationsService.getNotifications(queryParams);

            setNotifications(response.data || []);
            if (response.pagination) {
                setPagination({
                    totalRecords: response.pagination.totalRecords,
                    currentPage: response.pagination.currentPage,
                    totalPages: response.pagination.totalPages,
                    pageSize: response.pagination.pageSize
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch notifications'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await notificationsService.getNotificationStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchNotifications();
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

    const handleNotificationSent = () => {
        fetchNotifications();
        fetchStats();
        setShowBroadcastModal(false);
        setShowTargetedModal(false);
    };

    const openDetailsModal = (notification: Notification) => {
        setSelectedNotification(notification);
        setShowDetailsModal(true);
    };

    const handleDeleteNotification = async (notification: Notification) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                html: `You are about to delete the notification <strong>"${notification.title}"</strong>.<br/>This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await notificationsService.deleteNotification(notification._id!);
                fetchNotifications();
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Notification deleted successfully'
                });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to delete notification'
            });
        }
    };

    const handleResendNotification = async (notification: Notification) => {
        try {
            const result = await Swal.fire({
                title: 'Resend Notification',
                text: 'Are you sure you want to resend this notification?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, resend',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await notificationsService.resendNotification(notification._id!);
                fetchNotifications();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Notification resent successfully'
                });
            }
        } catch (error) {
            console.error('Error resending notification:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to resend notification'
            });
        }
    };

    const getNotificationTypeColor = (type: string) => {
        switch (type) {
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'success': return 'success';
            case 'promotion': return 'primary';
            case 'system': return 'secondary';
            default: return 'info';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'danger';
            case 'normal': return 'primary';
            case 'low': return 'secondary';
            default: return 'primary';
        }
    };

    if (loading && notifications.length === 0) {
        return <LoadingSpinner size="lg" text="Loading notifications..." />;
    }

    return (
        <div>
            <PageHeader
                title="Notifications Management"
                breadcrumbs={['Admin', 'Notifications']}
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
                                            <i className="bx bx-bell text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Notifications</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.totalNotifications}</h3>
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
                                            <i className="bx bx-paper-plane text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Delivered</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.deliveredNotifications}</h3>
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
                                            <i className="bx bx-mobile text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Push Notifications</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.pushNotifications}</h3>
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
                                            <i className="bx bx-envelope-open text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Read Notifications</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.readNotifications}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionBar
                title="Notifications List"
                searchPlaceholder="Search notifications..."
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
                            className="btn btn-info"
                            onClick={() => setShowTargetedModal(true)}
                        >
                            <i className="bx bx-target-lock me-1"></i>
                            Send Targeted
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowBroadcastModal(true)}
                        >
                            <i className="bx bx-broadcast me-1"></i>
                            Broadcast
                        </button>
                    </div>
                }
                filters={
                    <div className="row">
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.type || ''}
                                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                            >
                                <option value="">All Types</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="success">Success</option>
                                <option value="promotion">Promotion</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.priority || ''}
                                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                            >
                                <option value="">All Priorities</option>
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.isBroadcast?.toString() || ''}
                                onChange={(e) => handleFilterChange('isBroadcast',
                                    e.target.value === '' ? undefined : e.target.value === 'true')}
                            >
                                <option value="">All Notifications</option>
                                <option value="true">Broadcast</option>
                                <option value="false">Targeted</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filters.push?.toString() || ''}
                                onChange={(e) => handleFilterChange('push',
                                    e.target.value === '' ? undefined : e.target.value === 'true')}
                            >
                                <option value="">All Push Status</option>
                                <option value="true">Push Enabled</option>
                                <option value="false">Push Disabled</option>
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Notifications Table */}
            {notifications.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Notification</th>
                                            <th>Type</th>
                                            <th>Priority</th>
                                            <th>Delivery</th>
                                            <th>Push</th>
                                            <th>Recipients</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map((notification) => (
                                            <tr key={notification._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {notification.image && (
                                                            <div className="avatar avatar-sm me-3">
                                                                <img
                                                                    src={notification.image}
                                                                    alt=""
                                                                    className="rounded"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h6 className="mb-0">{notification.title}</h6>
                                                            <small className="text-muted">
                                                                {notification.message.length > 50
                                                                    ? `${notification.message.substring(0, 50)}...`
                                                                    : notification.message
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getNotificationTypeColor(notification.type)}`}>
                                                        {notification.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getPriorityColor(notification.priority)}`}>
                                                        {notification.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className={`badge ${notification.isBroadcast ? 'bg-primary' : 'bg-info'}`}>
                                                            {notification.isBroadcast ? 'Broadcast' : 'Targeted'}
                                                        </span>
                                                        {notification.deliveryCount > 0 && (
                                                            <small className="text-muted ms-2">
                                                                ({notification.deliveryCount} sent)
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={notification.push}
                                                        trueLabel="Enabled"
                                                        falseLabel="Disabled"
                                                        trueVariant="success"
                                                        falseVariant="secondary"
                                                    />
                                                    {notification.push && notification.pushSent && (
                                                        <div>
                                                            <small className="text-success">
                                                                <i className="bx bx-check me-1"></i>
                                                                Sent
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {notification.isBroadcast ? (
                                                        <span className="text-muted">All users</span>
                                                    ) : (
                                                        <span>{notification.totalRecipients || notification.recipients?.length || 0} users</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div>
                                                        <small className="text-muted">
                                                            {new Date(notification.createdAt!).toLocaleDateString()}
                                                        </small>
                                                        <div>
                                                            <small className="text-muted">
                                                                {notification.createdByDetails?.username || 'System'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <ActionDropdown
                                                        onDelete={() => handleDeleteNotification(notification)}
                                                        additionalActions={[
                                                            {
                                                                label: 'View Details',
                                                                icon: 'bx-show',
                                                                onClick: () => openDetailsModal(notification)
                                                            },
                                                            {
                                                                label: 'Resend',
                                                                icon: 'bx-refresh',
                                                                onClick: () => handleResendNotification(notification)
                                                            },
                                                            ...(notification.expiresAt && new Date(notification.expiresAt) > new Date() ? [{
                                                                label: 'Mark Expired',
                                                                icon: 'bx-time',
                                                                onClick: () => {
                                                                    // TODO: Implement expire notification
                                                                },
                                                                variant: 'warning' as const
                                                            }] : [])
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
                    title="No Notifications Found"
                    description="Get started by sending your first notification or adjust your search criteria"
                    icon="bx-bell"
                    actionButton={
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-info"
                                onClick={() => setShowTargetedModal(true)}
                            >
                                <i className="bx bx-target-lock me-1"></i>
                                Send Targeted
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowBroadcastModal(true)}
                            >
                                <i className="bx bx-broadcast me-1"></i>
                                Send Broadcast
                            </button>
                        </div>
                    }
                />
            )}

            {/* Modals */}
            {showBroadcastModal && (
                <NotificationFormModal
                    isOpen={showBroadcastModal}
                    onClose={() => setShowBroadcastModal(false)}
                    onSuccess={handleNotificationSent}
                    mode="broadcast"
                />
            )}

            {showTargetedModal && (
                <NotificationFormModal
                    isOpen={showTargetedModal}
                    onClose={() => setShowTargetedModal(false)}
                    onSuccess={handleNotificationSent}
                    mode="targeted"
                />
            )}

            {showDetailsModal && selectedNotification && (
                <NotificationDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedNotification(null);
                    }}
                    notification={selectedNotification}
                />
            )}
        </div>
    );
};

export default NotificationsPage;