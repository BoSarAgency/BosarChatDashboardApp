// React hook for WebSocket chat functionality

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    getChatService,
    ChatService,
    WebSocketMessage,
    ConversationStatusChange,
} from './chatService';

export interface UseChatWebSocketOptions {
    conversationId: string;
    token: string;
    onMessage?: (message: WebSocketMessage) => void;
    onStatusChange?: (data: ConversationStatusChange) => void;
    onError?: (error: { message: string }) => void;
}

export interface UseChatWebSocketReturn {
    isConnected: boolean;
    sendMessage: (message: string, role?: 'user' | 'bot' | 'agent') => void;
    messages: WebSocketMessage[];
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    error: string | null;
}

export function useChatWebSocket({
    conversationId,
    token,
    onMessage,
    onStatusChange,
    onError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error'
    >('connecting');
    const [error, setError] = useState<string | null>(null);

    const chatServiceRef = useRef<ChatService | null>(null);
    const currentConversationIdRef = useRef<string | null>(null);

    // Create stable callback references
    const stableOnMessage = useCallback(
        (message: WebSocketMessage) => {
            // Only add messages for the current conversation
            if (message.conversationId === currentConversationIdRef.current) {
                setMessages((prev) => {
                    // Avoid duplicates
                    const exists = prev.some((m) => m.id === message.id);
                    if (exists) return prev;
                    return [...prev, message];
                });
                onMessage?.(message);
            }
        },
        [onMessage],
    );

    const stableOnStatusChange = useCallback(
        (data: ConversationStatusChange) => {
            if (data.conversationId === currentConversationIdRef.current) {
                onStatusChange?.(data);
            }
        },
        [onStatusChange],
    );

    const stableOnError = useCallback(
        (error: { message: string }) => {
            setError(error.message);
            setConnectionStatus('error');
            onError?.(error);
        },
        [onError],
    );

    // Initialize chat service
    useEffect(() => {
        console.log('🔧 useChatWebSocket: Initializing with token:', token ? 'Present' : 'Missing');

        if (!token) {
            console.log('❌ useChatWebSocket: No token available');
            setConnectionStatus('disconnected');
            setError('No authentication token available');
            return;
        }

        console.log('🔄 useChatWebSocket: Setting up WebSocket connection...');
        setConnectionStatus('connecting');
        setError(null);

        // Only create new service if we don't have one or token changed
        let chatService = chatServiceRef.current;
        if (!chatService || !chatService.isConnected()) {
            console.log('🔄 useChatWebSocket: Creating new ChatService...');
            chatService = getChatService(token, true); // Force new connection
            chatServiceRef.current = chatService;
        } else {
            console.log('♻️ useChatWebSocket: Reusing existing ChatService');
        }

        console.log(
            '📡 useChatWebSocket: ChatService created:',
            chatService ? 'Success' : 'Failed',
        );

        if (chatService) {
            chatService.setCallbacks({
                onConnect: () => {
                    console.log('✅ useChatWebSocket: Connected successfully');
                    setIsConnected(true);
                    setConnectionStatus('connected');
                    setError(null);
                },
                onDisconnect: () => {
                    console.log('❌ useChatWebSocket: Disconnected');
                    setIsConnected(false);
                    setConnectionStatus('disconnected');
                },
                onMessage: stableOnMessage,
                onStatusChange: stableOnStatusChange,
                onError: stableOnError,
                onJoinedConversation: (data) => {
                    console.log('Successfully joined conversation:', data.conversationId);
                },
            });
        }

        return () => {
            // Don't disconnect the service here as it might be used by other components
            // The service will be cleaned up when the app unmounts
            console.log('🧹 useChatWebSocket: Cleanup effect running');
        };
    }, [token, stableOnMessage, stableOnStatusChange, stableOnError]);

    // Join conversation when conversationId changes
    useEffect(() => {
        if (!conversationId || !chatServiceRef.current || !isConnected) return;

        // Leave previous conversation if any
        if (
            currentConversationIdRef.current &&
            currentConversationIdRef.current !== conversationId
        ) {
            chatServiceRef.current.leaveConversation();
        }

        // Clear messages when switching conversations
        if (currentConversationIdRef.current !== conversationId) {
            setMessages([]);
        }

        currentConversationIdRef.current = conversationId;
        chatServiceRef.current.joinConversation(conversationId);

        return () => {
            // Leave conversation when component unmounts or conversationId changes
            if (chatServiceRef.current && currentConversationIdRef.current) {
                chatServiceRef.current.leaveConversation();
                currentConversationIdRef.current = null;
            }
        };
    }, [conversationId, isConnected]);

    const sendMessage = useCallback((message: string, role: 'user' | 'bot' | 'agent' = 'agent') => {
        if (!chatServiceRef.current || !currentConversationIdRef.current) {
            console.error('Chat service not available or no conversation joined');
            return;
        }

        chatServiceRef.current.sendMessage(currentConversationIdRef.current, message, role);
    }, []);

    return {
        isConnected,
        sendMessage,
        messages,
        connectionStatus,
        error,
    };
}
