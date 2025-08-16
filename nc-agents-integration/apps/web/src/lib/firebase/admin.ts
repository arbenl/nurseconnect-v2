import * as admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
  ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8')
  : '{}';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
