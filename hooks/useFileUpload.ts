import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import type { ContactInfo } from '../types';
import {
    extractContactInfo,
    analyzeBusinessCardImage,
    recommendWebsite,
    getAIInsights
} from '../services/geminiService';

interface UseFileUploadReturn {
    file: File | null;
    filePreviewUrl: string | null;
    contactInfo: ContactInfo | null;
    emailNotes: string;
    isLoading: boolean;
    loadingText: string;
    error: string | null;
    handleFileSelect: (selectedFile: File) => Promise<void>;
    setContactInfo: Dispatch<SetStateAction<ContactInfo | null>>;
    setEmailNotes: Dispatch<SetStateAction<string>>;
    setError: Dispatch<SetStateAction<string | null>>;
}

export const useFileUpload = (): UseFileUploadReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [emailNotes, setEmailNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const filePreviewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setContactInfo(null);
        setEmailNotes('');
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

                    // Append tags to notes field
                    const tagsText = extractedData.tags ? `Tags: ${extractedData.tags}` : '';

                    let finalContactInfo: ContactInfo = {
                        ...extractedData,
                        notes: tagsText,
                        tags: extractedData.tags || ''
                    };

                    // Try to find website if not extracted
                    if (!finalContactInfo.website && (finalContactInfo.company || finalContactInfo.email)) {
                        setLoadingText('Finding Website...');
                        try {
                            const recommendedUrl = await recommendWebsite(
                                finalContactInfo.company,
                                finalContactInfo.email
                            );
                            if (recommendedUrl) {
                                finalContactInfo.website = recommendedUrl;
                            }
                        } catch (e) {
                            console.warn("Could not recommend a website:", e);
                        }
                    }

                    setContactInfo(finalContactInfo);

                    // Get AI insights
                    let insights = '';
                    if (finalContactInfo.firstName && finalContactInfo.company) {
                        setLoadingText('Gathering AI Insights...');
                        try {
                            insights = await getAIInsights(
                                finalContactInfo.firstName,
                                finalContactInfo.lastName,
                                finalContactInfo.company,
                                finalContactInfo.title,
                                finalContactInfo.website
                            );
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
            };
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setIsLoading(false);
            setLoadingText('');
        }
    }, []);

    return {
        file,
        filePreviewUrl,
        contactInfo,
        emailNotes,
        isLoading,
        loadingText,
        error,
        handleFileSelect,
        setContactInfo,
        setEmailNotes,
        setError,
    };
};
