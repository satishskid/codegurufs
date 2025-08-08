import { TerminalInfo } from "../../types";

const MOCK_DB = {
  terminals: new Map<string, { info: TerminalInfo; active: boolean }>(),
  activationTokens: new Map<string, string>(),
};

const demoTerminalId1 = "term_123";
MOCK_DB.terminals.set(demoTerminalId1, {
  info: { schoolName: "Vibgyor High", className: "Grade 7B", teacherName: "Priya Sharma" },
  active: true,
});
MOCK_DB.activationTokens.set("token_abc", demoTerminalId1);

const demoTerminalId2 = "term_456";
MOCK_DB.terminals.set(demoTerminalId2, {
  info: { schoolName: "Delhi Public School", className: "Grade 10", teacherName: "Rohan Mehta" },
  active: false,
});
MOCK_DB.activationTokens.set("token_def", demoTerminalId2);

export async function handler(event: any) {
  const { httpMethod, queryStringParameters } = event;

  if (httpMethod === 'POST') {
    const token = queryStringParameters?.token;
    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Activation token is missing.' }) };
    }

    const terminalId = MOCK_DB.activationTokens.get(token);
    if (!terminalId) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Invalid activation token.' }) };
    }

    const terminal = MOCK_DB.terminals.get(terminalId);
    if (!terminal) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Terminal not found for this token.' }) };
    }

    terminal.active = true;

    return { statusCode: 200, body: JSON.stringify({ terminalId, terminalInfo: terminal.info }) };
  }

  if (httpMethod === 'GET') {
    const terminalId = queryStringParameters?.terminalId;
    if (!terminalId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Terminal ID is missing.' }) };
    }

    const terminal = MOCK_DB.terminals.get(terminalId);
    if (!terminal) {
      return { statusCode: 404, body: JSON.stringify({ message: 'This terminal does not exist.' }) };
    }

    if (!terminal.active) {
      return { statusCode: 403, body: JSON.stringify({ message: 'This terminal has been deactivated by the administrator.' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ terminalId, terminalInfo: terminal.info }) };
  }

  return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
}
