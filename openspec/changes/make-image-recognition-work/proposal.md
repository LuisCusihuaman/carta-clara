## Why

The `Foto` route currently presents a polished capture UI but image recognition is still a demo path: the worker returns no matches, upload does not trigger matching, and candidate buttons are hardcoded. Users need captured or uploaded images to produce real local card candidates before the photo flow can be considered functional.

## What Changes

- Wire camera capture and image upload into the local photo matching pipeline.
- Replace hardcoded demo candidates with ranked candidates returned from local image analysis.
- Implement a deterministic MVP matcher that can identify likely cards from generated/local card art using browser-safe image processing, perceptual hashing, and template comparison.
- Present high-confidence, medium-confidence, low-confidence, and error states from real matching output, with manual correction still available.
- Add photo QA fixtures or deterministic synthetic fixtures so matching behavior can be tested without relying on external services.
- Preserve the no-backend, no-generative-AI, privacy-local, lazy-photo-loading, and manual-search fallback boundaries.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `photo-card-matching`: Require the `Foto` flow to run real local matching from captured/uploaded images, return ranked candidates with confidence, handle unavailable assets/errors, and provide QA coverage for recognition behavior.

## Impact

- Affects `src/features/photo/PhotoPage.tsx`, photo worker wiring, worker image-processing utilities, vision manifest/template loading, and candidate/correction presentation.
- Affects tests and QA scripts for photo matching; may add deterministic fixture assets under test or public fixture paths.
- Does not add backend APIs, remote recognition calls, account requirements, remote sync, generative AI, or changes to card meaning data contracts.
