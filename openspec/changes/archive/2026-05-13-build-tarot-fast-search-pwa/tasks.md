## 1. Project Foundation

- [x] 1.1 Scaffold the Vite React TypeScript app without adding backend or server runtime dependencies, you could check mocks/ folder for the actual mocks html simple to inspired the heighlings, layout and visual direction, but the actual implementation should be in the new PWA source structure and not reference the mocks directly. The initial scaffold should include the core dependencies, source structure, TypeScript configuration, and basic app shell without card content, search, or photo features.
- [x] 1.2 Add project scripts for dev, build, preview, lint, unit tests, e2e tests, and content generation
- [x] 1.3 Add core dependencies for routing, Tailwind/CSS variables, PWA support, MiniSearch, Zod, local persistence, Vitest, and Playwright
- [x] 1.4 Create the recommended source structure for app, components, features, workers, db, data, and shared lib modules
- [x] 1.5 Configure TypeScript path aliases and strict type checking for app code, scripts, and tests

## 2. Mobile PWA Shell

- [x] 2.1 Implement the app router with routes for `/`, `/foto`, `/cartas`, `/guardadas`, `/carta/:id`, and `/tirada`
- [x] 2.2 Implement the mobile app shell with bottom tabs for `Buscar`, `Foto`, `Cartas`, and `Guardadas`
- [x] 2.3 Implement dark visual tokens, self-hosted font loading, layout spacing, rounded surfaces, gold/violet accents, and reusable UI primitives from the mock direction
- [x] 2.4 Add accessible focus states, aria labels for icon-only controls, 44px minimum tap targets, 16px input text, and reduced-motion styles
- [x] 2.5 Configure the web app manifest with Carta Clara metadata, icons, standalone display, portrait orientation, and theme colors
- [x] 2.6 Configure `vite-plugin-pwa` and Workbox to precache app shell, core assets, manifest, icons, card summaries, search index, and offline fallback
- [x] 2.7 Add runtime cache rules for detail JSON, thumbnails, full card images, vision templates, and the lazy OpenCV/photo chunk
- [x] 2.8 Add app boot states for loading shell, loading summaries, search ready, offline ready, update available, and storage error

## 3. Tarot Content Pipeline

- [x] 3.1 Define shared card types for source content, card summaries, card details, search docs, manifests, orientations, taxonomy, and media references
- [x] 3.2 Add Zod schemas for card source files and generated runtime artifacts
- [x] 3.3 Implement `validate-content` to require exactly 78 stable card IDs, required fields, minimum aliases, editorial limits, related cards, thumbnails, and full images
- [x] 3.4 Add source content files for all 22 major arcana cards with Spanish/English names, aliases, taxonomy, meanings, keywords, related cards, and media references
- [x] 3.5 Add source content files for all cups cards with complete validated fields
- [x] 3.6 Add source content files for all swords cards with complete validated fields
- [x] 3.7 Add source content files for all wands cards with complete validated fields
- [x] 3.8 Add source content files for all pentacles cards with complete validated fields
- [x] 3.9 Implement generation for `cards.summary.v1.json` using only startup, search result, popular, recent, and compact-card fields
- [x] 3.10 Implement generation for per-card detail JSON files under `cards.detail/`
- [x] 3.11 Implement generation for search documents and a serialized MiniSearch index
- [x] 3.12 Implement generation for the versioned app/content/search/vision manifest
- [x] 3.13 Add optimized thumbnail and full-image assets or placeholders that satisfy validation without entering the initial bundle

## 4. Fast Card Search

- [x] 4.1 Implement the static card repository for loading summaries at startup and details lazily by card ID
- [x] 4.2 Implement text normalization for case, accents, punctuation, whitespace, roman numerals, Spanish/English ranks, suits, and aliases
- [x] 4.3 Build exact lookup maps for IDs, slugs, aliases, numbers, suits, and rank/suit combinations
- [x] 4.4 Implement MiniSearch loading from the serialized index with field boosts for names, aliases, numbers, ranks, suits, keywords, one-line meanings, quick text, and contexts
- [x] 4.5 Implement result merge and reranking so exact names, aliases, and numbers outrank broad meaning matches
- [x] 4.6 Add search regression fixtures for `luna`, `moon`, `the moon`, `18`, `xviii`, `empratriz`, `emperatris`, `3 espadas`, `three swords`, and `ruptura`
- [x] 4.7 Implement the `Buscar` page with sticky/prominent search input, clear button, contextual placeholder, and horizontal filter chips
- [x] 4.8 Implement empty, typing, results, no-results, suggestions, and offline-search-ready states
- [x] 4.9 Implement compact result cards with thumbnail, name, keywords, upright/reversed one-line meanings, view, copy, and save actions
- [x] 4.10 Add performance instrumentation or tests verifying typical local search queries return within the 100 ms budget after data load

