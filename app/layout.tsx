import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
    title: 'BoSar Dashboard',
    description: 'A web app for managing chats with customers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="antialiased" suppressHydrationWarning={true}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
