'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthContext } from '@/components/AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuthContext();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render dashboard if not authenticated (AuthProvider will handle redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 bg-white overflow-auto">
                    <div className="p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
