import React, { useState, useCallback } from 'react';
import type { ContactInfo } from './types';
import { FileUpload } from './components/FileUpload';
import { ContactDisplay } from './components/ContactDisplay';
import { EmailDraft } from './components/EmailDraft';
import { NotesSection } from './components/NotesSection';
import { ActionButtons } from './components/ActionButtons';
import { SuccessFeedback } from './components/SuccessFeedback';
import { draftFollowUpEmail, transcribeAudio } from './services/geminiService';
import { useFileUpload } from './hooks/useFileUpload';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useWebsiteValidation } from './hooks/useWebsiteValidation';
import { downloadVCard } from './utils/vcard';
import { scheduleCalendarReminder } from './utils/calendar';
import { createAppError, logError } from './utils/errors';


const App: React.FC = () => {
    const [draftedEmail, setDraftedEmail] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    // Custom hooks for file upload and contact extraction
    const {
        file,
        filePreviewUrl,
        contactInfo,
        emailNotes,
        isLoading: isFileLoading,
        loadingText: fileLoadingText,
        error: fileError,
        handleFileSelect,
        setContactInfo,
        setEmailNotes,
        setError: setFileError,
    } = useFileUpload();

    // Email generation loading state
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

    // Website validation hook
    const isWebsiteValid = useWebsiteValidation(contactInfo?.website || '');

    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => setFeedbackMessage(''), 3000);
    };

    // Transcription loading state
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionTarget, setTranscriptionTarget] = useState<'email' | 'contact' | null>(null);

    // Handle audio transcription
    const handleTranscribeAudio = useCallback(
        async (audio: { data: string; mimeType: string }, target: 'email' | 'contact') => {
            setIsTranscribing(true);
            setTranscriptionTarget(target);
            setFileError(null);

            try {
                const transcribedText = await transcribeAudio(audio);
                if (target === 'email') {
                    setEmailNotes(prev => (prev ? `${prev}\n${transcribedText}`.trim() : transcribedText));
                } else if (target === 'contact') {
                    setContactInfo(prev =>
                        prev
                            ? {
                                  ...prev,
                                  notes: prev.notes ? `${prev.notes}\n${transcribedText}`.trim() : transcribedText,
                              }
                            : null
                    );
                }
            } catch (e) {
                const appError = createAppError(e, 'api');
                setFileError(appError.message);
                logError(e, 'Audio Transcription');
            } finally {
                setIsTranscribing(false);
                setTranscriptionTarget(null);
            }
        },
        [setContactInfo, setEmailNotes, setFileError]
    );

    // Audio recording hook
    const { isEmailRecording, isContactRecording, toggleRecording } = useAudioRecording({
        onTranscriptionComplete: handleTranscribeAudio,
    });

    // Update contact field
    const handleUpdateContact = useCallback(
        (field: keyof ContactInfo, value: string) => {
            setContactInfo(prev => (prev ? { ...prev, [field]: value } : null));
        },
        [setContactInfo]
    );

    // Generate follow-up email
    const handleGenerateEmail = useCallback(async () => {
        if (!contactInfo) return;

        setIsGeneratingEmail(true);
        setFileError(null);

        try {
            const email = await draftFollowUpEmail(contactInfo, emailNotes);
            setDraftedEmail(email);
        } catch (e) {
            const appError = createAppError(e, 'api');
            setFileError(appError.message);
            logError(e, 'Email Generation');
        } finally {
            setIsGeneratingEmail(false);
        }
    }, [contactInfo, emailNotes, setFileError]);

    // Copy email to clipboard
    const handleCopyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(draftedEmail);
        showFeedback('Email copied to clipboard!');
    }, [draftedEmail]);

    // Save contact as vCard
    const handleSaveContact = useCallback(() => {
        if (!contactInfo) return;
        try {
            downloadVCard(contactInfo);
            showFeedback('vCard downloaded!');
        } catch (e) {
            logError(e, 'Save Contact');
            showFeedback('Failed to download contact.');
        }
    }, [contactInfo]);

    // Schedule a follow-up reminder
    const handleScheduleReminder = useCallback(() => {
        if (!contactInfo) return;
        try {
            scheduleCalendarReminder(contactInfo);
        } catch (e) {
            logError(e, 'Schedule Reminder');
            showFeedback('Failed to schedule reminder.');
        }
    }, [contactInfo]);

    // Start over with a new card
    const handleStartOver = useCallback(() => {
        setDraftedEmail('');
        setIsGeneratingEmail(false);
        // File upload hook handles resetting its own state when a new file is selected
    }, []);

    // Determine overall loading state
    const isLoading = isFileLoading || isGeneratingEmail || isTranscribing;
    const loadingText = isGeneratingEmail
        ? 'Generating Prompt...'
        : isTranscribing
        ? 'Transcribing...'
        : fileLoadingText;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {feedbackMessage && <SuccessFeedback message={feedbackMessage} />}
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        AI Business Card Scanner
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        A single page to turn physical cards into digital contacts and emails instantly.
                    </p>
                </header>

                <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-10 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="animate-spin h-8 w-8 text-indigo-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="text-lg font-medium text-gray-700">
                                    {loadingText || 'AI is working...'}
                                </span>
                            </div>
                        </div>
                    )}

                    <FileUpload
                        onFileSelect={handleFileSelect}
                        file={file}
                        filePreviewUrl={filePreviewUrl}
                        isLoading={isLoading}
                    />

                    {contactInfo && (
                        <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
                            <ContactDisplay
                                contactInfo={contactInfo}
                                onUpdate={handleUpdateContact}
                                isWebsiteValid={isWebsiteValid}
                                isRecording={isContactRecording}
                                isTranscribing={isTranscribing && transcriptionTarget === 'contact'}
                                onToggleRecording={() => toggleRecording('contact')}
                            />
                            <NotesSection
                                emailNotes={emailNotes}
                                onNotesChange={setEmailNotes}
                                isRecording={isEmailRecording}
                                isTranscribing={isTranscribing && transcriptionTarget === 'email'}
                                onToggleRecording={() => toggleRecording('email')}
                                isLoading={isLoading}
                            />
                        </div>
                    )}

                    {draftedEmail && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <EmailDraft email={draftedEmail} onUpdate={setDraftedEmail} />
                        </div>
                    )}

                    {fileError && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{fileError}</div>
                    )}

                    <ActionButtons
                        contactInfo={contactInfo}
                        draftedEmail={draftedEmail}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        onGenerateEmail={handleGenerateEmail}
                        onCopyToClipboard={handleCopyToClipboard}
                        onSaveContact={handleSaveContact}
                        onScheduleReminder={handleScheduleReminder}
                        onStartOver={handleStartOver}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;