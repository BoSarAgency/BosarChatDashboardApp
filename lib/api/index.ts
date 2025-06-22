// ACGQ API - Main export file
// Centralized exports for all API utilities

// Configuration
export { API_CONFIG, API_ENDPOINTS, API_TAGS, HTTP_METHODS, STATUS_CODES } from './config';

// Types
export type {
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
    PaginatedResponse,
    PaginationParams,
    PdfDocument,
    ResetPasswordDto,
    UpdateBotSettingsDto,
    UpdateConversationDto,
    UpdateFaqDto,
    UpdatePdfDocumentDto,
    UpdateProfileDto,
    UpdateUserDto,
    User,
    UserRole,
} from './types';

// API Client
export { apiClient, apiClient as default } from './client';

// React Hooks
export {
    useAuth,
    useBotSettings,
    useBotSettingsById,
    useConversation,
    useConversationMessages,
    useConversations,
    useCreateConversation,
    useCreateUser,
    useDeleteUser,
    useFAQById,
    useFAQs,
    useForgotPassword,
    useLatestBotSettings,
    useMutation,
    usePdfDocument,
    usePdfDocuments,
    useResetPassword,
    useSendChatMessage,
    useTriggerHumanTakeover,
    useUpdateProfile,
    useUpdateUser,
    useUploadPdfDocument,
    useUser,
    useUserProfile,
    useUsers,
} from './hooks';
