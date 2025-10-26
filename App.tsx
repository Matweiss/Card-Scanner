import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ContactInfo } from './types';
import { FileUpload } from './components/FileUpload';
import { ContactDisplay } from './components/ContactDisplay';
import { EmailDraft } from './components/EmailDraft';
import { extractContactInfo, draftFollowUpEmail, transcribeAudio, analyzeBusinessCardImage, recommendWebsite, getAIInsights } from './services/geminiService';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { SaveIcon } from './components/icons/SaveIcon';
import { MicrophoneIcon } from './components/icons/MicrophoneIcon';
import { StopIcon } from './components/icons/StopIcon';
import { SuccessFeedback } from './components/SuccessFeedback';
import { CalendarIcon } from './components/icons/CalendarIcon';


const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [emailNotes, setEmailNotes] = useState('');
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [draftedEmail, setDraftedEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isEmailRecording, setIsEmailRecording] = useState(false);
    const [isContactRecording, setIsContactRecording] = useState(false);
    const [isWebsiteValid, setIsWebsiteValid] = useState<boolean | null>(null);
    
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);
    const transcriptionTargetRef = React.useRef<'email' | 'contact' | null>(null);

    const filePreviewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => setFeedbackMessage(''), 3000);
    };

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setContactInfo(null);
        setEmailNotes('');
        setDraftedEmail('');
        setIsLoading(true);
        setLoadingText('Scanning Card...');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onloadend = async () => {
                try {
                    const base64String = (reader.result as string).split(',')[1];
                    const fileData = { data: base64String, mimeType: selectedFile.type };

                    setLoadingText('Scanning & Analyzing...');
                    const [extractedData, analysisNotes] = await Promise.all([
                        extractContactInfo(fileData),
                        analyzeBusinessCardImage(fileData)
                    ]);
                    
                    let finalContactInfo: ContactInfo = { ...extractedData, notes: '', tags: extractedData.tags || '' };

                    if (!finalContactInfo.website && (finalContactInfo.company || finalContactInfo.email)) {
                        setLoadingText('Finding Website...');
                        try {
                            const recommendedUrl = await recommendWebsite(finalContactInfo.company, finalContactInfo.email);
                            if (recommendedUrl) {
                                finalContactInfo.website = recommendedUrl;
                            }
                        } catch (e) {
                            console.warn("Could not recommend a website:", e);
                        }
                    }
                    
                    setContactInfo(finalContactInfo);

                    let insights = '';
                    if (finalContactInfo.firstName && finalContactInfo.company) {
                        setLoadingText('Gathering AI Insights...');
                        try {
                           insights = await getAIInsights(finalContactInfo.firstName, finalContactInfo.lastName, finalContactInfo.company, finalContactInfo.title, finalContactInfo.website);
                        } catch (e) {
                             console.warn("Could not get AI insights:", e);
                        }
                    }

                    setEmailNotes((analysisNotes + insights).trim());
                    
                } catch (e) {
                     const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                    setLoadingText('');
                }
            };
            reader.onerror = () => {
                 throw new Error("Failed to read the file.");
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setIsLoading(false);
            setLoadingText('');
        }
    }, []);

    const handleTranscribeAudio = async (audio: { data: string, mimeType: string }, target: 'email' | 'contact') => {
        setIsLoading(true);
        setLoadingText('Transcribing...');
        setError(null);
        try {
            const transcribedText = await transcribeAudio(audio);
            if (target === 'email') {
                setEmailNotes(prev => prev ? `${prev}\n${transcribedText}`.trim() : transcribedText);
            } else if (target === 'contact') {
                setContactInfo(prev => prev ? { ...prev, notes: prev.notes ? `${prev.notes}\n${transcribedText}`.trim() : transcribedText } : null);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Transcription failed.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingText('');
        }
    };
    
    const handleToggleRecording = async (target: 'email' | 'contact') => {
        const isCurrentlyRecording = (target === 'email' && isEmailRecording) || (target === 'contact' && isContactRecording);

        if (isCurrentlyRecording) {
            mediaRecorderRef.current?.stop();
            if (target === 'email') setIsEmailRecording(false);
            if (target === 'contact') setIsContactRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const options = { mimeType: 'audio/webm' };
                mediaRecorderRef.current = new MediaRecorder(stream, options);
                audioChunksRef.current = [];
                transcriptionTargetRef.current = target;

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        if (transcriptionTargetRef.current) {
                            handleTranscribeAudio({ data: base64String, mimeType: options.mimeType }, transcriptionTargetRef.current);
                        }
                    };
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                if (target === 'email') setIsEmailRecording(true);
                if (target === 'contact') setIsContactRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please ensure permission is granted in your browser settings.");
            }
        }
    };

    const handleUpdateContact = (field: keyof ContactInfo, value: string) => {
        setContactInfo(prev => prev ? { ...prev, [field]: value } : null);
    };

    useEffect(() => {
        if (!contactInfo) return;
    
        if (contactInfo.website.trim() === '') {
            setIsWebsiteValid(null);
            return;
        }
    
        const handler = setTimeout(() => {
            const isValidUrl = (urlString: string): boolean => {
                const basicFormatRegex = /.+?\..+/;
                if (!basicFormatRegex.test(urlString)) {
                    return false;
                }
                let urlToTest = urlString;
                if (!/^https?:\/\//i.test(urlToTest)) {
                    urlToTest = `https://${urlToTest}`;
                }
                try {
                    new URL(urlToTest);
                    return true;
                } catch (e) {
                    return false;
                }
            };
            setIsWebsiteValid(isValidUrl(contactInfo.website));
        }, 500);
    
        return () => {
            clearTimeout(handler);
        };
    }, [contactInfo?.website]);

    const handleGenerateEmail = useCallback(async () => {
        if (!contactInfo) return;
        setIsLoading(true);
        setLoadingText('Generating Email...');
        setError(null);
        try {
            const email = await draftFollowUpEmail(contactInfo, emailNotes);
            setDraftedEmail(email);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingText('');
        }
    }, [contactInfo, emailNotes]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(draftedEmail);
        showFeedback('Email copied to clipboard!');
    };

    const handleSaveContact = () => {
        if (!contactInfo) return;

        const noteContent = [
            contactInfo.notes || '',
            contactInfo.tags ? `Tags: ${contactInfo.tags}` : ''
        ].filter(Boolean).join('\n\n');

        const vCard = `BEGIN:VCARD
VERSION:3.0
N:${contactInfo.lastName || ''};${contactInfo.firstName || ''}
FN:${contactInfo.firstName || ''} ${contactInfo.lastName || ''}
ORG:${contactInfo.company || ''}
TITLE:${contactInfo.title || ''}
TEL;TYPE=WORK,VOICE:${contactInfo.phone || ''}
EMAIL:${contactInfo.email || ''}
URL:${contactInfo.website || ''}
ADR;TYPE=WORK:;;${(contactInfo.address || '').replace(/\n/g, ';')}
NOTE:${noteContent.replace(/\n/g, '\\n')}
END:VCARD`;

        const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const namePart = `${contactInfo.firstName} ${contactInfo.lastName}`.trim() || 'contact';
        const fileName = `${namePart.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showFeedback('vCard downloaded!');
    };
    
    const handleScheduleReminder = () => {
        if (!contactInfo) return;
    
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
    
        const startTime = tomorrow.toISOString().replace(/-|:|\.\d+/g, '');
        tomorrow.setHours(11, 0, 0, 0);
        const endTime = tomorrow.toISOString().replace(/-|:|\.\d+/g, '');
    
        const title = encodeURIComponent(`Follow up with ${contactInfo.firstName} ${contactInfo.lastName}`);
        const details = encodeURIComponent(`Remember to follow up with ${contactInfo.firstName} from ${contactInfo.company}.\n\nEmail: ${contactInfo.email}\nPhone: ${contactInfo.phone}`);
        
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    
        window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    };
    
    const handleStartOver = () => {
        setFile(null);
        setEmailNotes('');
        setContactInfo(null);
        setDraftedEmail('');
        setError(null);
        setIsLoading(false);
        setLoadingText('');
    };

    const isTranscribing = loadingText === 'Transcribing...';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {feedbackMessage && <SuccessFeedback message={feedbackMessage} />}
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI Business Card Scanner</h1>
                    <p className="mt-4 text-lg text-gray-600">A single page to turn physical cards into digital contacts and emails instantly.</p>
                </header>

                <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-10 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                             <div className="flex items-center space-x-2">
                                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-lg font-medium text-gray-700">{loadingText || 'AI is working...'}</span>
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
                                isTranscribing={isTranscribing && transcriptionTargetRef.current === 'contact'}
                                onToggleRecording={() => handleToggleRecording('contact')} 
                            />
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="notes" className="block text-base font-semibold text-gray-700">
                                        AI Insights & Email Notes
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleRecording('email')}
                                        disabled={isLoading}
                                        className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isEmailRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        aria-label={isEmailRecording ? 'Stop recording' : 'Start recording notes'}
                                    >
                                        {isEmailRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
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
                                        onChange={(e) => setEmailNotes(e.target.value)}
                                    />
                                    {isTranscribing && transcriptionTargetRef.current === 'email' && (
                                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                                            <span className="text-sm font-medium text-gray-600 animate-pulse">Transcribing audio...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {draftedEmail && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <EmailDraft email={draftedEmail} onUpdate={setDraftedEmail} />
                        </div>
                    )}
                    
                    {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

                    {contactInfo && (
                         <div className="mt-8 pt-5 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row-reverse">
                                {draftedEmail ? (
                                    <>
                                        <button onClick={handleCopyToClipboard} type="button" className="w-full sm:w-auto sm:ml-3 inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2">
                                            <ClipboardIcon className="h-5 w-5"/> Copy to Clipboard
                                        </button>
                                        <button onClick={handleScheduleReminder} type="button" className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2">
                                            <CalendarIcon className="h-5 w-5"/> Schedule Reminder
                                        </button>
                                         <button onClick={handleSaveContact} type="button" className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center gap-2">
                                            <SaveIcon className="h-5 w-5"/> Save to Contacts
                                        </button>
                                        <button onClick={handleStartOver} type="button" className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Start Over</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleGenerateEmail} disabled={isLoading} className="w-full sm:w-auto sm:ml-3 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                                            {isLoading && loadingText === 'Generating Email...' ? loadingText : 'Draft Follow-up Email'}
                                        </button>
                                        <button onClick={handleSaveContact} type="button" className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center gap-2">
                                            <SaveIcon className="h-5 w-5"/> Save to Contacts
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;