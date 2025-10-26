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

const ContactField: React.FC<{ label: string; value: string; onUpdate: (value: string) => void; placeholder?: string }> = ({ label, value, onUpdate, placeholder="N/A" }) => (
    <div>
        <label className="block text-base font-semibold text-gray-700">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onUpdate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            placeholder={placeholder}
        />
    </div>
);

export const ContactDisplay: React.FC<ContactDisplayProps> = ({ 
    contactInfo, 
    onUpdate, 
    isWebsiteValid,
    isRecording,
    isTranscribing,
    onToggleRecording 
}) => {
    const websiteBorderColor = isWebsiteValid === true ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                           : isWebsiteValid === false ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                           : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Extracted Contact Information</h3>
            <p className="text-sm text-gray-500">Please review and edit the information below if needed.</p>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <ContactField label="First Name" value={contactInfo.firstName} onUpdate={(val) => onUpdate('firstName', val)} />
                <ContactField label="Last Name" value={contactInfo.lastName} onUpdate={(val) => onUpdate('lastName', val)} />
                <ContactField label="Title" value={contactInfo.title} onUpdate={(val) => onUpdate('title', val)} />
                <ContactField label="Company" value={contactInfo.company} onUpdate={(val) => onUpdate('company', val)} />
                <div className="sm:col-span-2">
                    <ContactField label="Phone" value={contactInfo.phone} onUpdate={(val) => onUpdate('phone', val)} />
                </div>
                <div className="sm:col-span-2">
                    <ContactField label="Email" value={contactInfo.email} onUpdate={(val) => onUpdate('email', val)} />
                </div>
                <div className="sm:col-span-2">
                    <div>
                        <label className="block text-base font-semibold text-gray-700">Website</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={contactInfo.website}
                                onChange={(e) => onUpdate('website', e.target.value)}
                                className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm text-black ${websiteBorderColor}`}
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
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <ContactField label="Address" value={contactInfo.address} onUpdate={(val) => onUpdate('address', val)} />
                </div>
                <div className="sm:col-span-2">
                    <ContactField 
                        label="Tags" 
                        value={contactInfo.tags} 
                        onUpdate={(val) => onUpdate('tags', val)} 
                        placeholder="prospect, conference2024, tech"
                    />
                     <p className="mt-1 text-xs text-gray-500">Comma-separated tags for organization.</p>
                </div>
                 <div className="sm:col-span-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="contact-notes" className="block text-base font-semibold text-gray-700">
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
                    <div className="mt-1 relative">
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
        </div>
    );
};