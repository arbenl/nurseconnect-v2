import { describe, it, expect, beforeAll } from "vitest";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from "firebase/firestore";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let uid: string;

describe("Auth + Profile Emulator Integration", () => {
  beforeAll(async () => {
    const cfg = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };
    app = getApps()[0] ?? initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);

    const [ah, ap] = (process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099').split(':');
    connectAuthEmulator(auth, `http://${ah}:${ap}`);
    const [fh, fp] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
    connectFirestoreEmulator(db, fh!, Number(fp));

    // Create or sign in test user
    try {
      const res = await createUserWithEmailAndPassword(auth, "emuuser@example.com", "password123");
      uid = res.user.uid;
    } catch {
      const res = await signInWithEmailAndPassword(auth, "emuuser@example.com", "password123");
      uid = res.user.uid;
    }
  });

  it("should allow user to login", async () => {
    const res = await signInWithEmailAndPassword(auth, "emuuser@example.com", "password123");
    expect(res.user.email).toBe("emuuser@example.com");
  });

  it("should allow profile update in Auth", async () => {
    if (!auth.currentUser) throw new Error("No current user");
    await updateProfile(auth.currentUser, { displayName: "Test User" });
    expect(auth.currentUser.displayName).toBe("Test User");
  });

  it("should create and update Firestore profile document", async () => {
    await signInWithEmailAndPassword(auth, "emuuser@example.com", "password123");
    const profileRef = doc(db, "users", uid);
    await setDoc(profileRef, { name: "John Doe", role: "patient" });

    const snap = await getDoc(profileRef);
    expect(snap.exists()).toBe(true);
    expect(snap.data()).toMatchObject({ name: "John Doe", role: "patient" });

    // Update profile
    await setDoc(profileRef, { role: "nurse" }, { merge: true });
    const updatedSnap = await getDoc(profileRef);
    expect(updatedSnap.data()?.role).toBe("nurse");
  });
});