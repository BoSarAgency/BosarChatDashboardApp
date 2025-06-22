'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { UpdateBotSettingsDto } from '@/lib/api/types';

const BOT_SETTINGS_ID = '106c3cac-0e27-4cc4-851c-921be1b7eeb9';

const MODEL_OPTIONS = ['gpt-4', 'gpt-4.1', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini'];

export default function AgentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        model: '',
        temperature: 0.7,
        systemInstructions: '',
    });

    useEffect(() => {
        const fetchBotSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const settings = await apiClient.getBotSettingsById(BOT_SETTINGS_ID);

                // Populate form data
                setFormData({
                    model: settings.model,
                    temperature: settings.temperature,
                    systemInstructions: settings.systemInstructions,
                });
            } catch (err) {
                console.error('Error fetching bot settings:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch bot settings');
            } finally {
                setLoading(false);
            }
        };

        fetchBotSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setUpdating(true);
            setError(null);

            const updateData: UpdateBotSettingsDto = {
                model: formData.model,
                temperature: formData.temperature,
                systemInstructions: formData.systemInstructions,
            };

            await apiClient.updateBotSettings(BOT_SETTINGS_ID, updateData);

            // Show success message (you could add a toast notification here)
            console.log('Bot settings updated successfully');
        } catch (err) {
            console.error('Error updating bot settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to update bot settings');
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Agent Settings</h1>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading bot settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Agent Settings</h1>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Bot Configuration</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure the AI agent settings
                        </p>
                    </div>

                    <div className="px-6 py-4 space-y-6">
                        {/* Model Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Model
                            </label>
                            <select
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                required
                            >
                                <option value="">Select a model</option>
                                {MODEL_OPTIONS.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Temperature Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temperature
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.temperature}
                                onChange={(e) =>
                                    handleInputChange('temperature', parseFloat(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Controls randomness in responses (0.0 = deterministic, 1.0 = very
                                creative)
                            </p>
                        </div>

                        {/* System Instructions Textarea */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                System Instructions
                            </label>
                            <textarea
                                value={formData.systemInstructions}
                                onChange={(e) =>
                                    handleInputChange('systemInstructions', e.target.value)
                                }
                                rows={20}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                placeholder="Enter system instructions for the AI agent..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Instructions that guide the AI agent&apos;s behavior and responses
                            </p>
                        </div>
                    </div>

                    {/* Update Button */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={updating}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Settings'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
