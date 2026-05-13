## ADDED Requirements

### Requirement: Lazy photo mode
The system SHALL isolate photo capture and matching behind the `Foto` route so camera code, OpenCV, workers, and vision assets are loaded only when photo mode is used.

#### Scenario: User opens search first
- **WHEN** the user opens the default app route
- **THEN** the system does not load photo matching code or vision assets

#### Scenario: User opens Foto
- **WHEN** the user opens the `Foto` tab
- **THEN** the system lazy-loads the photo UI and any required worker setup

### Requirement: Camera, upload, and manual fallback
The system SHALL support camera capture when available, image upload as fallback, and manual search as an always-available escape path.

#### Scenario: Camera permission denied
- **WHEN** the user denies camera permission
- **THEN** the system explains the limitation and offers photo upload and manual search alternatives

#### Scenario: Camera unsupported
- **WHEN** the browser or installed PWA context cannot provide camera access
- **THEN** the system offers photo upload and manual search alternatives

### Requirement: Local private image processing
The system SHALL process captured or uploaded card images locally on the device and MUST not upload photos by default or call external recognition APIs for MVP matching.

#### Scenario: User starts photo matching
- **WHEN** the user captures or uploads a photo for matching
- **THEN** the system processes the image locally and does not send it to a backend or third-party recognition service

#### Scenario: User leaves Foto
- **WHEN** the user exits the `Foto` route while the camera is active
- **THEN** the system stops all active camera tracks

### Requirement: Classical computer vision matching
The system SHALL identify likely card matches using non-generative local computer vision signals such as rectangle detection, perspective correction, normalized crops, ORB descriptors, perceptual hashes, and template matching.

#### Scenario: Single card in good light
- **WHEN** the user provides a clear photo of one supported deck card
- **THEN** the system returns ranked candidate matches with confidence scores

#### Scenario: Matching assets are unavailable
- **WHEN** local vision templates or descriptors for the selected deck are unavailable
- **THEN** the system disables automatic matching for that deck and directs the user to manual search or upload another supported image

### Requirement: Confidence-based review and correction
The system SHALL present confidence-aware results and SHALL allow manual correction when recognition is uncertain or wrong.

#### Scenario: High confidence result
- **WHEN** the best match confidence is at or above the configured strong-match threshold
- **THEN** the system displays the detected card as a strong match with its quick meaning

#### Scenario: Medium confidence result
- **WHEN** the best match confidence is below the strong threshold but above the low-confidence threshold
- **THEN** the system displays the top candidate options and asks the user to confirm

#### Scenario: Low confidence result
- **WHEN** no candidate reaches the low-confidence threshold
- **THEN** the system says it is not sure and offers top candidates, photo retry, upload fallback, and manual search

### Requirement: One to three card photo results
The system SHALL support the MVP path for a single card and SHALL support review of 1 to 3 detected cards when multiple card crops are available.

#### Scenario: Multiple cards detected
- **WHEN** the system detects 1 to 3 card-shaped regions in a photo
- **THEN** the system shows each detected card candidate with confidence and quick meaning

#### Scenario: User corrects a detected card
- **WHEN** the user changes an incorrect detected-card candidate
- **THEN** the system updates the photo result and any current spread entry to use the corrected card

### Requirement: Photo performance and accuracy targets
The system SHALL track photo matching against MVP performance and quality targets without blocking manual lookup.

#### Scenario: Photo route processing completes
- **WHEN** the user captures or uploads a supported single-card image under good lighting
- **THEN** the system returns a result or correction flow within the configured photo MVP time budget

#### Scenario: Recognition accuracy is evaluated
- **WHEN** the photo QA fixture set is run
- **THEN** the system reports top-candidate accuracy and single-card good-light accuracy against the configured MVP thresholds

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
