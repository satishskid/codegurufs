export const INTERNAL_USERS = [
  { email: 'satish@example.com', role: 'admin' as const },
  { email: 'raghab@example.com', role: 'member' as const },
  { email: 'pratichi@example.com', role: 'member' as const },
];

export const ADMIN_EMAILS = INTERNAL_USERS.filter(u => u.role === 'admin').map(u => u.email.toLowerCase());

export const isAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export default { INTERNAL_USERS, isAdmin, ADMIN_EMAILS };
