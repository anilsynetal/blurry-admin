import React, { ReactNode } from 'react';

interface FormModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    submitIcon?: string;
    size?: 'sm' | 'lg' | 'xl';
    children: ReactNode;
    showFooter?: boolean;
    customFooter?: ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    title,
    onClose,
    onSubmit,
    isSubmitting = false,
    submitLabel = 'Save',
    submitIcon = 'bx-check',
    size = 'lg',
    children,
    showFooter = true,
    customFooter
}) => {
    if (!isOpen) return null;

    const sizeClass = size === 'sm' ? 'modal-sm' : size === 'xl' ? 'modal-xl' : 'modal-lg';

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className={`modal-dialog ${sizeClass}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    {showFooter && (
                        <div className="modal-footer">
                            {customFooter || (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={onSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className={`bx ${submitIcon} me-1`}></i>
                                                {submitLabel}
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
    helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    required = false,
    error,
    children,
    helpText
}) => {
    return (
        <div className="mb-3">
            <label className="form-label">
                {label}
                {required && <span className="text-danger">*</span>}
            </label>
            {children}
            {error && <div className="text-danger small mt-1">{error}</div>}
            {helpText && !error && <div className="text-muted small mt-1">{helpText}</div>}
        </div>
    );
};

interface FormInputProps {
    type?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    min?: number;
    max?: number;
    step?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    error = false,
    className = '',
    min,
    max,
    step
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            const numValue = parseFloat(e.target.value);
            onChange(isNaN(numValue) ? 0 : numValue);
        } else {
            onChange(e.target.value);
        }
    };

    return (
        <input
            type={type}
            className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
        />
    );
};

interface FormSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    error = false,
    className = ''
}) => {
    return (
        <select
            className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

interface FormTextareaProps {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    value,
    onChange,
    rows = 3,
    placeholder,
    disabled = false,
    error = false,
    className = ''
}) => {
    return (
        <textarea
            className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
};

interface FormCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
    className?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`form-check ${className}`}>
            <input
                className="form-check-input"
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <label className="form-check-label">{label}</label>
        </div>
    );
};

interface FormFileInputProps {
    onChange: (files: FileList | null) => void;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}

export const FormFileInput: React.FC<FormFileInputProps> = ({
    onChange,
    accept,
    multiple = false,
    disabled = false,
    error = false,
    className = ''
}) => {
    return (
        <input
            type="file"
            className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
            onChange={(e) => onChange(e.target.files)}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
        />
    );
};