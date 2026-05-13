## 1. Worker Protocol And Assets

- [x] 1.1 Define photo worker request/response types for match start, progress, results, unavailable assets, and errors
- [x] 1.2 Add lazy vision asset/template loading that uses local/static card assets and does not run on the default `Buscar` route
- [x] 1.3 Add deterministic fixture or template metadata needed for local matching and QA without external services

## 2. Local Matching Engine

- [x] 2.1 Implement browser-safe image normalization for uploaded/captured images using canvas-compatible APIs
- [x] 2.2 Implement template/perceptual-hash scoring that returns signal details and confidence per candidate
- [x] 2.3 Rank candidates deterministically and classify results into high, medium, low, unavailable, and error states
- [x] 2.4 Keep single-card matching useful when multi-card rectangle detection is unavailable or inconclusive

## 3. Foto UI Integration

- [x] 3.1 Wire image upload to create an image bitmap or equivalent local image payload and send it to the photo worker
- [x] 3.2 Add camera preview capture action that sends a captured frame to the same worker pipeline when camera is active
- [x] 3.3 Replace hardcoded demo candidate buttons with real worker result, loading, uncertainty, and error states
- [x] 3.4 Show high-confidence detected cards with confidence, quick meaning, and confirm/add-to-spread actions
- [x] 3.5 Show medium/low-confidence correction UI with top candidates, retry/upload fallback, and manual search
- [x] 3.6 Ensure confirmed/corrected photo candidates update the current spread with source `photo` and do not auto-add uncertain matches

## 4. Tests And QA

- [x] 4.1 Add unit tests for scoring, ranking, confidence bands, and unavailable/error handling
- [x] 4.2 Add E2E coverage for upload-driven matching, displayed candidates, correction/manual fallback, and confirmed spread addition
- [x] 4.3 Update `pnpm photo:qa` to run deterministic fixture matching and report top-candidate accuracy, confidence, and signal scores
- [x] 4.4 Verify photo code and matching assets remain lazy-loaded outside the `Foto` route

## 5. Validation

- [x] 5.1 Run `pnpm content:validate` and fix any content validation regressions
- [x] 5.2 Run `pnpm typecheck` and fix any type errors
- [x] 5.3 Run `pnpm lint` and fix any lint errors
- [x] 5.4 Run `pnpm test` and fix any unit test failures
- [x] 5.5 Run `pnpm build` and fix any production build failures
- [x] 5.6 Run `pnpm test:e2e` and fix any end-to-end failures
- [x] 5.7 Run `pnpm photo:qa` and document the MVP recognition result in the task completion notes

Photo QA result: deterministic fixtures identified 2/2 top candidates correctly (100%) with confidence and signal scores reported.
