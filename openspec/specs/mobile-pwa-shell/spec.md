## ADDED Requirements

### Requirement: Mobile-first app shell and tab navigation
The system SHALL render a mobile-first app shell optimized for iPhone portrait usage with bottom navigation for `Buscar`, `Foto`, `Cartas`, and `Guardadas`.

#### Scenario: First launch opens search
- **WHEN** the user opens the app from Safari or an installed PWA icon
- **THEN** the system displays the `Buscar` screen with the search input as the primary interaction

#### Scenario: Bottom tabs are available
- **WHEN** the user is on any main tab screen
- **THEN** the system displays bottom navigation for `Buscar`, `Foto`, `Cartas`, and `Guardadas`

### Requirement: Static installable PWA
The system SHALL be deployable as static files and SHALL be installable as a PWA without requiring backend services, server APIs, login, or remote databases for MVP behavior.

#### Scenario: App runs from static hosting
- **WHEN** the static build is served over HTTPS
- **THEN** the app loads its shell, assets, and data from static files without calling a backend API

#### Scenario: App can be installed
- **WHEN** the browser evaluates the web app manifest and service worker
- **THEN** the app is eligible for install-style usage with standalone display metadata and app icons

### Requirement: Offline app shell
The system SHALL cache the app shell, core JavaScript and CSS, manifest, icons, summary data, search index, and offline fallback after the first successful load.

#### Scenario: Search remains available offline
- **WHEN** the user has loaded the app once and later opens it without network access
- **THEN** the system displays the app shell and allows search against cached card summary and search data

#### Scenario: Heavy assets are not precached initially
- **WHEN** the service worker installs for the first time
- **THEN** the system avoids precaching full card images, OpenCV assets, and full vision templates needed only outside the initial search flow

### Requirement: Initial-load performance isolation
The system SHALL keep the initial `Buscar` path independent from card detail payloads, full images, OpenCV, photo workers, and vision templates.

#### Scenario: Search boot excludes photo assets
- **WHEN** the user opens the default `Buscar` route
- **THEN** the system loads only the app shell, search UI, card summaries, and search index needed for manual lookup

#### Scenario: Photo assets are lazy
- **WHEN** the user has not opened the `Foto` tab
- **THEN** the system does not load OpenCV, photo worker code, or vision template assets

### Requirement: Accessible fast visual system
The system SHALL implement the dark premium mystical visual direction with accessible contrast, visible focus states, meaningful labels, important text at 16px or larger, tap targets at least 44px, and reduced-motion support.

#### Scenario: Touch controls are usable on iPhone
- **WHEN** the user interacts with primary controls such as tabs, search clear, cards, chips, and actions
- **THEN** each interactive target meets the minimum touch size and has an accessible label or visible text

#### Scenario: Reduced motion is respected
- **WHEN** the user has reduced motion enabled at the OS level
- **THEN** the system avoids nonessential motion and uses static or simplified transitions

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
