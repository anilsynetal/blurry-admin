import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/SimpleAdminContext';
import { authService } from '../../services/authService';
import { adminNotificationsService, AdminNotificationStats } from '../../services/adminNotifications.service';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

interface TopbarProps {
    onMenuToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
    const { state, dispatch } = useAdmin();
    const { showToast } = useToast();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notificationStats, setNotificationStats] = useState<AdminNotificationStats | null>(null);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLLIElement>(null);

    // Fetch notifications on component mount and set up polling
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const response = await adminNotificationsService.getHeaderNotifications(5);
            if (response.status === 'success') {
                setNotificationStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Use mock data as fallback
            setNotificationStats({
                totalNotifications: 0,
                unreadCount: 0,
                recentNotifications: []
            });
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Mark notification as read
    const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await adminNotificationsService.markAsRead(notificationId);
            // Refresh notifications
            await fetchNotifications();
            showToast({
                type: 'success',
                title: 'Success',
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to mark notification as read'
            });
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await adminNotificationsService.markAllAsRead();
            await fetchNotifications();
            showToast({
                type: 'success',
                title: 'Success',
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to mark notifications as read'
            });
        }
    };

    // Delete notification
    const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await adminNotificationsService.deleteNotification(notificationId);
            await fetchNotifications();
            showToast({
                type: 'success',
                title: 'Success',
                message: 'Notification deleted'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete notification'
            });
        }
    };

    const handleLogout = async () => {
        try {
            authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const toggleSidebar = () => {
        if (onMenuToggle) {
            onMenuToggle();
        } else {
            dispatch({ type: 'TOGGLE_SIDEBAR' });
        }
    };

    // Add notification hover effects
    const notificationItemStyle = {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        borderLeft: '3px solid transparent'
    };

    return (
        <>
            <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
                <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
                    <button
                        className="nav-item nav-link px-0 me-xl-4 btn btn-link border-0"
                        onClick={(e) => {
                            e.preventDefault();
                            //    console.log('Mobile menu button clicked in topbar');
                            toggleSidebar();
                        }}
                        style={{
                            background: 'none',
                            textDecoration: 'none',
                            color: '#697a8d',
                            fontSize: '1.5rem'
                        }}
                    >
                        <i className="bx bx-menu bx-sm"></i>
                    </button>
                </div>

                <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                    <ul className="navbar-nav flex-row align-items-center ms-auto">
                        <li className="nav-item lh-1 me-3">
                            <div className="dropdown d-inline-block" ref={notificationRef}>
                                <button
                                    type="button"
                                    className="btn header-item noti-icon position-relative"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        //    console.log('Notification button clicked, current state:', showNotifications);
                                        setShowNotifications(!showNotifications);
                                    }}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <i className="bx bx-bell bx-tada icon-lg" style={{ fontSize: '20px' }}></i>
                                    {notificationStats && notificationStats.unreadCount > 0 && (
                                        <span
                                            className="badge bg-danger rounded-pill position-absolute"
                                            style={{
                                                top: '2px',
                                                right: '2px',
                                                fontSize: '10px',
                                                minWidth: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'pulse 2s infinite'
                                            }}
                                        >
                                            {notificationStats.unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div
                                        className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 show"
                                        style={{
                                            width: '350px',
                                            maxHeight: 'none',
                                            display: 'block',
                                            position: 'absolute',
                                            zIndex: 1050
                                        }}
                                    >
                                        <div className="p-3 border-bottom bg-light">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="m-0 fw-bold">Notifications</h6>
                                                <div className="d-flex align-items-center">
                                                    {notificationStats && notificationStats.unreadCount > 0 && (
                                                        <span className="badge bg-primary rounded-pill me-2">
                                                            {notificationStats.unreadCount}
                                                        </span>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        style={{ fontSize: '11px', padding: '2px 8px' }}
                                                        onClick={handleMarkAllAsRead}
                                                        disabled={!notificationStats || notificationStats.unreadCount === 0}
                                                    >
                                                        Mark all read
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="notifications-container">
                                            {loadingNotifications ? (
                                                <div className="text-center p-4">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p className="text-muted mt-2 mb-0" style={{ fontSize: '12px' }}>Loading notifications...</p>
                                                </div>
                                            ) : notificationStats && notificationStats.recentNotifications.length > 0 ? (
                                                notificationStats.recentNotifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        className={`notification-item p-3 border-bottom position-relative ${!notification.isRead ? 'bg-light' : ''}`}
                                                        style={notificationItemStyle}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                            e.currentTarget.style.borderLeft = '3px solid #696cff';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = notification.isRead ? '' : '#f8f9fa';
                                                            e.currentTarget.style.borderLeft = '3px solid transparent';
                                                        }}
                                                    >
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 me-3">
                                                                <div className="avatar avatar-sm">
                                                                    <div className={`avatar-initial bg-${adminNotificationsService.getNotificationColor(notification.type)} rounded-circle`}>
                                                                        <i className={`bx ${adminNotificationsService.getNotificationIcon(notification.type)} text-white`}></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <h6 className="mb-1 fw-semibold" style={{ fontSize: '14px' }}>
                                                                        {notification.title}
                                                                    </h6>
                                                                    {!notification.isRead && (
                                                                        <span
                                                                            className="badge bg-primary"
                                                                            style={{ fontSize: '8px', cursor: 'pointer' }}
                                                                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                                            title="Mark as read"
                                                                        >
                                                                            •
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="mb-1 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                                    {notification.message}
                                                                </p>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <small className="text-muted">
                                                                        {adminNotificationsService.formatTimeAgo(notification.createdAt)}
                                                                    </small>
                                                                    <span
                                                                        className={`badge bg-${adminNotificationsService.getNotificationColor(notification.type)}`}
                                                                        style={{ fontSize: '10px' }}
                                                                    >
                                                                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="position-absolute top-0 end-0 p-2">
                                                                <button
                                                                    className="btn btn-sm btn-ghost p-1"
                                                                    style={{ fontSize: '12px', opacity: '0.6' }}
                                                                    onClick={(e) => handleDeleteNotification(notification._id, e)}
                                                                    title="Delete notification"
                                                                >
                                                                    <i className="bx bx-x"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center p-4">
                                                    <i className="bx bx-bell-off display-4 text-muted"></i>
                                                    <h6 className="text-muted mt-2">No Notifications</h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>You're all caught up!</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 border-top bg-light">
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        fetchNotifications();
                                                    }}
                                                    disabled={loadingNotifications}
                                                    title="Refresh notifications"
                                                >
                                                    <i className={`bx bx-refresh ${loadingNotifications ? 'bx-spin' : ''}`}></i>
                                                </button>
                                                <Link
                                                    to="/notifications"
                                                    className="btn btn-sm btn-outline-primary flex-grow-1"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    <i className="bx bx-bell me-1"></i>
                                                    View All
                                                    {notificationStats && notificationStats.totalNotifications > 0 && (
                                                        <span className="ms-1">({notificationStats.totalNotifications})</span>
                                                    )}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>

                        <li className="nav-item navbar-dropdown dropdown-user dropdown" ref={userMenuRef}>
                            <Link
                                className="nav-link dropdown-toggle hide-arrow"
                                to="#"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-online">
                                        <img
                                            className="w-px-40 h-auto rounded-circle"
                                            src={state.user?.image || '/assets/img/default-profile.png'}
                                            alt="Profile"
                                        />
                                    </div>
                                    <div className="ms-2 d-none d-lg-block">
                                        <span className="fw-semibold d-block">{state.user?.name || 'Admin User'}</span>
                                        <small className="text-muted">{state.user?.role || 'Admin'}</small>
                                    </div>
                                </div>
                            </Link>
                            {showUserMenu && (
                                <ul className="dropdown-menu dropdown-menu-end show">
                                    <li>
                                        <div className="dropdown-item">
                                            <div className="d-flex">
                                                <div className="flex-shrink-0 me-3">
                                                    <div className="avatar avatar-online">
                                                        <img
                                                            className="w-px-40 h-auto rounded-circle"
                                                            src={state.user?.image || '/assets/img/default-profile.png'}
                                                            alt="Profile"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <span className="fw-semibold d-block">{state.user?.name || 'Admin User'}</span>
                                                    <small className="text-muted">{state.user?.role || 'Admin'}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li><div className="dropdown-divider"></div></li>
                                    <li>
                                        <Link className="dropdown-item" to="/profile">
                                            <i className="bx bx-user me-2"></i>
                                            <span className="align-middle">My Profile</span>
                                        </Link>
                                    </li>
                                    <li><div className="dropdown-divider"></div></li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to="#"
                                            onClick={handleLogout}
                                        >
                                            <i className="bx bx-power-off me-2"></i>
                                            <span className="align-middle">Log Out</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Topbar;
