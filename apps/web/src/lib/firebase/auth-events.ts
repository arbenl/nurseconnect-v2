import type { User } from 'next-auth';
import { adminDb as firestore } from './admin';

/**
 * Handles the user sign-in event.
 *
 * @param {{ user: User }}
 */
export async function onUserSignIn({ user }: { user: User }) {
  if (!user.id) {
    return;
  }

  const userRef = firestore.collection('users').doc(user.id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      uid: user.id,
      email: user.email,
      displayName: user.name,
      roles: ['viewer'],
      createdAt: new Date(),
    });
  }
}
