## Context

Carta Clara now has a working static PWA with search, card browsing, detail, saved/history, current spread, and photo fallback flows. The screens are functional but visually underdeveloped compared with the reference material in `mocks/`, especially the deep cosmic background, glassmorphic cards, high-end editorial typography, thin gold linework, violet glow, and dense mobile-first hierarchy.

TEN MUCHO CUIDADO puede haber algunas pantallas rotas, asi que toma las mejores decisiones de diseño UX UI para que todas las pantallas sean concruentes

This change is visual and structural across the UI layer. It should not change the app data model, generated card content, search ranking, IndexedDB schemas, service-worker strategy, or the no-backend/no-generative-AI product boundaries.

## Goals / Non-Goals

**Goals:**

- Bring implemented screens much closer to the mock style while preserving existing behavior.
- Establish reusable visual primitives for mock-like screens: app frame, cosmic background, glass panels, tarot card art shells, chips, icon buttons, interpretation rows, bottom nav, and state panels.
- Refine the main flows represented in mocks: search home, search results, card detail, grid, photo capture, detected cards, correction, saved/history, and current spread.
- Keep the app mobile-first and iPhone-friendly, with readable text, 44px tap targets, and reduced-motion support.
- Use `mocks/` as reference only; all implementation remains in `src/` and runtime assets.

**Non-Goals:**

- No new product capability, routing model, backend, auth, remote sync, or card data schema changes.
- No pixel-perfect HTML copy/paste from `mocks/`.
- No dependency on mock HTML files at runtime.
- No heavy animation, canvas background, remote font CDN, or asset strategy that harms startup/search speed.
- No attempt to make real OpenCV recognition production-grade in this visual pass.

## Decisions

### Centralize the mock visual language in tokens and primitives

Update `src/styles/tokens.css` and shared UI components so the mock language is applied consistently: obsidian/deep-brown backgrounds, warm surface containers, mystic gold, electric violet, thin etched borders, glass translucency, soft glows, rounded cards, editorial display type, and clean sans body text.

Alternatives considered: restyling each screen independently would move faster but create inconsistent spacing, surfaces, and effects. Importing mock CSS/HTML was rejected because mocks are reference artifacts, not production source.

### Use CSS and Tailwind composition, not new UI dependencies

The visual pass should use the existing React/Tailwind setup and a small set of local components. Components should carry the style system, while screens decide layout and content hierarchy.

Alternatives considered: adding a component library would conflict with the distinctive mock style and add unnecessary dependency surface. A CSS-only global refactor would make stateful components harder to maintain.

### Rebuild screen hierarchy around mock-specific sections

Each screen should adopt the hierarchy visible in its closest mock:

- Search/home: prominent question/title, large tactile search bar, compact chips, recent/popular/search state blocks, premium result cards.
- Search in progress/result: visible processing/searching state, strong top result, quick action row, copy/save affordances.
- Detail: large tarot hero card, title block, keywords, orientation segmented control, glass interpretation rows, related cards, bottom action rhythm.
- Grid: tight 3-column card gallery, filter chips, stronger thumbnail frames, readable short labels.
- Photo: camera frame/overlay visual, privacy copy, capture/upload/manual fallback, detected-card list, confidence chips, correction flow.
- Current spread: 1-3 card stacked/row presentation, compact summary, repeated themes, rule-based advice.
- Saved/history: premium list cards for favorites, recents, and learning states.

Alternatives considered: minor color tweaks would not solve the user-reported mismatch. Full visual rewrite without preserving flows would risk regressions.

### Prefer local generated tarot placeholders until real art is available

The current generated SVG card placeholders should be restyled to look like premium tarot cards: dark stock, gold border, central glyph/label, and mock-like proportions. This avoids depending on copyrighted deck art while improving the visual impression.

Alternatives considered: shipping Rider-Waite art now has licensing and asset implications; keeping plain placeholders weakens every screen that relies on card imagery.

### Add visual regression-friendly E2E assertions

Existing E2E tests should continue to verify flows. Add or update assertions for key visual landmarks and mock-aligned states where practical: search hero, result cards, detail sections, grid, photo fallback/correction, and current spread. Avoid brittle pixel assertions unless a screenshot tool is introduced later.

Alternatives considered: pure manual review is necessary for taste, but not enough to prevent accidental removal of core screen landmarks.

## Risks / Trade-offs

- Visual fidelity may compete with performance -> keep effects CSS-only, avoid large background images, and keep photo code lazy.
- Mock style can reduce readability if overdone -> preserve minimum 16px important text, high contrast, and simple copy hierarchy.
- More reusable primitives can over-abstract early -> only extract components used by multiple screens.
- Placeholders may still not feel like final tarot art -> improve card frames now, but leave real deck art/template decisions for a separate asset/legal pass.
- E2E tests may become brittle if they assert styling too tightly -> assert semantic landmarks and user-visible states, not exact CSS values.

## Migration Plan

1. Inventory the current implemented screens against the closest mock screen for each flow.
2. Update design tokens and shared primitives first so screen changes remain consistent.
3. Restyle the app shell and bottom navigation.
4. Restyle search, result cards, card detail, and grid as the highest-impact screens.
5. Restyle photo, correction/detected states, saved/history, and current spread.
6. Update E2E/unit coverage for preserved flows and visible state landmarks.
7. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

Rollback is straightforward: revert UI/token/component changes. No persisted data migration is expected.

## Open Questions

- Should the visual target prioritize the warm brown/gold palette from `mocks/00-aetheric_tarot/DESIGN.md` or the darker violet/gold direction from some generated screens when they conflict?
- Are screenshots in `mocks/*/screen.png` the final reference, or should `code.html` spacing/colors be treated as authoritative when they differ?
- Do we want to add screenshot-based visual regression after this pass, or keep visual QA manual for now?
