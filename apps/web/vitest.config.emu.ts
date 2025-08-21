/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import fs from 'node:fs'

// 1) Load env as early as possible so any imported module sees it
const candidateEnvFiles = [
  resolve(__dirname, '.env.test.local'),
  resolve(__dirname, '.env.local'),
]
for (const p of candidateEnvFiles) {
  if (fs.existsSync(p)) {
    loadEnv({ path: p })
    break
  }
}

// 2) Ensure required vars exist (fallbacks fine for emulator)
const REQ = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_AUTH_EMULATOR_HOST',
  'FIRESTORE_EMULATOR_HOST',
] as const

for (const k of REQ) {
  if (!process.env[k]) {
    // Provide safe local defaults for emulator runs
    if (k === 'NEXT_PUBLIC_FIREBASE_API_KEY') process.env[k] = 'fake-key'
    else if (k === 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') process.env[k] = 'localhost'
    else if (k === 'NEXT_PUBLIC_FIREBASE_PROJECT_ID') process.env[k] = 'demo-nurseconnect'
    else if (k === 'NEXT_PUBLIC_FIREBASE_APP_ID') process.env[k] = 'fake-app-id'
    else if (k === 'FIREBASE_AUTH_EMULATOR_HOST') process.env[k] = '127.0.0.1:9099'
    else if (k === 'FIRESTORE_EMULATOR_HOST') process.env[k] = '127.0.0.1:8080'
  }
}

// 3) Inline the public envs at transform time so "process.env.X" has a value in code
const defineEnv = Object.fromEntries(
  [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ].map(k => [`process.env.${k}`, JSON.stringify(process.env[k] ?? '')]),
)

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.emu.ts'],
    include: ['src/**/*.emu.test.ts', 'src/**/*.emu.test.tsx'],
    // keep unit tests separate; do not pull *.test.tsx without .emu.
  },
  define: defineEnv,
})