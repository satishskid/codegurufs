import React from 'react';
import { SparklesIcon, ExclamationTriangleIcon, ClockIcon } from './icons';
import { TerminalStatus } from '../types';

interface TerminalActivationProps {
  status: TerminalStatus;
  message?: string;
}

const TerminalActivation: React.FC<TerminalActivationProps> = ({ status, message }) => {
    
    const getStatusContent = () => {
        switch(status) {
            case 'loading':
                return {
                    icon: <ClockIcon className="w-12 h-12 animate-spin" />,
                    title: 'Verifying Terminal...',
                    text: 'Please wait while we connect and verify this terminal.'
                };
            case 'error':
                return {
                    icon: <ExclamationTriangleIcon className="w-12 h-12" />,
                    title: 'Activation Error',
                    text: message || 'An unknown error occurred. Please contact your administrator.'
                };
            case 'unactivated':
            default:
                 return {
                    icon: <SparklesIcon className="w-12 h-12" />,
                    title: 'Terminal Not Activated',
                    text: 'To begin, please open the unique activation link sent to your school by the Code Buddy team.'
                };
        }
    };

    const { icon, title, text } = getStatusContent();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-500 rounded-full p-4 mb-6">
            {icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default TerminalActivation;
