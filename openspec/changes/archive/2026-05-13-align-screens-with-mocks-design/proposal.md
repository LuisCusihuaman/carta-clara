## Why

The current Carta Clara screens satisfy the basic product flow, but they still look like a functional scaffold rather than the premium mystical interface shown in `mocks/`. The UI should be tightened now so the implemented PWA matches the mock direction much more closely before more feature work builds on weak visual foundations.

## What Changes

- Refine the mobile app shell to better match the mock visual language: deeper cosmic background, glassmorphic layers, stronger editorial hierarchy, gold/violet accents, and more intentional bottom navigation styling.
- Restyle the `Buscar` screen to resemble the optimized mock home/search flow, including a more prominent search field, denser quick chips, richer empty state, and premium result cards.
- Restyle card detail screens to better match the La Luna mock: larger hero card treatment, layered interpretation sections, refined segmented orientation control, and more mock-like spacing/typography.
- Restyle the `Cartas` grid to resemble the mock grid, with stronger card thumbnails, tighter 3-column rhythm, filter chips, and visual grouping cues.
- Restyle `Foto`, detected-card, correction, saved/history, and current-spread screens toward the provided mock screens while preserving the current local/offline behavior.
- Keep the implementation in the PWA source structure and use `mocks/` only as visual reference; do not import or runtime-reference mock HTML files.
- Preserve existing performance, accessibility, offline, local-search, persistence, and no-backend/no-generative-AI requirements.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mobile-pwa-shell`: Strengthen visual-design requirements for the app shell, navigation, tokens, surfaces, typography, and motion so implemented screens closely follow the mock style.
- `fast-card-search`: Refine requirements for the search home, empty/searching/result/no-result states, quick chips, and compact result cards to match the search mocks more closely.
- `card-browse-detail`: Refine requirements for the card grid, card detail, orientation control, related cards, and current-spread presentation to match their corresponding mocks.
- `saved-cards-history`: Refine requirements for saved/history/learning-state presentation so `Guardadas` follows the same premium card/list visual system.
- `photo-card-matching`: Refine requirements for camera capture, detected cards, low-confidence correction, and photo result states to match the photo and correction mocks.

## Impact

- Affects React screen components, shared UI primitives, CSS variables/design tokens, Tailwind class usage, and responsive/mobile layout details.
- May require reorganizing visual components to support reusable mock-like glass cards, chips, bottom navigation, card thumbnails, interpretation rows, and state panels.
- Does not change card data contracts, search ranking, IndexedDB schemas, service-worker behavior, backend policy, or the no-generative-AI product boundary.
