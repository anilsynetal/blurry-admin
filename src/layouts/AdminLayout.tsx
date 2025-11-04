import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';
import { useAdmin } from '../context/SimpleAdminContext';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { state, dispatch } = useAdmin();

    // Check if mobile
    const isMobile = () => window.innerWidth < 1200;

    // Initialize mobile state only once on mount
    useEffect(() => {
        const isMobileView = isMobile();
        if (isMobileView && !state.sidebarCollapsed) {
            dispatch({ type: 'TOGGLE_SIDEBAR' });
        }
    }, []);

    // Initialize layout effects
    useEffect(() => {
        console.log('Layout effect - sidebarCollapsed:', state.sidebarCollapsed);
        const htmlElement = document.documentElement;
        const bodyElement = document.body;
        const isMobileView = isMobile();
        console.log('Layout effect - isMobile:', isMobileView);

        // Base classes
        let htmlClassName = 'light-style layout-menu-fixed';
        let bodyClassName = '';

        if (isMobileView) {
            // On mobile, menu is expanded when NOT collapsed (sidebarCollapsed = false means menu is open)
            if (state.sidebarCollapsed) {
                htmlClassName += ' layout-menu-expanded';
                bodyClassName += ' layout-menu-expanded';
                console.log('Mobile: Setting layout-menu-expanded');
            } else {
                console.log('Mobile: Menu expanded (normal)');
            }
        } else {
            // On desktop, menu is collapsed when collapsed
            if (state.sidebarCollapsed) {
                htmlClassName += ' layout-menu-collapsed';
                bodyClassName += ' layout-menu-collapsed';
                console.log('Desktop: Setting layout-menu-collapsed');
            } else {
                console.log('Desktop: Menu expanded (normal)');
            }
        }

        htmlElement.className = htmlClassName;
        bodyElement.className = bodyClassName.trim();

        htmlElement.setAttribute('dir', 'ltr');
        htmlElement.setAttribute('data-theme', 'theme-default');
        htmlElement.setAttribute('data-assets-path', '/assets');
        htmlElement.setAttribute('data-template', 'vertical-menu-template-free');

        console.log('Applied HTML classes:', htmlClassName);
        console.log('Applied Body classes:', bodyElement.className);
    }, [state.sidebarCollapsed]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // No auto-collapse on resize
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle menu toggle
    const handleMenuToggle = () => {
        console.log('Toggle sidebar clicked. Current state:', state.sidebarCollapsed);
        dispatch({ type: 'TOGGLE_SIDEBAR' });
    };

    return (
        <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
                {/* Loading Overlay */}
                <div
                    id="overlay"
                    className="overlay"
                    style={{ display: state.loading ? 'flex' : 'none' }}
                >
                    <div id="loader" className="loader"></div>
                </div>

                {/* Sidebar */}
                <aside
                    id="layout-menu"
                    className={`layout-menu menu-vertical menu bg-menu-theme ${state.sidebarCollapsed ? 'menu-collapsed' : ''}`}
                    style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'
                    } as React.CSSProperties}
                >
                    <Sidebar />
                </aside>

                {/* Main Content */}
                <div className="layout-page">
                    {/* Topbar */}
                    <Topbar onMenuToggle={handleMenuToggle} />

                    {/* Content wrapper */}
                    <div className="content-wrapper">
                        {/* Content */}
                        <div className="flex-grow-1 container-p-y container-fluid">
                            {children}
                        </div>

                        {/* Footer */}
                        <Footer />
                        <div className="content-backdrop fade"></div>
                    </div>
                </div>

                {/* Layout Overlay for mobile menu */}
                <div
                    className="layout-overlay layout-menu-toggle"
                    onClick={handleMenuToggle}
                ></div>
            </div>

            {/* Audio elements for notifications */}
            <audio style={{ display: 'none' }} id="audio" src="/assets/bell.wav" />
            <audio style={{ display: 'none' }} id="error" src="/assets/error.mp3" />
        </div>
    );
};

export default AdminLayout;