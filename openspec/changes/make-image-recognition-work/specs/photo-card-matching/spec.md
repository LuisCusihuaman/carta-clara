## MODIFIED Requirements

### Requirement: Camera, upload, and manual fallback
The system SHALL support camera capture when available, image upload as fallback, and manual search as an always-available escape path, and SHALL allow captured or uploaded images to start local matching.

#### Scenario: Camera permission denied
- **WHEN** the user denies camera permission
- **THEN** the system explains the limitation and offers photo upload and manual search alternatives

#### Scenario: Camera unsupported
- **WHEN** the browser or installed PWA context cannot provide camera access
- **THEN** the system offers photo upload and manual search alternatives

#### Scenario: User uploads an image
- **WHEN** the user selects an image file from the `Foto` route
- **THEN** the system sends that image to the local matching pipeline and displays matching progress followed by candidates, an uncertainty state, or an actionable error

#### Scenario: User captures a camera frame
- **WHEN** camera preview is active and the user captures a frame
- **THEN** the system sends the captured frame to the local matching pipeline without uploading it to a backend

### Requirement: Local private image processing
The system SHALL process captured or uploaded card images locally on the device and MUST not upload photos by default or call external recognition APIs for MVP matching.

#### Scenario: User starts photo matching
- **WHEN** the user captures or uploads a photo for matching
- **THEN** the system processes the image locally and does not send it to a backend or third-party recognition service

#### Scenario: User leaves Foto
- **WHEN** the user exits the `Foto` route while the camera is active
- **THEN** the system stops all active camera tracks

#### Scenario: Worker performs matching
- **WHEN** an image is matched
- **THEN** scoring runs in local browser code using local/static assets and returns ranked candidates with signal details

### Requirement: Classical computer vision matching
The system SHALL identify likely card matches using non-generative local computer vision signals such as rectangle detection, perspective correction, normalized crops, ORB descriptors, perceptual hashes, and template matching.

#### Scenario: Single card in good light
- **WHEN** the user provides a clear photo of one supported deck card
- **THEN** the system returns ranked candidate matches with confidence scores

#### Scenario: Matching assets are unavailable
- **WHEN** local vision templates or descriptors for the selected deck are unavailable
- **THEN** the system disables automatic matching for that deck and directs the user to manual search or upload another supported image

#### Scenario: Generated card image is uploaded
- **WHEN** the user uploads or captures an image that matches an existing local/generated card template
- **THEN** the system ranks the corresponding card as the top candidate with a confidence score derived from local image signals

### Requirement: Confidence-based review and correction
The system SHALL present confidence-aware results from real matching output and SHALL allow manual correction when recognition is uncertain or wrong.

#### Scenario: High confidence result
- **WHEN** the best match confidence is at or above the configured strong-match threshold
- **THEN** the system displays the detected card as a strong match with its quick meaning

#### Scenario: Medium confidence result
- **WHEN** the best match confidence is below the strong threshold but above the low-confidence threshold
- **THEN** the system displays the top candidate options and asks the user to confirm

#### Scenario: Low confidence result
- **WHEN** no candidate reaches the low-confidence threshold
- **THEN** the system says it is not sure and offers top candidates, photo retry, upload fallback, and manual search

#### Scenario: User confirms a matched card
- **WHEN** the user confirms or selects a candidate from photo results
- **THEN** the system updates the detected result and can add the confirmed card to the current spread with source `photo`

### Requirement: One to three card photo results
The system SHALL support the MVP path for a single card and SHALL support review of 1 to 3 detected cards when multiple card crops are available.

#### Scenario: Multiple cards detected
- **WHEN** the system detects 1 to 3 card-shaped regions in a photo
- **THEN** the system shows each detected card candidate with confidence and quick meaning

#### Scenario: User corrects a detected card
- **WHEN** the user changes an incorrect detected-card candidate
- **THEN** the system updates the photo result and any current spread entry to use the corrected card

#### Scenario: Single-card MVP remains useful
- **WHEN** multiple-card crop detection is unavailable or inconclusive
- **THEN** the system still attempts a single-card match against the whole normalized image and provides confidence-aware review

### Requirement: Photo performance and accuracy targets
The system SHALL track photo matching against MVP performance and quality targets without blocking manual lookup.

#### Scenario: Photo route processing completes
- **WHEN** the user captures or uploads a supported single-card image under good lighting
- **THEN** the system returns a result or correction flow within the configured photo MVP time budget

#### Scenario: Recognition accuracy is evaluated
- **WHEN** the photo QA fixture set is run
- **THEN** the system reports top-candidate accuracy and single-card good-light accuracy against the configured MVP thresholds

#### Scenario: Deterministic fixture identifies known card
- **WHEN** the QA suite matches a deterministic generated fixture for a known card
- **THEN** the corresponding card appears as the top candidate and the QA report includes the confidence and signal scores used to rank it
