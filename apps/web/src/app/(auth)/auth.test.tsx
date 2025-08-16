import { describe, it, expect, vi } from 'vitest';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'demo-nurseconnect.firebaseapp.com',
  projectId: 'demo-nurseconnect',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

describe('Authentication', () => {
  it('should sign up a new user and create a user document in Firestore', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    // Sign up the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    expect(user).toBeTruthy();

    // Create user document
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { email: user.email, roles: ['staff'] });

    // Verify the user document
    const userDoc = await getDoc(userRef);
    expect(userDoc.exists()).toBe(true);
    expect(userDoc.data()).toEqual({ email: user.email, roles: ['staff'] });
  });

  it('should log in an existing user', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    // Create a user to log in
    await createUserWithEmailAndPassword(auth, email, password);

    // Log in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    expect(userCredential.user).toBeTruthy();
  });
});
