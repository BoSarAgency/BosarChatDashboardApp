'use client';

import { useState, Suspense } from 'react';
import { useFAQs, usePdfDocuments, apiClient } from '@/lib/api';
import type { FAQ, CreateFaqDto, UpdateFaqDto } from '@/lib/api';
import CreateFAQModal from '@/components/CreateFAQModal';
import UpdateFAQModal from '@/components/UpdateFAQModal';
import DeleteFAQModal from '@/components/DeleteFAQModal';
import UploadDocumentModal from '@/components/UploadDocumentModal';

const BOT_SETTINGS_ID = '106c3cac-0e27-4cc4-851c-921be1b7eeb9';

// Loading skeleton components
function FAQSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex space-x-2">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DocumentsSkeleton() {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upload Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// FAQ Section Component
function FAQSection({
    onCreateFAQ,
    onEditFAQ,
    onDeleteFAQ,
}: {
    onCreateFAQ: () => void;
    onEditFAQ: (faq: FAQ) => void;
    onDeleteFAQ: (faq: FAQ) => void;
}) {
    const { data: faqs, loading: faqsLoading, error: faqsError } = useFAQs(BOT_SETTINGS_ID);

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
                    <button
                        onClick={onCreateFAQ}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Add new FAQ
                    </button>
                </div>
            </div>

            <div className="p-6">
                {faqsLoading ? (
                    <FAQSkeleton />
                ) : faqsError ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">Error loading FAQs: {faqsError.message}</p>
                    </div>
                ) : !faqs || faqs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            No FAQs found. Add your first FAQ to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => onEditFAQ(faq)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDeleteFAQ(faq)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Documents Section Component
function DocumentsSection({ onUploadDocument }: { onUploadDocument: () => void }) {
    const { data: documents, loading: documentsLoading, error: documentsError } = usePdfDocuments();

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                    <button
                        onClick={onUploadDocument}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Upload Document
                    </button>
                </div>
            </div>

            <div className="p-6">
                {documentsLoading ? (
                    <DocumentsSkeleton />
                ) : documentsError ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">
                            Error loading documents: {documentsError.message}
                        </p>
                    </div>
                ) : !documents || documents.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No documents found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Upload Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((document) => (
                                    <tr key={document.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {document.fileName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(document.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <a
                                                href={document.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function KnowledgeBasePage() {
    const [createFAQModalOpen, setCreateFAQModalOpen] = useState(false);
    const [updateFAQModalOpen, setUpdateFAQModalOpen] = useState(false);
    const [deleteFAQModalOpen, setDeleteFAQModalOpen] = useState(false);
    const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreateFAQ = async (data: CreateFaqDto) => {
        setActionLoading(true);
        try {
            await apiClient.createFAQ(data);
            setCreateFAQModalOpen(false);
            setRefreshKey((prev) => prev + 1); // Trigger refresh
        } catch (error) {
            throw error; // Let the modal handle the error display
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateFAQ = async (id: string, data: UpdateFaqDto) => {
        setActionLoading(true);
        try {
            await apiClient.updateFAQ(id, data);
            setUpdateFAQModalOpen(false);
            setSelectedFAQ(null);
            setRefreshKey((prev) => prev + 1); // Trigger refresh
        } catch (error) {
            throw error; // Let the modal handle the error display
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteFAQ = async (id: string) => {
        setActionLoading(true);
        try {
            await apiClient.deleteFAQ(id);
            setDeleteFAQModalOpen(false);
            setSelectedFAQ(null);
            setRefreshKey((prev) => prev + 1); // Trigger refresh
        } catch (error) {
            throw error; // Let the modal handle the error display
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (faq: FAQ) => {
        setSelectedFAQ(faq);
        setUpdateFAQModalOpen(true);
    };

    const openDeleteModal = (faq: FAQ) => {
        setSelectedFAQ(faq);
        setDeleteFAQModalOpen(true);
    };

    const handleUploadSuccess = async () => {
        setRefreshKey((prev) => prev + 1); // Trigger refresh
    };

    const closeModals = () => {
        setCreateFAQModalOpen(false);
        setUpdateFAQModalOpen(false);
        setDeleteFAQModalOpen(false);
        setUploadDocumentModalOpen(false);
        setSelectedFAQ(null);
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base</h1>

            {/* FAQ Section */}
            <Suspense
                fallback={
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
                                <button
                                    onClick={() => setCreateFAQModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Add new FAQ
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <FAQSkeleton />
                        </div>
                    </div>
                }
            >
                <FAQSection
                    key={`faq-${refreshKey}`}
                    onCreateFAQ={() => setCreateFAQModalOpen(true)}
                    onEditFAQ={openEditModal}
                    onDeleteFAQ={openDeleteModal}
                />
            </Suspense>

            {/* Documents Section */}
            <Suspense
                fallback={
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                                <button
                                    onClick={() => setUploadDocumentModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Upload Document
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <DocumentsSkeleton />
                        </div>
                    </div>
                }
            >
                <DocumentsSection
                    key={`docs-${refreshKey}`}
                    onUploadDocument={() => setUploadDocumentModalOpen(true)}
                />
            </Suspense>

            {/* FAQ Modals */}
            <CreateFAQModal
                isOpen={createFAQModalOpen}
                onClose={closeModals}
                onCreate={handleCreateFAQ}
                loading={actionLoading}
                botSettingsId={BOT_SETTINGS_ID}
            />

            <UpdateFAQModal
                isOpen={updateFAQModalOpen}
                onClose={closeModals}
                faq={selectedFAQ}
                onUpdate={handleUpdateFAQ}
                loading={actionLoading}
            />

            <DeleteFAQModal
                isOpen={deleteFAQModalOpen}
                onClose={closeModals}
                faq={selectedFAQ}
                onConfirm={handleDeleteFAQ}
                loading={actionLoading}
            />

            {/* Upload Document Modal */}
            <UploadDocumentModal
                isOpen={uploadDocumentModalOpen}
                onClose={closeModals}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}
