'use client';

import { useState, useEffect } from 'react';
import { useUsers, apiClient } from '@/lib/api';
import type { User, UpdateUserDto } from '@/lib/api';
import { useAuthContext } from './AuthProvider';
import UpdateUserModal from './UpdateUserModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface UsersTableProps {
    refreshTrigger?: number;
}

export default function UsersTable({ refreshTrigger }: UsersTableProps) {
    const { data: users, loading, error, refetch } = useUsers();
    const { user: currentUser } = useAuthContext();

    // Modal states
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Refresh users when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            refetch();
        }
    }, [refreshTrigger, refetch]);

    // Modal handlers
    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setUpdateModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleUpdateUser = async (id: string, data: UpdateUserDto) => {
        setActionLoading(true);
        try {
            await apiClient.updateUser(id, data);
            await refetch(); // Refresh the users list
            closeModals(); // Close modal after successful update
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setActionLoading(true);
        try {
            await apiClient.deleteUser(id);
            await refetch(); // Refresh the users list
            closeModals(); // Close modal after successful deletion
        } finally {
            setActionLoading(false);
        }
    };

    const closeModals = () => {
        setUpdateModalOpen(false);
        setDeleteModalOpen(false);
        setSelectedUser(null);
    };

    if (loading) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading users...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading users</div>
                    <div className="text-gray-600 text-sm mb-4">{error.message}</div>
                    <button
                        onClick={refetch}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="text-center text-gray-600">No users found</div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: User) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(user.updatedAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {currentUser && user.id !== currentUser.id ? (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">
                                            {currentUser && user.id === currentUser.id ? '' : '—'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <UpdateUserModal
                isOpen={updateModalOpen}
                onClose={closeModals}
                user={selectedUser}
                onUpdate={handleUpdateUser}
                loading={actionLoading}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeModals}
                user={selectedUser}
                onConfirm={handleDeleteUser}
                loading={actionLoading}
            />
        </div>
    );
}
