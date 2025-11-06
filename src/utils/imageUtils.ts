/**
 * Utility functions for handling image URLs
 */

// Get the backend base URL for serving static files
const getBackendBaseUrl = (): string => {
    // In development, the backend runs on port 3000
    // In production, this should be configured via environment variable
    return (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4002';
};

/**
 * Get the full URL for a notification image
 * @param imagePath - The image path from the notification (e.g., "/uploads/notifications/image.jpg")
 * @returns Full URL to the image
 */
export const getNotificationImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) {
        return null;
    }

    // If the path is already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If the path starts with '/', remove it to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    return `${getBackendBaseUrl()}/${cleanPath}`;
};

/**
 * Get the full URL for any uploaded file
 * @param filePath - The file path (e.g., "/uploads/profiles/avatar.jpg")
 * @returns Full URL to the file
 */
export const getFileUrl = (filePath: string | null | undefined): string | null => {
    if (!filePath) {
        return null;
    }

    // If the path is already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    // If the path starts with '/', remove it to avoid double slashes
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

    return `${getBackendBaseUrl()}/${cleanPath}`;
};

/**
 * Get a placeholder image URL for notifications without images
 * @returns URL to a default notification image
 */
export const getDefaultNotificationImage = (): string => {
    return `${getBackendBaseUrl()}/assets/img/notification-placeholder.png`;
};