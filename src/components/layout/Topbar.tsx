import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/SimpleAdminContext';
import { authService } from '../../services/authService';
import { Link } from 'react-router-dom';

interface TopbarProps {
    onMenuToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
    const { state, dispatch } = useAdmin();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLLIElement>(null);

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
                            console.log('Mobile menu button clicked in topbar');
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
                                        console.log('Notification button clicked, current state:', showNotifications);
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
                                        3
                                    </span>
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
                                                    <span className="badge bg-primary rounded-pill me-2">3</span>
                                                    <button className="btn btn-sm btn-outline-primary" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                        Mark all read
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="notifications-container">
                                            <div
                                                className="notification-item p-3 border-bottom position-relative"
                                                style={notificationItemStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    e.currentTarget.style.borderLeft = '3px solid #696cff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                                }}
                                            >
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0 me-3">
                                                        <div className="avatar avatar-sm">
                                                            <div className="avatar-initial bg-success rounded-circle">
                                                                <i className="bx bx-user-plus text-white"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-semibold" style={{ fontSize: '14px' }}>New User Registered</h6>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                            John Doe has successfully registered on the platform.
                                                        </p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">10 minutes ago</small>
                                                            <span className="badge bg-success" style={{ fontSize: '10px' }}>New</span>
                                                        </div>
                                                    </div>
                                                    <div className="position-absolute top-0 end-0 p-2">
                                                        <button className="btn btn-sm btn-ghost p-1" style={{ fontSize: '12px', opacity: '0.6' }}>
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="notification-item p-3 border-bottom position-relative"
                                                style={notificationItemStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    e.currentTarget.style.borderLeft = '3px solid #696cff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                                }}
                                            >
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0 me-3">
                                                        <div className="avatar avatar-sm">
                                                            <div className="avatar-initial bg-warning rounded-circle">
                                                                <i className="bx bx-server text-white"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-semibold" style={{ fontSize: '14px' }}>Server Maintenance</h6>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                            Scheduled maintenance completed successfully.
                                                        </p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">30 minutes ago</small>
                                                            <span className="badge bg-warning" style={{ fontSize: '10px' }}>System</span>
                                                        </div>
                                                    </div>
                                                    <div className="position-absolute top-0 end-0 p-2">
                                                        <button className="btn btn-sm btn-ghost p-1" style={{ fontSize: '12px', opacity: '0.6' }}>
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="notification-item p-3 border-bottom position-relative"
                                                style={notificationItemStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    e.currentTarget.style.borderLeft = '3px solid #696cff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                                }}
                                            >
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0 me-3">
                                                        <div className="avatar avatar-sm">
                                                            <div className="avatar-initial bg-info rounded-circle">
                                                                <i className="bx bx-credit-card text-white"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-semibold" style={{ fontSize: '14px' }}>Payment Received</h6>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                            Premium subscription payment of $29.99 received.
                                                        </p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">1 hour ago</small>
                                                            <span className="badge bg-info" style={{ fontSize: '10px' }}>Payment</span>
                                                        </div>
                                                    </div>
                                                    <div className="position-absolute top-0 end-0 p-2">
                                                        <button className="btn btn-sm btn-ghost p-1" style={{ fontSize: '12px', opacity: '0.6' }}>
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 text-center border-top bg-light">
                                            <Link to="/notifications" className="btn btn-sm btn-outline-primary w-100">
                                                <i className="bx bx-bell me-1"></i>
                                                View All Notifications
                                            </Link>
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
