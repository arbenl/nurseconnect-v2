import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: [
      'packages/contracts/test/emu/**/*.test.ts?(x)',
      // add web emulator tests here later if you create them:
      // 'apps/web/src/**/*/*.emu.test.ts?(x)',
    ],
    environment: 'node',
    setupFiles: './vitest.setup.emu.ts',
    testTimeout: 20000,
  },
})