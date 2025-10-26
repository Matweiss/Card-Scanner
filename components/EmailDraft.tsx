
import React from 'react';

interface EmailDraftProps {
    email: string;
    onUpdate: (email: string) => void;
}

export const EmailDraft: React.FC<EmailDraftProps> = ({ email, onUpdate }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Generated Email Draft</h3>
            <p className="text-sm text-gray-500">Here is a draft for your follow-up email. Feel free to edit it before sending.</p>
            <textarea
                rows={15}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={email}
                onChange={(e) => onUpdate(e.target.value)}
            />
        </div>
    );
};
