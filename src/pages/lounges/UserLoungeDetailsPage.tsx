import React, { useState, useEffect } from 'react';
import { userLoungeDetailsService, type UserLoungeDetail, type UserLoungeDetailsQueryParams } from '../../services/userLoungeDetails.service';
import { useToast } from '../../context/ToastContext';
import {
    LoadingSpinner,
    EmptyState,
    ActionBar,
    TablePagination,
    StatusBadge,
    PageHeader
} from '../../components/common';

interface UserLoungeDetailsFilters {
    search: string;
    userId: string;
    loungeId: string;
}

const UserLoungeDetailsPage: React.FC = () => {
    const [userLoungeDetails, setUserLoungeDetails] = useState<UserLoungeDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<UserLoungeDetailsFilters>({
        search: '',
        userId: '',
        loungeId: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalRecords: 0
    });

    const { showToast } = useToast();

    const fetchUserLoungeDetails = async (page = 1) => {
        try {
            setLoading(true);
            const params: UserLoungeDetailsQueryParams = {
                page,
                limit: pagination.pageSize,
                search: filters.search || undefined,
                userId: filters.userId || undefined,
                loungeId: filters.loungeId || undefined
            };

            const response = await userLoungeDetailsService.getUserLoungeDetails(params);
            setUserLoungeDetails(response.data);
            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                pageSize: response.pagination?.pageSize || 10,
                totalRecords: response.pagination?.totalRecords || 0
            });
        } catch (error) {
            console.error('Error fetching user lounge details:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load user lounge details'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserLoungeDetails();
    }, []);

    const handleSearch = () => {
        fetchUserLoungeDetails(1);
    };

    const handlePageChange = (page: number) => {
        fetchUserLoungeDetails(page);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize }));
        fetchUserLoungeDetails(1);
    };

    const handleFilterChange = (key: keyof UserLoungeDetailsFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading && userLoungeDetails.length === 0) {
        return <LoadingSpinner size="lg" text="Loading user lounge details..." />;
    }

    return (
        <div>
            <PageHeader
                title="User Lounge Details"
                breadcrumbs={['Admin', 'Lounges', 'User Details']}
            />

            <ActionBar
                title="User Lounge Memberships"
                searchPlaceholder="Search by user name, email, or lounge name..."
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
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="User ID (optional)"
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Lounge ID (optional)"
                                value={filters.loungeId}
                                onChange={(e) => handleFilterChange('loungeId', e.target.value)}
                            />
                        </div>
                    </div>
                }
            />

            {/* User Lounge Details Table */}
            {userLoungeDetails.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Lounge</th>
                                            <th>Joined At</th>
                                            <th>Vibe Description</th>
                                            <th>Switches Count</th>
                                            <th>User Status</th>
                                            <th>Lounge Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userLoungeDetails.map((detail) => (
                                            <tr key={detail._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <span className="avatar-initial rounded-circle bg-primary">
                                                                {detail.user.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{detail.user.name}</h6>
                                                            <small className="text-muted">{detail.user.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-3">
                                                            <img
                                                                src={detail.lounge.image}
                                                                alt={detail.lounge.name}
                                                                className="rounded-circle"
                                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/assets/img/default-lounge.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{detail.lounge.name}</h6>
                                                            <small className="text-muted">{detail.lounge.description}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {new Date(detail.joinedAt).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={detail.vibeDescription}>
                                                        {detail.vibeDescription || 'No description'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">{detail.loungeSwitchesCount}</span>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={detail.user.isActive}
                                                        trueLabel="Active"
                                                        falseLabel="Inactive"
                                                        trueVariant="success"
                                                        falseVariant="secondary"
                                                    />
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={detail.lounge.isActive}
                                                        trueLabel="Active"
                                                        falseLabel="Inactive"
                                                        trueVariant="success"
                                                        falseVariant="secondary"
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
                    title="No User Lounge Details Found"
                    description="No users have joined any lounges matching your current filters."
                    icon="bx bx-group"
                />
            )}
        </div>
    );
};

export default UserLoungeDetailsPage;