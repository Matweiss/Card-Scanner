import React from 'react';
import { AnimatedCheckIcon } from './icons/AnimatedCheckIcon';

interface SuccessFeedbackProps {
    message: string;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({ message }) => {
    return (
        <div 
            className="fixed top-5 right-5 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 z-50 animate-fade-in-out"
        >
            <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 3s ease-in-out forwards;
                }
            `}</style>
            <AnimatedCheckIcon className="h-8 w-8" />
            <span className="text-base font-medium text-gray-800">{message}</span>
        </div>
    );
};