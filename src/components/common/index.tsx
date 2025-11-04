import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text = 'Loading...',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'spinner-border-sm',
        md: '',
        lg: ''
    };

    const containerStyle = size === 'lg' ? { height: '400px' } : {};

    return (
        <div className={`d-flex justify-content-center align-items-center ${className}`} style={containerStyle}>
            <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
                <span className="visually-hidden">{text}</span>
            </div>
        </div>
    );
};

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    actionButton?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = 'bx-package',
    actionButton,
    className = ''
}) => {
    return (
        <div className={`card ${className}`}>
            <div className="card-body text-center py-5">
                <i className={`bx ${icon} display-4 text-muted mb-3`}></i>
                <h5>{title}</h5>
                <p className="text-muted">{description}</p>
                {actionButton}
            </div>
        </div>
    );
};

interface PageHeaderProps {
    title: string;
    breadcrumbs?: string[];
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    breadcrumbs = ['Admin'],
    actions
}) => {
    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold py-3 mb-4">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index}>
                                {index > 0 && <span className="text-muted fw-light"> / </span>}
                                <span className={index === breadcrumbs.length - 1 ? '' : 'text-muted fw-light'}>
                                    {crumb}
                                </span>
                            </span>
                        ))}
                        <span className="text-muted fw-light"> / </span>
                        {title}
                    </h4>
                    {actions && <div>{actions}</div>}
                </div>
            </div>
        </div>
    );
};

interface ActionBarProps {
    title: string;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    actions?: React.ReactNode;
    filters?: React.ReactNode;
}

export const ActionBar: React.FC<ActionBarProps> = ({
    title,
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
    actions,
    filters
}) => {
    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <h5 className="mb-0">{title}</h5>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex justify-content-end gap-2">
                                    {onSearchChange && (
                                        <div className="input-group" style={{ maxWidth: '250px' }}>
                                            <span className="input-group-text">
                                                <i className="bx bx-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={searchPlaceholder}
                                                value={searchValue}
                                                onChange={(e) => onSearchChange(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {actions}
                                </div>
                            </div>
                        </div>
                        {filters && (
                            <div className="row mt-3">
                                <div className="col-12">
                                    {filters}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatusBadgeProps {
    status: boolean;
    trueLabel?: string;
    falseLabel?: string;
    trueVariant?: string;
    falseVariant?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    trueLabel = 'Active',
    falseLabel = 'Inactive',
    trueVariant = 'success',
    falseVariant = 'secondary'
}) => {
    return (
        <span className={`badge bg-${status ? trueVariant : falseVariant}`}>
            {status ? trueLabel : falseLabel}
        </span>
    );
};

interface ActionDropdownProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    statusLabel?: string;
    statusIcon?: string;
    additionalActions?: Array<{
        label: string;
        icon: string;
        onClick: () => void;
        variant?: string;
    }>;
    disabled?: boolean;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    onEdit,
    onDelete,
    onToggleStatus,
    statusLabel,
    statusIcon,
    additionalActions = [],
    disabled = false
}) => {
    return (
        <div className="dropdown">
            <button
                type="button"
                className="btn p-0 dropdown-toggle hide-arrow"
                data-bs-toggle="dropdown"
                disabled={disabled}
            >
                <i className="bx bx-dots-vertical-rounded"></i>
            </button>
            <div className="dropdown-menu">
                {onEdit && (
                    <button className="dropdown-item" onClick={onEdit}>
                        <i className="bx bx-edit-alt me-1"></i> Edit
                    </button>
                )}

                {additionalActions.map((action, index) => (
                    <button
                        key={index}
                        className={`dropdown-item ${action.variant ? `text-${action.variant}` : ''}`}
                        onClick={action.onClick}
                    >
                        <i className={`bx ${action.icon} me-1`}></i> {action.label}
                    </button>
                ))}

                {onToggleStatus && statusLabel && (
                    <button className="dropdown-item" onClick={onToggleStatus}>
                        <i className={`bx ${statusIcon || 'bx-refresh'} me-1`}></i> {statusLabel}
                    </button>
                )}

                {onDelete && (
                    <>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item text-danger" onClick={onDelete}>
                            <i className="bx bx-trash me-1"></i> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRecords: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizes?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalRecords,
    onPageChange,
    onPageSizeChange,
    pageSizes = [10, 25, 50, 100]
}) => {
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <span className="me-3">
                    Showing {startRecord} to {endRecord} of {totalRecords} entries
                </span>
                <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizes.map(size => (
                        <option key={size} value={size}>{size} per page</option>
                    ))}
                </select>
            </div>

            <nav>
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                    </li>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </button>
                            </li>
                        );
                    })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};