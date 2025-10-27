// Application step types for multi-step workflow
export type AppStep = 'upload' | 'email';

// Contact information interface
export interface ContactInfo {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  notes: string;
  tags: string;
}

// File data for Gemini API
export interface FileData {
  data: string;
  mimeType: string;
}

// Audio data for transcription
export interface AudioData {
  data: string;
  mimeType: string;
}

// Loading state types
export type LoadingState =
  | 'idle'
  | 'scanning'
  | 'analyzing'
  | 'finding-website'
  | 'gathering-insights'
  | 'transcribing'
  | 'generating-email';

// Error types for better error handling
export interface AppError {
  message: string;
  type: 'file-read' | 'api' | 'microphone' | 'validation' | 'unknown';
  details?: string;
}

// Type guard for ContactInfo
export const isValidContactInfo = (data: unknown): data is ContactInfo => {
  if (typeof data !== 'object' || data === null) return false;
  const info = data as ContactInfo;
  return (
    typeof info.firstName === 'string' &&
    typeof info.lastName === 'string' &&
    typeof info.title === 'string' &&
    typeof info.company === 'string' &&
    typeof info.phone === 'string' &&
    typeof info.email === 'string' &&
    typeof info.website === 'string' &&
    typeof info.address === 'string' &&
    typeof info.notes === 'string' &&
    typeof info.tags === 'string'
  );
};