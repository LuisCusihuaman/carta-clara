## ADDED Requirements

### Requirement: Mock-aligned photo capture screen
The system SHALL style the `Foto` route like the guided camera mock, with a camera frame/overlay visual, privacy copy, capture/upload/manual fallback actions, and premium state panels.

#### Scenario: Camera entry follows mock direction
- **WHEN** the user opens `Foto`
- **THEN** the screen presents a guided camera/capture visual with mock-like glass, gold linework, and clear fallback actions

#### Scenario: Camera fallback remains polished
- **WHEN** camera permission is denied or unsupported
- **THEN** the fallback state uses the same premium visual system and offers upload and manual search without feeling like an error page

### Requirement: Mock-aligned detected and correction states
The system SHALL style detected-card, confidence, low-confidence, and correction flows like the photo result and correction mocks.

#### Scenario: Detected cards show confidence clearly
- **WHEN** photo matching returns candidates
- **THEN** each detected card appears in a premium result row/card with confidence, quick meaning, and correction affordance

#### Scenario: Low-confidence correction is guided
- **WHEN** matching confidence is low or the user chooses correction
- **THEN** the system presents a mock-aligned correction flow with top candidates and manual search fallback
