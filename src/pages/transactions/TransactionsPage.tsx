import React, { useEffect, useState } from 'react';
import { transactionService, Transaction, TransactionQueryParams } from '../../services/transactions.service';
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

const TransactionsPage: React.FC = () => {
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [queryParams, setQueryParams] = useState<TransactionQueryParams>({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, [queryParams]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = {
                ...queryParams,
                search: searchTerm || undefined,
                status: statusFilter || undefined
            };
            const response = await transactionService.getTransactions(params);
            setTransactions(response.data || []);
            setPagination(response.pagination || pagination);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch transactions'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await transactionService.getTransactionStats();
            setStats(response.data || {
                totalTransactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                revenue: { totalRevenue: 0, totalFees: 0 }
            });
        } catch (error) {
            console.error('Error fetching transaction stats:', error);
            // Set default stats on error
            setStats({
                totalTransactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                revenue: { totalRevenue: 0, totalFees: 0 }
            });
        }
    };

    const handleSearch = () => {
        setQueryParams({ ...queryParams, page: 1 });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setQueryParams({ ...queryParams, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setQueryParams({ ...queryParams, page });
    };

    const handleViewDetails = (_transaction: Transaction) => {
        // TODO: Implement view details modal
        showToast({
            type: 'info',
            title: 'Info',
            message: 'View details functionality coming soon'
        });
    };

    const handleUpdateStatus = async (transaction: Transaction, newStatus: string) => {
        const result = await Swal.fire({
            title: 'Update Transaction Status',
            text: `Are you sure you want to change the status to "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!'
        });

        if (result.isConfirmed) {
            try {
                await transactionService.updateTransactionStatus(transaction._id!, { status: newStatus as Transaction['status'] });
                await fetchTransactions();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Transaction status updated successfully!'
                });
            } catch (error) {
                const apiError = error as ApiError;
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to update transaction status'
                });
            }
        }
    };

    const handleProcessRefund = async (transaction: Transaction) => {
        const result = await Swal.fire({
            title: 'Process Refund',
            text: `Are you sure you want to process a refund for this transaction?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, process refund!'
        });

        if (result.isConfirmed) {
            try {
                await transactionService.processRefund(transaction._id!, {});
                await fetchTransactions();
                await fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Refund processed successfully!'
                });
            } catch (error) {
                const apiError = error as ApiError;
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: apiError.response?.data?.message || apiError.message || 'Failed to process refund'
                });
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'failed':
                return 'bg-danger';
            case 'refunded':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    if (loading && transactions.length === 0) {
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
                        <span className="text-muted fw-light">Admin /</span> Transactions
                    </h4>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 col-12 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                                <div className="avatar flex-shrink-0">
                                    <div className="avatar-initial bg-primary rounded">
                                        <i className="bx bx-money bx-sm text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <span className="fw-semibold d-block mb-1">Total Transactions</span>
                            <h3 className="card-title mb-2">{stats?.totalTransactions || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 col-12 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                                <div className="avatar flex-shrink-0">
                                    <div className="avatar-initial bg-success rounded">
                                        <i className="bx bx-check bx-sm text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <span className="fw-semibold d-block mb-1">Successful</span>
                            <h3 className="card-title mb-2">{stats?.successfulTransactions || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 col-12 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                                <div className="avatar flex-shrink-0">
                                    <div className="avatar-initial bg-danger rounded">
                                        <i className="bx bx-x bx-sm text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <span className="fw-semibold d-block mb-1">Failed</span>
                            <h3 className="card-title mb-2">{stats?.failedTransactions || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 col-12 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                                <div className="avatar flex-shrink-0">
                                    <div className="avatar-initial bg-info rounded">
                                        <i className="bx bx-dollar bx-sm text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <span className="fw-semibold d-block mb-1">Revenue</span>
                            <h3 className="card-title mb-2">${stats?.revenue?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by transaction ID, user email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => handleStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="succeeded">Succeeded</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={handleSearch}
                                    >
                                        <i className="bx bx-search me-1"></i> Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="table-responsive text-nowrap">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td>
                                                    <span className="fw-semibold">{transaction.transactionId}</span>
                                                </td>
                                                <td>
                                                    {transaction.user?.email || 'N/A'}
                                                </td>
                                                <td>
                                                    <span className="fw-semibold">{formatCurrency(transaction.amount)}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td>{transaction.type}</td>
                                                <td>{formatDate(transaction.createdAt!)}</td>
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
                                                                onClick={() => handleViewDetails(transaction)}
                                                            >
                                                                <i className="bx bx-show me-1"></i> View Details
                                                            </button>
                                                            {transaction.status === 'succeeded' && (
                                                                <button
                                                                    className="dropdown-item text-warning"
                                                                    onClick={() => handleProcessRefund(transaction)}
                                                                >
                                                                    <i className="bx bx-refresh me-1"></i> Process Refund
                                                                </button>
                                                            )}
                                                            {transaction.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        className="dropdown-item text-success"
                                                                        onClick={() => handleUpdateStatus(transaction, 'succeeded')}
                                                                    >
                                                                        <i className="bx bx-check me-1"></i> Mark Succeeded
                                                                    </button>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => handleUpdateStatus(transaction, 'failed')}
                                                                    >
                                                                        <i className="bx bx-x me-1"></i> Mark Failed
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="card-footer">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords} entries
                                        </span>
                                        <nav>
                                            <ul className="pagination pagination-sm">
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
                                                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                                                    if (pageNum > pagination.totalPages) return null;
                                                    return (
                                                        <li key={pageNum} className={`page-item ${pageNum === pagination.currentPage ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                {pageNum}
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;