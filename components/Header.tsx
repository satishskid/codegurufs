
import React from 'react';
import { TerminalInfo } from '../types';
import { ArrowLeftOnRectangleIcon, SparklesIcon, UserCircleIcon } from './icons';

interface HeaderProps {
  terminalInfo: TerminalInfo | null;
  studentName: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ terminalInfo, studentName, onLogout }) => {

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
        </div>
      </div>
      <nav className="flex items-center space-x-4">
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
