# Husky Pre-push Hook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Block `git push` to `develop` and `main` if Vitest unit tests fail, using Husky to distribute the hook automatically via `npm install`.

**Architecture:** Husky installs a `pre-push` git hook that reads the current branch name and runs `vitest run --passWithNoTests` only when pushing to `develop` or `main`. If tests fail the hook exits 1, aborting the push. The `prepare` script in `package.json` ensures every developer gets the hook on `npm install`.

**Tech Stack:** husky, vitest (already configured), bash

---

### Task 1: Install Husky

**Files:**
- Modify: `package.json` (devDependencies — handled by npm)

**Step 1: Install husky**

```bash
npm install -D husky
```

Expected: `husky` added to `devDependencies`, no errors.

**Step 2: Initialize husky**

```bash
npx husky init
```

Expected: `.husky/` directory created with a sample `pre-commit` file. A `"prepare": "husky"` script is added to `package.json` automatically.

**Step 3: Verify .husky/ was created**

```bash
ls .husky/
```

Expected: at least one file listed (e.g. `pre-commit`).

---

### Task 2: Create pre-push hook

**Files:**
- Create: `.husky/pre-push`
- Delete: `.husky/pre-commit` (created by `husky init` as a sample — not needed)

**Step 1: Remove the sample pre-commit hook**

```bash
rm .husky/pre-commit
```

**Step 2: Create `.husky/pre-push` with this exact content**

```bash
#!/bin/sh

branch=$(git symbolic-ref HEAD | sed 's|refs/heads/||')

if [ "$branch" = "develop" ] || [ "$branch" = "main" ]; then
  echo "Running tests before push to $branch..."
  npm run test:run -- --passWithNoTests
fi
```

> Note: Use POSIX sh (`#!/bin/sh`) not bash for maximum compatibility across environments.

**Step 3: Make the hook executable**

```bash
chmod +x .husky/pre-push
```

---

### Task 3: Verify the hook works

**Step 1: Simulate a passing run (no test files = passWithNoTests)**

```bash
npm run test:run -- --passWithNoTests
```

Expected: exit 0, output shows "No test files found" or passes with 0 tests.

**Step 2: Verify hook is executable and readable**

```bash
cat .husky/pre-push
```

Expected: content matches the script above.

**Step 3: Dry-run the hook manually**

```bash
bash .husky/pre-push
```

Expected: if current branch is `develop` or `main`, runs tests and exits 0. If on another branch, exits silently with 0.

---

### Task 4: Commit

**Step 1: Stage and commit**

```bash
git add .husky/pre-push package.json package-lock.json docs/plans/2026-02-27-husky-pre-push.md docs/plans/2026-02-27-pre-push-hook-design.md
git commit -m "$(cat <<'EOF'
feat(ci): add Husky pre-push hook to run tests before pushing to develop/main

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Expected: commit created, clean working tree.

---

## Notes

- The hook uses `--passWithNoTests` so it never blocks pushes until real test files exist
- E2E tests (Playwright) are intentionally excluded — too slow for a local hook
- Any developer cloning the repo gets the hook automatically on `npm install` via the `prepare` script
- To skip the hook in an emergency: `git push --no-verify` (use sparingly)
