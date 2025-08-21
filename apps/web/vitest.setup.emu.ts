import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
loadEnv({ path: resolve(__dirname, '.env.test.local') })
loadEnv({ path: resolve(__dirname, '.env.local') })

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'

// Optional debug:
// console.log('[EMU SETUP]', {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
//   fsHost: process.env.FIRESTORE_EMULATOR_HOST,
// })