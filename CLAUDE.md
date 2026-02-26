# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Production build
npm run lint       # ESLint via next lint
```

There is no test framework configured in this project.

## Environment Setup

Copy `.env.example` and fill in values. Required for local dev:
- `NEXT_PUBLIC_API=http://localhost:3001` — backend API URL
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET` — any random string

## Architecture

**Next.js 13 App Router** with TypeScript. Path alias `@/*` maps to `src/*`.

### Folder Layout

```
src/
├── app/                    # Next.js routes (App Router)
│   ├── api/auth/           # NextAuth route handler
│   ├── home/               # Protected app routes (layout with Sidebar/Navbar)
│   │   └── (admin)/        # Admin-only routes (logistics, tenants, warehouses)
│   ├── login/              # Auth pages
│   └── waiting/            # Pending-tenant landing
├── features/               # Domain modules (see pattern below)
├── shared/                 # Cross-feature components, hooks, stores, utils
│   ├── components/ui/      # Radix UI + shadcn primitives
│   └── stores/             # Global Zustand stores (alerts, aside)
├── config/
│   ├── axios.config.ts     # Axios instance + HTTPRequests class
│   └── env.config.ts       # Zod-validated env vars
├── providers/              # React context wrappers (Session, Query, Tenant)
└── middleware.ts            # Route protection + role-based redirects
```

### Feature Module Pattern

Every domain feature follows this structure:
```
features/[name]/
├── api/          # TanStack Query hooks wrapping fetch functions
├── components/   # React components
├── hooks/        # Custom hooks (data/business logic)
├── interfaces/   # TypeScript types
├── services/     # API call functions (called by hooks/api)
├── store/        # Zustand store (if needed)
├── utils/        # Helpers, validators
├── schemas/      # Zod validation schemas
└── index.ts      # Barrel export
```

### State Management

Two-layer approach:
- **Zustand** — UI/client state: filters, modal visibility, selections, form state across steps. Stores live in `features/[name]/store/` or `shared/stores/`.
- **TanStack React Query** — Server state: fetching, caching, background sync. Persisted to localStorage with 24h max age. Query keys are defined per feature.

### API Layer

`HTTPRequests` static class in `src/config/axios.config.ts` wraps `axiosInstance`. All API calls go through this class. The interceptor automatically calls `signOut()` on 401 responses. Token injection is set up via `setAuthInterceptor(token)`.

### Authentication

NextAuth with three providers: Google OAuth, Azure AD, and Credentials (email/password via backend). The JWT callback stores `accessToken`, `refreshToken`, `role`, `tenantId`, and `tenantName` in the token.

**Role-based routing in `middleware.ts`**:
- `superadmin` role or specific admin emails → redirected to `/home/logistics`
- Users without `tenantName` → redirected to `/waiting`
- Everyone else → `/home/dashboard`

### Forms & Validation

React Hook Form + Zod. Schemas in `features/[name]/schemas/`. CSV import schemas in `shared/interfaces/csv.ts`. Zod is also used for runtime validation of environment variables (`src/config/env.config.ts`).

## Key Conventions

- **Barrel exports**: Each feature exposes its public API through `index.ts`
- **Component library**: Radix UI primitives + shadcn/ui in `shared/components/ui/`. Prefer these over custom implementations.
- **Tailwind**: Custom colors defined in `tailwind.config.js` (e.g., `blue`, `purple`, `green` are brand colors — not Tailwind defaults). Team-specific colors `team1`–`team25` exist for avatars.
- **Date formatting**: Use utilities in `shared/utils/date.ts` and `shared/utils/dateFormat.ts`; date-fns is the underlying library.
- **Aside/panel system**: Global slide-over panels controlled via `useAsideStore` in `shared/stores/aside.store.ts`.
- **Alerts**: Global toast/alert system via `useAlertStore` in `shared/stores/alerts.store.ts`.
