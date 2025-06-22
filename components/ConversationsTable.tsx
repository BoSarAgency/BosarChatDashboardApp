'use client';

import { useRouter } from 'next/navigation';
import { useConversations } from '@/lib/api';
import type { Conversation } from '@/lib/api';

export default function ConversationsTable() {
    const router = useRouter();
    const { data: conversations, loading, error, refetch } = useConversations();

    // Sort conversations by lastMessageAt (most recent first), fallback to updatedAt
    const sortedConversations = conversations?.slice().sort((a, b) => {
        const aTime = a.lastMessageAt || a.updatedAt;
        const bTime = b.lastMessageAt || b.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Helper function to get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'auto':
                return 'bg-green-100 text-green-800';
            case 'human':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading conversations...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading conversations</div>
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

    if (!sortedConversations || sortedConversations.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                    <div className="text-gray-500 mb-2">No conversations found</div>
                    <div className="text-gray-400 text-sm">
                        Conversations will appear here when customers start chatting.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Messages
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Message
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedConversations?.map((conversation: Conversation) => (
                            <tr key={conversation.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {conversation.customerId}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                            conversation.status
                                        )}`}
                                    >
                                        {conversation.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {conversation.messagesAmount || conversation._count?.chatMessages || 0}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {conversation.userId ? (
                                            <span>{conversation.user?.name || 'Agent'}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(conversation.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {conversation.lastMessageAt ? (
                                        formatDate(conversation.lastMessageAt)
                                    ) : (
                                        <span className="text-gray-400 italic">No messages</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            router.push(`/dashboard/conversations/${conversation.id}`);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
