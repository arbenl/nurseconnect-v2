// apps/web/src/lib/firebase/admin.ts
import { cert, getApp, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON:', e);
    return null;
  }
}

function createFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    }

    const usingEmulators =
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST || !!process.env.FIRESTORE_EMULATOR_HOST;

    if (usingEmulators) {
        return initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-nurseconnect',
        });
    }

    const sa = parseServiceAccount();
    if (sa) {
        return initializeApp({
            credential: cert(sa as any),
            projectId: sa.project_id,
        });
    }

    return initializeApp();
}

// This is the key to preventing re-initialization in development
declare global {
  var __firebase_admin_app__: App | undefined;
}

const app = global.__firebase_admin_app__ || (global.__firebase_admin_app__ = createFirebaseAdminApp());

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app);
