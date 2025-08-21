import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { beforeAll } from "vitest";

// Minimal fake project config works with emulators
const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "demo-nurseconnect.firebaseapp.com",
  projectId: "demo-nurseconnect",
};

beforeAll(async () => {
  if (!getApps().length) initializeApp(firebaseConfig);

  const auth = getAuth();
  connectAuthEmulator(auth, "http://127.0.0.1:9098");

  const db = getFirestore();
  connectFirestoreEmulator(db, "127.0.0.1", 8081);

  // Add a small delay to ensure emulators are ready
  await new Promise(resolve => setTimeout(resolve, 1000));
});
