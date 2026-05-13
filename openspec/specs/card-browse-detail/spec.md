## ADDED Requirements

### Requirement: Browse all cards
The system SHALL provide a `Cartas` tab that lets users browse all 78 cards visually with lightweight filtering by arcana and suit.

#### Scenario: Card grid loads
- **WHEN** the user opens the `Cartas` tab
- **THEN** the system displays the 78-card grid using thumbnails and short card names

#### Scenario: User filters by suit
- **WHEN** the user selects a suit or arcana filter chip
- **THEN** the system updates the grid to show only matching cards

### Requirement: Card detail view
The system SHALL provide a card detail view with image, Spanish and English names, taxonomy, keywords, orientation control, one-line summary, quick explanation, contextual meanings, related cards, and actions.

#### Scenario: Detail opens from a compact card
- **WHEN** the user opens a card from search results, the grid, saved cards, history, or photo results
- **THEN** the system navigates to that card detail view and loads detailed card data lazily

#### Scenario: Detail content is layered
- **WHEN** the card detail data is loaded
- **THEN** the system presents immediate meaning first and deeper love, work, money, advice, yes/no, and related-card content below it

### Requirement: Upright and reversed interpretation
The system SHALL support both upright and reversed meanings with clear beginner-friendly labels and a large segmented orientation control on detail screens.

#### Scenario: Search result shows both orientations
- **WHEN** a card appears as a compact search result
- **THEN** the system displays both upright and reversed one-line meanings

#### Scenario: Detail orientation changes
- **WHEN** the user switches between `Derecha` and `Invertida` in the detail view
- **THEN** the system updates the displayed quick and contextual meanings for the selected orientation

### Requirement: Related card navigation
The system SHALL expose related cards from detail content and allow users to navigate between related cards without losing the app shell.

#### Scenario: User opens a related card
- **WHEN** the user selects a related card in a detail view
- **THEN** the system opens that related card detail view

### Requirement: Current physical spread review
The system SHALL allow up to 3 cards selected from search, browse, or photo results to be reviewed together as a current physical spread using rule-based summaries only.

#### Scenario: User adds cards to current spread
- **WHEN** the user adds 1 to 3 cards to the current spread
- **THEN** the system stores the selected cards with orientation and source for the current spread view

#### Scenario: Spread summary is rule-based
- **WHEN** the current spread summary is displayed
- **THEN** the system combines existing card meanings and repeated keywords without generating a new AI interpretation

### Requirement: Detail offline behavior
The system SHALL handle offline detail states when detailed JSON or images are unavailable from cache.

#### Scenario: Cached detail is unavailable offline
- **WHEN** the user opens an uncached card detail while offline
- **THEN** the system displays available summary data and an offline detail-unavailable state instead of failing silently
