import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { settingsService, SMTPConfig } from '../../services/settings.service';
import { useToast } from '../../context/ToastContext';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const SettingsPage: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('smtp');
    const [loading, setLoading] = useState(false);
    const [smtpSettings, setSMTPSettings] = useState<SMTPConfig>({
        host: '',
        port: 587,
        user: '',
        pass: '',
        from: '',
        fromName: '',
    });
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [termsConditions, setTermsConditions] = useState('');
    const [showPrivacyPreview, setShowPrivacyPreview] = useState(false);
    const [showTermsPreview, setShowTermsPreview] = useState(false);

    useEffect(() => {
        // Delay the API calls to prevent authentication issues on initial load
        const timer = setTimeout(() => {
            fetchSettings();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Try to fetch SMTP settings (requires auth)
            try {
                const smtpResponse = await settingsService.getSmtpConfig();
                if (smtpResponse.status === 'success' && smtpResponse.data) {
                    setSMTPSettings(smtpResponse.data);
                }
            } catch (smtpError) {
                console.warn('Could not fetch SMTP settings (may require authentication):', smtpError);
            }

            // Fetch Privacy Policy (public)
            try {
                const privacyResponse = await settingsService.getPrivacyPolicy();
                if (privacyResponse.status === 'success' && privacyResponse.data?.content) {
                    setPrivacyPolicy(privacyResponse.data.content);
                }
            } catch (privacyError) {
                console.warn('Could not fetch privacy policy:', privacyError);
            }

            // Fetch Terms and Conditions (public)
            try {
                const termsResponse = await settingsService.getTermsAndConditions();
                if (termsResponse.status === 'success' && termsResponse.data?.content) {
                    setTermsConditions(termsResponse.data.content);
                }
            } catch (termsError) {
                console.warn('Could not fetch terms and conditions:', termsError);
            }
        } catch (error) {
            console.error('General error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSMTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updateSmtpConfig(smtpSettings);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'SMTP settings updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating SMTP settings:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update SMTP settings'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyPolicySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updatePrivacyPolicy(privacyPolicy);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Privacy policy updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating privacy policy:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update privacy policy'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTermsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updateTermsAndConditions(termsConditions);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Terms and conditions updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating terms and conditions:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update terms and conditions'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="row mb-4">
                <div className="col-12">
                    <h4 className="fw-bold py-3 mb-4">
                        <span className="text-muted fw-light">Admin /</span> Settings
                    </h4>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            {/* Navigation Tabs */}
                            <ul className="nav nav-pills flex-column flex-md-row mb-3">
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'smtp' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('smtp');
                                        }}
                                    >
                                        <i className="bx bx-envelope me-1"></i>
                                        SMTP Settings
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('privacy');
                                        }}
                                    >
                                        <i className="bx bx-shield me-1"></i>
                                        Privacy Policy
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'terms' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('terms');
                                        }}
                                    >
                                        <i className="bx bx-file me-1"></i>
                                        Terms & Conditions
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content1">
                                {/* SMTP Settings Tab */}
                                {activeTab === 'smtp' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-8">
                                                <h5 className="mb-3">SMTP Configuration</h5>
                                                <p className="text-muted mb-4">Configure your email server settings for sending emails.</p>

                                                <form onSubmit={handleSMTPSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-host" className="form-label">
                                                                    SMTP Host <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="smtp-host"
                                                                    value={smtpSettings.host}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, host: e.target.value })}
                                                                    placeholder="smtp.gmail.com"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-port" className="form-label">
                                                                    SMTP Port <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    id="smtp-port"
                                                                    value={smtpSettings.port}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, port: parseInt(e.target.value) })}
                                                                    placeholder="587"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-user" className="form-label">
                                                                    SMTP Username <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    id="smtp-user"
                                                                    value={smtpSettings.user}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, user: e.target.value })}
                                                                    placeholder="noreply@blurry.com"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-pass" className="form-label">
                                                                    SMTP Password <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control"
                                                                    id="smtp-pass"
                                                                    value={smtpSettings.pass}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, pass: e.target.value })}
                                                                    placeholder="Enter password"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-from" className="form-label">
                                                                    From Email <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    id="smtp-from"
                                                                    value={smtpSettings.from}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, from: e.target.value })}
                                                                    placeholder="noreply@blurry.com"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="smtp-from-name" className="form-label">
                                                                    From Name <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="smtp-from-name"
                                                                    value={smtpSettings.fromName}
                                                                    onChange={(e) => setSMTPSettings({ ...smtpSettings, fromName: e.target.value })}
                                                                    placeholder="Blurry Team"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary">
                                                            Test Connection
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Privacy Policy Tab */}
                                {activeTab === 'privacy' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-3">Privacy Policy</h5>
                                                <p className="text-muted mb-4">Manage your application's privacy policy content.</p>

                                                <form onSubmit={handlePrivacyPolicySubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="privacy-content" className="form-label">Privacy Policy Content</label>
                                                        <Editor
                                                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                                            value={privacyPolicy}
                                                            onEditorChange={(content: string) => setPrivacyPolicy(content)}
                                                            init={{
                                                                height: 500,
                                                                menubar: true,
                                                                plugins: [
                                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                                                ],
                                                                toolbar: 'undo redo | blocks | ' +
                                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                    'removeformat | help',
                                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                                placeholder: "Enter privacy policy content...",
                                                                branding: false,
                                                                statusbar: false
                                                            }}
                                                        />
                                                        <div className="form-text">Rich text editor with formatting options.</div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? 'Saving...' : 'Save Privacy Policy'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setShowPrivacyPreview(true)}
                                                        >
                                                            Preview
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Terms & Conditions Tab */}
                                {activeTab === 'terms' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-3">Terms & Conditions</h5>
                                                <p className="text-muted mb-4">Manage your application's terms and conditions content.</p>

                                                <form onSubmit={handleTermsSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="terms-content" className="form-label">Terms & Conditions Content</label>
                                                        <Editor
                                                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                                            value={termsConditions}
                                                            onEditorChange={(content: string) => setTermsConditions(content)}
                                                            init={{
                                                                height: 500,
                                                                menubar: true,
                                                                plugins: [
                                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                                                ],
                                                                toolbar: 'undo redo | blocks | ' +
                                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                    'removeformat | help',
                                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                                placeholder: "Enter terms and conditions content...",
                                                                branding: false,
                                                                statusbar: false
                                                            }}
                                                        />
                                                        <div className="form-text">Rich text editor with formatting options.</div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? 'Saving...' : 'Save Terms & Conditions'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setShowTermsPreview(true)}
                                                        >
                                                            Preview
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Policy Preview Modal */}
            {showPrivacyPreview && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bx bx-show me-2"></i>
                                    Privacy Policy Preview
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPrivacyPreview(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: privacyPolicy }}
                                    style={{
                                        fontFamily: 'Arial, sans-serif',
                                        lineHeight: '1.6',
                                        padding: '20px'
                                    }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPrivacyPreview(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms & Conditions Preview Modal */}
            {showTermsPreview && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bx bx-show me-2"></i>
                                    Terms & Conditions Preview
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowTermsPreview(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: termsConditions }}
                                    style={{
                                        fontFamily: 'Arial, sans-serif',
                                        lineHeight: '1.6',
                                        padding: '20px'
                                    }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowTermsPreview(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style>{`
                .text-danger {
                    color: #dc3545 !important;
                }

                .nav-pills .nav-link {
                    border-radius: 0.375rem;
                    margin-right: 0.5rem;
                    border: none;
                    background: none;
                    text-decoration: none;
                    cursor: pointer;
                }

                .nav-pills .nav-link:hover {
                    background-color: rgba(105, 108, 255, 0.1);
                    text-decoration: none;
                }
                
                .nav-pills .nav-link:focus {
                    outline: none;
                    box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25);
                }

                .modal-body img {
                    max-width: 100%;
                    height: auto;
                }
                
                .modal-body table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }
                
                .modal-body table th,
                .modal-body table td {
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;