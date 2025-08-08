import { GradeLevel, StudentProgress, ChatMessage } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || 'Server error');
  }
  return response.json();
};

export const getStoredClientApiKey = (): string | null => {
  return localStorage.getItem('client_api_key');
};

export const setStoredClientApiKey = (key: string | null) => {
  if (!key) {
    localStorage.removeItem('client_api_key');
  } else {
    localStorage.setItem('client_api_key', key);
  }
};

export const getStudentProgress = async (terminalId: string, studentName: string): Promise<StudentProgress | null> => {
  const response = await fetch(`/api/progress?terminalId=${terminalId}&studentName=${studentName}`);
  if (response.status === 404 || response.status === 501) {
    return null; // No progress yet or DB not configured
  }
  return handleResponse(response);
};

export const saveStudentProgress = async (terminalId: string, studentName: string, progress: StudentProgress): Promise<void> => {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId, studentName, progress }),
  });
};

export const getAiResponse = async (
  terminalId: string,
  studentName: string,
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  const clientApiKey = getStoredClientApiKey();
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId, studentName, message: userMessage, history, clientApiKey }),
  });
  const data = await handleResponse(response);
  return data.text;
};

export const evaluateCode = async (
    terminalId: string,
    studentName: string,
    prompt: string
): Promise<string> => {
    const clientApiKey = getStoredClientApiKey();
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terminalId, studentName, message: prompt, isEvaluation: true, clientApiKey }),
    });
    const data = await handleResponse(response);
    return data.text;
};