import React from 'react';
import type { AppStep } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

interface Step {
    id: AppStep;
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const steps: Step[] = [
    { id: 'upload', name: 'Scan & Review', icon: UserCircleIcon },
    { id: 'email', name: 'Draft Email', icon: EnvelopeIcon },
];

interface StepIndicatorProps {
    currentStep: AppStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {stepIdx < currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-indigo-600" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-full">
                                    <step.icon className="h-5 w-5 text-white" aria-hidden="true" />
                                </div>
                            </>
                        ) : stepIdx === currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-indigo-600 rounded-full">
                                     <step.icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                                </div>
                                 <div className="absolute top-10 w-max text-center">
                                    <span className="text-sm font-semibold text-indigo-600">{step.name}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-gray-300 rounded-full">
                                    <step.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};