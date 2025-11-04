import React, { useState, useEffect } from 'react';
import { notificationsService, CreateBroadcastPayload, CreateTargetedNotificationPayload } from '../../services/notifications.service';
import { usersService } from '../../services/users.service';
import { useToast } from '../../context/ToastContext';
import { FormModal, FormField, FormInput, FormSelect, FormTextarea, FormCheckbox, FormFileInput } from '../../components/forms';

interface ValidationError {
    field: string;
    message: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            data?: ValidationError[];
        };
    };
    message?: string;
}

interface NotificationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'broadcast' | 'targeted';
}

interface NotificationFormData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'promotion' | 'system';
    priority: 'low' | 'normal' | 'high';
    actionUrl: string;
    actionText: string;
    push: boolean;
    expiresAt: string;
    recipients: string[];
    metadata: Record<string, any>;
}

interface UserOption {
    value: string;
    label: string;
}

const NotificationFormModal: React.FC<NotificationFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    mode
}) => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [formData, setFormData] = useState<NotificationFormData>({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        actionUrl: '',
        actionText: '',
        push: true,
        expiresAt: '',
        recipients: [],
        metadata: {}
    });

    useEffect(() => {
        if (isOpen) {
            resetForm();
            if (mode === 'targeted') {
                fetchUsers();
            }
        }
    }, [isOpen, mode]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await usersService.getUsers({
                limit: 100,
                isActive: true,
                sortBy: 'username'
            });
            const options = response.data.map(user => ({
                value: user._id!,
                label: `${user.username} (${user.email})`
            }));
            setUserOptions(options);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load users'
            });
        } finally {
            setLoadingUsers(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            priority: 'normal',
            actionUrl: '',
            actionText: '',
            push: true,
            expiresAt: '',
            recipients: [],
            metadata: {}
        });
        setFieldErrors({});
        setImageFile(null);
        setImagePreview('');
    };

    const handleInputChange = (field: keyof NotificationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleImageChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview('');
        }
    };

    const handleRecipientsChange = (value: string | number) => {
        // Simple implementation - in real app, you'd use a proper multi-select component
        const stringValue = value.toString();
        const recipientIds = stringValue.split(',').map(id => id.trim()).filter(Boolean);
        handleInputChange('recipients', recipientIds);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Title validation
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.length > 100) {
            errors.title = 'Title must be 100 characters or less';
        }

        // Message validation
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.length > 500) {
            errors.message = 'Message must be 500 characters or less';
        }

        // Recipients validation for targeted notifications
        if (mode === 'targeted' && formData.recipients.length === 0) {
            errors.recipients = 'At least one recipient is required for targeted notifications';
        }

        // Expiry date validation
        if (formData.expiresAt) {
            const expiryDate = new Date(formData.expiresAt);
            const now = new Date();
            if (expiryDate <= now) {
                errors.expiresAt = 'Expiry date must be in the future';
            }
        }

        // Action URL validation
        if (formData.actionUrl && !/^https?:\/\//.test(formData.actionUrl)) {
            errors.actionUrl = 'Please enter a valid URL (starting with http:// or https://)';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleValidationErrors = (error: ApiError) => {
        const validationErrors = error.response?.data?.data;
        if (validationErrors && Array.isArray(validationErrors)) {
            const errors: Record<string, string> = {};
            validationErrors.forEach((err: ValidationError) => {
                errors[err.field] = err.message;
            });
            setFieldErrors(errors);
        } else {
            showToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || error.message || 'An error occurred'
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = '';

            // Upload image if provided
            if (imageFile) {
                const imageResponse = await notificationsService.uploadNotificationImage(imageFile);
                imageUrl = imageResponse.data.imageUrl;
            }

            const submitData = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                image: imageUrl || undefined,
                actionUrl: formData.actionUrl || undefined,
                actionText: formData.actionText || undefined,
                push: formData.push,
                expiresAt: formData.expiresAt || undefined,
                metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined
            };

            if (mode === 'broadcast') {
                await notificationsService.createBroadcast(submitData as CreateBroadcastPayload);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Broadcast notification sent successfully!'
                });
            } else {
                const targetedData: CreateTargetedNotificationPayload = {
                    ...submitData,
                    recipients: formData.recipients
                };
                await notificationsService.createTargetedNotification(targetedData);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Targeted notification sent successfully!'
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Error sending notification:', error);
            const apiError = error as ApiError;
            handleValidationErrors(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const handleTestNotification = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await notificationsService.testNotification({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                push: formData.push
            });
            showToast({
                type: 'success',
                title: 'Success',
                message: 'Test notification sent to your account!'
            });
        } catch (error) {
            console.error('Error sending test notification:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || 'Failed to send test notification'
            });
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            title={mode === 'broadcast' ? 'Send Broadcast Notification' : 'Send Targeted Notification'}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={mode === 'broadcast' ? 'Send Broadcast' : 'Send to Recipients'}
            submitIcon="bx-paper-plane"
            size="lg"
            customFooter={
                <>
                    <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={handleTestNotification}
                        disabled={isSubmitting}
                    >
                        <i className="bx bx-test-tube me-1"></i>
                        Test
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="bx bx-paper-plane me-1"></i>
                                {mode === 'broadcast' ? 'Send Broadcast' : 'Send to Recipients'}
                            </>
                        )}
                    </button>
                </>
            }
        >
            <div className="row">
                <div className="col-12">
                    <FormField label="Title" required error={fieldErrors.title}>
                        <FormInput
                            value={formData.title}
                            onChange={(value) => handleInputChange('title', value)}
                            placeholder="Enter notification title"
                            error={!!fieldErrors.title}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <FormField label="Message" required error={fieldErrors.message}>
                        <FormTextarea
                            value={formData.message}
                            onChange={(value) => handleInputChange('message', value)}
                            placeholder="Enter notification message"
                            rows={4}
                            error={!!fieldErrors.message}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <FormField label="Type" required>
                        <FormSelect
                            value={formData.type}
                            onChange={(value) => handleInputChange('type', value)}
                            options={[
                                { value: 'info', label: 'Information' },
                                { value: 'success', label: 'Success' },
                                { value: 'warning', label: 'Warning' },
                                { value: 'error', label: 'Error' },
                                { value: 'promotion', label: 'Promotion' },
                                { value: 'system', label: 'System' }
                            ]}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField label="Priority" required>
                        <FormSelect
                            value={formData.priority}
                            onChange={(value) => handleInputChange('priority', value)}
                            options={[
                                { value: 'low', label: 'Low Priority' },
                                { value: 'normal', label: 'Normal Priority' },
                                { value: 'high', label: 'High Priority' }
                            ]}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            {/* Recipients field for targeted notifications */}
            {mode === 'targeted' && (
                <div className="row">
                    <div className="col-12">
                        <FormField
                            label="Recipients"
                            required
                            error={fieldErrors.recipients}
                            helpText="Enter user IDs separated by commas, or use the dropdown to select users"
                        >
                            {loadingUsers ? (
                                <div className="text-center py-2">
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Loading users...
                                </div>
                            ) : (
                                <>
                                    <FormInput
                                        value={formData.recipients.join(', ')}
                                        onChange={handleRecipientsChange}
                                        placeholder="Enter user IDs or select from dropdown"
                                        error={!!fieldErrors.recipients}
                                        disabled={isSubmitting}
                                    />
                                    {userOptions.length > 0 && (
                                        <div className="mt-2">
                                            <select
                                                className="form-select form-select-sm"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const newRecipients = [...formData.recipients];
                                                        if (!newRecipients.includes(e.target.value)) {
                                                            newRecipients.push(e.target.value);
                                                            handleInputChange('recipients', newRecipients);
                                                        }
                                                        e.target.value = '';
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Select a user to add...</option>
                                                {userOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}
                        </FormField>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-md-6">
                    <FormField label="Action URL" error={fieldErrors.actionUrl}>
                        <FormInput
                            value={formData.actionUrl}
                            onChange={(value) => handleInputChange('actionUrl', value)}
                            placeholder="https://example.com/action"
                            error={!!fieldErrors.actionUrl}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField label="Action Button Text">
                        <FormInput
                            value={formData.actionText}
                            onChange={(value) => handleInputChange('actionText', value)}
                            placeholder="View Details, Learn More, etc."
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <FormField label="Notification Image">
                        <FormFileInput
                            onChange={handleImageChange}
                            accept="image/*"
                            disabled={isSubmitting}
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="img-thumbnail"
                                    style={{ maxWidth: '200px', maxHeight: '100px' }}
                                />
                            </div>
                        )}
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField label="Expiry Date" error={fieldErrors.expiresAt}>
                        <FormInput
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(value) => handleInputChange('expiresAt', value)}
                            error={!!fieldErrors.expiresAt}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <FormCheckbox
                        checked={formData.push}
                        onChange={(checked) => handleInputChange('push', checked)}
                        label="Send as Push Notification"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="alert alert-info">
                        <i className="bx bx-info-circle me-1"></i>
                        <strong>Preview:</strong> {formData.title} - {formData.message}
                        {mode === 'broadcast' && (
                            <div className="mt-1">
                                <small>This notification will be sent to all active users.</small>
                            </div>
                        )}
                        {mode === 'targeted' && formData.recipients.length > 0 && (
                            <div className="mt-1">
                                <small>This notification will be sent to {formData.recipients.length} selected users.</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FormModal>
    );
};

export default NotificationFormModal;