import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../../../src/lib/firebaseClient"; // <- correct relative path

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email = "", password = "" } = (credentials ?? {}) as {
          email?: string; password?: string;
        };
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (cred.user) return { id: cred.user.uid, email: cred.user.email ?? "" };
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };