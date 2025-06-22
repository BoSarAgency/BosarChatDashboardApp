// WebSocket Chat Service for ACGQ Dashboard
// Handles real-time messaging using Socket.IO

import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
    id: string;
    conversationId: string;
    message: string;
    role: 'user' | 'bot' | 'agent';
    userId?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export interface ConversationStatusChange {
    conversationId: string;
    status: 'auto' | 'human' | 'pending' | 'closed';
    assignedAgent?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface SocketIOError extends Error {
    description?: string;
    context?: unknown;
    type?: string;
}

export interface ChatServiceCallbacks {
    onMessage?: (message: WebSocketMessage) => void;
    onStatusChange?: (data: ConversationStatusChange) => void;
    onJoinedConversation?: (data: { conversationId: string }) => void;
    onError?: (error: { message: string }) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export class ChatService {
    private socket: Socket | null = null;
    private callbacks: ChatServiceCallbacks = {};
    private currentConversationId: string | null = null;
    private isAuthenticated: boolean = false;
    private connectionAttempts: number = 0;
    private maxAttempts: number = 2;
    private heartbeatTimeout: NodeJS.Timeout | null = null;
    private lastHeartbeat: number = 0;
    private heartbeatTimeoutDuration = 60000; // 60 seconds

    constructor(private token: string) {
        this.connect();
    }

    private connect() {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/chat';
        this.connectionAttempts++;

        console.log(
            `🔌 Connection attempt ${this.connectionAttempts}/${this.maxAttempts} to WebSocket:`,
            wsUrl,
        );

        if (this.connectionAttempts === 1 && this.token) {
            // First attempt: Try authenticated connection
            console.log('🔑 Attempting authenticated connection with JWT token');
            this.connectWithAuth(wsUrl);
        } else {
            // Second attempt or no token: Try unauthenticated connection (like widget)
            console.log('🔓 Attempting unauthenticated connection (widget mode)');
            this.connectWithoutAuth(wsUrl);
        }
    }

    private connectWithAuth(wsUrl: string) {
        console.log(
            '🔑 Using token:',
            this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN',
        );

        // Check if token is expired
        // Try to decode the token to check if it's valid
        if (this.token) {
            try {
                const tokenParts = this.token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('🔍 Token payload:', {
                        sub: payload.sub,
                        email: payload.email,
                        role: payload.role,
                        exp: payload.exp,
                        expired: payload.exp < Date.now() / 1000,
                    });

                    if (payload.exp < Date.now() / 1000) {
                        console.warn('⚠️ Token is expired, will try unauthenticated connection');
                        this.connectWithoutAuth(wsUrl);
                        return;
                    }
                } else {
                    console.warn('⚠️ Token format appears invalid (not JWT)');
                }
            } catch (e) {
                console.warn(
                    '⚠️ Could not decode token:',
                    e instanceof Error ? e.message : String(e),
                );
            }
        }

        this.socket = io(wsUrl, {
            auth: {
                token: this.token,
            },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true,
            reconnection: false, // We'll handle reconnection manually
            upgrade: true,
            rememberUpgrade: true,
            withCredentials: true, // Important for sticky sessions with ALB
        });

        this.isAuthenticated = true;
        this.setupEventListeners();
    }

    private connectWithoutAuth(wsUrl: string) {
        this.socket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true,
            reconnection: false, // We'll handle reconnection manually
            upgrade: true,
            rememberUpgrade: true,
            withCredentials: true, // Important for sticky sessions with ALB
        });

        this.isAuthenticated = false;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log(
                `✅ Connected to chat server successfully (${
                    this.isAuthenticated ? 'authenticated' : 'unauthenticated'
                } mode)`,
            );
            this.connectionAttempts = 0; // Reset attempts on successful connection
            this.callbacks.onConnect?.();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from chat server. Reason:', reason);
            this.callbacks.onDisconnect?.();
        });

        this.socket.on('connect_error', (error: SocketIOError) => {
            console.error('🚨 WebSocket connection error:', error);
            console.error('Error details:', {
                message: error.message,
                description: error.description,
                context: error.context,
                type: error.type,
            });

            // If this was an authenticated attempt and we haven't tried unauthenticated yet
            if (this.isAuthenticated && this.connectionAttempts < this.maxAttempts) {
                console.log('🔄 Authentication failed, retrying without authentication...');
                this.socket?.disconnect();
                setTimeout(() => this.connect(), 1000);
                return;
            }

            // If authentication failed, try to provide more specific error
            if (error.message && error.message.includes('Authentication')) {
                console.error('🔐 Authentication failed - JWT token might be invalid or expired');
                this.callbacks.onError?.({
                    message: 'Authentication failed - using fallback mode',
                });
            } else {
                this.callbacks.onError?.({ message: `Connection error: ${error.message}` });
            }
        });

        this.socket.on('joined-conversation', (data: { conversationId: string }) => {
            console.log('Joined conversation:', data.conversationId);
            this.callbacks.onJoinedConversation?.(data);
        });

        this.socket.on('new-message', (message: WebSocketMessage) => {
            console.log('New message received:', message);
            this.callbacks.onMessage?.(message);
        });

        this.socket.on('conversation-status-changed', (data: ConversationStatusChange) => {
            console.log('Conversation status changed:', data);
            this.callbacks.onStatusChange?.(data);
        });

        this.socket.on('error', (error: { message: string }) => {
            console.error('Chat error:', error);
            this.callbacks.onError?.(error);
        });

        // Heartbeat handling for connection health monitoring
        this.socket.on('heartbeat', (data: { timestamp: number }) => {
            this.lastHeartbeat = Date.now();
            // Respond to server heartbeat with server's timestamp for synchronization
            this.socket?.emit('heartbeat-response', {
                timestamp: Date.now(),
                serverTimestamp: data.timestamp,
            });

            // Reset heartbeat timeout
            if (this.heartbeatTimeout) {
                clearTimeout(this.heartbeatTimeout);
            }

            // Set new timeout to detect connection issues
            this.heartbeatTimeout = setTimeout(() => {
                console.warn('⚠️ Heartbeat timeout - connection may be lost');
                this.handleConnectionLoss();
            }, this.heartbeatTimeoutDuration);
        });
    }

    public setCallbacks(callbacks: ChatServiceCallbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    public joinConversation(conversationId: string) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        this.currentConversationId = conversationId;

        if (this.isAuthenticated) {
            // Authenticated mode: use join-conversation
            this.socket.emit('join-conversation', { conversationId });
        } else {
            // Unauthenticated mode: simulate widget behavior
            console.log('🔓 Joining conversation in unauthenticated mode (limited functionality)');
            // In unauthenticated mode, we can't join existing conversations
            // This is a limitation of the fallback mode
        }
    }

    public sendMessage(
        conversationId: string,
        message: string,
        role: 'user' | 'bot' | 'agent' = 'agent',
    ) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        if (this.isAuthenticated) {
            // Authenticated mode: use send-message
            this.socket.emit('send-message', {
                conversationId,
                message,
                role,
            });
        } else {
            // Unauthenticated mode: use widget-send-message
            console.log('🔓 Sending message in unauthenticated mode (widget style)');
            this.socket.emit('widget-send-message', {
                customerId: 'dashboard_user_' + Date.now(),
                conversationId,
                message,
                timestamp: new Date().toISOString(),
            });
        }
    }

    public leaveConversation() {
        if (this.currentConversationId && this.socket) {
            this.socket.emit('leave-conversation', {
                conversationId: this.currentConversationId,
            });
            this.currentConversationId = null;
        }
    }

    private handleConnectionLoss() {
        console.log('🔄 Handling connection loss - attempting reconnection...');
        if (this.socket) {
            this.socket.disconnect();
        }

        // Clear heartbeat timeout
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }

        // Reset connection attempts for reconnection
        this.connectionAttempts = 0;

        // Attempt to reconnect after a short delay
        setTimeout(() => {
            this.connect();
        }, 2000);
    }

    public disconnect() {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }

        if (this.socket) {
            this.leaveConversation();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    public getCurrentConversationId(): string | null {
        return this.currentConversationId;
    }

    public isAuthenticatedMode(): boolean {
        return this.isAuthenticated;
    }
}

// Singleton instance for the dashboard
let chatServiceInstance: ChatService | null = null;

export function getChatService(token?: string, forceNew: boolean = false): ChatService | null {
    // If we have an existing instance and it's connected, reuse it
    if (chatServiceInstance && !forceNew && chatServiceInstance.isConnected()) {
        console.log('♻️ getChatService: Reusing existing connected service');
        return chatServiceInstance;
    }

    if (forceNew || (!chatServiceInstance && token)) {
        if (chatServiceInstance) {
            console.log('🔄 getChatService: Disconnecting old service');
            chatServiceInstance.disconnect();
        }
        console.log('🆕 getChatService: Creating new service');
        chatServiceInstance = new ChatService(token!);
    }
    return chatServiceInstance;
}

export function disconnectChatService() {
    if (chatServiceInstance) {
        chatServiceInstance.disconnect();
        chatServiceInstance = null;
    }
}
