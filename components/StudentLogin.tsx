
import React, { useState } from 'react';
import { SparklesIcon, ArrowRightIcon } from './icons';

interface StudentLoginProps {
  onLogin: (name: string) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-500 rounded-full p-4 mb-6">
            <SparklesIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ready to Code?</h1>
        <p className="text-gray-600 mb-8">Please enter your name to begin your lesson or pick up where you left off.</p>
        
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="What's your name?" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg" 
            />
            <button
                type="submit"
                disabled={!name.trim()}
                className="flex-shrink-0 bg-indigo-600 text-white font-bold p-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
            >
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
