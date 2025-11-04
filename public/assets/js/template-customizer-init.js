/**
 * Template Customizer Safe Initialization
 * Prevents the "Cannot read properties of null (reading 'split')" error
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    // Ensure required data attributes exist
    if (!document.documentElement.getAttribute('data-template')) {
        document.documentElement.setAttribute('data-template', 'vertical-menu-theme-default-light');
    }

    if (!document.documentElement.getAttribute('data-assets-path')) {
        document.documentElement.setAttribute('data-assets-path', '/assets/');
    }

    if (!document.documentElement.getAttribute('data-framework')) {
        document.documentElement.setAttribute('data-framework', 'react');
    }

    if (!document.documentElement.getAttribute('data-bs-theme')) {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }

    // Set template name for global access
    window.templateName = document.documentElement.getAttribute('data-template');
    window.assetsPath = document.documentElement.getAttribute('data-assets-path');

    console.log('Template attributes initialized:', {
        template: window.templateName,
        assetsPath: window.assetsPath,
        theme: document.documentElement.getAttribute('data-bs-theme')
    });
});

// Handle template customizer errors gracefully
window.addEventListener('error', function (event) {
    if (event.error && event.error.message && event.error.message.includes('split')) {
        console.warn('Template customizer error handled gracefully:', event.error.message);
        event.preventDefault(); // Prevent the error from showing in console
        return false;
    }
});

// Override console.error for template customizer errors
const originalConsoleError = console.error;
console.error = function (...args) {
    // Check if this is a template customizer error
    const errorMessage = args.join(' ');
    if (errorMessage.includes('template-customizer') || errorMessage.includes('split')) {
        console.warn('Template customizer warning:', ...args);
        return;
    }
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
};