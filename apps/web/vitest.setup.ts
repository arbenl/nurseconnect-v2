import '@testing-library/jest-dom/vitest'

// Quiet logger(s) that cause ESM/CJS headaches in tests
import { vi } from 'vitest'
vi.mock('pino', () => ({
  default: () => ({
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
    child: () => ({ info: () => {}, error: () => {}, warn: () => {}, debug: () => {} }),
  }),
}))
