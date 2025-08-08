import { StudentProgress } from "../../types";

// --- MOCK DATABASE for student progress ---
const MOCK_PROGRESS_DB = new Map<string, StudentProgress>();

export async function handler(event: any) {
  const { httpMethod, queryStringParameters } = event;

  if (httpMethod === 'GET') {
    const terminalId = queryStringParameters?.terminalId;
    const studentName = queryStringParameters?.studentName;

    if (!terminalId || !studentName) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing terminalId or studentName' }) };
    }

    const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
    const progress = MOCK_PROGRESS_DB.get(progressKey);

    if (progress) {
      return { statusCode: 200, body: JSON.stringify(progress) };
    } else {
      return { statusCode: 404, body: JSON.stringify({ message: 'No progress found for this student.' }) };
    }
  }

  if (httpMethod === 'POST') {
    const { terminalId, studentName, progress } = JSON.parse(event.body || '{}');

    if (!terminalId || !studentName || !progress) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields for saving progress.' }) };
    }

    const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
    MOCK_PROGRESS_DB.set(progressKey, progress);

    return { statusCode: 204, body: '' };
  }

  return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
}
