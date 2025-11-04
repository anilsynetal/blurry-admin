import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString();
        const newToast: Toast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto-remove toast after duration (default 5 seconds)
        setTimeout(() => {
            removeToast(id);
        }, toast.duration || 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className="toast-container position-fixed p-3"
            style={{
                top: '5px', // Position below topbar
                right: '15px',
                zIndex: 10000,
                maxWidth: '350px'
            }}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast show align-items-center text-bg-${toast.type === 'error' ? 'danger' : toast.type} border-0 mb-2`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    style={{
                        minWidth: '300px',
                        animation: 'slideInRight 0.3s ease-out'
                    }}
                >
                    <div className="d-flex">
                        <div className="toast-body">
                            <strong>{toast.title}</strong>
                            {toast.message && <div>{toast.message}</div>}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close"
                        />
                    </div>
                </div>
            ))}

            {/* Add CSS animation styles */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .toast-container .toast {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </div>
    );
};