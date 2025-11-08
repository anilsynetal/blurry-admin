import React, { useState, useEffect } from 'react';
import { subscriptionService, type Subscription, type SubscriptionQueryParams } from '../../services/subscriptions.service';
import { useToast } from '../../context/ToastContext';
import {
    LoadingSpinner,
    EmptyState,
    ActionBar,
    TablePagination,
    StatusBadge,
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

            // Filter out any subscriptions with null user or plan references
            const validSubscriptions = response.data.filter(subscription => {
                const isValid = subscription.user && subscription.plan;
                if (!isValid) {
                    console.warn('Filtered out invalid subscription:', {
                        id: subscription._id,
                        hasUser: !!subscription.user,
                        hasPlan: !!subscription.plan
                    });
                }
                return isValid;
            });

            setSubscriptions(validSubscriptions);
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

    // Add useEffect to refetch when filters change
    useEffect(() => {
        const hasActiveFilters = filters.status || filters.userId || filters.planId;
        if (hasActiveFilters) {
            fetchSubscriptions(1);
        }
    }, [filters]);

    // Add useEffect to handle search term changes
    useEffect(() => {
        if (searchTerm === '') {
            fetchSubscriptions(1);
        }
    }, [searchTerm]);

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

    const handleClearFilters = () => {
        setFilters({
            status: '',
            userId: '',
            planId: ''
        });
        setSearchTerm('');
        fetchSubscriptions(1);
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
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleClearFilters}
                        >
                            <i className="bx bx-refresh me-1"></i>
                            Clear Filters
                        </button>
                        {(filters.status || filters.userId || filters.planId || searchTerm) && (
                            <span className="badge bg-info">
                                {Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)} filter(s) active
                            </span>
                        )}
                    </div>
                }
                filters={
                    <div className="row">
                        <div className="col-md-4">
                            <label className="form-label small">Status Filter</label>
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
                        <div className="col-md-4">
                            <label className="form-label small">User ID Filter</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter User ID"
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small">Plan ID Filter</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter Plan ID"
                                value={filters.planId}
                                onChange={(e) => handleFilterChange('planId', e.target.value)}
                            />
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.filter(subscription => subscription.user && subscription.plan).map((subscription) => (
                                            <tr key={subscription._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <span className="avatar-initial rounded-circle bg-primary">
                                                                {subscription.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{subscription.user?.name || 'Unknown User'}</h6>
                                                            <small className="text-muted">{subscription.user?.email || 'No email'}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-semibold">{subscription.plan?.name || 'Unknown Plan'}</div>
                                                        <small className="text-muted">${subscription.plan?.price || 0}/{subscription.plan?.billingCycle || 'month'}</small>
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
                                                        {subscription.currentPeriodStart && subscription.currentPeriodEnd
                                                            ? `${new Date(subscription.currentPeriodStart).toLocaleDateString()} - ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                                                            : 'No period set'
                                                        }
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">{subscription.credits || 0}</span>
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
                <div>
                    <EmptyState
                        title="No Subscriptions Found"
                        description={
                            (filters.status || filters.userId || filters.planId || searchTerm)
                                ? "No subscriptions match your current filters."
                                : "No subscriptions have been created yet."
                        }
                        icon="bx-package"
                    />
                    {(filters.status || filters.userId || filters.planId || searchTerm) && (
                        <div className="text-center mt-3">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleClearFilters}
                            >
                                <i className="bx bx-refresh me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPage;