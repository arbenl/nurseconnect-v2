import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/test/**/*.test.ts",
      "packages/**/test/**/*.spec.ts",
      "packages/**/test/**/*.smoke.test.ts"
    ],
    testTimeout: 15000,
    hookTimeout: 15000
  }
});