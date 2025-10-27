import React from 'react';
import type { ContactInfo } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';


interface ContactDisplayProps {
    contactInfo: ContactInfo;
    onUpdate: (field: keyof ContactInfo, value: string) => void;
    isWebsiteValid: boolean | null;
    isRecording: boolean;
    isTranscribing: boolean;
    onToggleRecording: () => void;
}

export const ContactDisplay: React.FC<ContactDisplayProps> = ({
    contactInfo,
    onUpdate,
    isWebsiteValid,
    isRecording,
    isTranscribing,
    onToggleRecording
}) => {
    const getWebsiteValidationClasses = () => {
        if (isWebsiteValid === true) return 'border-green-500 focus:ring-green-500 focus:border-green-500';
        if (isWebsiteValid === false) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
        return 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    };

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Extracted Contact Information</h3>
                <p className="mt-1 text-sm text-gray-500">Please review and edit the information below if needed.</p>
            </div>

            {/* Contact Details Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Field
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {/* First Name */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                First Name
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="text"
                                    value={contactInfo.firstName}
                                    onChange={(e) => onUpdate('firstName', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Last Name */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Last Name
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="text"
                                    value={contactInfo.lastName}
                                    onChange={(e) => onUpdate('lastName', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Title */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Title
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="text"
                                    value={contactInfo.title}
                                    onChange={(e) => onUpdate('title', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Company */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Company
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="text"
                                    value={contactInfo.company}
                                    onChange={(e) => onUpdate('company', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Phone */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Phone
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="tel"
                                    value={contactInfo.phone}
                                    onChange={(e) => onUpdate('phone', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Email */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Email
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="email"
                                    value={contactInfo.email}
                                    onChange={(e) => onUpdate('email', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>

                        {/* Website with validation */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Website
                            </td>
                            <td className="px-3 py-4">
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={contactInfo.website}
                                        onChange={(e) => onUpdate('website', e.target.value)}
                                        className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm text-black ${getWebsiteValidationClasses()}`}
                                        placeholder="N/A"
                                    />
                                    {isWebsiteValid === true && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {isWebsiteValid === false && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <XCircleIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>

                        {/* Address */}
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                Address
                            </td>
                            <td className="px-3 py-4">
                                <input
                                    type="text"
                                    value={contactInfo.address}
                                    onChange={(e) => onUpdate('address', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                    placeholder="N/A"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Contact Notes Section (outside table for better UX) */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="contact-notes" className="block text-sm font-semibold text-gray-900">
                        Contact Notes
                    </label>
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        disabled={isTranscribing}
                        className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        aria-label={isRecording ? 'Stop recording contact notes' : 'Start recording contact notes'}
                    >
                        {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                    </button>
                </div>
                <div className="relative">
                    <textarea
                        id="contact-notes"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100 text-black"
                        placeholder="Add permanent notes for this contact..."
                        value={contactInfo.notes}
                        onChange={(e) => onUpdate('notes', e.target.value)}
                    />
                    {isTranscribing && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                            <span className="text-sm font-medium text-gray-600 animate-pulse">Transcribing...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};