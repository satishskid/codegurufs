import React, { useState, useEffect } from 'react';
import { TerminalInfo } from '../types';
import { ArrowLeftOnRectangleIcon, SparklesIcon, UserCircleIcon } from './icons';
import { getStoredClientApiKey, setStoredClientApiKey } from '../services/apiService';

interface HeaderProps {
  terminalInfo: TerminalInfo | null;
  studentName: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ terminalInfo, studentName, onLogout }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const k = getStoredClientApiKey();
    if (k) {
      setApiKey(k);
      setHasKey(true);
    }
  }, []);

  const saveKey = () => {
    const value = apiKey.trim();
    setStoredClientApiKey(value || '');
    setHasKey(!!value);
  };

  const clearKey = () => {
    setStoredClientApiKey(null);
    setApiKey('');
    setHasKey(false);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md z-10 flex-shrink-0">
      <div className="flex items-center">
        <SparklesIcon className="w-10 h-10 text-indigo-500 mr-4" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Code Buddy</h1>
          {terminalInfo && (
            <p className="text-xs text-gray-500 font-medium">
              {terminalInfo.schoolName} &bull; {terminalInfo.className} &bull; {terminalInfo.teacherName}
            </p>
          )}
          {hasKey && (
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Client API key active</span>
          )}
        </div>
      </div>
      <nav className="flex items-center space-x-4">
        <div className="hidden md:flex items-center gap-2">
          <input
            type="password"
            placeholder="Client API key (optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-52 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {!hasKey ? (
            <button onClick={saveKey} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">Save</button>
          ) : (
            <button onClick={clearKey} className="px-3 py-2 text-sm bg-gray-200 rounded-lg">Clear</button>
          )}
        </div>
        {studentName && (
          <>
            <div className="flex items-center text-sm font-semibold text-gray-700">
                <UserCircleIcon className="w-6 h-6 mr-2 text-indigo-500"/>
                <span>{studentName}</span>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                title="Switch Student"
            >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                Switch Student
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
