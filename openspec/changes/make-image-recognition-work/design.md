## Context

Carta Clara already has a lazy `Foto` route, worker stubs, local CV utility placeholders, photo matching requirements, and a mock-aligned capture UI. The current implementation is not yet functional recognition: the worker returns an empty score list, upload does not start matching, camera capture is not connected to a frame-processing action, and visible candidates are hardcoded demo buttons.

The change must keep the MVP privacy and architecture boundaries: static PWA, no backend, no external recognition API, no generative AI, no account dependency, and no heavy photo assets on the initial `Buscar` route. Recognition quality can be MVP-level but it must be real, deterministic, testable, and paired with manual correction when uncertain.

## Goals / Non-Goals

**Goals:**

- Make captured or uploaded images produce ranked local card candidates with confidence scores.
- Replace demo candidate buttons with results from the photo worker.
- Support upload as the most reliable MVP path and camera capture where browser APIs allow it.
- Use deterministic browser-safe image processing with generated/local card templates so QA can run without external services.
- Preserve lazy loading: image processing code and matching assets load only from the `Foto` flow.
- Preserve manual search/correction as an always-available fallback.

**Non-Goals:**

- No backend, remote recognition service, generative AI, account sync, or remote image upload.
- No production-grade OpenCV accuracy guarantee for arbitrary physical decks in this pass.
- No legal/deck-art asset expansion beyond existing generated/local assets unless separately approved.
- No changes to tarot meaning data contracts, search ranking, or IndexedDB schemas unless strictly required for current-spread updates.

## Decisions

### Use a deterministic generated-template matcher for the MVP

Implement a local matcher that compares uploaded/captured images against existing generated card art or generated vision templates using normalized canvas data, perceptual hash distance, and simple template similarity. This makes recognition actually work for controlled/generated assets and gives a stable baseline for future real-deck CV.

Alternatives considered: full OpenCV/ORB implementation now would add more complexity and asset requirements; keeping demo buttons would not satisfy the requirement that image recognition works.

### Keep matching inside the lazy photo worker

The `Foto` UI should create an `ImageBitmap` from upload or captured frame and send it to the worker. The worker loads the manifest/templates only when needed, computes scores, sorts candidates, and returns status plus ranked results. Main-route search must not import worker code or vision assets.

Alternatives considered: running all matching on the main thread is simpler but risks UI jank on mobile. Preloading templates at boot violates the initial-load isolation requirement.

### Prefer upload-first reliability with camera capture support

Upload is the easiest deterministic path to test and support across desktop/mobile browsers. Camera support should expose a capture action when a stream is active, but the user must still have upload/manual fallback if camera permission fails or canvas capture is unavailable.

Alternatives considered: camera-only recognition would be harder to test and less reliable in restricted PWA contexts.

### Return confidence bands, not binary recognition

The UI should classify worker output into high, medium, low, and unavailable/error states. High confidence can offer a primary detected card; medium should ask for confirmation among candidates; low should guide correction/manual search. Current-spread updates should happen only when the user confirms or selects a candidate.

Alternatives considered: auto-adding the top candidate for every image risks incorrect spreads; never adding from photo makes the recognition flow feel unfinished.

### Add deterministic QA fixtures before real-deck accuracy claims

Use existing generated card SVGs or synthetic rendered fixtures to validate that the matcher can identify known inputs and report top-candidate accuracy. This keeps tests small, local, and legally safe.

Alternatives considered: requiring physical deck photo fixtures now would block implementation on asset sourcing and lighting variability.

## Risks / Trade-offs

- Generated-template matching may not recognize real photographed decks well -> expose confidence/correction clearly and keep manual search prominent.
- Canvas/image processing can be slow on mobile -> resize inputs, limit candidate count, and keep work inside the worker.
- SVG/template loading could increase PWA cache size -> load templates lazily and avoid precaching heavy assets unless needed.
- Camera APIs vary by browser/PWA context -> make upload the reliable fallback and keep permission failure polished.
- False positives can pollute the current spread -> require user confirmation for medium/low confidence and allow correction.

## Migration Plan

1. Add a worker request/response protocol for matching progress, results, unavailable assets, and errors.
2. Build deterministic image normalization and template scoring utilities.
3. Wire upload and camera capture in `Foto` to send real images to the worker.
4. Replace demo candidate controls with result, confirmation, low-confidence, correction, and manual fallback UI.
5. Add unit tests for scoring/ranking and E2E coverage for upload/result/correction paths.
6. Add or update `photo:qa` to report deterministic fixture accuracy.
7. Run validation: `pnpm content:validate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, and `pnpm photo:qa`.

Rollback is straightforward: revert the photo UI/worker/scoring changes. No persisted data migration is expected.

## Open Questions

- Should the MVP matcher target only generated Carta Clara card images, or should it also try to support user photos of common physical decks with best-effort confidence?
- What confidence thresholds should separate high, medium, and low confidence after fixture results are measured?
