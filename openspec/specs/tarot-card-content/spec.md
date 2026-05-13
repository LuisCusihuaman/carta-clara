## ADDED Requirements

### Requirement: Complete 78-card source content
The system SHALL maintain human-editable source content for all 78 tarot cards with stable card IDs, Spanish and English names, taxonomy, aliases, keywords, layered meanings, related cards, media references, and metadata.

#### Scenario: Content set is complete
- **WHEN** the content validation pipeline runs
- **THEN** the system verifies exactly 78 cards are present with no duplicate or missing stable IDs

#### Scenario: Required card fields exist
- **WHEN** a card source file is validated
- **THEN** the system requires names, taxonomy, search metadata, upright and reversed meanings, related cards, media references, and version metadata

### Requirement: Beginner-friendly layered meanings
The system SHALL store meanings in layers for immediate, quick, and deeper interpretation without requiring prior tarot vocabulary.

#### Scenario: Quick meaning is available
- **WHEN** a card is shown in a search result or compact card
- **THEN** the system can provide keywords and one-line upright and reversed meanings

#### Scenario: Detail meaning is available
- **WHEN** a card detail view is opened
- **THEN** the system can provide quick, love, work, money, advice, yes/no, and related-card content for the selected orientation

### Requirement: Editorial validation rules
The system SHALL validate content quality and fail the build when required editorial constraints are not met.

#### Scenario: One-line text is too long
- **WHEN** a card one-line meaning exceeds the configured character limit
- **THEN** the content validation pipeline fails with an actionable error

#### Scenario: Aliases are incomplete
- **WHEN** a card lacks the minimum Spanish and English aliases required for search
- **THEN** the content validation pipeline fails with an actionable error

### Requirement: Generated runtime data
The system SHALL generate optimized runtime artifacts from source content, including card summaries, search documents, serialized search index data, card detail JSON files, and a versioned data manifest.

#### Scenario: Summary data is generated
- **WHEN** the content build completes successfully
- **THEN** the system writes summary data containing only fields needed for startup, search results, recent cards, popular cards, and compact cards

#### Scenario: Detail data is generated separately
- **WHEN** the content build completes successfully
- **THEN** the system writes per-card detail data that can be fetched lazily when a card detail view is opened

### Requirement: Versioned immutable card identity
The system SHALL keep card IDs stable across content, search, media, favorites, history, and spread data, and SHALL expose app, content, search index, and vision versions separately.

#### Scenario: Content version changes
- **WHEN** card copy or meanings change without changing app code
- **THEN** the system updates the content version without changing stable card IDs

#### Scenario: Search metadata changes
- **WHEN** aliases, ranking fields, or generated search index data change
- **THEN** the system updates the search index version without changing stable card IDs

### Requirement: Optimized media references
The system SHALL require thumbnail and full-image references for each card and SHALL keep large media out of startup runtime data.

#### Scenario: Thumbnail is missing
- **WHEN** a card source file references no required thumbnail
- **THEN** the content validation pipeline fails before runtime data is generated

#### Scenario: Full image is lazy
- **WHEN** the default search route loads card summary data
- **THEN** the system includes thumbnail references but does not require full card images to be loaded
