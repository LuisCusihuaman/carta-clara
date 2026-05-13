## ADDED Requirements

### Requirement: Search-first home experience
The system SHALL make manual card search the primary home experience and SHALL show results as the user types.

#### Scenario: User starts typing
- **WHEN** the user enters a query in the `Buscar` search input
- **THEN** the system updates search results without requiring form submission

#### Scenario: Search input is empty
- **WHEN** the search input is empty
- **THEN** the system displays helpful prompts, quick chips, recent cards, or popular cards instead of an empty page

### Requirement: Query normalization and exact lookup
The system SHALL normalize queries for case, accents, punctuation, whitespace, Spanish and English number words, roman numerals, ranks, suits, and known aliases before fuzzy matching.

#### Scenario: Spanish or English name lookup
- **WHEN** the user searches `luna`, `La Luna`, `moon`, or `The Moon`
- **THEN** the system ranks `La Luna` as the first result

#### Scenario: Number lookup
- **WHEN** the user searches `18`, `XVIII`, or `arcano 18`
- **THEN** the system ranks `La Luna` as the first result

#### Scenario: Minor arcana lookup
- **WHEN** the user searches `3 espadas`, `tres de espadas`, or `three of swords`
- **THEN** the system ranks `Tres de Espadas` as the first result

### Requirement: Fuzzy bilingual ranking
The system SHALL support fuzzy, prefix, bilingual, suit, number, and keyword search with deterministic reranking for high-intent exact matches.

#### Scenario: Typo tolerance
- **WHEN** the user searches `emperatris`
- **THEN** the system returns `La Emperatriz` within the top 3 results

#### Scenario: Keyword search
- **WHEN** the user searches `ruptura`
- **THEN** the system returns cards associated with rupture and includes `Tres de Espadas` within the top 3 results

#### Scenario: Exact match outranks broad keyword match
- **WHEN** the user searches a card name that also appears in broader meaning text
- **THEN** the system ranks the exact name or alias match above broad meaning-text matches

### Requirement: Compact result cards
The system SHALL show compact search result cards with thumbnail, card name, keywords, upright one-line meaning, reversed one-line meaning, and quick actions for viewing, copying, and saving.

#### Scenario: Strong match result
- **WHEN** the search engine identifies a strong top match
- **THEN** the system displays that result prominently with immediate upright and reversed summaries

#### Scenario: Copy quick meaning
- **WHEN** the user activates the copy action on a search result
- **THEN** the system copies a concise card meaning summary to the clipboard when clipboard access is available

### Requirement: Search states and suggestions
The system SHALL provide explicit states for empty search, typing, results, no results, suggestions, and offline-but-search-ready behavior.

#### Scenario: No results
- **WHEN** the user query has no direct matches
- **THEN** the system displays a no-results message and suggests similar or example queries

#### Scenario: Offline search ready
- **WHEN** the user is offline after the first successful load
- **THEN** the system indicates offline mode while allowing cached search data to keep working

### Requirement: Search performance budget
The system SHALL return local search results in under 100 ms for typical queries on target mobile hardware after search data has loaded.

#### Scenario: Query latency is measured
- **WHEN** the user enters a typical card name, alias, number, suit, or keyword query
- **THEN** the system returns ranked results within the configured search performance budget
