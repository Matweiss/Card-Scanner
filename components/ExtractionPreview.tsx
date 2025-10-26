import React from 'react';
import type { ContactInfo } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ExtractionPreviewProps {
    fieldStatus: Record<keyof ContactInfo, boolean> | null;
    isLoading: boolean;
}

const fieldLabels: Record<Exclude<keyof ContactInfo, 'notes' | 'tags'>, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    title: 'Title',
    company: 'Company',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    address: 'Address',
};

export const ExtractionPreview: React.FC<ExtractionPreviewProps> = ({ fieldStatus, isLoading }) => {
    if (isLoading) {
        return (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
                <p className="text-sm font-medium text-gray-600 animate-pulse">Performing quick scan...</p>
            </div>
        );
    }

    if (!fieldStatus) {
        return null; // Don't show anything if there's no status yet
    }

    return (
        <div className="mt-6 space-y-3 p-4 border rounded-lg bg-gray-50">
            <div>
                <h3 className="text-md font-semibold text-gray-800">Information Check</h3>
                <p className="text-sm text-gray-500">
                    Here's what the AI could quickly identify. Add any missing details in the notes below.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {Object.entries(fieldLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                        {fieldStatus[key as keyof ContactInfo] ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${fieldStatus[key as keyof ContactInfo] ? 'text-gray-700' : 'text-red-600 font-medium'}`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};