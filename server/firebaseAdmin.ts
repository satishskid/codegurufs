import admin from 'firebase-admin';

let initialized = false;

export const getAdminApp = () => {
  if (!initialized) {
    try {
      if (!admin.apps.length) {
        const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (svc) {
          const credentials = JSON.parse(svc);
          admin.initializeApp({
            credential: admin.credential.cert(credentials as any),
          });
        } else {
          // Not configured; leave uninitialized
        }
      }
      initialized = true;
    } catch (e) {
      console.error('Failed to init firebase-admin', e);
    }
  }
  if (!admin.apps.length) {
    throw new Error('firebase-admin not configured');
  }
  return admin.app();
};

export const getFirestore = () => {
  if (!admin.apps.length) {
    throw new Error('firebase-admin not configured');
  }
  const app = admin.app();
  return admin.firestore(app);
};

export default getFirestore;
