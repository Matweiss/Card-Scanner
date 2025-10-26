import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';

interface NotesSectionProps {
    emailNotes: string;
    onNotesChange: (notes: string) => void;
    isRecording: boolean;
    isTranscribing: boolean;
    onToggleRecording: () => void;
    isLoading: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
    emailNotes,
    onNotesChange,
    isRecording,
    isTranscribing,
    onToggleRecording,
    isLoading,
}) => {
    return (
        <div>
            <div className="flex justify-between items-center">
                <label htmlFor="notes" className="block text-base font-semibold text-gray-700">
                    AI Insights & Email Notes
                </label>
                <button
                    type="button"
                    onClick={onToggleRecording}
                    disabled={isLoading}
                    className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording notes'}
                >
                    {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                </button>
            </div>
            <div className="mt-1 relative">
                <textarea
                    id="notes"
                    name="notes"
                    rows={8}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100 text-black"
                    placeholder="AI insights and your notes for the email will appear here..."
                    value={emailNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                />
                {isTranscribing && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                        <span className="text-sm font-medium text-gray-600 animate-pulse">
                            Transcribing audio...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
