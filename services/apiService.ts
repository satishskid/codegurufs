import { GradeLevel, StudentProgress, ChatMessage } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || 'Server error');
  }
  return response.json();
};

export const getStudentProgress = async (terminalId: string, studentName: string): Promise<StudentProgress | null> => {
  const response = await fetch(`/api/progress?terminalId=${terminalId}&studentName=${studentName}`);
  if (response.status === 404) {
    return null; // Student has no saved progress yet
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
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terminalId, studentName, message: userMessage, history }),
  });
  const data = await handleResponse(response);
  return data.text;
};

export const evaluateCode = async (
    terminalId: string,
    studentName: string,
    prompt: string
): Promise<string> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terminalId, studentName, message: prompt, isEvaluation: true }),
    });
    const data = await handleResponse(response);
    return data.text;
};