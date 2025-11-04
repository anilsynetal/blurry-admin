import React, { useState, useEffect } from 'react';
import { subscriptionService, type Subscription, type SubscriptionQueryParams } from '../../services/subscriptions.service';
import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';
import {
    LoadingSpinner,
    EmptyState,
    ActionBar,
    TablePagination,
    StatusBadge,
    ActionDropdown,
    PageHeader
} from '../../components/common';

const SubscriptionsPage: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        userId: '',
        planId: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalRecords: 0
    });
    const [stats, setStats] = useState<any>(null);

    const { showToast } = useToast();

    const fetchSubscriptions = async (page = 1) => {
        try {
            setLoading(true);
            const params: SubscriptionQueryParams = {
                page,
                limit: pagination.pageSize,
                search: searchTerm,
                status: filters.status || undefined,
                userId: filters.userId || undefined,
                planId: filters.planId || undefined
            };

            const response = await subscriptionService.getSubscriptions(params);
            setSubscriptions(response.data);
            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                pageSize: response.pagination?.pageSize || 10,
                totalRecords: response.pagination?.totalRecords || 0
            });
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load subscriptions'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await subscriptionService.getSubscriptionStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
        fetchStats();
    }, []);

    const handleSearch = () => {
        fetchSubscriptions(1);
    };

    const handlePageChange = (page: number) => {
        fetchSubscriptions(page);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize }));
        fetchSubscriptions(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleStatus = async (subscription: Subscription) => {
        try {
            const action = subscription.status === 'active' ? 'cancel' : 'reactivate';
            const result = await Swal.fire({
                title: 'Confirm Action',
                text: `Are you sure you want to ${action} this subscription?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Yes, ${action}`,
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                if (action === 'cancel') {
                    await subscriptionService.cancelSubscription(subscription._id!);
                } else {
                    await subscriptionService.reactivateSubscription(subscription._id!);
                }

                fetchSubscriptions(pagination.currentPage);
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: `Subscription ${action}d successfully`
                });
            }
        } catch (error) {
            console.error('Error updating subscription status:', error);
            const apiError = error as any;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to update subscription status'
            });
        }
    };

    if (loading && subscriptions.length === 0) {
        return <LoadingSpinner size="lg" text="Loading subscriptions..." />;
    }

    return (
        <div>
            <PageHeader
                title="Subscriptions Management"
                breadcrumbs={['Admin', 'Subscriptions']}
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
                                            <i className="bx bx-package text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Subscriptions</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.totalSubscriptions}</h3>
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
                                        <small className="text-muted d-block">Active Subscriptions</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.activeSubscriptions}</h3>
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
                                        <small className="text-muted d-block">Cancelled Subscriptions</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.cancelledSubscriptions}</h3>
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
                                            <i className="bx bx-dollar text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Revenue</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">${stats.revenue.totalRevenue?.toFixed(2) || '0.00'}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionBar
                title="Subscriptions List"
                searchPlaceholder="Search subscriptions..."
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
                    </div>
                }
                filters={
                    <div className="row">
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-sm"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Subscriptions Table */}
            {subscriptions.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Plan</th>
                                            <th>Subscription ID</th>
                                            <th>Status</th>
                                            <th>Current Period</th>
                                            <th>Credits</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map((subscription) => (
                                            <tr key={subscription._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <span className="avatar-initial rounded-circle bg-primary">
                                                                {subscription.user.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{subscription.user.name}</h6>
                                                            <small className="text-muted">{subscription.user.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-semibold">{subscription.plan.name}</div>
                                                        <small className="text-muted">${subscription.plan.price}/{subscription.plan.billingCycle}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="font-monospace">{subscription.subscriptionId}</span>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={subscription.status === 'active'}
                                                        trueLabel="Active"
                                                        falseLabel={subscription.status === 'expired' ? 'Expired' : subscription.status === 'paused' ? 'Paused' : 'Inactive'}
                                                        trueVariant="success"
                                                        falseVariant={subscription.status === 'expired' ? 'secondary' : subscription.status === 'paused' ? 'warning' : 'secondary'}
                                                    />
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">{subscription.credits}</span>
                                                </td>
                                                <td>
                                                    <ActionDropdown
                                                        onDelete={() => handleToggleStatus(subscription)}
                                                        statusLabel={subscription.status === 'active' ? 'Cancel' : 'Reactivate'}
                                                        statusIcon={subscription.status === 'active' ? 'bx-x' : 'bx-check'}
                                                        additionalActions={[]}
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
                    title="No Subscriptions Found"
                    description="No subscriptions match your current filters."
                    icon="bx-package"
                />
            )}
        </div>
    );
};

export default SubscriptionsPage;