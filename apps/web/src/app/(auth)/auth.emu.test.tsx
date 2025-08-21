import { describe, it, expect, vi, beforeAll } from "vitest";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

describe("Authentication", () => {
  beforeAll(() => {
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
  });

  it("should sign up a new user and create a user document in Firestore", async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";

    // Sign up the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    expect(user).toBeTruthy();

    // Create user document
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { email: user.email, roles: ["staff"] });

    // Verify the user document
    const userDoc = await getDoc(userRef);
    expect(userDoc.exists()).toBe(true);
    expect(userDoc.data()).toEqual({ email: user.email, roles: ["staff"] });
  });

  it("should log in an existing user", async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";

    // Create a user to log in
    await createUserWithEmailAndPassword(auth, email, password);

    // Log in the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    expect(userCredential.user).toBeTruthy();
  });
});
