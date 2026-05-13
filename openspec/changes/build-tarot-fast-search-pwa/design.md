## Context

The repository currently contains product and technical PDR documents plus static HTML mock references, but no application implementation or existing OpenSpec capability specs. This change introduces Carta Clara as a static, offline-first, mobile-first PWA for iPhone users who need to identify and understand physical tarot cards quickly.

The core constraint is speed: manual lookup should get from user intent to useful meaning in under 3 seconds, search results should appear in under 100 ms, and the app should remain useful offline after the first load. The app must not introduce a backend, login, remote database, uploaded photos by default, chatbot behavior, or generative AI readings.

## Goals / Non-Goals

**Goals:**

- Ship a React and TypeScript PWA that can be statically hosted and installed on iPhone.
- Keep the `Buscar` path independent from heavy detail data, full images, OpenCV, and vision assets.
- Model all 78 tarot cards as editable source content and generate optimized runtime data for summaries, detail, search, and vision.
- Provide instant local search across Spanish and English names, aliases, numbers, suits, keywords, and fuzzy typo variants.
- Persist favorites, recent history, learning state, and current spread locally on device.
- Implement photo matching as local browser computer vision with manual fallback and correction.
- Preserve the mock direction: dark, premium, mystical, legible, tactile, and fast.

**Non-Goals:**

- No backend service, server API, authentication, account sync, or remote user database.
- No generated tarot readings, chatbot, marketplace, community, courses, astrology flow, or random digital draw for MVP.
- No dependency on camera success for core usefulness; manual search must always work.
- No initial-load download of full card images, card detail payloads, OpenCV, or full vision templates.
- No runtime dependency on external font CDNs.

## Decisions

### Use Vite, React, TypeScript, and static hosting

The app will be a Vite React TypeScript project that builds to static files. This matches the PDR architecture and keeps deployment simple across Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

Alternatives considered: Next.js/SSR and a backend-backed app were rejected because the product explicitly needs static offline behavior and no server dependency. Plain HTML/JS was rejected because the app has enough stateful UI, routing, content validation, and testing needs to benefit from React and TypeScript.

### Use `vite-plugin-pwa` with Workbox

PWA support will use `vite-plugin-pwa` as requested in the proposal impact note and PDR-tech. The service worker should use explicit Workbox caching rules, preferably through `injectManifest` once runtime cache behavior is needed for detail JSON, thumbnails, full images, OpenCV chunks, and vision templates.

Alternatives considered: a fully hand-written service worker would add unnecessary setup risk, while a default generated service worker alone may hide caching behavior that needs to be precise for performance and stale asset control.

### Split source content from runtime data

Human-editable card content will live under `content/cards/**`. Build scripts will validate with Zod and generate optimized runtime artifacts under `public/data/**`, including summary data, search documents, a serialized MiniSearch index, detail JSON files, and manifests.

The startup path should load only app shell, card summaries, and the search index. Detail JSON, full images, and vision assets load only when requested.

Alternatives considered: loading full card JSON on boot would simplify fetching but violates the startup target. Hardcoding card data inside TypeScript would make editing, validation, and asset generation harder.

### Use a hybrid search pipeline

Search will normalize input first, then run exact maps for names, aliases, numbers, roman numerals, ranks, and suits before using MiniSearch for fuzzy and prefix matching. Results are merged and reranked so high-intent queries like `luna`, `moon`, `18`, `xviii`, and `3 espadas` return the expected card first.

Alternatives considered: MiniSearch-only search was rejected because exact tarot names and numbers need deterministic priority. Fuse.js was not chosen because MiniSearch better matches the PDR requirement for local indexed search, field boosting, prefix matching, fuzzy search, and serialized indexes.

### Use route and feature-level code splitting

Routes will map to the product tabs and detail views: `/` for `Buscar`, `/foto`, `/cartas`, `/guardadas`, `/carta/:id`, and optionally `/tirada`. The photo route and worker code must be lazy-loaded so OpenCV and vision assets never enter the initial bundle.

Feature modules should stay separated: search must not import photo, cards must not import OpenCV, workers must not import React, and persistence must not depend on UI components.

