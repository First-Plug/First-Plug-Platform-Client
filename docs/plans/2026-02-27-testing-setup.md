# Testing Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Configure Vitest + Testing Library (unit/integration) and Playwright (E2E) with zero test files — infrastructure only.

**Architecture:** Vitest runs in jsdom environment with the `@/*` path alias mirroring tsconfig. Tests are colocated next to source files (`Component.test.tsx`). Playwright targets `localhost:3000` with E2E tests in a top-level `e2e/` directory. No test files are created here — they are added on demand as code is touched.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, @vitest/coverage-v8, @playwright/test

---

### Task 1: Install unit/integration test dependencies

**Files:**
- Modify: `package.json` (devDependencies — handled by npm)

**Step 1: Install packages**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/coverage-v8
```

Expected: packages added to `devDependencies` in `package.json`, no errors.

---

### Task 2: Install E2E test dependency

**Files:**
- Modify: `package.json` (devDependencies — handled by npm)

**Step 1: Install Playwright**

```bash
npm install -D @playwright/test
```

**Step 2: Install browser binaries (Chromium only to keep CI lean)**

```bash
npx playwright install chromium
```

Expected: `.playwright/` cache populated, no errors.

---

### Task 3: Create Vitest config

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

**Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules", "e2e/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["node_modules", "e2e/**", ".next/**", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom";
```

**Step 3: Verify config resolves without errors**

```bash
npx vitest --run --reporter=verbose 2>&1 | head -20
```

Expected: "No test files found" or empty suite — NOT a config error.

---

### Task 4: Create Playwright config

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/.gitkeep`

**Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 2: Create `e2e/.gitkeep` so the directory is tracked**

```bash
touch e2e/.gitkeep
```

---

### Task 5: Add scripts to package.json

**Files:**
- Modify: `package.json`

**Step 1: Add test scripts**

Add these entries to the `"scripts"` block in `package.json`:

```json
"test":          "vitest",
"test:run":      "vitest run",
"test:coverage": "vitest run --coverage",
"test:e2e":      "playwright test"
```

**Step 2: Verify scripts run**

```bash
npm run test:run 2>&1 | tail -5
```

Expected: "No test files found" (exit 0) or similar — NOT a missing config error.

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Replace the Commands section to include test scripts**

Update the `## Commands` block to:

```markdown
## Commands

\`\`\`bash
npm run dev           # Start development server (port 3000)
npm run build         # Production build
npm run lint          # ESLint via next lint
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run (CI)
npm run test:coverage # Vitest with coverage report
npm run test:e2e      # Playwright E2E tests (requires dev server or CI)
\`\`\`

There is no test framework configured in this project.
```

Remove the line "There is no test framework configured in this project." since we now have one.

---

### Task 7: Commit

**Step 1: Stage and commit**

```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts e2e/.gitkeep package.json package-lock.json CLAUDE.md docs/plans/2026-02-27-testing-setup.md
git commit -m "feat(testing): configure Vitest + Playwright infrastructure"
```

---

## Notes for on-demand test writing

When writing the first test for a component or hook that uses TanStack Query or NextAuth, create `src/tests/utils.tsx` with a `renderWithProviders()` helper:

```tsx
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export function renderWithProviders(ui: ReactNode) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}
```

Common Next.js mocks to add in `vitest.setup.ts` if/when needed:

```ts
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```
