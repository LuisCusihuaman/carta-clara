## ADDED Requirements

### Requirement: Favorite cards
The system SHALL let users save and unsave tarot cards from search results, card detail, card grid, and photo result flows.

#### Scenario: User saves a card
- **WHEN** the user activates a save action for a card
- **THEN** the system stores that card as a favorite with a created timestamp

#### Scenario: User removes a favorite
- **WHEN** the user activates an unsave action for a saved card
- **THEN** the system removes that card from favorites without deleting card content

### Requirement: Recent card history
The system SHALL record recently viewed cards with viewed timestamp and source context.

#### Scenario: User opens a card detail
- **WHEN** the user opens a card detail from search, grid, photo, related card, or saved card context
- **THEN** the system records that card in recent history with its source

#### Scenario: Recent history is displayed
- **WHEN** the user opens recent history in `Guardadas` or the search home state
- **THEN** the system displays recent cards in reverse chronological order

### Requirement: Saved tab composition
The system SHALL provide a `Guardadas` tab that combines favorites, recent history, and learning state without interrupting fast lookup.

#### Scenario: User opens Guardadas
- **WHEN** the user opens the `Guardadas` tab
- **THEN** the system displays saved cards and recent cards with clear empty states when none exist

#### Scenario: Learning state is updated
- **WHEN** the user marks a card as unknown, review, or learned
- **THEN** the system stores and displays that learning state without requiring an account

### Requirement: Local structured persistence
The system SHALL store favorites, recent history, learning state, and current spread data locally using IndexedDB or an equivalent structured client-side database.

#### Scenario: Data survives reload
- **WHEN** the user saves a favorite or views a card and then reloads the app
- **THEN** the system preserves the saved and recent card state on the same device

#### Scenario: Storage write fails
- **WHEN** local persistence rejects a write because storage is unavailable or full
- **THEN** the system keeps the app usable and displays recoverable feedback instead of blocking search

### Requirement: Minimal preference storage
The system SHALL use simple preference storage only for small settings such as theme, last selected tab, install hint state, and camera privacy copy acceptance.

#### Scenario: Large user data is not stored in preferences
- **WHEN** favorites, history, notes, learning state, or spread data are persisted
- **THEN** the system stores them in structured local persistence rather than preference storage

### Requirement: No account dependency
The system SHALL provide saved-card and history behavior without login, account creation, remote sync, or remote user data storage.

#### Scenario: User has no account
- **WHEN** the user opens `Guardadas` on the same device after using the app
- **THEN** the system displays locally stored favorites and history without requiring authentication
