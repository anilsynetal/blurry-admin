import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/SimpleAdminContext';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/dashboard/Dashboard';
import PlansPage from '../pages/plans/PlansPage';
import EmailTemplatesPage from '../pages/email-templates/EmailTemplatesPage';
import SettingsPage from '../pages/settings/SettingsPage';
import { UsersPage } from '../pages/users/index.tsx';
import { NotificationsPage } from '../pages/notifications/index.tsx';
import { LoungesPage } from '../pages/lounges/index.tsx';
import UserLoungeDetailsPage from '../pages/lounges/UserLoungeDetailsPage';
import DatePlanTemplatesPage from '../pages/date-plan-templates/DatePlanTemplatesPage';
import DatePlansPage from '../pages/date-plans/DatePlansPage';
import MatchesPage from '../pages/matches/MatchesPage';
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';
import TransactionsPage from '../pages/transactions/TransactionsPage';
import ProfilePage from '../pages/profile/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useAdmin();

    // If still loading, show loading state
    if (state.loading) {
        return <div>Loading...</div>;
    }

    // Check if user has valid authentication (either authenticated OR has token)
    if (!state.isAuthenticated && !state.token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const AdminRoutes: React.FC = () => {
    const { state } = useAdmin();

    return (
        <Routes>
            {/* Login Route - Only accessible when not authenticated */}
            <Route
                path="/login"
                element={
                    state.isAuthenticated ?
                        <Navigate to="/dashboard" replace /> :
                        <LoginPage />
                }
            />

            {/* Protected Routes - Only accessible when authenticated */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AdminLayout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/users" element={<UsersPage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />
                                <Route path="/lounges" element={<LoungesPage />} />
                                <Route path="/lounges/user-details" element={<UserLoungeDetailsPage />} />
                                <Route path="/plans" element={<PlansPage />} />
                                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                                <Route path="/transactions" element={<TransactionsPage />} />
                                <Route path="/date-plan-templates" element={<DatePlanTemplatesPage />} />
                                <Route path="/date-plans" element={<DatePlansPage />} />
                                <Route path="/matches" element={<MatchesPage />} />
                                <Route path="/email-templates" element={<EmailTemplatesPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/settings/*" element={<Navigate to="/settings" replace />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            {/* Default Route */}
            <Route path="*" element={
                state.isAuthenticated ?
                    <Navigate to="/dashboard" replace /> :
                    <Navigate to="/login" replace />
            } />
        </Routes>
    );
};

export default AdminRoutes;