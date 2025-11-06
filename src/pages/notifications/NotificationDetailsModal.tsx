import React, { useState, useEffect } from 'react';
import { notificationsService, Notification, DeliveryStatsResponse } from '../../services/notifications.service';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, LoadingSpinner } from '../../components/common';
import { getNotificationImageUrl } from '../../utils/imageUtils';

interface NotificationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
    isOpen,
    onClose,
    notification
}) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'metadata'>('details');
    const [deliveryStats, setDeliveryStats] = useState<DeliveryStatsResponse | null>(null);
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'delivery' && notification._id) {
            fetchDeliveryStats();
        }
    }, [isOpen, activeTab, notification._id]);

    const fetchDeliveryStats = async () => {
        try {
            setLoadingDelivery(true);
            const response = await notificationsService.getDeliveryStats(notification._id!);
            setDeliveryStats(response.data);
        } catch (error) {
            console.error('Error fetching delivery stats:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to fetch delivery statistics'
            });
        } finally {
            setLoadingDelivery(false);
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

    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Notification Details</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {/* Notification Header */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-auto">
                                                {notification.image && (
                                                    <div className="avatar avatar-lg">
                                                        <img
                                                            src={getNotificationImageUrl(notification.image) || notification.image}
                                                            alt=""
                                                            className="rounded"
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col">
                                                <h3 className="mb-1">{notification.title}</h3>
                                                <p className="mb-1 text-muted">{notification.message}</p>
                                                <div className="d-flex gap-2 mt-2">
                                                    <span className={`badge bg-${getNotificationTypeColor(notification.type)}`}>
                                                        {notification.type.toUpperCase()}
                                                    </span>
                                                    <span className={`badge bg-${getPriorityColor(notification.priority)}`}>
                                                        {notification.priority.toUpperCase()}
                                                    </span>
                                                    <span className={`badge ${notification.isBroadcast ? 'bg-primary' : 'bg-info'}`}>
                                                        {notification.isBroadcast ? 'Broadcast' : 'Targeted'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-auto">
                                                <div className="d-flex flex-column gap-2">
                                                    <StatusBadge
                                                        status={notification.push}
                                                        trueLabel="Push Enabled"
                                                        falseLabel="Push Disabled"
                                                        trueVariant="success"
                                                        falseVariant="secondary"
                                                    />
                                                    {notification.push && notification.pushSent && (
                                                        <span className="badge bg-success">Push Sent</span>
                                                    )}
                                                    {notification.expiresAt && (
                                                        <small className="text-muted">
                                                            Expires: {new Date(notification.expiresAt).toLocaleString()}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    <i className="bx bx-info-circle me-1"></i>
                                    Details
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('delivery')}
                                >
                                    <i className="bx bx-paper-plane me-1"></i>
                                    Delivery Stats
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'metadata' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('metadata')}
                                >
                                    <i className="bx bx-data me-1"></i>
                                    Metadata
                                </button>
                            </li>
                        </ul>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="mb-0">Notification Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row mb-3">
                                                    <div className="col-sm-4">
                                                        <strong>Title:</strong>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {notification.title}
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-4">
                                                        <strong>Message:</strong>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {notification.message}
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-4">
                                                        <strong>Type:</strong>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        <span className={`badge bg-${getNotificationTypeColor(notification.type)}`}>
                                                            {notification.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-4">
                                                        <strong>Priority:</strong>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        <span className={`badge bg-${getPriorityColor(notification.priority)}`}>
                                                            {notification.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {notification.actionUrl && (
                                                    <div className="row mb-3">
                                                        <div className="col-sm-4">
                                                            <strong>Action URL:</strong>
                                                        </div>
                                                        <div className="col-sm-8">
                                                            <a
                                                                href={notification.actionUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-break"
                                                            >
                                                                {notification.actionUrl}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                {notification.actionText && (
                                                    <div className="row mb-3">
                                                        <div className="col-sm-4">
                                                            <strong>Action Text:</strong>
                                                        </div>
                                                        <div className="col-sm-8">
                                                            {notification.actionText}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="mb-0">Delivery & Status</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Delivery Type:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        <span className={`badge ${notification.isBroadcast ? 'bg-primary' : 'bg-info'}`}>
                                                            {notification.isBroadcast ? 'Broadcast' : 'Targeted'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Recipients:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        {notification.isBroadcast ? (
                                                            'All active users'
                                                        ) : (
                                                            `${notification.totalRecipients || notification.recipients?.length || 0} users`
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Delivered:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        {notification.deliveryCount} notifications
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Push Notification:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        <StatusBadge
                                                            status={notification.push}
                                                            trueLabel="Enabled"
                                                            falseLabel="Disabled"
                                                        />
                                                    </div>
                                                </div>
                                                {notification.push && (
                                                    <div className="row mb-3">
                                                        <div className="col-sm-5">
                                                            <strong>Push Status:</strong>
                                                        </div>
                                                        <div className="col-sm-7">
                                                            <StatusBadge
                                                                status={notification.pushSent || false}
                                                                trueLabel="Sent"
                                                                falseLabel="Pending"
                                                            />
                                                            {notification.pushSentAt && (
                                                                <div>
                                                                    <small className="text-muted">
                                                                        {new Date(notification.pushSentAt).toLocaleString()}
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Created:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        {new Date(notification.createdAt!).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-sm-5">
                                                        <strong>Created By:</strong>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        {notification.createdByDetails?.username || notification.createdBy || 'System'}
                                                        {notification.createdByDetails?.email && (
                                                            <div>
                                                                <small className="text-muted">
                                                                    {notification.createdByDetails.email}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {notification.expiresAt && (
                                                    <div className="row mb-3">
                                                        <div className="col-sm-5">
                                                            <strong>Expires At:</strong>
                                                        </div>
                                                        <div className="col-sm-7">
                                                            {new Date(notification.expiresAt).toLocaleString()}
                                                            {new Date(notification.expiresAt) < new Date() && (
                                                                <div>
                                                                    <span className="badge bg-danger">Expired</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {notification.image && (
                                        <div className="col-12 mt-3">
                                            <div className="card">
                                                <div className="card-header">
                                                    <h6 className="mb-0">Notification Image</h6>
                                                </div>
                                                <div className="card-body text-center">
                                                    <img
                                                        src={getNotificationImageUrl(notification.image) || notification.image}
                                                        alt="Notification"
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: '300px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Delivery Tab */}
                            {activeTab === 'delivery' && (
                                <div className="row">
                                    <div className="col-12">
                                        {loadingDelivery ? (
                                            <LoadingSpinner text="Loading delivery statistics..." />
                                        ) : deliveryStats ? (
                                            <>
                                                {/* Delivery Summary */}
                                                <div className="row mb-4">
                                                    <div className="col-md-3">
                                                        <div className="card text-center">
                                                            <div className="card-body">
                                                                <h4 className="text-primary">{deliveryStats.totalRecipients}</h4>
                                                                <p className="mb-0">Total Recipients</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card text-center">
                                                            <div className="card-body">
                                                                <h4 className="text-success">{deliveryStats.deliveredCount}</h4>
                                                                <p className="mb-0">Delivered</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card text-center">
                                                            <div className="card-body">
                                                                <h4 className="text-info">{deliveryStats.readCount}</h4>
                                                                <p className="mb-0">Read</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card text-center">
                                                            <div className="card-body">
                                                                <h4 className="text-danger">{deliveryStats.failedCount}</h4>
                                                                <p className="mb-0">Failed</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Delivery Rates */}
                                                <div className="row mb-4">
                                                    <div className="col-md-6">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <h6>Delivery Rate</h6>
                                                                <div className="progress">
                                                                    <div
                                                                        className="progress-bar bg-success"
                                                                        style={{ width: `${deliveryStats.deliveryRate}%` }}
                                                                    >
                                                                        {deliveryStats.deliveryRate.toFixed(1)}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <h6>Read Rate</h6>
                                                                <div className="progress">
                                                                    <div
                                                                        className="progress-bar bg-info"
                                                                        style={{ width: `${deliveryStats.readRate}%` }}
                                                                    >
                                                                        {deliveryStats.readRate.toFixed(1)}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Detailed Delivery List */}
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">Delivery Details</h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="table-responsive">
                                                            <table className="table table-sm">
                                                                <thead>
                                                                    <tr>
                                                                        <th>User</th>
                                                                        <th>Email</th>
                                                                        <th>Delivered</th>
                                                                        <th>Read</th>
                                                                        <th>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {deliveryStats.deliveryDetails.map((detail, index) => (
                                                                        <tr key={index}>
                                                                            <td>{detail.username}</td>
                                                                            <td>{detail.email}</td>
                                                                            <td>
                                                                                {detail.delivered ? (
                                                                                    <span className="badge bg-success">
                                                                                        <i className="bx bx-check me-1"></i>
                                                                                        {detail.deliveredAt && new Date(detail.deliveredAt).toLocaleString()}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="badge bg-danger">Failed</span>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {detail.read ? (
                                                                                    <span className="badge bg-info">
                                                                                        <i className="bx bx-envelope-open me-1"></i>
                                                                                        {detail.readAt && new Date(detail.readAt).toLocaleString()}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="badge bg-secondary">Unread</span>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {detail.error ? (
                                                                                    <span className="text-danger">{detail.error}</span>
                                                                                ) : (
                                                                                    <span className="text-success">Success</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="bx bx-paper-plane display-4 text-muted"></i>
                                                <p className="text-muted">No delivery statistics available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata Tab */}
                            {activeTab === 'metadata' && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="mb-0">Notification Metadata</h6>
                                            </div>
                                            <div className="card-body">
                                                {notification.metadata && Object.keys(notification.metadata).length > 0 ? (
                                                    <pre className="bg-light p-3 rounded">
                                                        {JSON.stringify(notification.metadata, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <i className="bx bx-data display-4 text-muted"></i>
                                                        <p className="text-muted">No metadata available for this notification</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailsModal;