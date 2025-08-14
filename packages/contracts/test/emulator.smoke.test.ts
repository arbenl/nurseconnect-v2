import { test, expect } from "vitest";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc, setDoc, getDoc,
} from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
} from "firebase/auth";

test(
  "firestore emulator write+read (rules aware)",
  async () => {
    // ✅ For Auth emulator you must include apiKey and authDomain
    const app = initializeApp({
      apiKey: "fake-api-key",                              // <-- required by Auth SDK
      authDomain: "demo-nurseconnect.firebaseapp.com",     // <-- any string is ok
      projectId: "demo-nurseconnect",
    });

    // Auth emulator (so request.auth.uid is set in rules)
    const auth = getAuth(app);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;

    // Firestore emulator
    const db = getFirestore(app);
    connectFirestoreEmulator(db, "127.0.0.1", 8080);

    // Write to an allowed path by your rules
    const userRef = doc(db, `users/${uid}`);
    await setDoc(userRef, { ok: true });

    const snap = await getDoc(userRef);
    expect(snap.exists()).toBe(true);
    expect(snap.data()).toEqual({ ok: true });
  },
  15_000
);