Alternatives considered: a single-screen state router would reduce setup but makes detail links, tab history, lazy route loading, and PWA navigation weaker.

### Use local persistence with IndexedDB

Durable user data such as favorites, history, learning state, and current spread will use IndexedDB through a small typed persistence layer. Dexie is the preferred abstraction if schema migrations become non-trivial; `idb` is acceptable if the implementation stays minimal. `localStorage` should be limited to small preferences such as theme, last selected tab, install hint state, and camera privacy copy acceptance.

Alternatives considered: storing all user data in `localStorage` was rejected because history, notes, and spread data are structured and may grow. Remote persistence is out of scope for MVP.

### Treat mocks as visual reference, not implementation source

The mock HTML and `mocks/00-aetheric_tarot/DESIGN.md` define the visual language: deep dark surfaces, subtle glass layers, gold/violet accents, editorial headings, readable body text, rounded tactile controls, and minimal icons. Implementation should recreate the direction with reusable React components, CSS variables, and Tailwind utilities rather than importing the mock HTML.

Alternatives considered: copying mock HTML directly would be fast initially but would duplicate structure, bypass app state, and make responsive behavior harder to maintain.

### Keep photo matching local and optional

Photo mode will use browser camera access or image upload, canvas processing, a web worker, lazy OpenCV.js, contour detection, perspective correction, local templates/descriptors, and a composite confidence score. The UX must always offer manual search or correction when confidence is low or camera access fails.

Alternatives considered: server-side recognition and generative AI recognition were rejected because photos should not upload by default and MVP explicitly excludes AI tarot reader behavior. A pure template-match-only approach was rejected because perspective, lighting, and card angle require more robust signals such as ORB and perceptual hashes.

### Test the data pipeline and critical user paths

Vitest will cover content validation, generated data shape, normalization, ranking, repository behavior, and local persistence utilities. Playwright will cover the fast search flow, card detail flow, saved/history flow, offline reload behavior, and photo fallback/correction states.

Alternatives considered: relying only on manual QA was rejected because search ranking and offline behavior are easy to regress. Full browser vision accuracy automation is out of scope initially, but deterministic matcher utilities and fallback UI can be tested.

## Risks / Trade-offs

- OpenCV and vision templates can make the app feel slow -> keep photo code lazy, use a worker, and keep manual search fully independent.
- iOS PWA camera and storage behavior can vary -> provide gallery upload and manual search fallback, and treat local writes as recoverable.
- Search quality depends heavily on aliases and content metadata -> enforce minimum aliases, keyword counts, and ranking fixtures in validation/tests.
- Offline caches can serve stale card data -> version generated data and manifests, and clean old runtime caches when the app updates.
- Visual matching is deck-specific -> start with a known deck/template set and rely on confidence thresholds plus manual correction.
- Rich mystical UI can hurt performance or accessibility -> use CSS variables, small assets, self-hosted fonts, reduced-motion support, high contrast, and lazy images.
- Building all 78 cards is content-heavy -> validate source content in CI/build and fail fast when required fields, images, aliases, or character limits are missing.

## Migration Plan

1. Scaffold the Vite React TypeScript PWA and core project structure.
2. Add design tokens, layout shell, bottom navigation, and route placeholders.
3. Add content schemas and enough seed cards to validate the pipeline, then complete all 78 cards before marking content capability complete.
4. Add generated runtime data and local repository loading.
5. Add search, card detail, saved/history, PWA caching, and photo matching in vertical slices.
6. Add tests around each capability as it lands.
7. Deploy as static assets; rollback is reverting to the previous static deployment because no remote data migration exists.

## Open Questions

- Which physical deck should the first vision template set target, and do we have rights to ship its images/templates?
- Should the first release use the exact mock fonts, or should fonts be adjusted for licensing and bundle size while preserving the same feel?
- Are the mock screens directional references only, or should their spacing and component hierarchy be treated as pixel-close targets?
- Should the first photo milestone ship single-card matching first inside this change, then expand to 1 to 3 cards before completion, or should 1 to 3 card matching be required before any photo flow is considered done?
