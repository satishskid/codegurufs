// Admin API for invite allowlist and roles stored in Firestore
// Minimal endpoints:
// GET /api/admin/users           -> list allowlisted users
// POST /api/admin/users          -> add/update user { email, role }
// DELETE /api/admin/users?email= -> remove user

import getFirestore from '../server/firebaseAdmin';
import { getAuthUser } from '../server/clerkAuth';

const db = (() => {
  try { return getFirestore(); } catch { return null as any; }
})();

const USERS_COLL = 'allowlist_users';

// Optional check: only allow admins via Clerk user or fallback header
const isAdmin = async (email?: string | null) => {
  if (!email || !db) return false;
  const doc = await db.collection(USERS_COLL).doc(String(email).toLowerCase()).get();
  const data = doc.data();
  return !!data && data.role === 'admin';
};

const seedAllowlistIfEmpty = async () => {
  if (!db) return;
  const snap = await db.collection(USERS_COLL).limit(1).get();
  if (!snap.empty) return;
  const seed = process.env.ALLOWLIST_INITIAL;
  if (!seed) return;
  const pairs = seed.split(',').map(s => s.trim()).filter(Boolean);
  const batch = db.batch();
  for (const p of pairs) {
    const [emailRaw, roleRaw] = p.split(':');
    const email = String(emailRaw || '').toLowerCase();
    const role = (roleRaw || 'member').toLowerCase();
    if (!email) continue;
    batch.set(db.collection(USERS_COLL).doc(email), { role }, { merge: true });
  }
  await batch.commit();
};

export default async (req: Request) => {
  if (!db) {
    return new Response(JSON.stringify({ message: 'Database not configured' }), { status: 501 });
  }

  await seedAllowlistIfEmpty();

  const url = new URL(req.url);
  const authUser = await getAuthUser(req);
  const callerEmail = authUser?.email || req.headers.get('x-admin-email');
  if (!(await isAdmin(callerEmail))) {
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
    await db.collection(USERS_COLL).doc(String(email).toLowerCase()).delete();
    return new Response(null, { status: 204 });
  }

  return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
};
