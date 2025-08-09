export const INTERNAL_USERS = [
  { email: 'satish@skids.health', role: 'admin' as const },
  { email: 'raghab@skids.health', role: 'member' as const },
  { email: 'drpratichi@skids.health', role: 'member' as const },
];

export const ADMIN_EMAILS = INTERNAL_USERS.filter(u => u.role === 'admin').map(u => u.email.toLowerCase());

export const isAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export default { INTERNAL_USERS, isAdmin, ADMIN_EMAILS };
