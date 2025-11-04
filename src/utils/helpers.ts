/**
 * Utility functions for admin panel
 */

// Format date helper
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format currency helper
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

// Truncate text helper
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Get status badge class
export const getStatusBadgeClass = (isActive: boolean): string => {
    return isActive ? 'bg-success' : 'bg-secondary';
};

// Get status text
export const getStatusText = (isActive: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
};

// Generate random ID
export const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// Download file
export const downloadFile = (data: any, filename: string, type: string = 'application/json'): void => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text to clipboard:', err);
        return false;
    }
};

// Local storage helpers
export const storage = {
    get: (key: string): any => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return localStorage.getItem(key);
        }
    },

    set: (key: string, value: any): void => {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    remove: (key: string): void => {
        localStorage.removeItem(key);
    },

    clear: (): void => {
        localStorage.clear();
    },
};

// Session storage helpers
export const sessionStorage = {
    get: (key: string): any => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return window.sessionStorage.getItem(key);
        }
    },

    set: (key: string, value: any): void => {
        try {
            window.sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to sessionStorage:', error);
        }
    },

    remove: (key: string): void => {
        window.sessionStorage.removeItem(key);
    },

    clear: (): void => {
        window.sessionStorage.clear();
    },
};