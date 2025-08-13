We are now implementing Phase 0: Bootstrap & Baselines.

## Architecture & Technology for this Phase
* **Monorepo**: Turborepo (`apps/web`, `apps/functions`, `packages/contracts`, `packages/ui`, `packages/testing`).
* **Session Management**: NextAuth.js (Auth.js v5) with a Firebase provider.
* **Testing**: Jest (unit/integration), Storybook.
* **Security**: ESLint guard against `firebase-admin` client-side imports.

## Implementation Tasks for Phase 0

1.  **Turborepo & TypeScript Config**: Generate the root `package.json`, `pnpm-workspace.yaml`, and `turbo.json` files. Also, create initial `package.json` and `tsconfig.json` files for each workspace (`apps/web`, `apps/functions`, `packages/*`).
2.  **Zod Schemas**: Create the initial Zod schemas and TypeScript types for `User`, `Request`, and `Event` in `packages/contracts/src/index.ts`.
3.  **Firebase Emulator Setup**: Generate the `firebase.json` and `.firebaserc` files configured for the Auth, Firestore, and Functions emulators.
4.  **NextAuth.js Setup**: Create a basic `auth.ts` file in `apps/web/` to set up NextAuth.js with a Firebase Credentials provider.
5.  **Storybook Init**: Provide the command to initialize Storybook in the `apps/web` directory.
6.  **ESLint Guard**: Provide the ESLint configuration (`.eslintrc.js`) for the monorepo root that includes the rule to forbid `firebase-admin` imports in client-facing packages.
7.  **CI Pipeline**: Generate a starter GitHub Actions workflow file (`.github/workflows/ci.yml`) that lints, type-checks, and runs unit tests.

## Exit Criteria for this Phase
* `pnpm dev` runs successfully.
* The CI pipeline passes.
* An emulator connectivity test passes.
