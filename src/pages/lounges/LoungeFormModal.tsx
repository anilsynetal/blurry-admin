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
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
    const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
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
        setMainImageFile(null);
        setMainImagePreview('');
        setBannerImageFile(null);
        setBannerImagePreview('');
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

    const handleMainImageChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setMainImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setMainImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Clear field error when user selects a file
            if (fieldErrors.image) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        } else {
            setMainImageFile(null);
            setMainImagePreview('');
        }
    };

    const handleBannerImageChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setBannerImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setBannerImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Clear field error when user selects a file
            if (fieldErrors.bannerImage) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.bannerImage;
                    return newErrors;
                });
            }
        } else {
            setBannerImageFile(null);
            setBannerImagePreview('');
        }
    }; const handleTagAdd = (tag: string) => {
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

        // Image validation for create mode
        if (mode === 'create' && !mainImageFile && !bannerImageFile) {
            errors.image = 'At least one image is required';
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

                await loungesService.createLounge(submitData, mainImageFile || undefined, bannerImageFile || undefined);
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

                await loungesService.updateLounge(lounge._id, submitData, mainImageFile || undefined, bannerImageFile || undefined);
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

            {/* Current Images Preview (Edit Mode) */}
            {mode === 'edit' && lounge && (
                <div className="row">
                    <div className="col-12">
                        <FormField label="Current Images">
                            <div className="row">
                                {lounge.image && (
                                    <div className="col-md-6">
                                        <div className="card">
                                            <img
                                                src={getImageUrl(lounge.image)}
                                                alt={lounge.name}
                                                className="card-img-top"
                                                style={{ height: '120px', objectFit: 'cover' }}
                                            />
                                            <div className="card-body py-2 text-center">
                                                <small className="text-muted">Main Image</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {lounge.bannerImage && (
                                    <div className="col-md-6">
                                        <div className="card">
                                            <img
                                                src={getImageUrl(lounge.bannerImage)}
                                                alt={`${lounge.name} Banner`}
                                                className="card-img-top"
                                                style={{ height: '120px', objectFit: 'cover' }}
                                            />
                                            <div className="card-body py-2 text-center">
                                                <small className="text-muted">Banner Image</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <small className="text-muted mt-2 d-block">
                                Upload new images to replace the current ones
                            </small>
                        </FormField>
                    </div>
                </div>
            )}

            {/* Image Upload */}
            <div className="row">
                <div className="col-md-6">
                    <FormField
                        label="Main Image"
                        helpText="Upload the main lounge image"
                        required={mode === 'create'}
                        error={fieldErrors.image}
                    >
                        <FormFileInput
                            onChange={handleMainImageChange}
                            accept="image/*"
                            disabled={isSubmitting}
                        />

                        {/* Selected File Info and Preview */}
                        {mainImageFile && (
                            <div className="mt-2">
                                <div className="d-flex align-items-center justify-content-between">
                                    <small className="text-success">
                                        <i className="bx bx-check me-1"></i>
                                        Selected: {mainImageFile.name}
                                    </small>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            setMainImageFile(null);
                                            setMainImagePreview('');
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                </div>
                                {mainImagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={mainImagePreview}
                                            alt="Main image preview"
                                            className="img-thumbnail"
                                            style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </FormField>
                </div>
                <div className="col-md-6">
                    <FormField
                        label="Banner Image"
                        helpText="Upload the banner image (optional)"
                        error={fieldErrors.bannerImage}
                    >
                        <FormFileInput
                            onChange={handleBannerImageChange}
                            accept="image/*"
                            disabled={isSubmitting}
                        />

                        {/* Selected File Info and Preview */}
                        {bannerImageFile && (
                            <div className="mt-2">
                                <div className="d-flex align-items-center justify-content-between">
                                    <small className="text-success">
                                        <i className="bx bx-check me-1"></i>
                                        Selected: {bannerImageFile.name}
                                    </small>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            setBannerImageFile(null);
                                            setBannerImagePreview('');
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                </div>
                                {bannerImagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={bannerImagePreview}
                                            alt="Banner image preview"
                                            className="img-thumbnail"
                                            style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </FormField>
                </div>
            </div>            {/* Additional info for edit mode */}
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