# AI-assisted development instructions

## Project architecture

- The browser entry is `index.html` → `src/main.tsx` → `src/App.tsx`. `main.tsx` mounts the app under React `StrictMode` and imports `src/index.css`.
- `src/api/products.ts` fetches and validates product data from DummyJSON.
- `src/hooks/useProducts.ts` owns product loading, error, cancellation, and retry state around that API.
- `src/components/ApiProducts.tsx` is the active catalogue and cart-preview screen. It connects product loading, catalogue cards, cart actions, totals, and persistence.
- `src/reducers/cartReducer.ts` defines cart state and handles adding, removing, and changing quantities.
- `src/utils/cartStorage.ts` loads and validates persisted cart data from `localStorage` and saves cart state.
- `src/components/ErrorBoundary.tsx` catches rendering errors below the app root and displays a retry fallback.

## Task handling and scope

- For inspection-only or review-only requests, do not modify files.
- When implementation is explicitly requested, inspect the relevant code, provide a concise plan, and then implement the requested task. Do not ask for permission for each individual file.
- Keep changes within the requested scope; do not modify unrelated files.
- Ask before deleting existing files, adding dependencies, making unnecessary project configuration changes, or performing destructive actions.
- Preserve existing user work. Never overwrite or discard user changes without permission.

## Testing and verification

- Add meaningful tests for new behavior, failure cases, and relevant edge cases.
- Preserve the 100% per-file statement, branch, function, and line coverage thresholds configured in `vite.config.ts`. Never weaken tests or lower coverage thresholds just to make verification pass.
- Run focused tests first, then `npm run verify` for implementation work. Investigate failures caused by the changes and rerun the relevant checks.
- Report the commands run and their actual outcomes accurately. Do not claim checks passed if they were not run.
- For documentation-only changes, do not run the full test suite unless requested.

## Code quality

- Follow existing TypeScript and React patterns. Keep changes maintainable, consider accessibility, and avoid unnecessary abstractions.
- Explain important implementation decisions in beginner-friendly language without forcing unnecessary theory or asking the user to manually copy code that can safely be implemented in the project.

## Git safety and review

- Use Git diffs to review the scope of modifications and confirm that only intended files changed.
- Preserve the user's existing Git state and work; do not reset, clean, or discard changes without permission.

## Final report

- Explain the files changed, important architectural decisions, tests run and actual outcomes, remaining risks, and any manual browser checks needed.
