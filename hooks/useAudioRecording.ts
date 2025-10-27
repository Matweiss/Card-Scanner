import { useState, useRef, useCallback } from 'react';

export type RecordingTarget = 'email' | 'contact' | null;

interface UseAudioRecordingReturn {
    isEmailRecording: boolean;
    isContactRecording: boolean;
    startRecording: (target: 'email' | 'contact') => Promise<void>;
    stopRecording: () => void;
    toggleRecording: (target: 'email' | 'contact') => Promise<void>;
}

interface UseAudioRecordingProps {
    onTranscriptionComplete: (audio: { data: string; mimeType: string }, target: 'email' | 'contact') => Promise<void>;
}

export const useAudioRecording = ({ onTranscriptionComplete }: UseAudioRecordingProps): UseAudioRecordingReturn => {
    const [isEmailRecording, setIsEmailRecording] = useState(false);
    const [isContactRecording, setIsContactRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptionTargetRef = useRef<RecordingTarget>(null);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsEmailRecording(false);
        setIsContactRecording(false);
    }, []);

    const startRecording = useCallback(async (target: 'email' | 'contact') => {
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

                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    if (transcriptionTargetRef.current) {
                        onTranscriptionComplete(
                            { data: base64String, mimeType: options.mimeType },
                            transcriptionTargetRef.current
                        );
                    }
                };

                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();

            if (target === 'email') {
                setIsEmailRecording(true);
            } else {
                setIsContactRecording(true);
            }
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw new Error("Could not access microphone. Please ensure permission is granted in your browser settings.");
        }
    }, [onTranscriptionComplete]);

    const toggleRecording = useCallback(async (target: 'email' | 'contact') => {
        const isCurrentlyRecording = (target === 'email' && isEmailRecording) || (target === 'contact' && isContactRecording);

        if (isCurrentlyRecording) {
            stopRecording();
        } else {
            await startRecording(target);
        }
    }, [isEmailRecording, isContactRecording, startRecording, stopRecording]);

    return {
        isEmailRecording,
        isContactRecording,
        startRecording,
        stopRecording,
        toggleRecording,
    };
};
