import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface AdminUser {
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
    notifications: any[];
    unreadCount: number;
}

type AdminAction =
    | { type: 'LOGIN_SUCCESS'; payload: { user: AdminUser; token: string } }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_NOTIFICATIONS'; payload: any[] }
    | { type: 'SET_UNREAD_COUNT'; payload: number };

const initialState: AdminState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('admin_token'),
    loading: false,
    sidebarCollapsed: false,
    notifications: [],
    unreadCount: 0,
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
        case 'SET_NOTIFICATIONS':
            return {
                ...state,
                notifications: action.payload,
            };
        case 'SET_UNREAD_COUNT':
            return {
                ...state,
                unreadCount: action.payload,
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

export type { AdminUser, AdminState, AdminAction };