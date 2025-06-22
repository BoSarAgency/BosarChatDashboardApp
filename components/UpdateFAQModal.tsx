'use client';

import { useState, useEffect } from 'react';
import type { FAQ, UpdateFaqDto } from '@/lib/api';

interface UpdateFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    faq: FAQ | null;
    onUpdate: (id: string, data: UpdateFaqDto) => Promise<void>;
    loading?: boolean;
}

export default function UpdateFAQModal({
    isOpen,
    onClose,
    faq,
    onUpdate,
    loading = false,
}: UpdateFAQModalProps) {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string>('');

    // Populate form when FAQ changes
    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question,
                answer: faq.answer,
            });
            setErrors({});
            setApiError('');
        }
    }, [faq]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.question.trim()) {
            newErrors.question = 'Question is required';
        }

        if (!formData.answer.trim()) {
            newErrors.answer = 'Answer is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!faq || !validateForm()) {
            return;
        }

        setApiError(''); // Clear any previous API errors

        try {
            await onUpdate(faq.id, formData);
            // Modal will be closed by the parent component after successful update
        } catch (error) {
            console.error('Failed to update FAQ:', error);
            // Display the error message to the user
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { message?: string; error?: string })?.message ||
                      (error as { message?: string; error?: string })?.error ||
                      'Failed to update FAQ. Please try again.';
            setApiError(errorMessage);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen || !faq) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Update FAQ</h2>
                    <button
                        onClick={handleClose}
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
                <form onSubmit={handleSubmit} className="p-6">
                    {/* API Error Display */}
                    {apiError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{apiError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Question Field */}
                        <div>
                            <label
                                htmlFor="question"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Question
                            </label>
                            <input
                                type="text"
                                id="question"
                                name="question"
                                value={formData.question}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                    errors.question ? 'border-red-300' : 'border-gray-300'
                                }`}
                                disabled={loading}
                                placeholder="Enter the question"
                            />
                            {errors.question && (
                                <p className="mt-1 text-sm text-red-600">{errors.question}</p>
                            )}
                        </div>

                        {/* Answer Field */}
                        <div>
                            <label
                                htmlFor="answer"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Answer
                            </label>
                            <textarea
                                id="answer"
                                name="answer"
                                value={formData.answer}
                                onChange={handleInputChange}
                                rows={6}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                    errors.answer ? 'border-red-300' : 'border-gray-300'
                                }`}
                                disabled={loading}
                                placeholder="Enter the answer"
                            />
                            {errors.answer && (
                                <p className="mt-1 text-sm text-red-600">{errors.answer}</p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update FAQ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
