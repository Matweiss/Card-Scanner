// FIX: Add AppStep type for StepIndicator component
export type AppStep = 'upload' | 'email';

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