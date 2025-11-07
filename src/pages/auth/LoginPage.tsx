import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/SimpleAdminContext';
import { authService } from '../../services/authService';

const LoginPage: React.FC = () => {
    const { dispatch } = useAdmin();
    const navigate = useNavigate();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Use actual API call
            const response = await authService.login(formData.email, formData.password);

            if (response.status === 'success' && response.data) {
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: response.data.user,
                        token: response.data.token
                    },
                });

                // Navigate to dashboard after successful login
                navigate('/dashboard');
            } else {
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.forgotPassword(forgotEmail);
            if (response.status === 'success') {
                setSuccess('Password reset email sent successfully! Please check your inbox.');
                setShowForgotPassword(false);
                setForgotEmail('');
            } else {
                setError(response.message || 'Failed to send password reset email.');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to send password reset email.';
            setError(errorMessage);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="container-xxl">
            <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                    {/* Login */}
                    <div className="card">
                        <div className="card-body">
                            {/* Logo */}
                            <div className="app-brand justify-content-center mb-0">
                                <a href="/" className="app-brand-link gap-2">
                                    <span className="app-brand-logo demo">
                                        <img src="/assets/img/logo.png" alt="Blurry" style={{ maxHeight: '100px' }} />
                                    </span>
                                </a>
                            </div>
                            {/* /Logo */}
                            <h4 className="mb-2">Welcome to Blurry! 👋</h4>
                            <p className="mb-4">Please sign-in to your account and start the adventure</p>

                            {!showForgotPassword ? (
                                <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success" role="alert">
                                            {success}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="mb-3 form-password-toggle form-control-validation">
                                        <div className="d-flex justify-content-between">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowForgotPassword(true);
                                                    setError('');
                                                }}
                                            >
                                                <small>Forgot Password?</small>
                                            </a>
                                        </div>
                                        <div className="input-group input-group-merge">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                className="form-control"
                                                name="password"
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <span
                                                className="input-group-text cursor-pointer"
                                                onClick={togglePasswordVisibility}
                                            >
                                                <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}></i>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="remember-me" />
                                            <label className="form-check-label" htmlFor="remember-me">
                                                Remember Me
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <button
                                            className="btn btn-primary d-grid w-100"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Signing in...' : 'Sign in'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form className="mb-3" onSubmit={handleForgotPassword}>
                                    <h5 className="mb-3">Reset Password</h5>
                                    <p className="mb-4">Enter your email address and we'll send you a link to reset your password.</p>

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success" role="alert">
                                            {success}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="forgotEmail" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="forgotEmail"
                                            name="forgotEmail"
                                            placeholder="Enter your email address"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <button
                                            className="btn btn-primary d-grid w-100"
                                            type="submit"
                                            disabled={forgotLoading}
                                        >
                                            {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowForgotPassword(false);
                                                setError('');
                                                setForgotEmail('');
                                            }}
                                        >
                                            <small>Back to Login</small>
                                        </a>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                    {/* /Login */}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;