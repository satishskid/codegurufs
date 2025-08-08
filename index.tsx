import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import { INTERNAL_USERS, isAdmin } from './shared/admin';

const clerkPubKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY || (window as any).CLERK_PUBLISHABLE_KEY;

const AllowlistGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = INTERNAL_USERS.some(u => u.email.toLowerCase() === email);
  if (!allowed) return <div className="p-6 max-w-2xl mx-auto">Your account is not yet invited. Please contact admin.</div>;
  return children as any;
};

const Admin: React.FC = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdmin(email || '')) return <Navigate to="/" replace />;
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-4">Invite users via Clerk Dashboard. Hardcoded allowlist is active until DB is added.</p>
      <ul className="list-disc pl-6 text-sm text-gray-700">
        {INTERNAL_USERS.map(u => (
          <li key={u.email}>{u.email} — {u.role}</li>
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
