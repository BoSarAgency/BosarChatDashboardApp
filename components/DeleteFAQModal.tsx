'use client';

import React, { useState, useEffect } from 'react';
import type { FAQ } from '@/lib/api';

interface DeleteFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    faq: FAQ | null;
    onConfirm: (id: string) => Promise<void>;
    loading?: boolean;
}

export default function DeleteFAQModal({
    isOpen,
    onClose,
    faq,
    onConfirm,
    loading = false,
}: DeleteFAQModalProps) {
    const [apiError, setApiError] = useState<string>('');

    // Clear API error when modal opens
    useEffect(() => {
        if (isOpen) {
            setApiError('');
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!faq) return;

        setApiError(''); // Clear any previous API errors

        try {
            await onConfirm(faq.id);
            // Modal will be closed by the parent component after successful deletion
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
            // Display the error message to the user
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { message?: string; error?: string })?.message ||
                      (error as { message?: string; error?: string })?.error ||
                      'Failed to delete FAQ. Please try again.';
            setApiError(errorMessage);
        }
    };

    if (!isOpen || !faq) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Confirm Delete</h2>
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

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Delete FAQ</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                        <p className="text-sm text-gray-700 mb-3">{faq.question}</p>
                        <h4 className="font-medium text-gray-900 mb-2">Answer:</h4>
                        <p className="text-sm text-gray-700 line-clamp-3">{faq.answer}</p>
                    </div>

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

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
