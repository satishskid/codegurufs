import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import { INTERNAL_USERS, isAdmin as isAdminLocal } from './shared/admin';

const clerkPubKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY || (window as any).CLERK_PUBLISHABLE_KEY;

const useServerAllowlist = () => {
  const [users, setUsers] = React.useState(INTERNAL_USERS);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin', { headers: { 'x-admin-email': 'bootstrap@local' } });
        if (res.status === 200) {
          const data = await res.json();
          setUsers(data.users?.map((u: any) => ({ email: u.email, role: u.role })) || INTERNAL_USERS);
        }
      } catch {}
    })();
  }, []);
  return users;
};

const AllowlistGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const users = useServerAllowlist();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = users.some(u => u.email.toLowerCase() === email);
  if (!allowed) return <div className="p-6 max-w-2xl mx-auto">Your account is not yet invited. Please contact admin.</div>;
  return children as any;
};

const Admin: React.FC = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const [users, setUsers] = React.useState<{ email: string; role: string }[]>(INTERNAL_USERS);
  const [newEmail, setNewEmail] = React.useState('');
  const [role, setRole] = React.useState('member');

  const isAdmin = isAdminLocal(email);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin', { headers: { 'x-admin-email': email } });
        if (res.status === 200) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch {}
    })();
  }, [email]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const addOrUpdate = async () => {
    if (!newEmail) return;
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-email': email },
      body: JSON.stringify({ email: newEmail, role })
    });
    setNewEmail('');
    const res = await fetch('/api/admin', { headers: { 'x-admin-email': email } });
    if (res.ok) setUsers((await res.json()).users);
  };

  const removeUser = async (uEmail: string) => {
    await fetch(`/api/admin?email=${encodeURIComponent(uEmail)}`, { method: 'DELETE', headers: { 'x-admin-email': email } });
    const res = await fetch('/api/admin', { headers: { 'x-admin-email': email } });
    if (res.ok) setUsers((await res.json()).users);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-4">Manage invite allowlist and roles. This uses Firestore when configured.</p>
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-2 py-1" placeholder="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <select className="border rounded px-2 py-1" value={role} onChange={e => setRole(e.target.value)}>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={addOrUpdate} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
      </div>
      <ul className="list-disc pl-6 text-sm text-gray-700">
        {users.map(u => (
          <li key={u.email} className="flex items-center justify-between">
            <span>{u.email} — {u.role}</span>
            <button onClick={() => removeUser(u.email)} className="text-red-600 text-xs">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SignInPage: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <SignIn routing="path" path="/sign-in" signUpUrl={undefined} />
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <AllowlistGate><App /></AllowlistGate> },
  { path: '/admin', element: <AllowlistGate><Admin /></AllowlistGate> },
  { path: '/sign-in', element: <SignInPage /> },
]);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} signInForceRedirectUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
);
