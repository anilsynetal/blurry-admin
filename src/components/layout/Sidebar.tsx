import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/SimpleAdminContext';

interface MenuItem {
    path: string;
    name: string;
    icon: string;
    permission?: string;
    subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        path: '',
        name: 'Dashboard',
        icon: 'bx bx-home-circle',
    },
    {
        path: 'users',
        name: 'Users',
        icon: 'bx bx-user',
    },
    {
        path: 'subscriptions',
        name: 'Subscriptions',
        icon: 'bx bx-credit-card',
    },
    {
        path: 'transactions',
        name: 'Transactions',
        icon: 'bx bx-money',
    },
    {
        path: 'date-plans',
        name: 'Date Plans',
        icon: 'bx bx-heart',
    },
    {
        path: 'date-plan-templates',
        name: 'Date Plan Templates',
        icon: 'bx bx-calendar',
    },
    {
        path: 'faq',
        name: 'FAQ',
        icon: 'bx bx-help-circle',
    },
    {
        path: 'notifications',
        name: 'Notifications',
        icon: 'bx bx-bell',
    },
    {
        path: 'lounges',
        name: 'Lounges',
        icon: 'bx bx-building',
        subItems: [
            {
                path: 'lounges',
                name: 'Manage Lounges',
                icon: 'bx bx-building',
            },
            {
                path: 'lounges/user-details',
                name: 'User Details',
                icon: 'bx bx-group',
            },
        ],
    },
    {
        path: 'matches',
        name: 'Matches',
        icon: 'bx bx-heart',
    },
    {
        path: 'plans',
        name: 'Plans',
        icon: 'bx bx-package',
    },
    {
        path: 'email-templates',
        name: 'Email Templates',
        icon: 'bx bx-envelope',
    },
    {
        path: 'settings',
        name: 'Settings',
        icon: 'bx bx-cog',
        subItems: [
            {
                path: 'settings/smtp',
                name: 'SMTP Settings',
                icon: 'bx bx-cog',
            },
            {
                path: 'settings/privacy-policy',
                name: 'Privacy Policy',
                icon: 'bx bx-shield',
            },
            {
                path: 'settings/terms-conditions',
                name: 'Terms & Conditions',
                icon: 'bx bx-file',
            },
        ],
    },
];

const Sidebar: React.FC = () => {
    const { dispatch } = useAdmin();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

    const toggleSidebar = () => {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
    };

    const toggleMenu = (menuName: string, e: React.MouseEvent) => {
        e.preventDefault();
        setOpenMenus(prev => {
            const newSet = new Set(prev);
            if (newSet.has(menuName)) {
                newSet.delete(menuName);
            } else {
                newSet.add(menuName);
            }
            return newSet;
        });
    };

    const isActiveRoute = (path: string): boolean => {
        if (path === '') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname === `/${path}` || location.pathname.startsWith(`/${path}/`);
    };

    const hasActiveSubItem = (subItems?: MenuItem[]): boolean => {
        if (!subItems) return false;
        return subItems.some(item => isActiveRoute(item.path));
    };

    const isMenuOpen = (menuName: string): boolean => {
        return openMenus.has(menuName) || hasActiveSubItem(menuItems.find(item => item.name === menuName)?.subItems);
    };

    return (
        <>
            {/* App Brand */}
            <div className="app-brand demo">
                <Link to="" className="app-brand-link">
                    <span className="app-brand-logo demo">
                        <span className="text-primary d-flex align-items-center">
                            <img src="/assets/img/logo.png" alt="Blurry Logo" width="60" height="60" />
                            <span className="app-brand-text demo text-body fw-bold ms-1">Blurry </span>
                        </span>
                    </span>
                </Link>

                {/* Desktop toggle button */}
                <button
                    type="button"
                    className="layout-menu-toggle menu-link text-large ms-auto d-xl-block"
                    onClick={() => {
                        // console.log('Desktop toggle button clicked in sidebar');
                        toggleSidebar();
                    }}

                >
                    <i className="bx bx-chevron-left bx-sm"></i>
                </button>

                {/* Mobile close button */}
                <button
                    type="button"
                    className="layout-menu-toggle menu-link text-large ms-auto d-xl-none"
                    onClick={() => {
                        // console.log('Mobile close button clicked in sidebar');
                        toggleSidebar();
                    }}

                >
                    <i className="bx bx-x bx-sm"></i>
                </button>
            </div>

            <div className="menu-inner-shadow"></div>

            {/* Menu */}
            <ul className="menu-inner py-1 ps ps--active-y menu-scrollable" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                {menuItems.map((item, index) => (
                    <li key={index} className={`menu-item ${isActiveRoute(item.path) || hasActiveSubItem(item.subItems) ? 'active' : ''} ${item.subItems && isMenuOpen(item.name) ? 'open' : ''}`}>
                        {item.subItems ? (
                            <>
                                <a href="#" className="menu-link menu-toggle" onClick={(e) => toggleMenu(item.name, e)}>
                                    <i className={`menu-icon icon-base ${item.icon}`}></i>
                                    <div>{item.name}</div>
                                </a>
                                <ul className="menu-sub">
                                    {item.subItems.map((subItem, subIndex) => (
                                        <li key={subIndex} className={`menu-item ${isActiveRoute(subItem.path) ? 'active' : ''}`}>
                                            <Link to={subItem.path || ''} className="menu-link">
                                                <div>{subItem.name}</div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <Link to={item.path || ''} className="menu-link">
                                <i className={`menu-icon icon-base ${item.icon}`}></i>
                                <div>{item.name}</div>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Sidebar;