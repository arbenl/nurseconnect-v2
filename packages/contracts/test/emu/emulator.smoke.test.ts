// packages/contracts/test/emulator.smoke.test.ts
import { describe, it, expect } from "vitest";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";


const PROJECT_ID = "demo-nurseconnect"; // matches your emulator project
const APP_CONFIG = {
  apiKey: "fake-api-key",
  authDomain: "demo-nurseconnect.firebaseapp.com",
  projectId: PROJECT_ID,
  appId: "demo-app-id",
};

function app() {
  return getApps().length ? getApp() : initializeApp(APP_CONFIG);
}

describe("firestore emulator write+read (rules aware)", () => {
  it("writes and reads a doc in test-only collection", async () => {
    const a = app();

    // Auth emulator
    const auth = getAuth(a);
    connectAuthEmulator(auth, "http://127.0.0.1:9098");
    const cred = await signInAnonymously(auth);
    expect(cred.user).toBeTruthy();

    // Firestore emulator
    const db = getFirestore(a);
    connectFirestoreEmulator(db, "127.0.0.1", 8081);

    // test collection allowed for any authenticated user by rules
    
    const ref = doc(db, "test_only", "smoke");
    await setDoc(ref, { ok: true, ts: Date.now(), uid: cred.user.uid });

    const snap = await getDoc(ref);
    expect(snap.exists()).toBe(true);
    expect(snap.data()?.ok).toBe(true);
  }, 15_000);

  it("allows creating a user document with default role", async () => {
    const a = app();
    const auth = getAuth(a);
    connectAuthEmulator(auth, "http://127.0.0.1:9098");
    const db = getFirestore(a);
    connectFirestoreEmulator(db, "127.0.0.1", 8081);

    const userCred = await signInAnonymously(auth);
    const user = userCred.user;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { email: "anonymous@example.com", roles: ["staff"] });

    const userDoc = await getDoc(userRef);
    expect(userDoc.exists()).toBe(true);
    expect(userDoc.data()).toEqual({ email: "anonymous@example.com", roles: ["staff"] });
  });
});