'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation, useConversationMessages, useSendChatMessage, useTriggerHumanTakeover } from '@/lib/api';
import { useChatWebSocket } from '@/lib/websocket/useChatWebSocket';
import type { ChatMessage, CreateChatMessageDto } from '@/lib/api';
import type { WebSocketMessage } from '@/lib/websocket/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.id as string;

    // Only log once per conversation to reduce noise
    const loggedRef = useRef<string | null>(null);
    if (loggedRef.current !== conversationId) {
        console.log('🏁 ConversationPage: Loading with conversationId:', conversationId);
        loggedRef.current = conversationId;
    }

    const { data: conversation, loading: conversationLoading, error: conversationError } = useConversation(conversationId);
    const { data: initialMessagesData, loading: messagesLoading, refetch: refetchMessages } = useConversationMessages(conversationId);
    const { sendMessage: sendRestMessage, loading: sendingMessage } = useSendChatMessage();
    const { triggerTakeover, loading: triggeringTakeover } = useTriggerHumanTakeover();

    const [messageText, setMessageText] = useState('');
    const [authToken, setAuthToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageCount, setMessageCount] = useState(0);



    // Get auth token from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            console.log('🔑 ConversationPage: Auth token from localStorage:', token ? 'Found' : 'Not found');
            setAuthToken(token);
        }
    }, []);

    // Create stable callback references to prevent infinite re-renders
    const onMessage = useCallback((message: WebSocketMessage) => {
        console.log('Received message:', message);
    }, []);

    const onStatusChange = useCallback((data: { conversationId: string; status: string; assignedAgent?: { id: string; name: string; email: string } }) => {
        console.log('Status changed:', data);
        // Optionally refresh conversation data when status changes
    }, []);

    const onError = useCallback((error: { message: string }) => {
        console.error('WebSocket error:', error);
    }, []);

    // WebSocket connection for real-time messaging (with fallback)
    const {
        isConnected,
        sendMessage: sendWebSocketMessage,
        messages: webSocketMessages,
        connectionStatus,
        error: webSocketError
    } = useChatWebSocket({
        conversationId,
        token: authToken || '',
        onMessage,
        onStatusChange,
        onError
    });



    // Auto-scroll to bottom when messages change
    useEffect(() => {
        const totalMessages = (initialMessagesData?.messages?.length || 0) + webSocketMessages.length;
        if (totalMessages > messageCount) {
            setMessageCount(totalMessages);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100); // Small delay to ensure DOM is updated
        }
    }, [initialMessagesData?.messages?.length, webSocketMessages.length, messageCount]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || sendingMessage) return;

        try {
            if (isConnected) {
                // Use WebSocket if connected
                sendWebSocketMessage(messageText.trim(), 'agent');
                setMessageText('');
            } else {
                // Fallback to REST API
                const messageData: CreateChatMessageDto = {
                    conversationId,
                    message: messageText.trim(),
                    role: 'agent',
                };

                await sendRestMessage(messageData);
                setMessageText('');
                // Refetch messages to get the latest
                refetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleTakeover = async () => {
        try {
            await triggerTakeover(conversationId, 'Manual takeover by agent');
            // Refetch conversation to get updated status
            window.location.reload(); // Simple refresh for now
        } catch (error) {
            console.error('Failed to trigger takeover:', error);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMessageSenderName = (message: ChatMessage) => {
        switch (message.role) {
            case 'user':
                return `Customer ${conversation?.customerId?.slice(-8) || 'Unknown'}`;
            case 'bot':
                return 'AI Assistant';
            case 'agent':
                return message.user?.name || 'Agent';
            default:
                return 'Unknown';
        }
    };

    if (conversationLoading || messagesLoading || !authToken) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading conversation...</span>
            </div>
        );
    }

    if (conversationError || webSocketError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-medium">Error loading conversation</h3>
                <p className="text-red-600 text-sm mt-1">
                    {conversationError?.message || webSocketError || 'Unknown error occurred'}
                </p>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-gray-800 font-medium">Conversation not found</h3>
                <p className="text-gray-600 text-sm mt-1">
                    The conversation you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                </p>
            </div>
        );
    }

    // Combine initial REST API messages with real-time WebSocket messages
    const initialMessages = initialMessagesData?.messages || [];

    // Convert initial messages to WebSocket format
    const convertedInitialMessages = initialMessages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        message: msg.message,
        role: msg.role,
        userId: msg.userId,
        user: msg.user,
        createdAt: msg.createdAt
    } as WebSocketMessage));

    // Combine initial messages with WebSocket messages, avoiding duplicates
    const allMessages = [...convertedInitialMessages];

    // Add WebSocket messages that aren't already in the initial messages
    webSocketMessages.forEach(wsMsg => {
        const exists = allMessages.some(msg => msg.id === wsMsg.id);
        if (!exists) {
            allMessages.push(wsMsg);
        }
    });

    // Sort by creation date to ensure proper order
    allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const isAutoMode = conversation.status === 'auto';
    const canSendMessages = !isAutoMode; // Allow sending even when WebSocket is not connected (will use REST API)

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Customer {conversation.customerId?.slice(-8) || 'Unknown'}
                        </h1>
                        <p className="text-sm text-gray-500">ID: {conversation.customerId}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            ID: {conversationId}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            connectionStatus === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : connectionStatus === 'connecting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {connectionStatus === 'connected' ? '🟢 Live' :
                             connectionStatus === 'connecting' ? '🟡 Connecting' : '🔴 Offline'}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            conversation.status === 'auto'
                                ? 'bg-green-100 text-green-800'
                                : conversation.status === 'human'
                                ? 'bg-yellow-100 text-yellow-800'
                                : conversation.status === 'pending'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {conversation.status.replace('_', ' ')}
                        </span>
                        {isAutoMode && (
                            <button
                                onClick={handleTakeover}
                                disabled={triggeringTakeover}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                {triggeringTakeover ? 'Taking over...' : 'Takeover'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {allMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    allMessages.map((message: WebSocketMessage) => {
                        const isFromCustomer = message.role === 'user';
                        const isFromBot = message.role === 'bot';
                        
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    isFromCustomer
                                        ? 'bg-blue-600 text-white'
                                        : isFromBot
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'bg-green-100 text-green-900'
                                }`}>
                                    <div className="text-sm font-medium mb-1">
                                        {getMessageSenderName(message)}
                                    </div>
                                    <div className="text-sm">
                                        {isFromBot ? (
                                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-800">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {message.message}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            message.message
                                        )}
                                    </div>
                                    <div className={`text-xs mt-1 ${
                                        isFromCustomer ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                        {formatTime(message.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-6">
                {isAutoMode && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            This conversation is in auto mode. Click &quot;Takeover&quot; to start responding manually.
                        </p>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={canSendMessages ? "Type your message..." : "Takeover required to send messages"}
                        disabled={!canSendMessages || sendingMessage}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!canSendMessages || !messageText.trim() || sendingMessage}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium disabled:cursor-not-allowed"
                    >
                        {sendingMessage ? 'Sending...' : !isConnected ? 'Send (Offline)' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
}
