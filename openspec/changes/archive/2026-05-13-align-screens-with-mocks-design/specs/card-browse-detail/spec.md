## ADDED Requirements

### Requirement: Mock-aligned card grid
The system SHALL style the `Cartas` grid like the reference grid screens, with a tight 3-column rhythm, premium tarot thumbnail frames, filter chips, visual grouping cues, and readable short labels.

#### Scenario: Grid visually resembles mock gallery
- **WHEN** the user opens the `Cartas` tab
- **THEN** the card grid uses mock-aligned spacing, thumbnail proportions, border treatment, and typography rather than plain tiles

#### Scenario: Filters preserve visual rhythm
- **WHEN** the user changes arcana or suit filters
- **THEN** filter chips and grid content maintain the same premium visual system and mobile rhythm

### Requirement: Mock-aligned card detail
The system SHALL style card detail screens like the La Luna reference, including a large hero card area, strong title block, keywords, segmented orientation control, layered interpretation rows, related-card section, and bottom action rhythm.

#### Scenario: Detail hero is visually prominent
- **WHEN** the user opens a card detail screen
- **THEN** the card image or placeholder appears as a premium tarot hero with mock-like proportions, border, glow, and surrounding spacing

#### Scenario: Meanings are layered visually
- **WHEN** detail content is loaded
- **THEN** one-line, quick, love, work, money, advice, and related content appear in visually distinct glass sections or rows consistent with the mocks

### Requirement: Mock-aligned spread summary
The system SHALL style the current spread view like the spread mock, with 1 to 3 card presentation, concise rule-based summary, repeated-theme emphasis, and premium glass sections.

#### Scenario: Spread cards are presented together
- **WHEN** the user opens a current spread containing cards
- **THEN** the system displays those cards as a cohesive mock-aligned spread rather than a plain text list

#### Scenario: Rule-based summary remains clear
- **WHEN** the spread summary is shown
- **THEN** the summary remains visibly rule-based and concise while matching the premium visual system
