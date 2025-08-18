import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // Only unit tests
    include: [
      'apps/web/src/**/*.test.ts?(x)',
      'packages/contracts/test/unit/**/*.test.ts?(x)',
    ],
    // Never pick emulator tests in CI
    exclude: [
      'packages/contracts/test/emu/**',
      '**/*.emu.test.ts?(x)',
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
    ],
    environment: 'node',
  },
  // (Optional) split per-project; keep if you prefer:
  // test: { ... }, projects: [{ name:'web', ... }, { name:'contracts', ... }]
})