We need modern UX for Phase 1 (Auth & Roles).

Scope:
- Home page hero with clear CTA (Sign in/Sign up), responsive, dark mode, accessible.
- Top nav (hamburger on mobile), authenticated vs unauthenticated states.
- Signup/Login pages using shadcn/ui forms, field validation, error states.
- Dashboard shell: sidebar on desktop, tabbed bottom bar on mobile.
- Design tokens (tailwind.config) and CSS variables; dark mode toggle.

Exit Criteria:
- Pages render on mobile & desktop without layout shift.
- Basic keyboard navigation works; labels & aria present.
- Lighthouse mobile performance >= 85, accessibility >= 95 (if perf agent used).
- Vitest snapshots or simple render tests for key components.