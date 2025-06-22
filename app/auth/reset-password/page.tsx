'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useResetPassword, apiClient } from '@/lib/api';
import { useAuthContext } from '@/components/AuthProvider';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(2);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword, loading, error, success, resetResponse } = useResetPassword();
    const auth = useAuthContext();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        setToken(tokenParam);
    }, [searchParams]);

    // Handle successful password reset
    useEffect(() => {
        if (success && resetResponse) {
            const authenticateUser = async () => {
                // If the response includes an access token, authenticate the user
                if (resetResponse.access_token && resetResponse.user) {
                    // Store the token and user data
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('auth_token', resetResponse.access_token);
                        localStorage.setItem('user', JSON.stringify(resetResponse.user));
                    }

                    // Set up the API client with the new token
                    apiClient.setAuthToken(resetResponse.access_token);

                    // Update auth context state by calling checkAuth
                    try {
                        await auth.checkAuth();
                    } catch (error) {
                        console.error('Failed to update auth state:', error);
                    }
                }

                // Start countdown
                setCountdown(2);
                const countdownInterval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            router.push('/dashboard/conversations');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(countdownInterval);
            };

            authenticateUser();
        }
    }, [success, resetResponse, router, auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        if (!token) {
            return;
        }

        try {
            const response = await resetPassword(token, password);
            console.log('Reset password successful:', response);
        } catch (error) {
            // Error is handled by the hook
            console.error('Reset password failed:', error);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length < 8) return 0; // Must be at least 8 characters

        let strength = 1; // Start with 1 if length requirement is met
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getPasswordRequirements = (password: string) => {
        return {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[^A-Za-z0-9]/.test(password),
        };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordRequirements = getPasswordRequirements(password);
    const strengthLabels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = [
        'bg-red-500',
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-blue-500',
        'bg-green-500',
    ];

    const isPasswordValid = password.length >= 8 && passwordStrength >= 2;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                </div>

                <div className="relative max-w-md w-full">
                    {/* Glass morphism card */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
                        {/* Error icon */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                                Invalid Reset Link
                            </h1>
                            <p className="text-gray-300 text-lg mb-2">
                                The reset link is missing or invalid
                            </p>
                            <p className="text-gray-400 text-sm">
                                Please check your email for the correct reset link or request a new
                                one.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/auth/forgot-password"
                                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg block text-center"
                            >
                                Request New Reset Link
                            </Link>

                            <div className="text-center">
                                <Link
                                    href="/auth/signin"
                                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 relative group"
                                >
                                    Back to Sign In
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                </div>

                <div className="relative max-w-md w-full">
                    {/* Glass morphism card */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
                        {/* Success icon */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                                Password Reset Successful
                            </h1>
                            <p className="text-gray-300 text-lg mb-2">
                                Your password has been updated
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                You are now signed in and will be redirected to your dashboard.
                            </p>
                            <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 rounded-lg">
                                <span className="text-gray-300 text-sm">
                                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            </div>

            <div className="relative max-w-md w-full">
                {/* Glass morphism card */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
                    {/* Logo and title */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                            Reset Password
                        </h1>
                        <p className="text-gray-300 text-lg">Create your new password</p>
                        <p className="text-gray-400 text-sm">
                            Enter a strong password to secure your account
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-200 mb-2"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                    placeholder="Enter your new password"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 transition-opacity duration-200 pointer-events-none focus-within:opacity-100"></div>
                            </div>
                            {password && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    strengthColors[passwordStrength] ||
                                                    'bg-gray-500'
                                                }`}
                                                style={{
                                                    width: `${(passwordStrength / 5) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {strengthLabels[passwordStrength] || 'Too Short'}
                                        </span>
                                    </div>

                                    {/* Password requirements checklist */}
                                    <div className="text-xs space-y-1">
                                        <div
                                            className={`flex items-center space-x-2 ${
                                                passwordRequirements.minLength
                                                    ? 'text-green-400'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            <span>
                                                {passwordRequirements.minLength ? '✓' : '○'}
                                            </span>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div
                                            className={`flex items-center space-x-2 ${
                                                passwordRequirements.hasUppercase
                                                    ? 'text-green-400'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            <span>
                                                {passwordRequirements.hasUppercase ? '✓' : '○'}
                                            </span>
                                            <span>One uppercase letter</span>
                                        </div>
                                        <div
                                            className={`flex items-center space-x-2 ${
                                                passwordRequirements.hasLowercase
                                                    ? 'text-green-400'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            <span>
                                                {passwordRequirements.hasLowercase ? '✓' : '○'}
                                            </span>
                                            <span>One lowercase letter</span>
                                        </div>
                                        <div
                                            className={`flex items-center space-x-2 ${
                                                passwordRequirements.hasNumber
                                                    ? 'text-green-400'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            <span>
                                                {passwordRequirements.hasNumber ? '✓' : '○'}
                                            </span>
                                            <span>One number</span>
                                        </div>
                                        <div
                                            className={`flex items-center space-x-2 ${
                                                passwordRequirements.hasSpecialChar
                                                    ? 'text-green-400'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            <span>
                                                {passwordRequirements.hasSpecialChar ? '✓' : '○'}
                                            </span>
                                            <span>One special character</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-200 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                    placeholder="Confirm your new password"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 transition-opacity duration-200 pointer-events-none focus-within:opacity-100"></div>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-2 text-sm text-red-400">Passwords do not match</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                <div className="text-sm">
                                    {error.message || 'Failed to reset password. Please try again.'}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || password !== confirmPassword || !isPasswordValid}
                            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            <span className="relative z-10">
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Resetting...
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>

                        <div className="text-center">
                            <Link
                                href="/auth/signin"
                                className="text-sm text-gray-300 hover:text-white transition-colors duration-200 relative group"
                            >
                                Back to Sign In
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full opacity-60 animate-bounce"></div>
                <div
                    className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 rounded-full opacity-60 animate-bounce"
                    style={{ animationDelay: '1s' }}
                ></div>
                <div
                    className="absolute top-1/2 -right-8 w-4 h-4 bg-pink-500 rounded-full opacity-60 animate-bounce"
                    style={{ animationDelay: '2s' }}
                ></div>
            </div>
        </div>
    );
}
