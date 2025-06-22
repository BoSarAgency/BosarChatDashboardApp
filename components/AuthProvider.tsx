'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/api';
import type { User, ApiError, LoginResponse } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: ApiError | null;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    loadUserProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth/signin', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.isAuthenticated && !isPublicRoute) {
                // Redirect unauthenticated users to sign-in
                router.push('/auth/signin');
            } else if (auth.isAuthenticated && isPublicRoute) {
                // Redirect authenticated users away from public routes to dashboard
                router.push('/dashboard/conversations');
            }
        }
    }, [auth.loading, auth.isAuthenticated, isPublicRoute, router]);

    // Show loading spinner while checking authentication
    if (auth.loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
