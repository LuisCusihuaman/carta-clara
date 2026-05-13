## ADDED Requirements

### Requirement: Mock-aligned saved and history presentation
The system SHALL style the `Guardadas` tab using the same premium glass/list visual system as the rest of the app, including favorites, recent cards, learning states, and empty states.

#### Scenario: Saved tab is visually cohesive
- **WHEN** the user opens `Guardadas`
- **THEN** favorites, recent history, and learning sections use mock-aligned cards, spacing, typography, and accent treatment

#### Scenario: Empty states feel intentional
- **WHEN** favorites, history, or learning states are empty
- **THEN** the system displays polished empty-state panels with warm guidance copy rather than bare placeholder text

### Requirement: Saved card rows match premium card language
The system SHALL present saved and recent items as compact premium card rows with clear card identity, source/time context where available, and direct navigation affordance.

#### Scenario: User reviews saved cards
- **WHEN** saved or recent cards are present
- **THEN** each item appears as a tactile row or card consistent with the mock visual language and remains easy to tap
