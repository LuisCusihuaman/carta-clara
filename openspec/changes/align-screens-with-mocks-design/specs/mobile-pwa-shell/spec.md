## ADDED Requirements

### Requirement: Mock-aligned visual system
The system SHALL apply a cohesive visual system derived from `mocks/`, including deep cosmic backgrounds, warm dark surfaces, glassmorphic panels, mystic gold accents, restrained violet glow, editorial display typography, readable sans body text, rounded card forms, and thin etched borders.

#### Scenario: App shell uses mock visual language
- **WHEN** the user opens any main app route
- **THEN** the screen uses the shared mock-aligned background, surface, border, typography, and accent tokens rather than generic scaffold styling

#### Scenario: Visual system remains local
- **WHEN** the app renders production screens
- **THEN** the system does not import or runtime-reference files from `mocks/`

### Requirement: Premium mobile app frame
The system SHALL present the app as a premium mobile-first frame with safe-area handling, layered depth, intentional header hierarchy, and a bottom navigation treatment that matches the mock direction.

#### Scenario: App frame is visually cohesive
- **WHEN** the user navigates between `Buscar`, `Foto`, `Cartas`, and `Guardadas`
- **THEN** header, content, and bottom navigation remain visually consistent and aligned to the mock style

#### Scenario: Navigation remains accessible
- **WHEN** bottom navigation is restyled
- **THEN** tab targets remain at least 44px and each tab remains labeled for assistive technology

### Requirement: Reusable mock-style UI primitives
The system SHALL provide reusable UI primitives for glass panels, chips, icon actions, section headers, tarot card frames, interpretation rows, confidence badges, and state panels.

#### Scenario: Screens share primitives
- **WHEN** search, detail, grid, photo, saved, and spread screens display comparable UI elements
- **THEN** those elements use shared primitives or shared tokenized styles instead of unrelated one-off styling

#### Scenario: Motion stays lightweight
- **WHEN** interactive elements use glow, opacity, or transform effects
- **THEN** the effects are CSS-only, subtle, and disabled or simplified under reduced-motion preferences
