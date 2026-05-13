## 1. Visual Foundations

- [ ] 1.1 Audit current implemented screens against the closest `mocks/` references and note any broken or incongruent UI areas to address during the pass
- [ ] 1.2 Update shared CSS tokens for the mock-aligned palette, surfaces, borders, glows, shadows, typography, spacing, and reduced-motion behavior
- [ ] 1.3 Create or refine reusable mock-style primitives for glass panels, section headers, chips, icon actions, state panels, confidence badges, interpretation rows, and premium tarot card frames
- [ ] 1.4 Restyle generated tarot card placeholders with mock-like proportions, dark stock, gold borders, central glyph/label treatment, and consistent thumbnail/hero variants

## 2. App Shell And Navigation

- [ ] 2.1 Restyle the root app frame with a deep cosmic background, safe-area-aware mobile layout, layered depth, and consistent page padding
- [ ] 2.2 Restyle the header and bottom navigation to match the premium mock direction while preserving labels, active state clarity, and 44px minimum tap targets
- [ ] 2.3 Verify the shared shell remains cohesive across `Buscar`, `Foto`, `Cartas`, and `Guardadas` routes on mobile and desktop viewport widths

## 3. Search Experience

- [ ] 3.1 Restyle the `Buscar` empty state with an editorial title/question, dominant tactile search field, compact horizontal chips, and rich recent/popular/suggestion panels
- [ ] 3.2 Restyle typing, searching, offline-ready, and no-result states as premium glass state panels with clear recovery guidance
- [ ] 3.3 Restyle top-match and compact search result cards with stronger tarot thumbnails, layered text hierarchy, upright/reversed summaries, and compact view/copy/save controls
- [ ] 3.4 Verify local search behavior, result ranking, copy actions, save actions, keyboard interaction, and offline behavior remain unchanged

## 4. Card Browse, Detail, And Spread

- [ ] 4.1 Restyle the `Cartas` grid with a tight 3-column rhythm, premium thumbnail frames, filter chips, grouping cues, and readable short labels
- [ ] 4.2 Verify arcana and suit filters preserve the mock-aligned grid rhythm and existing filtering behavior
- [ ] 4.3 Restyle card detail pages with a prominent tarot hero, strong title block, keywords, segmented orientation control, glass interpretation rows, related cards, and bottom action rhythm
- [ ] 4.4 Verify upright/reversed toggling, related-card navigation, copy/save actions, and card detail accessibility remain unchanged
- [ ] 4.5 Restyle the current spread summary with cohesive 1-3 card presentation, concise rule-based summary, repeated-theme emphasis, and premium glass sections

## 5. Photo, Saved, And History Screens

- [ ] 5.1 Restyle the `Foto` route with a guided camera frame/overlay visual, privacy copy, capture/upload/manual fallback actions, and polished fallback states
- [ ] 5.2 Restyle detected-card, confidence, low-confidence, and correction flows with premium result rows/cards, confidence chips, top candidates, and manual search fallback
- [ ] 5.3 Verify camera permission denied, unsupported camera, upload fallback, manual search, candidate selection, and correction behavior remain unchanged
- [ ] 5.4 Restyle the `Guardadas` tab with cohesive premium sections for favorites, recent history, learning states, and polished empty-state panels
- [ ] 5.5 Restyle saved and recent item rows as tactile premium card rows with clear identity, time/source context where available, and direct navigation affordance

## 6. Validation

- [ ] 6.1 Update unit and E2E coverage for key visual landmarks and preserved flows across search, card detail, grid, photo/correction, saved/history, and current spread
- [ ] 6.2 Run `pnpm content:validate` and fix any content validation regressions
- [ ] 6.3 Run `pnpm typecheck` and fix any type errors
- [ ] 6.4 Run `pnpm lint` and fix any lint errors
- [ ] 6.5 Run `pnpm test` and fix any unit test failures
- [ ] 6.6 Run `pnpm build` and fix any production build failures
- [ ] 6.7 Run `pnpm test:e2e` and fix any end-to-end failures
- [ ] 6.8 Manually review the main screens on a mobile-sized viewport against the relevant `mocks/` references for visual congruence, readability, tap targets, and reduced-motion behavior
