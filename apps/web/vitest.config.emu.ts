/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.emu.ts'],
    include: ['**/*.emu.test.ts?(x)'],
  },
  define: {
    'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify('dummy'),
    'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify('localhost'),
    'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify('demo-nurseconnect'),
    'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify('dummy'),
    'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('dummy'),
    'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify('dummy'),
    'process.env.NEXT_PUBLIC_USE_EMULATORS': JSON.stringify('1'),
    'process.env.FIREBASE_AUTH_EMULATOR_HOST': JSON.stringify('127.0.0.1:9099'),
    'process.env.FIRESTORE_EMULATOR_HOST': JSON.stringify('127.0.0.1:8080'),
  }
})