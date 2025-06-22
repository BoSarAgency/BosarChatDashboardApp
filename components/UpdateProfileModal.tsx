'use client';

import { useState, useEffect } from 'react';
import { useUpdateProfile } from '@/lib/api';
import { useAuthContext } from './AuthProvider';
import type { User } from '@/lib/api';

interface UpdateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function UpdateProfileModal({ isOpen, onClose, user }: UpdateProfileModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string>('');
    const { updateProfile, loading } = useUpdateProfile();
    const { loadUserProfile } = useAuthContext();

    // Populate form when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                password: '',
                confirmPassword: '',
            });
            setErrors({});
            setApiError('');
        }
    }, [user]);

    // Password strength validation
    const validatePasswordStrength = (password: string): string[] => {
        const issues: string[] = [];
        if (password.length > 0) {
            if (password.length < 6) issues.push('At least 6 characters');
            if (!/[A-Z]/.test(password)) issues.push('One uppercase letter');
            if (!/[a-z]/.test(password)) issues.push('One lowercase letter');
            if (!/\d/.test(password)) issues.push('One number');
        }
        return issues;
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Password validation (only if password is provided)
        if (formData.password) {
            const passwordIssues = validatePasswordStrength(formData.password);
            if (passwordIssues.length > 0) {
                newErrors.password = `Password must have: ${passwordIssues.join(', ')}`;
            }

            // Confirm password validation
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        } else if (formData.confirmPassword) {
            newErrors.confirmPassword = 'Please enter a password first';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setApiError(''); // Clear any previous API errors

        try {
            // Prepare data to send - only include password if it's not empty
            const updateData: { name: string; password?: string } = {
                name: formData.name,
            };

            if (formData.password.trim()) {
                updateData.password = formData.password;
            }

            await updateProfile(updateData);

            // Refresh user profile in auth context
            await loadUserProfile();

            // Close modal on success
            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Display the error message to the user
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { message?: string; error?: string })?.message ||
                      (error as { message?: string; error?: string })?.error ||
                      'Failed to update profile. Please try again.';
            setApiError(errorMessage);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Update Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
                    {/* API Error */}
                    {apiError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{apiError}</p>
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="profile-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Name *
                        </label>
                        <input
                            type="text"
                            id="profile-name"
                            name="profile-name"
                            autoComplete="off"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="profile-new-password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password (optional)
                        </label>
                        <input
                            type="password"
                            id="profile-new-password"
                            name="new-password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                            placeholder="Leave empty to keep current password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}

                        {/* Password strength indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4].map((level) => {
                                        const passwordIssues = validatePasswordStrength(
                                            formData.password,
                                        );
                                        const strength = 4 - passwordIssues.length;
                                        return (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded ${
                                                    level <= strength
                                                        ? strength === 1
                                                            ? 'bg-red-400'
                                                            : strength === 2
                                                            ? 'bg-yellow-400'
                                                            : strength === 3
                                                            ? 'bg-blue-400'
                                                            : 'bg-green-400'
                                                        : 'bg-gray-200'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-6">
                        <label
                            htmlFor="profile-confirm-password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="profile-confirm-password"
                            name="confirm-new-password"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                            placeholder="Confirm your new password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
