import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { adminDb } from '@/lib/firebase/admin';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: FirestoreAdapter(adminDb),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        const userData = userDoc.data();
        token.id = user.id;
        token.role = userData?.role || 'nurse';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        email: user.email,
        name: user.name,
        image: user.image,
        role: 'nurse', // Default role for new users
        createdAt: new Date().toISOString(),
      });
    },
  },
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-request',
    error: '/signin', // Redirect to signin page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
};
