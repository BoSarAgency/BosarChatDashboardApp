'use client';

import { useState } from 'react';
import UsersTable from '@/components/UsersTable';
import CreateUserModal from '@/components/CreateUserModal';
import { apiClient } from '@/lib/api';
import type { CreateUserDto } from '@/lib/api';

export default function UsersPage() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateUser = async (data: CreateUserDto) => {
        setActionLoading(true);
        try {
            await apiClient.createUser(data);
            setRefreshTrigger((prev) => prev + 1); // Trigger refresh of users list
            setCreateModalOpen(false); // Close modal after successful creation
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Add User
                </button>
            </div>
            <UsersTable refreshTrigger={refreshTrigger} />

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateUser}
                loading={actionLoading}
            />
        </div>
    );
}
