## Why

Beginners using physical tarot cards need a fast, forgiving way to identify a card and understand its practical meaning without studying a full reference book. Carta Clara should turn the PDR into an installable, mobile-first PWA that gets from intent to useful meaning in under 3 seconds for manual lookup, while keeping photo matching local and non-generative.

## What Changes

- Build a mobile-first PWA with bottom navigation for `Buscar`, `Foto`, `Cartas`, and `Guardadas`, following the PDR and mock screens as the product and visual reference.
- Add an offline-first tarot card dictionary for all 78 cards, including Spanish and English names, aliases, taxonomy, keywords, upright/reversed meanings, related cards, and optimized media references.
- Add instant local search with fuzzy, prefix, bilingual, number, suit, and keyword matching so results appear while typing.
- Add quick result and card detail experiences that layer meaning from one-line summaries to deeper categories such as love, work, money, advice, and yes/no.
- Add favorites, recent history, copyable meanings, and beginner-friendly interaction states stored locally on device.
- Add a photo capture flow for recognizing 1 to 3 physical cards using local visual matching, confidence feedback, and manual correction when detection is uncertain.
- Add installable and offline behavior for the app shell, textual card data, thumbnails, favorites, and history without adding login, backend APIs, remote databases, chatbot behavior, or generative AI tarot readings.

## Capabilities

### New Capabilities

- `mobile-pwa-shell`: Covers the installable mobile app shell, bottom navigation, offline availability, startup performance, accessibility basics, and visual direction from the mocks.
- `tarot-card-content`: Covers the 78-card content model, layered meanings, bilingual names, taxonomy, search metadata, related cards, and media references.
- `fast-card-search`: Covers instant local search, fuzzy and prefix matching, bilingual lookup, number/suit/keyword queries, result ranking, quick cards, and copyable summaries.
- `card-browse-detail`: Covers the card grid, compact card presentation, card detail view, upright/reversed toggling, and progressive disclosure of deeper meanings.
- `saved-cards-history`: Covers favorites, recent cards, local persistence, and saved-card states used by the `Guardadas` tab.
- `photo-card-matching`: Covers camera capture for 1 to 3 physical cards, local visual matching without generative AI, result confidence, detected-card review, and manual correction.

### Modified Capabilities

- None. No existing capability specs currently exist in `openspec/specs/`.

## Impact

- Adds a new static React/TypeScript PWA implementation with generated assets and runtime data under the project source/public structure., use this; https://github.com/vite-pwa/vite-plugin-pwa
- Adds local content/data validation and build-time generation for optimized summary, search, detail, image, and vision assets.
- Adds client-side dependencies for local search, PWA caching, local persistence, validation, tests, and eventually browser-based vision processing.
- Affects app performance budgets, offline caching strategy, iPhone Safari/PWA behavior, and privacy expectations for photo handling.
- Does not introduce backend services, authentication, uploaded photos by default, remote user data, or server APIs for MVP.
