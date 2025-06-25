// React hooks for bosar API integration
// Custom hooks for common API operations

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from './client';
import type {
    ApiError,
    CreateChatMessageDto,
    CreateConversationDto,
    CreateUserDto,
    ResetPasswordResponse,
    UpdateProfileDto,
    UpdateUserDto,
    User,
} from './types';

// Generic hook state interface
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

// Generic hook for API calls
function useApiCall<T>(
    apiCall: () => Promise<T>,
    dependencies: unknown[] = [],
): ApiState<T> & { refetch: () => Promise<void> } {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const data = await apiCall();
            setState({ data, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as ApiError });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiCall, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        ...state,
        refetch: fetchData,
    };
}

// Authentication hooks
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<ApiError | null>(null);
    const [mounted, setMounted] = useState(false);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.login({ email, password });
            apiClient.setAuthToken(response.access_token);

            // Store token in localStorage only on client side
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.access_token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            // Then update state
            setUser(response.user);
            setIsAuthenticated(true);

            return response;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        apiClient.clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);

        // Clear localStorage only on client side
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    };

    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await apiClient.getUserProfile();
            setUser(profile);

            // Store in localStorage only on client side
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(profile));
            }

            return profile;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            // If profile loading fails, clear auth state
            logout();
            throw error;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        // Only run on client side
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');

            if (token) {
                apiClient.setAuthToken(token);

                // Try to load fresh user profile from API
                try {
                    const profile = await loadUserProfile();
                    setIsAuthenticated(true);
                    setUser(profile);
                } catch {
                    // If API call fails, fall back to localStorage data
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        setUser(JSON.parse(userData));
                        setIsAuthenticated(true);
                    } else {
                        logout();
                    }
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [loadUserProfile]);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            checkAuth();
        }
    }, [mounted, checkAuth]);

    return {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
        loadUserProfile,
    };
}

// Users hooks
export function useUsers() {
    const getUsersCall = useCallback(() => apiClient.getUsers(), []);
    return useApiCall(getUsersCall);
}

export function useUser(id: string) {
    const getUserCall = useCallback(() => apiClient.getUserById(id), [id]);
    return useApiCall(getUserCall, [id]);
}

export function useUserProfile() {
    const getUserProfileCall = useCallback(() => apiClient.getUserProfile(), []);
    return useApiCall(getUserProfileCall);
}

export function useCreateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const createUser = async (userData: CreateUserDto) => {
        setLoading(true);
        setError(null);
        try {
            const user = await apiClient.createUser(userData);
            return user;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { createUser, loading, error };
}

export function useUpdateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const updateUser = async (id: string, userData: UpdateUserDto) => {
        setLoading(true);
        setError(null);
        try {
            const user = await apiClient.updateUser(id, userData);
            return user;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { updateUser, loading, error };
}

export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const updateProfile = async (profileData: UpdateProfileDto) => {
        setLoading(true);
        setError(null);
        try {
            const user = await apiClient.updateUserProfile(profileData);
            return user;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, loading, error };
}

export function useDeleteUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const deleteUser = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.deleteUser(id);
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { deleteUser, loading, error };
}

// Bot Settings hooks
export function useBotSettings() {
    const getBotSettingsCall = useCallback(() => apiClient.getBotSettings(), []);
    return useApiCall(getBotSettingsCall);
}

export function useLatestBotSettings() {
    const getLatestBotSettingsCall = useCallback(() => apiClient.getLatestBotSettings(), []);
    return useApiCall(getLatestBotSettingsCall);
}

export function useBotSettingsById(id: string) {
    const getBotSettingsByIdCall = useCallback(() => apiClient.getBotSettingsById(id), [id]);
    return useApiCall(getBotSettingsByIdCall, [id]);
}

// FAQ hooks
export function useFAQs(botSettingsId?: string) {
    const getFAQsCall = useCallback(() => apiClient.getFAQs(botSettingsId), [botSettingsId]);
    return useApiCall(getFAQsCall, [botSettingsId]);
}

export function useFAQById(id: string) {
    const getFAQByIdCall = useCallback(() => apiClient.getFAQById(id), [id]);
    return useApiCall(getFAQByIdCall, [id]);
}

// Conversations hooks
export function useConversations() {
    const getConversationsCall = useCallback(() => apiClient.getConversations(), []);
    return useApiCall(getConversationsCall);
}

export function useConversation(id: string) {
    const getConversationCall = useCallback(() => apiClient.getConversationById(id), [id]);
    return useApiCall(getConversationCall, [id]);
}

export function useCreateConversation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const createConversation = async (data: CreateConversationDto) => {
        setLoading(true);
        setError(null);
        try {
            const conversation = await apiClient.createConversation(data);
            return conversation;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { createConversation, loading, error };
}

// Chat Messages hooks
export function useConversationMessages(conversationId: string) {
    const getMessagesCall = useCallback(
        () => apiClient.getConversationMessages(conversationId),
        [conversationId],
    );
    return useApiCall(getMessagesCall, [conversationId]);
}

export function useSendChatMessage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const sendMessage = async (data: CreateChatMessageDto) => {
        setLoading(true);
        setError(null);
        try {
            const message = await apiClient.sendChatMessage(data);
            return message;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading, error };
}

export function useTriggerHumanTakeover() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const triggerTakeover = async (conversationId: string, reason?: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.triggerHumanTakeover(conversationId, {
                reason: reason || 'Manual takeover',
            });
            return result;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { triggerTakeover, loading, error };
}

// PDF Documents hooks
export function usePdfDocuments() {
    const getPdfDocumentsCall = useCallback(() => apiClient.getPdfDocuments(), []);
    return useApiCall(getPdfDocumentsCall);
}

export function usePdfDocument(id: string) {
    const getPdfDocumentCall = useCallback(() => apiClient.getPdfDocumentById(id), [id]);
    return useApiCall(getPdfDocumentCall, [id]);
}

export function useUploadPdfDocument() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [progress, setProgress] = useState(0);

    const uploadPdf = async (file: File) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            // Note: For real progress tracking, you'd need to implement
            // a custom fetch with progress tracking
            const document = await apiClient.uploadPdfDocument(file);
            setProgress(100);
            return document;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { uploadPdf, loading, error, progress };
}

// Generic mutation hook for create/update/delete operations
export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [data, setData] = useState<TData | null>(null);

    const mutate = async (variables: TVariables) => {
        setLoading(true);
        setError(null);
        try {
            const result = await mutationFn(variables);
            setData(result);
            return result;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    return {
        mutate,
        data,
        loading,
        error,
        reset,
    };
}

// Forgot Password hook
export function useForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [success, setSuccess] = useState(false);

    const forgotPassword = async (email: string) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await apiClient.forgotPassword({ email });
            setSuccess(true);
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setError(null);
        setSuccess(false);
        setLoading(false);
    };

    return {
        forgotPassword,
        loading,
        error,
        success,
        reset,
    };
}

// Reset Password hook
export function useResetPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [success, setSuccess] = useState(false);
    const [resetResponse, setResetResponse] = useState<ResetPasswordResponse | null>(null);

    const resetPassword = async (token: string, newPassword: string) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setResetResponse(null);

        try {
            const response = await apiClient.resetPassword({ token, newPassword });
            setResetResponse(response);
            setSuccess(true);
            return response;
        } catch (error) {
            setError(error as ApiError);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setError(null);
        setSuccess(false);
        setLoading(false);
        setResetResponse(null);
    };

    return {
        resetPassword,
        loading,
        error,
        success,
        resetResponse,
        reset,
    };
}
