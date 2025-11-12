import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { settingsService, SMTPConfig, StripeConfig, AppSettings, InvitationConfig } from '../../services/settings.service';
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
        testEmail: '',
    });
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [termsConditions, setTermsConditions] = useState('');
    const [showPrivacyPreview, setShowPrivacyPreview] = useState(false);
    const [showTermsPreview, setShowTermsPreview] = useState(false);
    const [stripeSettings, setStripeSettings] = useState<StripeConfig>({
        secretKey: '',
        publishableKey: '',
        webhookSecretKey: '',
    });
    const [appSettings, setAppSettings] = useState<AppSettings>({
        unblurPercentage: 50,
    });
    const [invitationSettings, setInvitationSettings] = useState<InvitationConfig>({
        inviteTitle: '',
        inviteDescription: '',
        bannerImage: null,
        bannerImageFile: undefined,
        referrerCreditAmount: 50,
        referredCreditAmount: 25,
        isEnabled: true,
    });

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4002';
        return `${baseUrl.replace('/api/admin', '')}/${imagePath}`;
    };

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

            // Fetch Stripe Configuration (requires auth)
            try {
                const stripeResponse = await settingsService.getStripeConfig();
                if (stripeResponse.status === 'success' && stripeResponse.data) {
                    setStripeSettings(stripeResponse.data);
                }
            } catch (stripeError) {
                console.warn('Could not fetch Stripe settings (may require authentication):', stripeError);
            }

            // Fetch App Settings (requires auth)
            try {
                const appResponse = await settingsService.getAppSettings();
                if (appResponse.status === 'success' && appResponse.data) {
                    setAppSettings(appResponse.data);
                }
            } catch (appError) {
                console.warn('Could not fetch app settings (may require authentication):', appError);
            }

            // Fetch Invitation Settings (requires auth)
            try {
                const invitationResponse = await settingsService.getInvitationConfig();
                if (invitationResponse.status === 'success' && invitationResponse.data) {
                    setInvitationSettings(invitationResponse.data);
                }
            } catch (invitationError) {
                console.warn('Could not fetch invitation settings (may require authentication):', invitationError);
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

    const handleStripeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updateStripeConfig(stripeSettings);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Stripe configuration updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating Stripe configuration:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update Stripe configuration'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAppSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updateAppSettings(appSettings);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'App settings updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating app settings:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update app settings'
            });
        } finally {
            setLoading(false);
        }
    };
    // Test SMTP Connection
    const handleTestConnection = async () => {
        if (!smtpSettings?.testEmail) {
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Please enter an email address to send the test email.',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await settingsService.testSmtpConnection({
                ...smtpSettings,
                userEmail: smtpSettings?.testEmail,
            });

            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: response.message || 'SMTP connection successful and test email sent!',
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Error',
                    message: response.message || 'SMTP connection failed.',
                });
            }
        } catch (error) {
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message:
                    apiError.response?.data?.message ||
                    apiError.message ||
                    'SMTP connection failed.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInvitationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await settingsService.updateInvitationConfig(invitationSettings);
            if (response.status === 'success') {
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Invitation settings updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating invitation settings:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update invitation settings'
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
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'stripe' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('stripe');
                                        }}
                                    >
                                        <i className="bx bx-credit-card me-1"></i>
                                        Stripe Configuration
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'app' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('app');
                                        }}
                                    >
                                        <i className="bx bx-mobile me-1"></i>
                                        App Settings
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link ${activeTab === 'invitation' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveTab('invitation');
                                        }}
                                    >
                                        <i className="bx bx-user-plus me-1"></i>
                                        Invitation Settings
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
                                                <p className="text-muted mb-4">
                                                    Configure your email server settings for sending emails.
                                                </p>

                                                <form onSubmit={handleSMTPSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">SMTP Host</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={smtpSettings.host}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, host: e.target.value })
                                                                }
                                                                placeholder="smtp.gmail.com"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">SMTP Port</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={smtpSettings.port}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, port: parseInt(e.target.value) })
                                                                }
                                                                placeholder="587"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">SMTP Username</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={smtpSettings.user}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, user: e.target.value })
                                                                }
                                                                placeholder="noreply@domain.com"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">SMTP Password</label>
                                                            <input
                                                                type="password"
                                                                className="form-control"
                                                                value={smtpSettings.pass}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, pass: e.target.value })
                                                                }
                                                                placeholder="Enter password"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">From Email</label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                value={smtpSettings.from}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, from: e.target.value })
                                                                }
                                                                placeholder="noreply@domain.com"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">From Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={smtpSettings.fromName}
                                                                onChange={(e) =>
                                                                    setSMTPSettings({ ...smtpSettings, fromName: e.target.value })
                                                                }
                                                                placeholder="Support Team"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 👇 Added: Test Email Input + Button */}
                                                    <div className="mt-4 d-flex align-items-center gap-2">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary"
                                                            disabled={loading}
                                                        >
                                                            {loading ? 'Saving...' : 'Save Changes'}
                                                        </button>

                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            style={{ maxWidth: '300px' }}
                                                            placeholder="Enter test email"
                                                            value={smtpSettings.testEmail || ''}
                                                            onChange={(e) =>
                                                                setSMTPSettings({
                                                                    ...smtpSettings,
                                                                    testEmail: e.target.value,
                                                                })
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={handleTestConnection}
                                                            disabled={loading || !smtpSettings.testEmail}
                                                        >
                                                            {loading ? 'Testing...' : 'Send Test Email'}
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

                                {/* Stripe Configuration Tab */}
                                {activeTab === 'stripe' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-8">
                                                <h5 className="mb-3">Stripe Payment Gateway Configuration</h5>
                                                <p className="text-muted mb-4">Configure your Stripe payment gateway settings for processing payments.</p>

                                                <div className="alert alert-warning" role="alert">
                                                    <i className="bx bx-info-circle me-2"></i>
                                                    <strong>Security Notice:</strong> Stripe keys are sensitive information. Secret keys will be masked for security purposes.
                                                </div>

                                                <form onSubmit={handleStripeSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label htmlFor="stripe-secret-key" className="form-label">
                                                                    Secret Key <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control"
                                                                    id="stripe-secret-key"
                                                                    value={stripeSettings.secretKey}
                                                                    onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                                                                    placeholder="sk_test_ or sk_live_..."
                                                                    required
                                                                />
                                                                <div className="form-text">
                                                                    Your Stripe secret key (starts with sk_test_ for test mode or sk_live_ for live mode)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label htmlFor="stripe-publishable-key" className="form-label">
                                                                    Publishable Key <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="stripe-publishable-key"
                                                                    value={stripeSettings.publishableKey}
                                                                    onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                                                                    placeholder="pk_test_ or pk_live_..."
                                                                    required
                                                                />
                                                                <div className="form-text">
                                                                    Your Stripe publishable key (starts with pk_test_ for test mode or pk_live_ for live mode)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label htmlFor="stripe-webhook-secret" className="form-label">
                                                                    Webhook Secret Key
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control"
                                                                    id="stripe-webhook-secret"
                                                                    value={stripeSettings.webhookSecretKey}
                                                                    onChange={(e) => setStripeSettings({ ...stripeSettings, webhookSecretKey: e.target.value })}
                                                                    placeholder="whsec_..."
                                                                />
                                                                <div className="form-text">
                                                                    Your Stripe webhook endpoint secret (starts with whsec_) - Optional but recommended for webhook security
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="card bg-light">
                                                                <div className="card-body">
                                                                    <h6 className="card-title">
                                                                        <i className="bx bx-info-circle me-1 text-info"></i>
                                                                        Configuration Guide
                                                                    </h6>
                                                                    <ul className="mb-0 small text-muted">
                                                                        <li><strong>Test Mode:</strong> Use keys starting with sk_test_ and pk_test_ for development</li>
                                                                        <li><strong>Live Mode:</strong> Use keys starting with sk_live_ and pk_live_ for production</li>
                                                                        <li><strong>Security:</strong> Never expose your secret key in client-side code</li>
                                                                        <li><strong>Webhooks:</strong> Configure webhook endpoints in your Stripe dashboard for event handling</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bx bx-save me-1"></i>
                                                                    Save Stripe Configuration
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="col-xl-4">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-help-circle me-1"></i>
                                                            Need Help?
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <p className="small text-muted mb-3">
                                                            Find your Stripe API keys in your Stripe Dashboard under Developers → API keys.
                                                        </p>
                                                        <div className="d-grid gap-2">
                                                            <a
                                                                href="https://dashboard.stripe.com/apikeys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-primary btn-sm"
                                                            >
                                                                <i className="bx bx-link-external me-1"></i>
                                                                Open Stripe Dashboard
                                                            </a>
                                                            <a
                                                                href="https://stripe.com/docs/keys"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-info btn-sm"
                                                            >
                                                                <i className="bx bx-book me-1"></i>
                                                                API Keys Documentation
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card mt-3">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-shield-check me-1"></i>
                                                            Security Status
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className={`bx ${stripeSettings.secretKey ? 'bx-check-circle text-success' : 'bx-x-circle text-danger'} me-2`}></i>
                                                            <span className="small">Secret Key {stripeSettings.secretKey ? 'Configured' : 'Missing'}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className={`bx ${stripeSettings.publishableKey ? 'bx-check-circle text-success' : 'bx-x-circle text-danger'} me-2`}></i>
                                                            <span className="small">Publishable Key {stripeSettings.publishableKey ? 'Configured' : 'Missing'}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <i className={`bx ${stripeSettings.webhookSecretKey ? 'bx-check-circle text-success' : 'bx-info-circle text-warning'} me-2`}></i>
                                                            <span className="small">Webhook Secret {stripeSettings.webhookSecretKey ? 'Configured' : 'Optional'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* App Settings Tab */}
                                {activeTab === 'app' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-8">
                                                <h5 className="mb-3">Application Settings</h5>
                                                <p className="text-muted mb-4">Configure application-specific settings for the mobile app.</p>

                                                <form onSubmit={handleAppSettingsSubmit}>
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h6 className="mb-0">
                                                                <i className="bx bx-image me-1"></i>
                                                                Image Settings
                                                            </h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="unblur-percentage" className="form-label">
                                                                            Unblur Percentage <span className="text-danger">*</span>
                                                                        </label>
                                                                        <div className="input-group">
                                                                            <input
                                                                                type="number"
                                                                                className="form-control"
                                                                                id="unblur-percentage"
                                                                                value={appSettings.unblurPercentage}
                                                                                onChange={(e) => setAppSettings({
                                                                                    ...appSettings,
                                                                                    unblurPercentage: parseInt(e.target.value) || 0
                                                                                })}
                                                                                placeholder="50"
                                                                                min="0"
                                                                                max="100"
                                                                                required
                                                                            />
                                                                            <span className="input-group-text">%</span>
                                                                        </div>
                                                                        <div className="form-text">
                                                                            Percentage of image that will be unblurred for app users (0-100%)
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="card bg-light h-100">
                                                                        <div className="card-body d-flex flex-column justify-content-center">
                                                                            <h6 className="card-title text-center mb-3">
                                                                                <i className="bx bx-info-circle me-1 text-info"></i>
                                                                                Preview Effect
                                                                            </h6>
                                                                            <div className="text-center">
                                                                                <div className="progress mb-2" style={{ height: '20px' }}>
                                                                                    <div
                                                                                        className="progress-bar bg-success"
                                                                                        role="progressbar"
                                                                                        style={{ width: `${appSettings.unblurPercentage}%` }}
                                                                                    >
                                                                                        {appSettings.unblurPercentage}% Unblurred
                                                                                    </div>
                                                                                </div>
                                                                                <small className="text-muted">
                                                                                    {appSettings.unblurPercentage}% of the image will be visible to users
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="alert alert-info d-flex" role="alert">
                                                                <i className="bx bx-info-circle me-2 mt-1"></i>
                                                                <div>
                                                                    <strong>How it works:</strong> This setting controls what percentage of profile images
                                                                    are unblurred for app users. A lower percentage means more blur effect, encouraging
                                                                    users to unlock premium features to see full images.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bx bx-save me-1"></i>
                                                                    Save App Settings
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="col-xl-4">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-info-circle me-1"></i>
                                                            Setting Guidelines
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <ul className="mb-0 small text-muted">
                                                            <li><strong>0-25%:</strong> Heavy blur effect - encourages premium upgrades</li>
                                                            <li><strong>26-50%:</strong> Moderate blur - balanced user experience</li>
                                                            <li><strong>51-75%:</strong> Light blur - good for engagement</li>
                                                            <li><strong>76-100%:</strong> Minimal blur - may reduce premium conversions</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="card mt-3">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-mobile me-1"></i>
                                                            Current Configuration
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small">Unblur Percentage:</span>
                                                            <span className="badge bg-primary">{appSettings.unblurPercentage}%</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small">Blur Effect:</span>
                                                            <span className={`badge ${appSettings.unblurPercentage <= 25 ? 'bg-danger' :
                                                                appSettings.unblurPercentage <= 50 ? 'bg-warning' :
                                                                    appSettings.unblurPercentage <= 75 ? 'bg-info' : 'bg-success'
                                                                }`}>
                                                                {appSettings.unblurPercentage <= 25 ? 'Heavy' :
                                                                    appSettings.unblurPercentage <= 50 ? 'Moderate' :
                                                                        appSettings.unblurPercentage <= 75 ? 'Light' : 'Minimal'}
                                                            </span>
                                                        </div>
                                                        <hr className="my-2" />
                                                        <small className="text-muted">
                                                            This affects all profile images in the mobile app.
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Invitation Settings Tab */}
                                {activeTab === 'invitation' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-8">
                                                <h5 className="mb-3">Invitation & Referral Settings</h5>
                                                <p className="text-muted mb-4">Configure invitation content and referral credit amounts for the mobile app.</p>

                                                <form onSubmit={handleInvitationSubmit}>
                                                    {/* Enable/Disable Toggle */}
                                                    <div className="card mb-4">
                                                        <div className="card-header">
                                                            <h6 className="mb-0">
                                                                <i className="bx bx-toggle-left me-1"></i>
                                                                Invitation System Status
                                                            </h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="invitation-enabled"
                                                                    checked={invitationSettings.isEnabled}
                                                                    onChange={(e) => setInvitationSettings({
                                                                        ...invitationSettings,
                                                                        isEnabled: e.target.checked
                                                                    })}
                                                                />
                                                                <label className="form-check-label" htmlFor="invitation-enabled">
                                                                    <strong>Enable Invitation System</strong>
                                                                </label>
                                                            </div>
                                                            <small className="text-muted">
                                                                When enabled, users can invite friends and earn referral credits.
                                                            </small>
                                                        </div>
                                                    </div>

                                                    {/* Content Settings */}
                                                    <div className="card mb-4">
                                                        <div className="card-header">
                                                            <h6 className="mb-0">
                                                                <i className="bx bx-edit me-1"></i>
                                                                Invitation Content
                                                            </h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="invitation-title" className="form-label">
                                                                            Invitation Title <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            id="invitation-title"
                                                                            value={invitationSettings.inviteTitle}
                                                                            onChange={(e) => setInvitationSettings({
                                                                                ...invitationSettings,
                                                                                inviteTitle: e.target.value
                                                                            })}
                                                                            placeholder="Invite Your Friends"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="invitation-description" className="form-label">
                                                                            Description <span className="text-danger">*</span>
                                                                        </label>
                                                                        <textarea
                                                                            className="form-control"
                                                                            id="invitation-description"
                                                                            rows={3}
                                                                            value={invitationSettings.inviteDescription}
                                                                            onChange={(e) => setInvitationSettings({
                                                                                ...invitationSettings,
                                                                                inviteDescription: e.target.value
                                                                            })}
                                                                            placeholder="Invite your friends and earn credits when they sign up!"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="banner-image" className="form-label">
                                                                            Banner Image Upload
                                                                        </label>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <input
                                                                                type="file"
                                                                                className="form-control"
                                                                                id="banner-image"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        setInvitationSettings({
                                                                                            ...invitationSettings,
                                                                                            bannerImageFile: file
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {(invitationSettings.bannerImage || invitationSettings.bannerImageFile) && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-danger btn-sm"
                                                                                    onClick={() => {
                                                                                        setInvitationSettings({
                                                                                            ...invitationSettings,
                                                                                            bannerImage: null,
                                                                                            bannerImageFile: undefined
                                                                                        });
                                                                                        // Clear the file input
                                                                                        const fileInput = document.getElementById('banner-image') as HTMLInputElement;
                                                                                        if (fileInput) fileInput.value = '';
                                                                                    }}
                                                                                    title="Remove image"
                                                                                >
                                                                                    <i className="bx bx-trash"></i>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <small className="form-text text-muted">
                                                                            Upload a banner image to display in the invitation section (optional). Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB.
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Credit Settings */}
                                                    <div className="card mb-4">
                                                        <div className="card-header">
                                                            <h6 className="mb-0">
                                                                <i className="bx bx-wallet me-1"></i>
                                                                Referral Credit Configuration
                                                            </h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="referrer-credit" className="form-label">
                                                                            Referrer Credit Amount <span className="text-danger">*</span>
                                                                        </label>
                                                                        <div className="input-group">
                                                                            <span className="input-group-text">$</span>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control"
                                                                                id="referrer-credit"
                                                                                value={invitationSettings.referrerCreditAmount}
                                                                                onChange={(e) => setInvitationSettings({
                                                                                    ...invitationSettings,
                                                                                    referrerCreditAmount: parseInt(e.target.value) || 0
                                                                                })}
                                                                                placeholder="50"
                                                                                min="0"
                                                                                step="1"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <small className="form-text text-muted">
                                                                            Credit amount for the user who sends the invitation
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="referred-credit" className="form-label">
                                                                            Referred User Credit Amount <span className="text-danger">*</span>
                                                                        </label>
                                                                        <div className="input-group">
                                                                            <span className="input-group-text">$</span>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control"
                                                                                id="referred-credit"
                                                                                value={invitationSettings.referredCreditAmount}
                                                                                onChange={(e) => setInvitationSettings({
                                                                                    ...invitationSettings,
                                                                                    referredCreditAmount: parseInt(e.target.value) || 0
                                                                                })}
                                                                                placeholder="25"
                                                                                min="0"
                                                                                step="1"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <small className="form-text text-muted">
                                                                            Credit amount for the new user who signs up with invite code
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="alert alert-info d-flex" role="alert">
                                                                <i className="bx bx-info-circle me-2 mt-1"></i>
                                                                <div>
                                                                    <strong>Credit Processing:</strong> Credits are automatically added to user wallets
                                                                    when the referred user verifies their email address after signing up with an invite code.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bx bx-save me-1"></i>
                                                                    Save Invitation Settings
                                                                </>
                                                            )}
                                                        </button>

                                                    </div>
                                                </form>
                                            </div>
                                            <div className="col-xl-4">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-info-circle me-1"></i>
                                                            Current Configuration
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small">System Status:</span>
                                                            <span className={`badge ${invitationSettings.isEnabled ? 'bg-success' : 'bg-danger'}`}>
                                                                {invitationSettings.isEnabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small">Referrer Credit:</span>
                                                            <span className="badge bg-primary">${invitationSettings.referrerCreditAmount}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small">Referred User Credit:</span>
                                                            <span className="badge bg-info">${invitationSettings.referredCreditAmount}</span>
                                                        </div>
                                                        <hr className="my-2" />
                                                        <small className="text-muted">
                                                            These settings control the invite friend functionality in the mobile app.
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="card mt-3">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bx bx-mobile me-1"></i>
                                                            Mobile App Preview
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                            {(invitationSettings.bannerImage || invitationSettings.bannerImageFile) && (
                                                                <div className="mb-3">
                                                                    <img
                                                                        src={
                                                                            invitationSettings.bannerImageFile
                                                                                ? URL.createObjectURL(invitationSettings.bannerImageFile)
                                                                                : getImageUrl(invitationSettings.bannerImage || '')
                                                                        }
                                                                        alt="Invitation Banner"
                                                                        className="img-fluid rounded"
                                                                        style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <h6 className="fw-bold mb-2">{invitationSettings.inviteTitle || 'Invite Your Friends'}</h6>
                                                            <p className="small text-muted mb-3">
                                                                {invitationSettings.inviteDescription || 'Invite your friends and earn credits when they sign up!'}
                                                            </p>
                                                            <button className="btn btn-primary btn-sm" disabled>
                                                                Share Invite Link
                                                            </button>
                                                        </div>
                                                        <small className="text-muted mt-2 d-block">
                                                            This is how the invitation section will appear in the mobile app.
                                                        </small>
                                                    </div>
                                                </div>
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