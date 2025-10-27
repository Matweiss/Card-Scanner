import React from 'react';
import type { ContactInfo } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SaveIcon } from './icons/SaveIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface ActionButtonsProps {
    contactInfo: ContactInfo;
    draftedEmail: string;
    isLoading: boolean;
    loadingText: string;
    onGenerateEmail: () => void;
    onCopyToClipboard: () => void;
    onSaveContact: () => void;
    onScheduleReminder: () => void;
    onStartOver: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    contactInfo,
    draftedEmail,
    isLoading,
    loadingText,
    onGenerateEmail,
    onCopyToClipboard,
    onSaveContact,
    onScheduleReminder,
    onStartOver,
}) => {
    if (!contactInfo) return null;

    return (
        <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row-reverse">
                {draftedEmail ? (
                    <>
                        <button
                            onClick={onCopyToClipboard}
                            type="button"
                            className="w-full sm:w-auto sm:ml-3 inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2"
                        >
                            <ClipboardIcon className="h-5 w-5" /> Copy to Clipboard
                        </button>
                        <button
                            onClick={onScheduleReminder}
                            type="button"
                            className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2"
                        >
                            <CalendarIcon className="h-5 w-5" /> Schedule Reminder
                        </button>
                        <button
                            onClick={onSaveContact}
                            type="button"
                            className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center gap-2"
                        >
                            <SaveIcon className="h-5 w-5" /> Save to Contacts
                        </button>
                        <button
                            onClick={onStartOver}
                            type="button"
                            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Start Over
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onGenerateEmail}
                            disabled={isLoading}
                            className="w-full sm:w-auto sm:ml-3 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isLoading && loadingText === 'Generating Email...'
                                ? loadingText
                                : 'Draft Follow-up Email'}
                        </button>
                        <button
                            onClick={onSaveContact}
                            type="button"
                            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center gap-2"
                        >
                            <SaveIcon className="h-5 w-5" /> Save to Contacts
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
