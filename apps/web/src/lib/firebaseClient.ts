// apps/web/src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(cfg);
export const firebaseAuth = getAuth(firebaseApp);

// 👇 Use the emulator in dev
if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true") {
  connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
}