## 5. Card Browse, Detail, and Spread

- [x] 5.1 Implement the `Cartas` grid using all 78 summaries, thumbnails, short names, and 3-column mobile layout
- [x] 5.2 Add grid filters for all cards, major arcana, cups, swords, wands, and pentacles
- [x] 5.3 Add grid interactions for tap-to-detail and long-press save where supported without harming accessibility
- [x] 5.4 Implement the lazy card detail route with image, Spanish/English names, taxonomy, keywords, and progressive content sections
- [x] 5.5 Implement the large `Derecha`/`Invertida` segmented control and orientation-specific detail content
- [x] 5.6 Implement related card navigation from the detail view
- [x] 5.7 Implement copy, save, and add-to-current-spread actions from the detail view
- [x] 5.8 Implement offline detail fallback when detailed JSON or full images are unavailable from cache
- [x] 5.9 Implement the current spread view for up to 3 cards with orientation, source, card lines, repeated keyword themes, and rule-based summary copy
- [x] 5.10 Ensure spread summaries never generate AI-style interpretations and only combine existing card content/rules

## 6. Saved Cards and Local Persistence

- [x] 6.1 Define the local database schema for favorites, recent cards, learning state, and current spread records
- [x] 6.2 Implement persistence helpers for saving, unsaving, listing, and checking favorite cards
- [x] 6.3 Implement recent-history recording with card ID, timestamp, and source context from search, grid, detail, related, saved, and photo flows
- [x] 6.4 Implement learning state updates for unknown, review, and learned states
- [x] 6.5 Implement current spread persistence and recovery across reloads
- [x] 6.6 Implement recoverable UI feedback for local storage write failures without blocking search
- [x] 6.7 Implement preference storage only for small settings such as theme, last selected tab, install hint state, and camera privacy copy acceptance
- [x] 6.8 Implement the `Guardadas` tab with favorites, recent history, learning states, and empty states without requiring authentication

## 7. Photo Card Matching

- [x] 7.1 Implement the lazy `Foto` route so camera UI, workers, OpenCV, and vision assets are excluded from the initial search bundle
- [x] 7.2 Implement camera permission flow with privacy copy, unsupported-camera state, denied-permission state, and stream cleanup when leaving the route
- [x] 7.3 Implement image upload fallback and always-visible manual-search fallback from photo states
- [x] 7.4 Implement the photo worker client and worker boundary without importing React into worker modules
- [x] 7.5 Implement lazy OpenCV initialization in the worker
- [x] 7.6 Implement rectangle detection, perspective correction, crop normalization, and orientation handling for candidate card regions
- [x] 7.7 Implement local template, descriptor, and hash manifest loading for the supported deck
- [x] 7.8 Implement ORB, perceptual hash, and template-match scoring into a composite confidence result
- [x] 7.9 Implement single-card photo matching with top candidate ranking and quick meaning display
- [x] 7.10 Implement confidence states for strong match, medium-confidence confirmation, and low-confidence correction/retry/manual search
- [x] 7.11 Implement 1 to 3 detected-card review with confidence per card, correction, and add-to-current-spread behavior
- [x] 7.12 Add a local photo QA fixture structure and reporting for good light, low light, angled, three cards, reversed, and blurry cases

## 8. Verification and Release Readiness

- [x] 8.1 Add unit tests for content validation, generated data shapes, text normalization, roman numeral handling, search ranking, repository loading, and spread summary rules
- [x] 8.2 Add unit tests for favorites, history, learning state, current spread persistence, and recoverable storage errors
- [x] 8.3 Add e2e coverage for opening the app, searching `luna`, seeing the top result, opening detail, switching orientation, saving a favorite, reloading, and seeing persistence
- [x] 8.4 Add e2e coverage for offline reload with cached app shell, cached search data, and offline detail fallback
- [x] 8.5 Add e2e or component coverage for photo permission denied, upload fallback, low-confidence correction, and manual search fallback
- [x] 8.6 Verify the production build has no backend/API dependency and no OpenCV/photo worker code in the initial search path
- [x] 8.7 Verify app shell, summary data, search index, and thumbnails needed for fast search are cached after first load
- [x] 8.8 Verify initial load, search latency, and photo MVP timings against the documented budgets on target mobile hardware or browser throttling
- [x] 8.9 Run the full validation, unit, e2e, and production build commands and document any residual risks before applying the change
