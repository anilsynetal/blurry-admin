import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Fetch SMTP settings
            const smtpResponse = await settingsService.getSmtpConfig();
            if (smtpResponse.status === 'success' && smtpResponse.data) {
                setSMTPSettings(smtpResponse.data);
            }

            // Fetch Privacy Policy
            const privacyResponse = await settingsService.getPrivacyPolicy();
            if (privacyResponse.status === 'success' && privacyResponse.data?.content) {
                setPrivacyPolicy(privacyResponse.data.content);
            }

            // Fetch Terms and Conditions
            const termsResponse = await settingsService.getTermsAndConditions();
            if (termsResponse.status === 'success' && termsResponse.data?.content) {
                setTermsConditions(termsResponse.data.content);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch settings'
            });
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
                                        className={`nav-link ${activeTab === 'smtp' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('smtp')}
                                    >
                                        <i className="bx bx-envelope me-1"></i>
                                        SMTP Settings
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('privacy')}
                                    >
                                        <i className="bx bx-shield me-1"></i>
                                        Privacy Policy
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'terms' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('terms')}
                                    >
                                        <i className="bx bx-file me-1"></i>
                                        Terms & Conditions
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content">
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
                                                        <textarea
                                                            className="form-control"
                                                            id="privacy-content"
                                                            rows={15}
                                                            value={privacyPolicy}
                                                            onChange={(e) => setPrivacyPolicy(e.target.value)}
                                                            placeholder="Enter privacy policy content..."
                                                        />
                                                        <div className="form-text">You can use HTML tags for formatting.</div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? 'Saving...' : 'Save Privacy Policy'}
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary">
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
                                                        <textarea
                                                            className="form-control"
                                                            id="terms-content"
                                                            rows={15}
                                                            value={termsConditions}
                                                            onChange={(e) => setTermsConditions(e.target.value)}
                                                            placeholder="Enter terms and conditions content..."
                                                        />
                                                        <div className="form-text">You can use HTML tags for formatting.</div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? 'Saving...' : 'Save Terms & Conditions'}
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary">
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

            {/* Custom Styles */}
            <style>{`
                /* Required field indicator */
                .text-danger {
                    color: #dc3545 !important;
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;