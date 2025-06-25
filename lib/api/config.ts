// API Configuration for bosar Dashboard
// Based on the NestJS backend API endpoints

// Environment-aware API URL configuration
const getApiBaseUrl = (): string => {
    // If explicitly set via environment variable, use that
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        console.log(
            '🔧 Using API URL from environment variable:',
            process.env.NEXT_PUBLIC_API_BASE_URL,
        );
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }

    // Always return localhost for SSR to avoid hydration mismatches
    // Client-side detection will happen in the API client initialization
    console.log('💻 Using default API URL for SSR: http://localhost:3001');
    return 'http://localhost:3001';
};

export const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: 10000, // 10 seconds
    HEADERS: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
} as const;

// API Endpoints organized by feature
export const API_ENDPOINTS = {
    // Health Check
    HEALTH: {
        ROOT: '/',
        CHECK: '/health',
    },

    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },

    // Users Management
    USERS: {
        BASE: '/users',
        CREATE: '/users',
        GET_ALL: '/users',
        GET_PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        GET_BY_ID: (id: string) => `/users/${id}`,
        UPDATE_BY_ID: (id: string) => `/users/${id}`,
        DELETE_BY_ID: (id: string) => `/users/${id}`,
    },

    // Bot Settings
    BOT_SETTINGS: {
        BASE: '/bot-settings',
        CREATE: '/bot-settings',
        GET_ALL: '/bot-settings',
        GET_LATEST: '/bot-settings/latest',
        GET_BY_ID: (id: string) => `/bot-settings/${id}`,
        UPDATE_BY_ID: (id: string) => `/bot-settings/${id}`,
        DELETE_BY_ID: (id: string) => `/bot-settings/${id}`,
    },

    // FAQ Management
    FAQ: {
        BASE: '/faq',
        CREATE: '/faq',
        GET_ALL: '/faq',
        GET_BY_BOT_SETTINGS: (botSettingsId: string) => `/faq?botSettingsId=${botSettingsId}`,
        GET_BY_ID: (id: string) => `/faq/${id}`,
        UPDATE_BY_ID: (id: string) => `/faq/${id}`,
        DELETE_BY_ID: (id: string) => `/faq/${id}`,
    },

    // PDF Documents
    PDF_DOCUMENTS: {
        BASE: '/pdf-documents',
        CREATE: '/pdf-documents',
        UPLOAD: '/pdf-documents/upload',
        GET_ALL: '/pdf-documents',
        SEARCH: '/pdf-documents/search',
        GET_BY_ID: (id: string) => `/pdf-documents/${id}`,
        UPDATE_BY_ID: (id: string) => `/pdf-documents/${id}`,
        DELETE_BY_ID: (id: string) => `/pdf-documents/${id}`,
    },

    // Conversations
    CONVERSATIONS: {
        BASE: '/conversations',
        CREATE: '/conversations',
        GET_ALL: '/conversations',
        GET_BY_ID: (id: string) => `/conversations/${id}`,
        UPDATE_BY_ID: (id: string) => `/conversations/${id}`,
        DELETE_BY_ID: (id: string) => `/conversations/${id}`,
        ADD_MESSAGE: (id: string) => `/conversations/${id}/messages`,
        HUMAN_TAKEOVER: (id: string) => `/conversations/${id}/human-takeover`,
    },

    // Chat Messages
    CHAT_MESSAGES: {
        BASE: '/chat-messages',
        CREATE: '/chat-messages',
        GET_BY_CONVERSATION: (conversationId: string) =>
            `/chat-messages/conversation/${conversationId}`,
        GET_BY_ID: (id: string) => `/chat-messages/${id}`,
        DELETE_BY_ID: (id: string) => `/chat-messages/${id}`,
    },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    PUT: 'PUT',
    DELETE: 'DELETE',
} as const;

// Response Status Codes
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// API Tags (for organization)
export const API_TAGS = {
    HEALTH: 'Health',
    AUTH: 'Authentication',
    USERS: 'Users',
    BOT_SETTINGS: 'Bot Settings',
    FAQ: 'FAQ',
    PDF_DOCUMENTS: 'PDF Documents',
    CONVERSATIONS: 'Conversations',
    CHAT_MESSAGES: 'Chat Messages',
} as const;
