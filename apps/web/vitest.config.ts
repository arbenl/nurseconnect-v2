import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      '**/*.e2e.*',
      // keep emulator tests out of default runs:
      '../../packages/**/emulator.*.test.ts',
      '../../packages/**/__tests__/**',
    ],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
})
