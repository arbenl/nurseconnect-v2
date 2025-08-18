import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { adminDb } from '@/lib/firebase/admin';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "isSignUp", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          if (credentials.isSignUp === 'true') {
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;
            return user ? { id: user.uid, email: user.email } : null;
          } else {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;
            return user ? { id: user.uid, email: user.email } : null;
          }
        } catch (e) {
          console.error("Auth Error: ", e);
          return null;
        }
      }
    })
  ],
  adapter: FirestoreAdapter(adminDb),
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token) session.user.id = token.uid as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
  },
  events: {
    createUser: async ({ user }) => {
      const userRef = adminDb.collection('users').doc(user.id);
      await userRef.set({ email: user.email, createdAt: new Date(), roles: ['nurse'] }, { merge: true });
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
