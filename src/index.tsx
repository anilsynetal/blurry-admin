import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from './context/SimpleAdminContext';
import { ToastProvider } from './context/ToastContext';
import AdminRoutes from './routes/AdminRoutes';

const AdminApp: React.FC = () => {
    return (
        <AdminProvider>
            <ToastProvider>
                <BrowserRouter>
                    <AdminRoutes />
                </BrowserRouter>
            </ToastProvider>
        </AdminProvider>
    );
};

export default AdminApp;