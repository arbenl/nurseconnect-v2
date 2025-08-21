import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "packages/contracts/test/emu/**/*.test.ts?(x)",
      'apps/web/src/**/*/*.emu.test.ts?(x)',
    ],
    environment: "node",
    setupFiles: "./vitest.setup.emu.ts",
    testTimeout: 20000,
  },
});
