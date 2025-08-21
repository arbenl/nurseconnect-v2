import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import { describe, it, expect, beforeAll } from "vitest";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

beforeAll(() => {
  const EMU_AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
  const EMU_FS_HOST = process.env.FIRESTORE_EMULATOR_HOST?.split(":")[0] ?? "127.0.0.1";
  const EMU_FS_PORT = Number(process.env.FIRESTORE_EMULATOR_HOST?.split(":")[1] ?? 8080);

  app =
    getApps()[0] ??
    initializeApp({
      apiKey: "fake-api-key",
      authDomain: "localhost",
      projectId: "demo-nurseconnect",
    });

  auth = getAuth(app);
  connectAuthEmulator(auth, `http://${EMU_AUTH}`);

  db = getFirestore(app);
  connectFirestoreEmulator(db, EMU_FS_HOST, EMU_FS_PORT);
});

describe("Profile Page", () => {
  it("should have a test", () => {
    expect(true).toBe(true);
  });
});