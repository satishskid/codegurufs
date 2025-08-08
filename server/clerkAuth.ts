import { createClerkClient, verifyToken } from '@clerk/backend';

export interface AuthUser {
  userId: string;
  email: string | null;
}

const getSecretKey = () => {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error('CLERK_SECRET_KEY not configured');
  return key;
};

export const getAuthUser = async (req: Request): Promise<AuthUser | null> => {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    if (!token) return null;

    const secretKey = getSecretKey();
    const claims = await verifyToken(token, { secretKey });
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(String(claims.sub));
    const email = (user.primaryEmailAddress?.emailAddress) || (user.emailAddresses?.[0]?.emailAddress) || null;
    return { userId: String(claims.sub), email };
  } catch (_e) {
    return null;
  }
};

export const requireAuth = async (req: Request): Promise<AuthUser> => {
  const user = await getAuthUser(req);
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
};

export default getAuthUser;
