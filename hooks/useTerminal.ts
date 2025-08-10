import { useState, useCallback, useEffect } from 'react';
import { TerminalInfo } from '../types';

export const useTerminal = () => {
  const [terminalId, setTerminalId] = useState<string | null>(() => localStorage.getItem('terminal_id'));
  const [terminalInfo, setTerminalInfo] = useState<TerminalInfo | null>(() => {
    const info = localStorage.getItem('terminal_info');
    return info ? JSON.parse(info) : null;
  });
  const [studentName, setStudentNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateAndCheckStatus = async () => {
      setIsLoading(true);
      setError(null);

      const urlParams = new URLSearchParams(window.location.search);
      const activationToken = urlParams.get('token');
      
      let currentTerminalId = localStorage.getItem('terminal_id');

      try {
        if (activationToken) {
          // New activation
          const response = await fetch(`/api/terminal?token=${activationToken}`, { method: 'POST' });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Activation failed.');
          }
          const data = await response.json();
          currentTerminalId = data.terminalId;
          
          localStorage.setItem('terminal_id', data.terminalId);
          localStorage.setItem('terminal_info', JSON.stringify(data.terminalInfo));
          setTerminalId(data.terminalId);
          setTerminalInfo(data.terminalInfo);
          
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (currentTerminalId) {
          // Check status of existing terminal
          const response = await fetch(`/api/terminal?terminalId=${currentTerminalId}`);
          if (!response.ok) {
             const errorData = await response.json();
            throw new Error(errorData.message || 'Terminal is not active.');
          }
           const data = await response.json();
           // Re-set info in case it was updated
           localStorage.setItem('terminal_info', JSON.stringify(data.terminalInfo));
           setTerminalInfo(data.terminalInfo);
        } else {
           // No token and no stored ID
           throw new Error("This terminal has not been activated. Please use the activation link provided by your administrator.");
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    activateAndCheckStatus();
  }, []);

  const setStudentName = useCallback((name: string) => {
    sessionStorage.setItem('student_name', name);
    setStudentNameState(name);
  }, []);

  const logoutStudent = useCallback(() => {
    sessionStorage.removeItem('student_name');
    setStudentNameState(null);
  }, []);

  // Check for a student name in session storage on initial load
  useEffect(() => {
    const savedStudent = sessionStorage.getItem('student_name');
    if (savedStudent) {
      setStudentNameState(savedStudent);
    }
  }, []);

  return { terminalId, terminalInfo, studentName, isLoading, error, setStudentName, logoutStudent };
};
