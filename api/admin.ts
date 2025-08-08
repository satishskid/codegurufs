// Admin API for invite allowlist and roles stored in Firestore
// Minimal endpoints:
// GET /api/admin/users           -> list allowlisted users
// POST /api/admin/users          -> add/update user { email, role }
// DELETE /api/admin/users?email= -> remove user

import getFirestore from '../server/firebaseAdmin';

const db = (() => {
  try { return getFirestore(); } catch { return null as any; }
})();

const USERS_COLL = 'allowlist_users';

// Optional check: only allow admins via header X-Admin-Email present in allowlist
const isAdmin = async (email?: string | null) => {
  if (!email || !db) return false;
  const doc = await db.collection(USERS_COLL).doc(email.toLowerCase()).get();
  const data = doc.data();
  return !!data && data.role === 'admin';
};

export default async (req: Request) => {
  if (!db) {
    return new Response(JSON.stringify({ message: 'Database not configured' }), { status: 501 });
  }

  const url = new URL(req.url);
  const adminEmail = req.headers.get('x-admin-email');
  if (!(await isAdmin(adminEmail))) {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  if (req.method === 'GET') {
    const snap = await db.collection(USERS_COLL).get();
    const users = snap.docs.map(d => ({ email: d.id, ...(d.data() || {}) }));
    return new Response(JSON.stringify({ users }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    const { email, role } = await req.json();
    if (!email || !role) {
      return new Response(JSON.stringify({ message: 'Missing email or role' }), { status: 400 });
    }
    await db.collection(USERS_COLL).doc(String(email).toLowerCase()).set({ role }, { merge: true });
    return new Response(null, { status: 204 });
  }

  if (req.method === 'DELETE') {
    const email = url.searchParams.get('email');
    if (!email) return new Response(JSON.stringify({ message: 'Missing email' }), { status: 400 });
    await db.collection(USERS_COLL).doc(email.toLowerCase()).delete();
    return new Response(null, { status: 204 });
  }

  return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
};
