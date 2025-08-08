
// This file would be deployed as a serverless function, e.g., at /api/terminal
// It would interact with a database like Firestore to manage terminals.
// The implementation below is a MOCK. A real implementation would require a database connection.

import { TerminalInfo } from "../types";

// --- MOCK DATABASE ---
// In a real app, this data would live in Firestore, Supabase, etc.
const MOCK_DB = {
    terminals: new Map<string, { info: TerminalInfo; active: boolean }>(),
    activationTokens: new Map<string, string>(), // token -> terminalId
};

// Pre-populate with some data for demonstration
const demoTerminalId1 = "term_123";
MOCK_DB.terminals.set(demoTerminalId1, {
    info: { schoolName: "Vibgyor High", className: "Grade 7B", teacherName: "Priya Sharma" },
    active: true
});
MOCK_DB.activationTokens.set("token_abc", demoTerminalId1);

const demoTerminalId2 = "term_456";
MOCK_DB.terminals.set(demoTerminalId2, {
    info: { schoolName: "Delhi Public School", className: "Grade 10", teacherName: "Rohan Mehta" },
    active: false // This terminal is deactivated
});
MOCK_DB.activationTokens.set("token_def", demoTerminalId2);
// --- END MOCK DATABASE ---

export default async (req: Request) => {
    const url = new URL(req.url);

    if (req.method === 'POST') {
        // --- Activate a terminal ---
        const token = url.searchParams.get('token');
        if (!token) {
            return new Response(JSON.stringify({ message: 'Activation token is missing.' }), { status: 400 });
        }
        
        const terminalId = MOCK_DB.activationTokens.get(token);
        if (!terminalId) {
            return new Response(JSON.stringify({ message: 'Invalid activation token.' }), { status: 404 });
        }
        
        const terminal = MOCK_DB.terminals.get(terminalId);
        if (!terminal) {
            return new Response(JSON.stringify({ message: 'Terminal not found for this token.' }), { status: 404 });
        }

        // Mark as active in a real DB
        terminal.active = true;

        return new Response(JSON.stringify({ terminalId, terminalInfo: terminal.info }), { status: 200 });

    } else if (req.method === 'GET') {
        // --- Check terminal status ---
        const terminalId = url.searchParams.get('terminalId');
        if (!terminalId) {
            return new Response(JSON.stringify({ message: 'Terminal ID is missing.' }), { status: 400 });
        }
        
        const terminal = MOCK_DB.terminals.get(terminalId);
        if (!terminal) {
            return new Response(JSON.stringify({ message: 'This terminal does not exist.' }), { status: 404 });
        }
        
        if (!terminal.active) {
            return new Response(JSON.stringify({ message: 'This terminal has been deactivated by the administrator.' }), { status: 403 });
        }

        return new Response(JSON.stringify({ terminalId, terminalInfo: terminal.info }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
};
