import { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/auth.service';

export const useAuth = () => {
    const { state, dispatch } = useAdmin();

    useEffect(() => {
        // Check if user is already authenticated on app load
        const token = localStorage.getItem('admin_token');
        if (token && !state.user) {
            // In a real app, you would validate the token with the server
            // For now, we'll just trust the token exists
            dispatch({ type: 'SET_LOADING', payload: true });

            // Mock user data - in real app, fetch from API using token
            setTimeout(() => {
                const mockUser = {
                    _id: '1',
                    name: 'Admin User',
                    email: 'admin@blurry.com',
                    role: 'admin',
                };

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user: mockUser, token },
                });
            }, 1000);
        }
    }, [state.user, dispatch]);

    const login = async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await authService.login({ email, password });
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: response.data,
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'SET_LOADING', payload: false });
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const logoutAll = async () => {
        try {
            await authService.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    return {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        token: state.token,
        login,
        logout,
        logoutAll,
    };
};