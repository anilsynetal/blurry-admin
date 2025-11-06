import React, { useState, useEffect } from 'react';
import { usersService, UpdateAdminProfilePayload, AdminPasswordPayload } from '../../services/users.service';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/SimpleAdminContext';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const ProfilePage: React.FC = () => {
    const { showToast } = useToast();
    const { state, dispatch } = useAdmin();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Profile form state
    const [profileData, setProfileData] = useState<UpdateAdminProfilePayload>({
        name: '',
        email: '',
        username: '',
        mobile: '',
        dateOfBirth: '',
        gender: undefined,
        bio: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState<AdminPasswordPayload>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            const response = await usersService.getAdminProfile();
            if (response.status === 'success' && response.data) {
                const profile = response.data;
                setProfileData({
                    name: profile.name || '',
                    email: profile.email || '',
                    username: profile.username || '',
                    mobile: profile.mobile || '',
                    dateOfBirth: '', // This might come from the profile if available
                    gender: undefined, // This might come from the profile if available
                    bio: '' // This might come from the profile if available
                });
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to fetch profile data'
            });
        } finally {
            setInitialLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Filter out empty values
            const updateData: UpdateAdminProfilePayload = {};
            Object.entries(profileData).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    updateData[key as keyof UpdateAdminProfilePayload] = value;
                }
            });

            const response = await usersService.updateAdminProfile(updateData);
            if (response.status === 'success') {
                // Update user context with new data
                if (response.data && state.user) {
                    dispatch({
                        type: 'INIT_AUTH',
                        payload: {
                            user: {
                                ...state.user,
                                name: response.data.name || state.user.name,
                                email: response.data.email || state.user.email
                            }
                        }
                    });
                }

                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Profile updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast({
                type: 'error',
                title: 'Error',
                message: 'New password and confirm password do not match'
            });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Password must be at least 8 characters long'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await usersService.changeAdminPassword(passwordData);
            if (response.status === 'success') {
                // Reset password form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                // Show success toast and reload page
                showToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Password changed successfully!'
                });
                //redirect to login after password change
                // window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error changing password:', error);
            const apiError = error as ApiError;
            showToast({
                type: 'error',
                title: 'Error',
                message: apiError.response?.data?.message || apiError.message || 'Failed to change password'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof UpdateAdminProfilePayload, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field: keyof AdminPasswordPayload, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (initialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="row mb-4">
                <div className="col-12">
                    <h4 className="fw-bold py-3 mb-4">
                        <span className="text-muted fw-light">Admin /</span> My Profile
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
                                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <i className="bx bx-user me-1"></i>
                                        Profile Information
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <i className="bx bx-lock-alt me-1"></i>
                                        Change Password
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* Profile Information Tab */}
                                {activeTab === 'profile' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-8">
                                                <h5 className="mb-3">Profile Information</h5>
                                                <p className="text-muted mb-4">Update your personal information and contact details.</p>

                                                <form onSubmit={handleProfileSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="profile-name" className="form-label">
                                                                    Full Name <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="profile-name"
                                                                    value={profileData.name}
                                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                                    placeholder="Enter your full name"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="profile-username" className="form-label">
                                                                    Username <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="profile-username"
                                                                    value={profileData.username}
                                                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                                                    placeholder="Enter your username"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="profile-email" className="form-label">
                                                                    Email Address <span className="text-danger">*</span>
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    id="profile-email"
                                                                    value={profileData.email}
                                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                                    placeholder="Enter your email"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="profile-mobile" className="form-label">
                                                                    Mobile Number
                                                                </label>
                                                                <input
                                                                    type="tel"
                                                                    className="form-control"
                                                                    id="profile-mobile"
                                                                    value={profileData.mobile}
                                                                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                                                                    placeholder="Enter your mobile number"
                                                                />
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
                                                                'Save Changes'
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={fetchAdminProfile}
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Change Password Tab */}
                                {activeTab === 'password' && (
                                    <div className="tab-pane active">
                                        <div className="row">
                                            <div className="col-xl-6">
                                                <h5 className="mb-3">Change Password</h5>
                                                <p className="text-muted mb-4">Update your password to keep your account secure.</p>

                                                <form onSubmit={handlePasswordSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="current-password" className="form-label">
                                                            Current Password <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <input
                                                                type={showPasswords.current ? 'text' : 'password'}
                                                                className="form-control"
                                                                id="current-password"
                                                                value={passwordData.currentPassword}
                                                                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                                placeholder="Enter current password"
                                                                required
                                                            />
                                                            <span className="input-group-text cursor-pointer">
                                                                <i
                                                                    className={`bx ${showPasswords.current ? 'bx-hide' : 'bx-show'}`}
                                                                    onClick={() => togglePasswordVisibility('current')}
                                                                ></i>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="new-password" className="form-label">
                                                            New Password <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <input
                                                                type={showPasswords.new ? 'text' : 'password'}
                                                                className="form-control"
                                                                id="new-password"
                                                                value={passwordData.newPassword}
                                                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                                placeholder="Enter new password"
                                                                required
                                                                minLength={8}
                                                            />
                                                            <span className="input-group-text cursor-pointer">
                                                                <i
                                                                    className={`bx ${showPasswords.new ? 'bx-hide' : 'bx-show'}`}
                                                                    onClick={() => togglePasswordVisibility('new')}
                                                                ></i>
                                                            </span>
                                                        </div>
                                                        <div className="form-text">
                                                            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="confirm-password" className="form-label">
                                                            Confirm New Password <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-merge">
                                                            <input
                                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                                className="form-control"
                                                                id="confirm-password"
                                                                value={passwordData.confirmPassword}
                                                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                                placeholder="Confirm new password"
                                                                required
                                                            />
                                                            <span className="input-group-text cursor-pointer">
                                                                <i
                                                                    className={`bx ${showPasswords.confirm ? 'bx-hide' : 'bx-show'}`}
                                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                                ></i>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Changing Password...
                                                                </>
                                                            ) : (
                                                                'Change Password'
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setPasswordData({
                                                                currentPassword: '',
                                                                newPassword: '',
                                                                confirmPassword: ''
                                                            })}
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </form>

                                                {/* Password Requirements */}
                                                <div className="mt-4 p-3 bg-light rounded">
                                                    <h6 className="mb-2">Password Requirements:</h6>
                                                    <ul className="mb-0 small text-muted">
                                                        <li>At least 8 characters long</li>
                                                        <li>Contains at least one uppercase letter</li>
                                                        <li>Contains at least one lowercase letter</li>
                                                        <li>Contains at least one number</li>
                                                        <li>Contains at least one special character (@$!%*?&)</li>
                                                    </ul>
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

            {/* Custom Styles */}
            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .text-danger {
                    color: #dc3545 !important;
                }

                .input-group-text {
                    transition: all 0.2s ease;
                }

                .input-group-text:hover {
                    background-color: #f8f9fa;
                }

                .nav-pills .nav-link {
                    border-radius: 0.375rem;
                    margin-right: 0.5rem;
                }

                .nav-pills .nav-link:hover {
                    background-color: rgba(105, 108, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;