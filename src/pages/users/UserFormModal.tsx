import React, { useState, useEffect } from 'react';
import { usersService, User } from '../../services/users.service';
import { useToast } from '../../context/ToastContext';
import { FormModal, FormField, FormInput, FormSelect, FormCheckbox } from '../../components/forms';

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

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    user?: User;
}

interface UserFormData {
    username: string;
    email: string;
    name: string;
    mobile: string;
    role: 'app_user' | 'admin' | 'super_admin' | 'user';
    isActive: boolean;
    password?: string;
    confirmPassword?: string;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    mode,
    user
}) => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        name: '',
        mobile: '',
        role: 'app_user',
        isActive: true,
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (mode === 'edit' && user) {
            setFormData({
                username: user.username,
                email: user.email,
                name: user.name || '',
                mobile: user.mobile || '',
                role: user.role,
                isActive: user.isActive,
                password: '',
                confirmPassword: ''
            });
        } else if (mode === 'create') {
            resetForm();
        }
    }, [mode, user, isOpen]);

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            name: '',
            mobile: '',
            role: 'app_user',
            isActive: true,
            password: '',
            confirmPassword: ''
        });
        setFieldErrors({});
    };

    const handleInputChange = (field: keyof UserFormData, value: any) => {
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

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        // Password validation (only for create mode or when password is provided)
        if (mode === 'create') {
            if (!formData.password) {
                errors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }

            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Please confirm password';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        } else if (mode === 'edit' && formData.password) {
            if (formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        // Mobile validation (optional but if provided should be valid)
        if (formData.mobile && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/\s/g, ''))) {
            errors.mobile = 'Please enter a valid mobile number';
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
            const submitData: any = {
                username: formData.username,
                email: formData.email,
                name: formData.name,
                mobile: formData.mobile || undefined,
                role: formData.role,
                isActive: formData.isActive
            };

            // Include password only if provided
            if (formData.password) {
                submitData.password = formData.password;
            }

            if (mode === 'create') {
                await usersService.create(submitData);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'User created successfully!'
                });
            } else if (mode === 'edit' && user?._id) {
                await usersService.updateUser(user._id, submitData);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'User updated successfully!'
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Error submitting user form:', error);
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

    return (
        <FormModal
            isOpen={isOpen}
            title={mode === 'create' ? 'Create New User' : 'Edit User'}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={mode === 'create' ? 'Create User' : 'Update User'}
            submitIcon={mode === 'create' ? 'bx-plus' : 'bx-check'}
            size="lg"
        >
            <div className="row">
                <div className="col-md-6">
                    <FormField label="Username" required error={fieldErrors.username}>
                        <FormInput
                            value={formData.username}
                            onChange={(value) => handleInputChange('username', value)}
                            placeholder="Enter username"
                            error={!!fieldErrors.username}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField label="Email" required error={fieldErrors.email}>
                        <FormInput
                            type="email"
                            value={formData.email}
                            onChange={(value) => handleInputChange('email', value)}
                            placeholder="Enter email address"
                            error={!!fieldErrors.email}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <FormField label="Full Name" required error={fieldErrors.name}>
                        <FormInput
                            value={formData.name}
                            onChange={(value) => handleInputChange('name', value)}
                            placeholder="Enter full name"
                            error={!!fieldErrors.name}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <FormField label="Mobile Number" error={fieldErrors.mobile}>
                        <FormInput
                            value={formData.mobile}
                            onChange={(value) => handleInputChange('mobile', value)}
                            placeholder="Enter mobile number"
                            error={!!fieldErrors.mobile}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField label="Role" required>
                        <FormSelect
                            value={formData.role}
                            onChange={(value) => handleInputChange('role', value)}
                            options={[
                                { value: 'app_user', label: 'App User' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'super_admin', label: 'Super Admin' }
                            ]}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            {/* Password fields */}
            <div className="row">
                <div className="col-md-6">
                    <FormField
                        label="Password"
                        required={mode === 'create'}
                        error={fieldErrors.password}
                        helpText={mode === 'edit' ? 'Leave blank to keep current password' : undefined}
                    >
                        <FormInput
                            type="password"
                            value={formData.password || ''}
                            onChange={(value) => handleInputChange('password', value)}
                            placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
                            error={!!fieldErrors.password}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField
                        label="Confirm Password"
                        required={mode === 'create' || !!formData.password}
                        error={fieldErrors.confirmPassword}
                    >
                        <FormInput
                            type="password"
                            value={formData.confirmPassword || ''}
                            onChange={(value) => handleInputChange('confirmPassword', value)}
                            placeholder="Confirm password"
                            error={!!fieldErrors.confirmPassword}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            {/* Status checkboxes */}
            <div className="row">
                <div className="col-md-6">
                    <FormCheckbox
                        checked={formData.isActive}
                        onChange={(checked) => handleInputChange('isActive', checked)}
                        label="Active User"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* Additional info for edit mode */}
            {mode === 'edit' && user && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <div><strong>Created:</strong> {new Date(user.createdAt!).toLocaleString()}</div>
                        <div><strong>Last Updated:</strong> {new Date(user.updatedAt!).toLocaleString()}</div>
                        {user.lastLogin && (
                            <div><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</div>
                        )}
                        <div><strong>Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</div>
                    </small>
                </div>
            )}
        </FormModal>
    );
};

export default UserFormModal;