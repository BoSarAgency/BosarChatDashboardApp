// TypeScript interfaces for ACGQ API
// Based on the NestJS backend DTOs and Prisma schema

// Common types
export type UserRole = 'admin' | 'agent';

export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
}

// Authentication types
export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    access_token: string;
    user: User;
    message: string;
}

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: UserRole;
}

export interface UpdateProfileDto {
    name?: string;
    password?: string;
}

// Bot Settings types
export interface BotSettings {
    id: string;
    model: string;
    temperature: number;
    systemInstructions: string;
    tools: Record<string, unknown>; // JSON field
    createdAt: string;
    updatedAt: string;
}

export interface CreateBotSettingsDto {
    model: string;
    temperature: number;
    systemInstructions: string;
    tools?: Record<string, unknown>;
}

export interface UpdateBotSettingsDto {
    model?: string;
    temperature?: number;
    systemInstructions?: string;
    tools?: Record<string, unknown>;
}

// FAQ types
export interface FAQ {
    id: string;
    question: string;
    answer: string;
    botSettingsId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFaqDto {
    question: string;
    answer: string;
    botSettingsId: string;
}

export interface UpdateFaqDto {
    question?: string;
    answer?: string;
    botSettingsId?: string;
}

// PDF Document types
export interface PdfDocument {
    id: string;
    fileName: string;
    url: string;
    chunks?: Record<string, unknown>; // JSON field
    uploadedById: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePdfDocumentDto {
    fileName: string;
    url: string;
    chunks?: Record<string, unknown>;
}

export interface UpdatePdfDocumentDto {
    fileName?: string;
    url?: string;
    chunks?: Record<string, unknown>;
}

// Conversation types
export interface Conversation {
    id: string;
    customerId: string;
    status: 'auto' | 'human' | 'pending' | 'closed';
    userId?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
    messagesAmount?: number;
    messages?: ChatMessage[];
    _count?: {
        chatMessages: number;
    };
}

export interface CreateConversationDto {
    customerName: string;
    customerEmail: string;
}

export interface UpdateConversationDto {
    customerName?: string;
    customerEmail?: string;
    status?: 'auto' | 'human' | 'pending' | 'closed';
    assignedAgentId?: string;
}

// Chat Message types
export interface ChatMessage {
    id: string;
    conversationId: string;
    message: string;
    role: 'user' | 'bot' | 'agent';
    createdAt: string;
    userId?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreateMessageDto {
    content: string;
    sender: 'customer' | 'bot' | 'agent';
}

export interface CreateChatMessageDto {
    conversationId: string;
    message: string;
    role: 'user' | 'bot' | 'agent';
    userId?: string;
}

// Human Takeover types
export interface HumanTakeoverDto {
    reason: string;
}

// Health Check types
export interface HealthResponse {
    status: string;
    timestamp: string;
    service: string;
    version: string;
}

// API Error types
export interface ApiError {
    message: string;
    error?: string;
    statusCode: number;
}

// Pagination types
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
