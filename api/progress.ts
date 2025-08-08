
// This file would be deployed as a serverless function, e.g., at /api/progress
// It would interact with a database like Firestore to store student progress.
// The implementation below is a MOCK. A real implementation would require a database connection.

import { StudentProgress } from '../types';

// --- MOCK DATABASE for student progress ---
// Key: "terminalId_studentName", Value: StudentProgress
const MOCK_PROGRESS_DB = new Map<string, StudentProgress>();
// --- END MOCK DATABASE ---


export default async (req: Request) => {
    const url = new URL(req.url);

    if (req.method === 'GET') {
        // --- Get student progress ---
        const terminalId = url.searchParams.get('terminalId');
        const studentName = url.searchParams.get('studentName');

        if (!terminalId || !studentName) {
            return new Response(JSON.stringify({ message: 'Missing terminalId or studentName' }), { status: 400 });
        }

        const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
        const progress = MOCK_PROGRESS_DB.get(progressKey);

        if (progress) {
            return new Response(JSON.stringify(progress), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'No progress found for this student.' }), { status: 404 });
        }
    }

    if (req.method === 'POST') {
        // --- Save student progress ---
        const { terminalId, studentName, progress } = await req.json();

        if (!terminalId || !studentName || !progress) {
            return new Response(JSON.stringify({ message: 'Missing required fields for saving progress.' }), { status: 400 });
        }
        
        const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
        MOCK_PROGRESS_DB.set(progressKey, progress);

        return new Response(null, { status: 204 }); // Success, no content
    }

    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
};
