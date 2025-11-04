import React, { useState, useEffect } from 'react';
import { matchService, type Match, type MatchQueryParams } from '../../services/matches.service';
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

interface MatchFilters {
    search: string;
    status: string;
    userId: string;
    isMatched: string;
    isBlocked: string;
}

const MatchesPage: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<MatchFilters>({
        search: '',
        status: '',
        userId: '',
        isMatched: '',
        isBlocked: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalRecords: 0
    });
    const [stats, setStats] = useState<any>(null);

    const { showToast } = useToast();

    const fetchMatches = async (page = 1) => {
        try {
            setLoading(true);
            const params: MatchQueryParams = {
                page,
                limit: pagination.pageSize,
                search: filters.search || undefined,
                status: filters.status || undefined,
                userId: filters.userId || undefined,
                isMatched: filters.isMatched === 'true' ? true : filters.isMatched === 'false' ? false : undefined,
                isBlocked: filters.isBlocked === 'true' ? true : filters.isBlocked === 'false' ? false : undefined
            };

            const response = await matchService.getMatches(params);
            setMatches(response.data);
            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                pageSize: response.pagination?.pageSize || 10,
                totalRecords: response.pagination?.totalRecords || 0
            });
        } catch (error) {
            console.error('Error fetching matches:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load matches'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await matchService.getMatchStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchMatches();
        fetchStats();
    }, []);

    const handleSearch = () => {
        fetchMatches(1);
    };

    const handlePageChange = (page: number) => {
        fetchMatches(page);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize }));
        fetchMatches(1);
    };

    const handleFilterChange = (key: keyof MatchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdateStatus = async (match: Match, newStatus: Match['status']) => {
        try {
            const result = await Swal.fire({
                title: 'Confirm Action',
                text: `Are you sure you want to change the match status to ${newStatus}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Yes, update to ${newStatus}`,
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await matchService.updateMatchStatus(match._id, { status: newStatus });
                fetchMatches(pagination.currentPage);
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: `Match status updated to ${newStatus}`
                });
            }
        } catch (error) {
            console.error('Error updating match status:', error);
            const apiError = error as any;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to update match status'
            });
        }
    };

    const handleToggleBlock = async (match: Match) => {
        try {
            const action = match.isBlocked ? 'unblock' : 'block';
            const reason = action === 'block' ? await Swal.fire({
                title: 'Block Reason',
                input: 'text',
                inputLabel: 'Please provide a reason for blocking this match',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Block reason is required!';
                    }
                    return null;
                }
            }) : null;

            if (action === 'block' && (!reason || reason.dismiss)) return;

            const result = await Swal.fire({
                title: 'Confirm Action',
                text: `Are you sure you want to ${action} this match?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Yes, ${action}`,
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await matchService.toggleMatchBlock(match._id, {
                    isBlocked: !match.isBlocked,
                    blockReason: reason?.value
                });
                fetchMatches(pagination.currentPage);
                fetchStats();
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: `Match ${action}ed successfully`
                });
            }
        } catch (error) {
            console.error('Error toggling match block:', error);
            const apiError = error as any;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to update match block status'
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'matched': return 'success';
            case 'approved': return 'info';
            case 'pending': return 'warning';
            case 'denied': return 'danger';
            case 'expired': return 'secondary';
            default: return 'secondary';
        }
    };

    if (loading && matches.length === 0) {
        return <LoadingSpinner size="lg" text="Loading matches..." />;
    }

    return (
        <div>
            <PageHeader
                title="Matches Management"
                breadcrumbs={['Admin', 'Matches']}
            />

            {/* Statistics Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-primary">
                                            <i className="bx bx-heart text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Total Matches</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.totalMatches}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-success">
                                            <i className="bx bx-check-circle text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Matched</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.matchedPairs}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
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
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.pendingMatches}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-info">
                                            <i className="bx bx-check text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Approved</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.approvedMatches}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-danger">
                                            <i className="bx bx-x text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Denied</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.deniedMatches}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-secondary">
                                            <i className="bx bx-block text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Blocked</small>
                                        <div className="d-flex align-items-center">
                                            <h3 className="mb-0 me-1">{stats.blockedMatches}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionBar
                title="Matches List"
                searchPlaceholder="Search by requester or requestee name/email..."
                searchValue={filters.search}
                onSearchChange={(value) => handleFilterChange('search', value)}
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
                        <div className="col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="denied">Denied</option>
                                <option value="matched">Matched</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={filters.isMatched}
                                onChange={(e) => handleFilterChange('isMatched', e.target.value)}
                            >
                                <option value="">All Matches</option>
                                <option value="true">Matched</option>
                                <option value="false">Not Matched</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select
                                className="form-select form-select-sm"
                                value={filters.isBlocked}
                                onChange={(e) => handleFilterChange('isBlocked', e.target.value)}
                            >
                                <option value="">All Blocks</option>
                                <option value="true">Blocked</option>
                                <option value="false">Not Blocked</option>
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Matches Table */}
            {matches.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Requester</th>
                                            <th>Requestee</th>
                                            <th>Status</th>
                                            <th>Matched</th>
                                            <th>Message</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map((match) => (
                                            <tr key={match._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <span className="avatar-initial rounded-circle bg-primary">
                                                                {match.requester.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{match.requester.name}</h6>
                                                            <small className="text-muted">{match.requester.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <span className="avatar-initial rounded-circle bg-success">
                                                                {match.requestee.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{match.requestee.name}</h6>
                                                            <small className="text-muted">{match.requestee.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={true}
                                                        trueLabel={match.status}
                                                        trueVariant={getStatusBadgeVariant(match.status)}
                                                        falseLabel=""
                                                    />
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={match.isMatched}
                                                        trueLabel="Yes"
                                                        falseLabel="No"
                                                        trueVariant="success"
                                                        falseVariant="secondary"
                                                    />
                                                </td>
                                                <td>
                                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={match.message}>
                                                        {match.message || 'No message'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {new Date(match.createdAt).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>
                                                    <ActionDropdown
                                                        onEdit={() => {/* Could open modal for details */ }}
                                                        additionalActions={[
                                                            {
                                                                label: 'Approve',
                                                                icon: 'bx-check',
                                                                onClick: () => handleUpdateStatus(match, 'approved'),
                                                                variant: match.status === 'approved' ? 'success' : ''
                                                            },
                                                            {
                                                                label: 'Deny',
                                                                icon: 'bx-x',
                                                                onClick: () => handleUpdateStatus(match, 'denied'),
                                                                variant: 'danger'
                                                            },
                                                            {
                                                                label: match.isBlocked ? 'Unblock' : 'Block',
                                                                icon: match.isBlocked ? 'bx-unlock' : 'bx-lock',
                                                                onClick: () => handleToggleBlock(match),
                                                                variant: match.isBlocked ? 'success' : 'warning'
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
                    title="No Matches Found"
                    description="No matches match your current filters."
                    icon="bx bx-heart"
                />
            )}
        </div>
    );
};

export default MatchesPage;