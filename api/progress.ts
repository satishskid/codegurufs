// This file would be deployed as a serverless function, e.g., at /api/progress
// It would interact with a database like Firestore to store student progress.
// The implementation below is a MOCK. A real implementation would require a database connection.

import { StudentProgress } from '../types';
import getFirestore from '../server/firebaseAdmin';
import { getAuthUser } from '../server/clerkAuth';

const db = (() => {
  try { return getFirestore(); } catch { return null as any; }
})();

const STUDENTS_COLL = 'students_progress';

// Fallback in-memory DB when admin SDK isn't configured
const MOCK_PROGRESS_DB = new Map<string, StudentProgress>();

// Verify Clerk JWT when secret is configured; otherwise allow for local testing
const verifyAuth = async (req: Request) => {
  if (!process.env.CLERK_SECRET_KEY) return true;
  const user = await getAuthUser(req);
  return !!user;
};

export default async (req: Request) => {
    const url = new URL(req.url);

    if (!(await verifyAuth(req))) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    if (req.method === 'GET') {
        const terminalId = url.searchParams.get('terminalId');
        const studentName = url.searchParams.get('studentName');

        if (!terminalId || !studentName) {
            return new Response(JSON.stringify({ message: 'Missing terminalId or studentName' }), { status: 400 });
        }

        if (!db) {
          const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
          const progress = MOCK_PROGRESS_DB.get(progressKey);
          if (progress) return new Response(JSON.stringify(progress), { status: 200 });
          return new Response(JSON.stringify({ message: 'No progress found for this student.' }), { status: 404 });
        }

        const docId = `${terminalId}_${studentName.toLowerCase()}`;
        const docRef = db.collection(STUDENTS_COLL).doc(docId);
        const snap = await docRef.get();
        if (!snap.exists) {
          return new Response(JSON.stringify({ message: 'No progress found for this student.' }), { status: 404 });
        }
        return new Response(JSON.stringify(snap.data() as StudentProgress), { status: 200 });
    }

    if (req.method === 'POST') {
        const { terminalId, studentName, progress } = await req.json();
        if (!terminalId || !studentName || !progress) {
            return new Response(JSON.stringify({ message: 'Missing required fields for saving progress.' }), { status: 400 });
        }

        if (!db) {
          const progressKey = `${terminalId}_${studentName.toLowerCase()}`;
          MOCK_PROGRESS_DB.set(progressKey, progress);
          return new Response(null, { status: 204 });
        }

        const docId = `${terminalId}_${studentName.toLowerCase()}`;
        await db.collection(STUDENTS_COLL).doc(docId).set(progress, { merge: true });
        return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
};
