import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { authService } from '../services/authService';

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
}

interface AdminState {
    isAuthenticated: boolean;
    user: AdminUser | null;
    token: string | null;
    loading: boolean;
    sidebarCollapsed: boolean;
}

type AdminAction =
    | { type: 'LOGIN_SUCCESS'; payload: { user: AdminUser; token: string } }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'INIT_AUTH'; payload: { user: AdminUser } }
    | { type: 'CLEAR_AUTH' };

const initialState: AdminState = {
    isAuthenticated: !!localStorage.getItem('admin_token'),
    user: null,
    token: localStorage.getItem('admin_token'),
    loading: false,
    sidebarCollapsed: false, // Always start with sidebar expanded
};

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('admin_token', action.payload.token);
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
            };
        case 'INIT_AUTH':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                loading: false,
            };
        case 'CLEAR_AUTH':
        case 'LOGOUT':
            localStorage.removeItem('admin_token');
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'TOGGLE_SIDEBAR':
            return {
                ...state,
                sidebarCollapsed: !state.sidebarCollapsed,
            };
        default:
            return state;
    }
};

interface AdminContextType {
    state: AdminState;
    dispatch: React.Dispatch<AdminAction>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminReducer, initialState);

    // Validate token on app startup
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('admin_token');

            if (token) {
                dispatch({ type: 'SET_LOADING', payload: true });
                try {
                    const response = await authService.validateToken();
                    if (response.success && response.user) {
                        dispatch({ type: 'INIT_AUTH', payload: { user: response.user } });
                    } else {
                        dispatch({ type: 'CLEAR_AUTH' });
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    dispatch({ type: 'CLEAR_AUTH' });
                } finally {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                // No token found, but don't set loading
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        validateToken();
    }, []);

    return (
        <AdminContext.Provider value={{ state, dispatch }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};