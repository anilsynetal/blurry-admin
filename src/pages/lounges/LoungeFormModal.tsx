import React, { useState, useEffect } from 'react';
import { loungesService, Lounge, CreateLoungePayload, UpdateLoungePayload } from '../../services/lounges.service';
import { useToast } from '../../context/ToastContext';
import { FormModal, FormField, FormInput, FormTextarea, FormFileInput } from '../../components/forms';

const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4002';
    return `${baseUrl.replace('/api/admin', '')}/${imagePath}`;
};

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

interface LoungeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    lounge?: Lounge;
}

interface LoungeFormData {
    name: string;
    description: string;
    tags: string[];
    sortOrder: number;
}

const LoungeFormModal: React.FC<LoungeFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    mode,
    lounge
}) => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [tagInput, setTagInput] = useState<string>('');

    const [formData, setFormData] = useState<LoungeFormData>({
        name: '',
        description: '',
        tags: [],
        sortOrder: 0
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && lounge) {
                setFormData({
                    name: lounge.name,
                    description: lounge.description,
                    tags: lounge.tags || [],
                    sortOrder: lounge.sortOrder || 0
                });
            } else if (mode === 'create') {
                resetForm();
            }
        }
    }, [mode, lounge, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            tags: [],
            sortOrder: 0
        });
        setFieldErrors({});
        setImageFiles(null);
        setTagInput('');
    };

    const handleInputChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof LoungeFormData] as any,
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleImagesChange = (files: FileList | null) => {
        setImageFiles(files);
    };

    const handleTagAdd = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }));
        }
        setTagInput('');
    };

    const handleTagRemove = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        // Description validation
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }

        // Sort order validation
        if (formData.sortOrder < 0) {
            errors.sortOrder = 'Sort order must be 0 or greater';
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
            if (mode === 'create') {
                const submitData: CreateLoungePayload = {
                    name: formData.name,
                    description: formData.description,
                    tags: formData.tags,
                    sortOrder: formData.sortOrder
                };

                await loungesService.createLounge(submitData, imageFiles || []);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Lounge created successfully!'
                });
            } else if (mode === 'edit' && lounge?._id) {
                const submitData: UpdateLoungePayload = {
                    name: formData.name,
                    description: formData.description,
                    tags: formData.tags,
                    sortOrder: formData.sortOrder
                };

                await loungesService.updateLounge(lounge._id, submitData, imageFiles || undefined);
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Lounge updated successfully!'
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Error submitting lounge form:', error);
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
            title={mode === 'create' ? 'Create New Lounge' : 'Edit Lounge'}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={mode === 'create' ? 'Create Lounge' : 'Update Lounge'}
            submitIcon={mode === 'create' ? 'bx-plus' : 'bx-check'}
            size="lg"
        >
            {/* Basic Information */}
            <div className="row">
                <div className="col-md-8">
                    <FormField label="Lounge Name" required error={fieldErrors.name}>
                        <FormInput
                            value={formData.name}
                            onChange={(value) => handleInputChange('name', value)}
                            placeholder="Enter lounge name"
                            error={!!fieldErrors.name}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
                <div className="col-md-4">
                    <FormField label="Sort Order" error={fieldErrors.sortOrder}>
                        <FormInput
                            type="number"
                            value={formData.sortOrder}
                            onChange={(value) => handleInputChange('sortOrder', value)}
                            placeholder="Sort order"
                            min={0}
                            error={!!fieldErrors.sortOrder}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <FormField label="Description" required error={fieldErrors.description}>
                        <FormTextarea
                            value={formData.description}
                            onChange={(value) => handleInputChange('description', value)}
                            placeholder="Enter lounge description"
                            rows={3}
                            error={!!fieldErrors.description}
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            {/* Tags */}
            <div className="row">
                <div className="col-12">
                    <FormField label="Tags" helpText="Enter tags to categorize the lounge">
                        <div className="d-flex mb-2">
                            <FormInput
                                value={tagInput}
                                onChange={(value) => setTagInput(value as string)}
                                placeholder="Enter a tag"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-primary ms-2"
                                onClick={() => handleTagAdd(tagInput)}
                                disabled={isSubmitting || !tagInput.trim()}
                            >
                                Add
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="badge bg-primary d-flex align-items-center">
                                        {tag}
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white ms-2"
                                            style={{ fontSize: '0.7em' }}
                                            onClick={() => handleTagRemove(tag)}
                                            disabled={isSubmitting}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                    </FormField>
                </div>
            </div>

            {/* Current Image Preview (Edit Mode) */}
            {mode === 'edit' && lounge?.image && (
                <div className="row">
                    <div className="col-12">
                        <FormField label="Current Image">
                            <div className="d-flex align-items-center">
                                <img
                                    src={getImageUrl(lounge.image)}
                                    alt={lounge.name}
                                    className="rounded"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <div className="ms-3">
                                    <small className="text-muted">
                                        Upload a new image to replace the current one
                                    </small>
                                </div>
                            </div>
                        </FormField>
                    </div>
                </div>
            )}

            {/* Images */}
            <div className="row">
                <div className="col-12">
                    <FormField label="Lounge Image" helpText={mode === 'edit' ? 'Select a new image to replace the current one' : 'Select an image for the lounge'}>
                        <FormFileInput
                            onChange={handleImagesChange}
                            accept="image/*"
                            disabled={isSubmitting}
                        />
                    </FormField>
                </div>
            </div>

            {/* Additional info for edit mode */}
            {mode === 'edit' && lounge && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <div><strong>Created:</strong> {new Date(lounge.createdAt!).toLocaleString()}</div>
                        <div><strong>Last Updated:</strong> {new Date(lounge.updatedAt!).toLocaleString()}</div>
                        <div><strong>Status:</strong> {lounge.isActive ? 'Active' : 'Inactive'}</div>
                    </small>
                </div>
            )}
        </FormModal>
    );
};

export default LoungeFormModal;