import type { AppError } from '../types';

/**
 * Creates a user-friendly error message from an error object
 * @param error - The error to process
 * @param type - The type of error
 * @returns AppError object with user-friendly message
 */
export const createAppError = (
    error: unknown,
    type: AppError['type'] = 'unknown'
): AppError => {
    if (error instanceof Error) {
        return {
            message: getUserFriendlyMessage(error.message, type),
            type,
            details: error.message,
        };
    }

    return {
        message: 'An unexpected error occurred. Please try again.',
        type,
    };
};

/**
 * Converts technical error messages to user-friendly ones
 * @param message - The original error message
 * @param type - The type of error
 * @returns User-friendly error message
 */
const getUserFriendlyMessage = (message: string, type: AppError['type']): string => {
    switch (type) {
        case 'file-read':
            return 'Failed to read the uploaded file. Please try uploading a different image.';
        case 'api':
            if (message.includes('API key')) {
                return 'API configuration error. Please check your Gemini API key.';
            }
            if (message.includes('quota') || message.includes('rate limit')) {
                return 'API rate limit reached. Please try again in a few moments.';
            }
            return 'Failed to process the request. Please try again.';
        case 'microphone':
            return 'Could not access microphone. Please ensure microphone permissions are granted in your browser settings.';
        case 'validation':
            return message; // Validation messages are already user-friendly
        default:
            return message || 'An unexpected error occurred. Please try again.';
    }
};

/**
 * Logs error to console with context
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export const logError = (error: unknown, context: string): void => {
    console.error(`[${context}]`, error);
};
