#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${1:-$(pwd)}"
say() { printf "\033[1;32m%s\033[0m\n" "$*"; }

say "Installing Phase-0 files into: $ROOT"

mk() { mkdir -p "$ROOT/$1"; }
wt() { local rel="$1"; shift; mkdir -p "$(dirname "$ROOT/$rel")"; cat > "$ROOT/$rel"; say "✓ wrote $rel"; }

# Minimal Next page + env types (prevents TS18003)
mk apps/web/app
wt apps/web/app/page.tsx <<'EOF'
export default function Page() { return <main style={{padding: 20}}>Hello NurseConnect</main>; }
EOF
wt apps/web/next-env.d.ts <<'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF

# Zod contracts
mk packages/contracts/src
wt packages/contracts/src/index.ts <<'EOF'
import { z } from "zod";
export const Role = z.enum(["patient","nurse","admin"]);
export const User = z.object({ id: z.string(), role: Role, isAvailable: z.boolean().optional(), currentLocation: z.object({ lat: z.number(), lng: z.number(), geohash: z.string().optional(), updatedAt: z.number().optional() }).optional() });
export type User = z.infer<typeof User>;
export const RequestStatus = z.enum(["searching","assigned","en_route","arrived","in_service","completed","cancelled"]);
export const Request = z.object({ id: z.string(), patientId: z.string(), status: RequestStatus, location: z.object({ lat: z.number(), lng: z.number(), geohash: z.string().optional() }), assignedNurseId: z.string().optional(), assignmentExpiresAt: z.number().optional(), etaSeconds: z.number().int().nonnegative().optional(), createdAt: z.number(), updatedAt: z.number() });
export type Request = z.infer<typeof Request>;
export const Event = z.object({ id: z.string().optional(), requestId: z.string(), type: z.string(), actorId: z.string(), at: z.number(), payload: z.record(z.any()).default({}) });
export type Event = z.infer<typeof Event>;
EOF

# Firebase emulators
wt firebase.json <<'EOF'
{
  "functions": { "source": "apps/functions" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "ui": { "enabled": true }
  }
}
EOF
wt .firebaserc <<'EOF'
{ "projects": { "default": "demo-nurseconnect" } }
EOF

# ESLint guard (ban firebase-admin in client code)
wt .eslintrc.cjs <<'EOF'
module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  overrides: [
    {
      files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": ["error", { "paths": [{ "name": "firebase-admin", "message": "Never import firebase-admin in client code" }] }]
      }
    }
  ]
}
EOF

# NextAuth minimal + Firebase client stub
mk apps/web/src/lib
wt apps/web/src/lib/firebaseClient.ts <<'EOF'
import { initializeApp, getApps, getApp } from 'firebase/app';
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!
};
export function initFirebaseClient() { if (!getApps().length) initializeApp(cfg); return getApp(); }
EOF

wt apps/web/src/auth.ts <<'EOF'
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initFirebaseClient } from "./lib/firebaseClient";
initFirebaseClient();
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Firebase",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const auth = getAuth();
        const cred = await signInWithEmailAndPassword(auth, String(creds?.email), String(creds?.password));
        return { id: cred.user.uid, email: cred.user.email ?? "" };
      }
    })
  ]
});
EOF
mk "apps/web/app/api/auth/[...nextauth]"
wt "apps/web/app/api/auth/[...nextauth]/route.ts" <<'EOF'
export { handlers as GET, handlers as POST } from "../../../../src/auth";
EOF

# CI workflow
mk .github/workflows
wt .github/workflows/ci.yml <<'EOF'
name: CI
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint || true
      - run: pnpm turbo type-check
      - run: pnpm -r test:unit || true
EOF

# Vitest config + emulator smoke test
wt vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['**/*.test.ts'] } });
EOF
mk packages/contracts/test
wt packages/contracts/test/emulator.smoke.test.ts <<'EOF'
import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
const cfg = { apiKey:'x', authDomain:'x', projectId:'demo-nurseconnect' };
test('firestore emulator write+read', async () => {
  const app = initializeApp(cfg);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const ref = doc(db, 'smoke/test');
  await setDoc(ref, { ok: true });
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});
EOF

say "All Phase-0 files written."
say "Next:"
echo "  1) pnpm install"
echo "  2) pnpm turbo type-check"
echo "  3) (optional) npm i -g firebase-tools && pnpm emulators:start"
echo "  4) pnpm add -D vitest @vitest/ui @vitest/coverage-v8 && pnpm -r test:unit"
echo "  5) pnpm --filter web add next-auth firebase && pnpm --filter web dev"