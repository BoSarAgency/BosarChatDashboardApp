// API Client for ACGQ Dashboard
// Centralized HTTP client with all API endpoints

import { API_CONFIG, API_ENDPOINTS, HTTP_METHODS, STATUS_CODES } from './config';
import type {
    ApiError,
    ApiResponse,
    BotSettings,
    ChatMessage,
    Conversation,
    CreateBotSettingsDto,
    CreateChatMessageDto,
    CreateConversationDto,
    CreateFaqDto,
    CreateMessageDto,
    CreatePdfDocumentDto,
    CreateUserDto,
    FAQ,
    ForgotPasswordDto,
    HealthResponse,
    HumanTakeoverDto,
    LoginDto,
    LoginResponse,
    PdfDocument,
    ResetPasswordDto,
    ResetPasswordResponse,
    UpdateBotSettingsDto,
    UpdateConversationDto,
    UpdateFaqDto,
    UpdatePdfDocumentDto,
    UpdateProfileDto,
    UpdateUserDto,
    User,
} from './types';

// HTTP Client class
class ApiClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;
    private authToken: string | null = null;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.defaultHeaders = { ...API_CONFIG.HEADERS };

        // Update base URL on client side to avoid hydration mismatches
        this.updateBaseUrlForEnvironment();
    }

    // Update base URL based on environment (client-side only)
    private updateBaseUrlForEnvironment() {
        // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }

        // If explicitly set via environment variable, keep that
        if (process.env.NEXT_PUBLIC_API_BASE_URL) {
            return;
        }

        const hostname = window.location.hostname;
        console.log('🌐 Detecting API URL for hostname:', hostname);

        // Production environment
        if (hostname.includes('acgq.click') || hostname.includes('amplifyapp.com')) {
            console.log('🚀 Production environment detected, updating to: https://api.acgq.click');
            this.baseURL = 'https://api.acgq.click';
            return;
        }

        // Staging environment (if needed in the future)
        if (hostname.includes('staging') || hostname.includes('dev')) {
            console.log(
                '🧪 Staging environment detected, updating to: https://staging-api.acgq.click',
            );
            this.baseURL = 'https://staging-api.acgq.click';
            return;
        }

        // Keep localhost for development
        console.log('💻 Development environment confirmed, keeping: http://localhost:3001');
    }

    // Set authentication token
    setAuthToken(token: string) {
        this.authToken = token;
    }

    // Clear authentication token
    clearAuthToken() {
        this.authToken = null;
    }

    // Get headers with auth token if available
    private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
        const headers = { ...this.defaultHeaders, ...customHeaders };

        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    // Generic HTTP request method
    private async request<T = unknown>(
        endpoint: string,
        options: {
            method?: string;
            body?: unknown;
            headers?: Record<string, string>;
            params?: Record<string, string>;
        } = {},
    ): Promise<T> {
        const { method = HTTP_METHODS.GET, body, headers: customHeaders, params } = options;

        // Build URL with query parameters
        let url = `${this.baseURL}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        const config: RequestInit = {
            method,
            headers: this.getHeaders(customHeaders),
        };

        // Add body for non-GET requests
        if (body && method !== HTTP_METHODS.GET) {
            // Don't JSON.stringify FormData - let browser handle it
            if (body instanceof FormData) {
                config.body = body;
                // Remove Content-Type header for FormData - browser will set it with boundary
                if (config.headers && 'Content-Type' in config.headers) {
                    delete (config.headers as Record<string, string>)['Content-Type'];
                }
            } else {
                config.body = JSON.stringify(body);
            }
        }

        try {
            const response = await fetch(url, config);

            // Handle different response types
            let data: unknown;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorData = data as { message?: string; error?: string };
                throw {
                    message: errorData.message || 'Request failed',
                    statusCode: response.status,
                    error: errorData.error || response.statusText,
                } as ApiError;
            }

            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw {
                    message: error.message,
                    statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
                    error: 'Network Error',
                } as ApiError;
            }
            throw error;
        }
    }

    // Health Check endpoints
    async healthCheck(): Promise<string> {
        return this.request(API_ENDPOINTS.HEALTH.ROOT);
    }

    async healthStatus(): Promise<HealthResponse> {
        return this.request(API_ENDPOINTS.HEALTH.CHECK);
    }

    // Authentication endpoints
    async login(credentials: LoginDto): Promise<LoginResponse> {
        return this.request(API_ENDPOINTS.AUTH.LOGIN, {
            method: HTTP_METHODS.POST,
            body: credentials,
        });
    }

    async forgotPassword(data: ForgotPasswordDto): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    async resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
        return this.request(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    // Users endpoints
    async getUsers(): Promise<User[]> {
        return this.request(API_ENDPOINTS.USERS.GET_ALL);
    }

    async createUser(userData: CreateUserDto): Promise<User> {
        return this.request(API_ENDPOINTS.USERS.CREATE, {
            method: HTTP_METHODS.POST,
            body: userData,
        });
    }

    async getUserProfile(): Promise<User> {
        return this.request(API_ENDPOINTS.USERS.GET_PROFILE);
    }

    async updateUserProfile(data: UpdateProfileDto): Promise<User> {
        return this.request(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async getUserById(id: string): Promise<User> {
        return this.request(API_ENDPOINTS.USERS.GET_BY_ID(id));
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        return this.request(API_ENDPOINTS.USERS.UPDATE_BY_ID(id), {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async deleteUser(id: string): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.USERS.DELETE_BY_ID(id), {
            method: HTTP_METHODS.DELETE,
        });
    }

    // Bot Settings endpoints
    async getBotSettings(): Promise<BotSettings[]> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.GET_ALL);
    }

    async createBotSettings(data: CreateBotSettingsDto): Promise<BotSettings> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.CREATE, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    async getLatestBotSettings(): Promise<BotSettings> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.GET_LATEST);
    }

    async getBotSettingsById(id: string): Promise<BotSettings> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.GET_BY_ID(id));
    }

    async updateBotSettings(id: string, data: UpdateBotSettingsDto): Promise<BotSettings> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.UPDATE_BY_ID(id), {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async deleteBotSettings(id: string): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.BOT_SETTINGS.DELETE_BY_ID(id), {
            method: HTTP_METHODS.DELETE,
        });
    }

    // FAQ endpoints
    async getFAQs(botSettingsId?: string): Promise<FAQ[]> {
        const endpoint = botSettingsId
            ? API_ENDPOINTS.FAQ.GET_BY_BOT_SETTINGS(botSettingsId)
            : API_ENDPOINTS.FAQ.GET_ALL;
        return this.request(endpoint);
    }

    async createFAQ(data: CreateFaqDto): Promise<FAQ> {
        return this.request(API_ENDPOINTS.FAQ.CREATE, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    async getFAQById(id: string): Promise<FAQ> {
        return this.request(API_ENDPOINTS.FAQ.GET_BY_ID(id));
    }

    async updateFAQ(id: string, data: UpdateFaqDto): Promise<FAQ> {
        return this.request(API_ENDPOINTS.FAQ.UPDATE_BY_ID(id), {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async deleteFAQ(id: string): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.FAQ.DELETE_BY_ID(id), {
            method: HTTP_METHODS.DELETE,
        });
    }

    // PDF Documents endpoints
    async getPdfDocuments(): Promise<PdfDocument[]> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.GET_ALL);
    }

    async createPdfDocument(data: CreatePdfDocumentDto): Promise<PdfDocument> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.CREATE, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    async uploadPdfDocument(file: File): Promise<PdfDocument> {
        const formData = new FormData();
        formData.append('file', file);
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.UPLOAD, {
            method: HTTP_METHODS.POST,
            body: formData,
            headers: {}, // Let browser set Content-Type for FormData
        });
    }

    async searchPdfDocuments(query: string): Promise<unknown> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.SEARCH, {
            params: { q: query },
        });
    }

    async getPdfDocumentById(id: string): Promise<PdfDocument> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.GET_BY_ID(id));
    }

    async updatePdfDocument(id: string, data: UpdatePdfDocumentDto): Promise<PdfDocument> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.UPDATE_BY_ID(id), {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async deletePdfDocument(id: string): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.PDF_DOCUMENTS.DELETE_BY_ID(id), {
            method: HTTP_METHODS.DELETE,
        });
    }

    // Conversations endpoints
    async getConversations(): Promise<Conversation[]> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.GET_ALL);
    }

    async createConversation(data: CreateConversationDto): Promise<Conversation> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.CREATE, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    async getConversationById(id: string): Promise<Conversation> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id));
    }

    async updateConversation(id: string, data: UpdateConversationDto): Promise<Conversation> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.UPDATE_BY_ID(id), {
            method: HTTP_METHODS.PATCH,
            body: data,
        });
    }

    async deleteConversation(id: string): Promise<ApiResponse> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.DELETE_BY_ID(id), {
            method: HTTP_METHODS.DELETE,
        });
    }

    async addMessageToConversation(id: string, message: CreateMessageDto): Promise<unknown> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.ADD_MESSAGE(id), {
            method: HTTP_METHODS.POST,
            body: message,
        });
    }

    async triggerHumanTakeover(id: string, data: HumanTakeoverDto): Promise<unknown> {
        return this.request(API_ENDPOINTS.CONVERSATIONS.HUMAN_TAKEOVER(id), {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }

    // Chat Messages endpoints
    async getConversationMessages(
        conversationId: string,
        params?: {
            limit?: number;
            offset?: number;
            after?: string;
            before?: string;
        },
    ): Promise<{
        messages: ChatMessage[];
        pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    }> {
        return this.request(API_ENDPOINTS.CHAT_MESSAGES.GET_BY_CONVERSATION(conversationId), {
            params: params
                ? Object.fromEntries(
                      Object.entries(params).map(([key, value]) => [key, String(value)]),
                  )
                : undefined,
        });
    }

    async sendChatMessage(data: CreateChatMessageDto): Promise<ChatMessage> {
        return this.request(API_ENDPOINTS.CHAT_MESSAGES.CREATE, {
            method: HTTP_METHODS.POST,
            body: data,
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
