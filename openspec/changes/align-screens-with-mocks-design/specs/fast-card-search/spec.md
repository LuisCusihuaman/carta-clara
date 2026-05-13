## ADDED Requirements

### Requirement: Mock-aligned search home
The system SHALL present the `Buscar` screen with a mock-aligned hierarchy: editorial title/question, premium tactile search field, compact horizontal chips, and rich empty-state sections for recent, popular, or suggested searches.

#### Scenario: Empty search state matches reference hierarchy
- **WHEN** the search input is empty
- **THEN** the screen displays a visually rich search home with mock-like spacing, glass sections, quick chips, and helpful suggestions instead of a plain scaffold card

#### Scenario: Search field is the hero interaction
- **WHEN** the user opens `Buscar`
- **THEN** the search input is visually dominant, easy to tap, and styled with mock-like dark surface, gold/violet accents, and readable placeholder text

### Requirement: Mock-aligned search states
The system SHALL style typing, searching, no-result, offline-search-ready, and result states using premium state panels that are visually consistent with the search mocks.

#### Scenario: Search in progress is visible
- **WHEN** the user types a query while local data or ranking is being prepared
- **THEN** the system shows a mock-aligned searching state rather than a generic loading message

#### Scenario: No results suggests recovery
- **WHEN** no direct search results are found
- **THEN** the system displays a glass state panel with clear recovery copy and suggested query examples

### Requirement: Premium result cards
The system SHALL render search result cards with stronger tarot thumbnails, layered text hierarchy, upright/reversed summaries, etched glass surfaces, and compact action controls that resemble the result mocks.

#### Scenario: Strong match result is premium
- **WHEN** a strong top match is shown
- **THEN** the result card uses a larger visual emphasis, richer card framing, and clear action controls for view, copy, and save

#### Scenario: Compact results remain scannable
- **WHEN** multiple search results are shown
- **THEN** each result remains dense, readable, and easy to scan on a mobile viewport
