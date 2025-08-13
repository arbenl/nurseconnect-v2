module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  overrides: [
    {
      files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": ["error", { "paths": [{ "name": "firebase-admin", "message": "Never import firebase-admin in client code" }] }]
      }
    }
  ]
}
