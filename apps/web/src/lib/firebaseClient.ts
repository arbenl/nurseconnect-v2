// lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "demo-nurseconnect",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Point to emulator when running locally
if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, "http://127.0.0.1:9199");
    connectFirestoreEmulator(db, "127.0.0.1", 8180);
}

export { app, auth, db };