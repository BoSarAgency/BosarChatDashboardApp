'use client';

import { useState } from 'react';
import { useForgotPassword } from '@/lib/api';

// Test component to verify forgot password functionality
// This can be used for testing purposes
export default function ForgotPasswordTest() {
    const [email, setEmail] = useState('test@example.com');
    const { forgotPassword, loading, error, success, reset } = useForgotPassword();

    const handleTest = async () => {
        try {
            await forgotPassword(email);
        } catch (error) {
            console.error('Test failed:', error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Forgot Password API Test</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Email:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter test email"
                    />
                </div>

                <button
                    onClick={handleTest}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    {loading ? 'Testing...' : 'Test Forgot Password API'}
                </button>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <strong>Error:</strong> {error.message}
                        <br />
                        <small>Status: {error.statusCode}</small>
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        <strong>Success!</strong> Password reset email would be sent to {email}
                    </div>
                )}

                {(error || success) && (
                    <button
                        onClick={reset}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Reset Test
                    </button>
                )}
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">API Details:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Endpoint:</strong> POST /auth/forgot-password</li>
                    <li><strong>Payload:</strong> {`{ email: "${email}" }`}</li>
                    <li><strong>Hook:</strong> useForgotPassword()</li>
                    <li><strong>Status:</strong> {loading ? 'Loading...' : success ? 'Success' : error ? 'Error' : 'Ready'}</li>
                </ul>
            </div>
        </div>
    );
}
