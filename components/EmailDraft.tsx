
import React from 'react';

interface EmailDraftProps {
    email: string;
    onUpdate: (email: string) => void;
}

export const EmailDraft: React.FC<EmailDraftProps> = ({ email, onUpdate }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">AI Prompt for Email Drafting</h3>
            <p className="text-sm text-gray-500">
                Copy this prompt and paste it into <strong>Claude</strong>, <strong>Gemini</strong>, or <strong>ChatGPT</strong> to generate a personalized follow-up email.
            </p>
            <textarea
                rows={15}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono text-xs"
                value={email}
                onChange={(e) => onUpdate(e.target.value)}
            />
        </div>
    );
};
