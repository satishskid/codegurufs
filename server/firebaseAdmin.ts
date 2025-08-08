import admin from 'firebase-admin';

let initialized = false;

export const getAdminApp = () => {
  if (!initialized) {
    try {
      if (!admin.apps.length) {
        const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!svc) {
          console.warn('FIREBASE_SERVICE_ACCOUNT not set. Firestore APIs will not work.');
        } else {
          const credentials = JSON.parse(svc);
          admin.initializeApp({
            credential: admin.credential.cert(credentials as any),
          });
        }
      }
      initialized = true;
    } catch (e) {
      console.error('Failed to init firebase-admin', e);
    }
  }
  return admin.app();
};

export const getFirestore = () => {
  const app = getAdminApp();
  return admin.firestore(app);
};

export default getFirestore;
