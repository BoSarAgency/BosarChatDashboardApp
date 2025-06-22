'use client';

import { useState, useRef, useCallback } from 'react';
import { useUploadPdfDocument } from '@/lib/api';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadDocumentModal({
    isOpen,
    onClose,
    onSuccess,
}: UploadDocumentModalProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [apiError, setApiError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadPdf, loading, error } = useUploadPdfDocument();

    const formatFileSize = (bytes: number): string => {
        const MB = 1024 * 1024;
        const KB = 1024;

        if (bytes >= MB) {
            return `${(bytes / MB).toFixed(2)} MB`;
        } else {
            return `${(bytes / KB).toFixed(2)} KB`;
        }
    };

    const validateFile = (file: File): string | null => {
        // Check file type
        if (file.type !== 'application/pdf') {
            return 'Please select a PDF file.';
        }

        // Check file size (150MB limit)
        const maxSize = 150 * 1024 * 1024; // 150MB in bytes
        if (file.size > maxSize) {
            return 'File size must be less than 150MB.';
        }

        return null;
    };

    const handleFileSelect = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setApiError(validationError);
            return;
        }

        setSelectedFile(file);
        setApiError('');
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect],
    );

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        console.log(
            '🚀 Starting upload for file:',
            selectedFile.name,
            'Size:',
            selectedFile.size,
            'Type:',
            selectedFile.type,
        );
        setApiError('');

        try {
            const result = await uploadPdf(selectedFile);
            console.log('✅ Upload successful:', result);
            // Reset state
            setSelectedFile(null);
            setApiError('');
            // Notify parent of success
            onSuccess();
            // Close modal
            onClose();
        } catch (error) {
            console.error('❌ Failed to upload document:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { message?: string; error?: string })?.message ||
                      (error as { message?: string; error?: string })?.error ||
                      'Failed to upload document. Please try again.';
            setApiError(errorMessage);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setSelectedFile(null);
            setApiError('');
            onClose();
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
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

                {/* Body */}
                <div className="p-6">
                    {/* Drag and Drop Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                            isDragOver
                                ? 'border-blue-400 bg-blue-50'
                                : selectedFile
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={openFileDialog}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="space-y-2">
                                <svg
                                    className="mx-auto h-12 w-12 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                                <p className="text-xs text-green-600">
                                    Click to select a different file
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-900">
                                    Drop your PDF file here
                                </p>
                                <p className="text-xs text-gray-500">or click to browse files</p>
                                <p className="text-xs text-gray-400">Maximum file size: 150MB</p>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {(apiError || error) && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">
                                {apiError || error?.message || 'An error occurred'}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </>
                            ) : (
                                'Upload Document'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
