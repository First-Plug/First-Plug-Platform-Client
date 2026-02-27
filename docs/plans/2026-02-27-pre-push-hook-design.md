# Pre-push Hook Design

## Goal
Block git pushes to `develop` and `main` if Vitest unit tests fail. Uses Husky to distribute the hook automatically via `npm install`.

## Behavior
- Push to `develop` or `main` → run `vitest run --passWithNoTests`
- Tests pass (or no test files yet) → push proceeds
- Tests fail → push is blocked
- Any other branch → hook skipped, push proceeds normally
- E2E (Playwright) excluded — too slow and requires a running server

## Files
- `.husky/pre-push` — shell script with branch detection + test run
- `package.json` — add `"prepare": "husky"` script

## Hook logic
```bash
branch=$(git symbolic-ref HEAD | sed 's|refs/heads/||')
if [[ "$branch" == "develop" || "$branch" == "main" ]]; then
  npm run test:run -- --passWithNoTests
fi
```

## Notes
- `--passWithNoTests` ensures the hook doesn't block pushes before any test files exist
- `prepare` script runs automatically on `npm install` for all team members
