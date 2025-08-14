// .eslintrc.cjs (root)
module.exports = {
  root: true,
  overrides: [
    // Next.js app only
    {
      files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
      extends: ["next", "next/core-web-vitals"],
      settings: { next: { rootDir: ["apps/web"] } },
      rules: {
        // guard to prevent admin SDK in client bundles
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "firebase-admin",
                message: "Never import firebase-admin in client code",
              },
            ],
          },
        ],
        // App Router project; we don't have /pages
        "@next/next/no-html-link-for-pages": "off"
      },
    },

    // Cloud Functions (Node, not Next)
    {
      files: ["apps/functions/**/*.ts"],
      env: { node: true, es2022: true },
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      rules: {
        // keep rules relaxed for now to pass Phase 0
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "off",
      },
    },

    // UI package (React components, not Next)
    {
      files: ["packages/ui/**/*.{ts,tsx}"],
      env: { browser: true, es2022: true },
      parser: "@typescript-eslint/parser",
      plugins: ["react", "@typescript-eslint"],
      extends: ["plugin:react/recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      settings: { react: { version: "18.3" } }, // avoid "detect" warning
      rules: {
        "react/react-in-jsx-scope": "off"
      },
    },
  ],
};