import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import './App.css'
import { cardSprite, cardSpriteColumns, cardSpriteImage } from './data/cardSprite'
import { cardsById, detectedDemoIds, tarotCards, type TarotCard } from './data/cards'
import { isConfidentCameraMatch, matchCameraFrame, matchImageFile, type CameraMatch } from './lib/cameraMatcher'
import { filterCards, filters, searchCards, type CardFilter } from './lib/search'
import {
  readFavorites,
  readRecents,
  removeFavorite,
  saveFavorite,
  saveRecent,
  type StoredRecent,
} from './lib/storage'

type Tab = 'search' | 'photo' | 'saved'
type Orientation = 'upright' | 'reversed'
type DetailIconName = 'spark' | 'reversed' | 'heart' | 'work' | 'money' | 'advice' | 'question' | 'eye' | 'copy' | 'bookmark' | 'spread'

type SpreadItem = {
  cardId: string
  orientation: Orientation
  source: 'search' | 'photo'
  confidence?: number
}

type PhotoStage = 'camera' | 'detected' | 'correct'
type CameraStatus = 'idle' | 'active' | 'denied' | 'unsupported'
type ScanStatus = 'idle' | 'scanning' | 'confident' | 'uncertain'

const cameraPermissionStorageKey = 'carta-clara-camera-granted'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<CardFilter>('all')
  const [detailCardId, setDetailCardId] = useState<string | null>(null)
  const [detailOrientation, setDetailOrientation] = useState<Orientation>('upright')
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [recents, setRecents] = useState<StoredRecent[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [photoStage, setPhotoStage] = useState<PhotoStage>('camera')
  const [spreadOpen, setSpreadOpen] = useState(false)
  const [spread, setSpread] = useState<SpreadItem[]>([])
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let mounted = true

    Promise.all([readFavorites(), readRecents()]).then(([favorites, recentItems]) => {
      if (!mounted) return
      setFavoriteIds(favorites.map((item) => item.cardId))
      setRecents(recentItems)
    })

    return () => {
      mounted = false
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  function notify(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  function switchTab(tab: Tab) {
    startTransition(() => {
      setActiveTab(tab)
      setDetailCardId(null)
      setSpreadOpen(false)
      if (tab !== 'photo') setPhotoStage('camera')
    })
  }

  function openCard(cardId: string, source: StoredRecent['source']) {
    setDetailCardId(cardId)
    setSpreadOpen(false)
    setDetailOrientation('upright')
    void saveRecent(cardId, source).then(() => readRecents().then(setRecents))
  }

  function toggleFavorite(cardId: string) {
    if (favoriteIds.includes(cardId)) {
      setFavoriteIds((current) => current.filter((id) => id !== cardId))
      void removeFavorite(cardId)
      notify('Carta quitada de guardadas')
      return
    }

    setFavoriteIds((current) => [cardId, ...current])
    void saveFavorite(cardId)
    notify('Carta guardada')
  }

  function addToSpread(cardId: string, orientation: Orientation = 'upright', source: SpreadItem['source'] = 'search') {
    setSpread((current) => {
      const withoutDuplicate = current.filter((item) => item.cardId !== cardId)
      return [...withoutDuplicate, { cardId, orientation, source }].slice(-3)
    })
    notify('Agregada a tirada actual')
  }

  function openDemoSpread() {
    setSpread(
      detectedDemoIds.map((cardId, index) => ({
        cardId,
        orientation: index === 1 ? 'reversed' : 'upright',
        source: 'photo',
        confidence: [0.92, 0.88, 0.83][index],
      })),
    )
    setSpreadOpen(true)
    setDetailCardId(null)
  }

  async function copyMeaning(card: TarotCard, orientation: Orientation = 'upright') {
    const text = `${card.nameEs} (${orientation === 'upright' ? 'Derecha' : 'Invertida'})\n${
      orientation === 'upright' ? card.oneLineUpright : card.oneLineReversed
    }`
    await copyText(text)
    notify('Significado copiado')
  }

  if (spreadOpen) {
    return (
      <AppFrame toast={toast}>
        <SpreadPage
          spread={spread}
          onBack={() => setSpreadOpen(false)}
          onOpenCard={(cardId) => openCard(cardId, 'related')}
          onCopy={async (text) => {
            await copyText(text)
            notify('Tirada copiada')
          }}
          onClear={() => {
            setSpread([])
            notify('Tirada vaciada')
          }}
        />
      </AppFrame>
    )
  }

  const detailCard = detailCardId ? cardsById.get(detailCardId) : null

  if (detailCard) {
    return (
      <AppFrame toast={toast}>
        <CardDetailPage
          card={detailCard}
          orientation={detailOrientation}
          isFavorite={favoriteIds.includes(detailCard.id)}
          spreadCount={spread.length}
          onBack={() => setDetailCardId(null)}
          onOrientationChange={setDetailOrientation}
          onToggleFavorite={() => toggleFavorite(detailCard.id)}
          onCopy={() => void copyMeaning(detailCard, detailOrientation)}
          onAddToSpread={() => addToSpread(detailCard.id, detailOrientation)}
          onOpenRelated={(cardId) => openCard(cardId, 'related')}
          onOpenSpread={() => setSpreadOpen(true)}
        />
      </AppFrame>
    )
  }

  return (
    <AppFrame toast={toast}>
      {activeTab === 'search' && (
        <SearchPage
          query={searchQuery}
          filter={searchFilter}
          recents={recents}
          favoriteIds={favoriteIds}
          onQueryChange={setSearchQuery}
          onFilterChange={setSearchFilter}
          onOpenCard={(cardId) => openCard(cardId, 'search')}
          onCopy={(card) => void copyMeaning(card)}
          onToggleFavorite={toggleFavorite}
          onAddToSpread={addToSpread}
          onGoPhoto={() => switchTab('photo')}
        />
      )}
      {activeTab === 'photo' && (
        <PhotoPage
          stage={photoStage}
          onStageChange={setPhotoStage}
          onOpenCard={(cardId) => openCard(cardId, 'photo')}
          onOpenSpread={openDemoSpread}
          onAddCardToSpread={(cardId, orientation) => addToSpread(cardId, orientation, 'photo')}
          onAddDetectedToSpread={() => {
            detectedDemoIds.forEach((cardId, index) => addToSpread(cardId, index === 1 ? 'reversed' : 'upright', 'photo'))
          }}
        />
      )}
      {activeTab === 'saved' && (
        <SavedPage
          favoriteIds={favoriteIds}
          recents={recents}
          spread={spread}
          onOpenCard={(cardId) => openCard(cardId, 'saved')}
          onOpenSpread={() => setSpreadOpen(true)}
          onGoSearch={() => switchTab('search')}
        />
      )}
      <BottomNav activeTab={activeTab} onChange={switchTab} />
    </AppFrame>
  )
}

function AppFrame({ children, toast }: { children: ReactNode; toast: string | null }) {
  return (
    <div className="app-shell">
      <div className="cosmic-orb cosmic-orb-one" />
      <div className="cosmic-orb cosmic-orb-two" />
      {children}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function SearchPage({
  query,
  filter,
  recents,
  favoriteIds,
  onQueryChange,
  onFilterChange,
  onOpenCard,
  onCopy,
  onToggleFavorite,
  onAddToSpread,
  onGoPhoto,
}: {
  query: string
  filter: CardFilter
  recents: StoredRecent[]
  favoriteIds: string[]
  onQueryChange: (query: string) => void
  onFilterChange: (filter: CardFilter) => void
  onOpenCard: (cardId: string) => void
  onCopy: (card: TarotCard) => void
  onToggleFavorite: (cardId: string) => void
  onAddToSpread: (cardId: string) => void
  onGoPhoto: () => void
}) {
  const deferredQuery = useDeferredValue(query)
  const hasQuery = deferredQuery.trim().length > 0
  const results = hasQuery ? searchCards(deferredQuery, 'all', 13) : []
  const best = results[0]?.card
  const visualSourceCards = hasQuery ? results.slice(1).map((result) => result.card) : tarotCards
  const visualCards = hasQuery ? visualSourceCards : filterCards(visualSourceCards, filter)
  const recentCards = recents.map((item) => cardsById.get(item.cardId)).filter((card): card is TarotCard => Boolean(card)).slice(0, 4)
  const gridTitle = hasQuery ? 'También podría ser' : 'Todas las cartas'
  const gridCaption = hasQuery
    ? `${visualCards.length} sugerencias`
    : filter === 'all'
      ? `${visualCards.length} cartas`
      : `${getFilterLabel(filter)} · ${visualCards.length}`
  const showVisualGrid = !hasQuery || visualCards.length > 0

  return (
    <main className={`page page-with-nav search-page unified-search-page ${hasQuery ? 'search-page-active' : ''}`}>
      <header className="hero-header">
        <div className="top-row">
          <div className="top-spacer" />
          <div className="brand-mark" aria-hidden="true">
            <SunIcon />
          </div>
          <button className="round-ghost" type="button" aria-label="Modo foto" onClick={onGoPhoto}>
            <CameraIcon />
          </button>
        </div>
        <p className="eyebrow">Carta Clara</p>
        <h1>¿Qué carta salió?</h1>
      </header>

      {hasQuery ? (
        <section className="stack-lg">
          {best ? (
            <FastSearchResults
              best={best}
              isFavorite={favoriteIds.includes(best.id)}
              onOpenBest={() => onOpenCard(best.id)}
              onCopyBest={() => onCopy(best)}
              onToggleFavorite={() => onToggleFavorite(best.id)}
              onAddToSpread={() => onAddToSpread(best.id)}
            />
          ) : (
            <EmptyState
              title="No encontré esa carta."
              text="Probá con nombre, número o una palabra como amor, trabajo o XVIII."
            />
          )}
        </section>
      ) : recentCards.length > 0 ? (
        <RecentStrip cards={recentCards} onOpen={onOpenCard} />
      ) : null}
      {showVisualGrid && (
        <section className={`visual-search-section ${hasQuery ? 'search-results-section' : ''}`}>
          <SectionTitle title={gridTitle} caption={gridCaption} />
          {!hasQuery && (
            <div className="deck-filter">
              <span>Filtrar mazo</span>
              <FilterChips value={filter} onChange={onFilterChange} compact />
            </div>
          )}
          {hasQuery ? (
            <SearchResultGrid cards={visualCards} onOpenCard={onOpenCard} />
          ) : (
            <VisualCardGrid cards={visualCards} favoriteIds={favoriteIds} onOpenCard={onOpenCard} onToggleFavorite={onToggleFavorite} />
          )}
        </section>
      )}
      <div className="home-search-dock">
        <SearchBar value={query} onChange={onQueryChange} placeholder="Buscar: Luna, 3 espadas, amor..." autoFocus variant="primary" />
      </div>
    </main>
  )
}

function FastSearchResults({
  best,
  isFavorite,
  onOpenBest,
  onCopyBest,
  onToggleFavorite,
  onAddToSpread,
}: {
  best: TarotCard
  isFavorite: boolean
  onOpenBest: () => void
  onCopyBest: () => void
  onToggleFavorite: () => void
  onAddToSpread: () => void
}) {
  return (
    <section className="fast-results" aria-label="Mejor resultado">
      <article className="fast-best-card glow-card">
        <button className="fast-best-main" type="button" onClick={onOpenBest}>
          <TarotCardArt card={best} size="small" />
          <span className="fast-best-copy">
            <small>Mejor resultado · {best.arcana === 'major' ? `Arcano ${best.roman}` : best.suitEs}</small>
            <strong>{best.nameEs}</strong>
            <em>{best.keywordsUpright.slice(0, 3).join(' · ')}</em>
          </span>
          <span className="result-chevron" aria-hidden="true">›</span>
        </button>
        <div className="fast-meanings">
          <p><b>Der.</b> {best.oneLineUpright}</p>
          <p><b>Inv.</b> {best.oneLineReversed}</p>
        </div>
        <div className="fast-actions">
          <button type="button" onClick={onCopyBest}>Copiar</button>
          <button type="button" onClick={onToggleFavorite}>{isFavorite ? 'Guardada' : 'Guardar'}</button>
          <button type="button" onClick={onAddToSpread}>Tirada</button>
          <button type="button" onClick={onOpenBest}>Ver más</button>
        </div>
      </article>
    </section>
  )
}

function CompactCardResult({ card, onOpen }: { card: TarotCard; onOpen: () => void }) {
  return (
    <button className="compact-result" type="button" onClick={onOpen}>
      <TarotCardArt card={card} size="tiny" />
      <span className="compact-copy">
        <strong>{card.nameEs}</strong>
        <small>{card.keywordsUpright.slice(0, 3).join(' · ')}</small>
      </span>
      <span className="result-chevron" aria-hidden="true">›</span>
    </button>
  )
}

function RecentStrip({ cards, onOpen }: { cards: TarotCard[]; onOpen: (cardId: string) => void }) {
  return (
    <section className="recent-strip" aria-label="Cartas recientes">
      <span>Recientes</span>
      <div>
        {cards.map((card) => (
          <button key={card.id} type="button" onClick={() => onOpen(card.id)}>
            <TarotCardArt card={card} size="tiny" />
            <strong>{card.shortName}</strong>
          </button>
        ))}
      </div>
    </section>
  )
}

function VisualCardGrid({
  cards,
  favoriteIds,
  onOpenCard,
  onToggleFavorite,
}: {
  cards: TarotCard[]
  favoriteIds: string[]
  onOpenCard: (cardId: string) => void
  onToggleFavorite: (cardId: string) => void
}) {
  return (
    <div className="cards-grid" aria-label="Todas las cartas">
      {cards.map((card) => (
        <article className="grid-card" key={card.id}>
          <button type="button" onClick={() => onOpenCard(card.id)} aria-label={`Ver ${card.nameEs}`}>
            <TarotCardArt card={card} size="grid" />
            <strong>{card.shortName}</strong>
            <small>{card.arcana === 'major' ? card.roman : card.suitEs}</small>
          </button>
          <button
            className={`mini-save ${favoriteIds.includes(card.id) ? 'active' : ''}`}
            type="button"
            onClick={() => onToggleFavorite(card.id)}
            aria-label={favoriteIds.includes(card.id) ? `Quitar ${card.nameEs}` : `Guardar ${card.nameEs}`}
          >
            {favoriteIds.includes(card.id) ? '★' : '☆'}
          </button>
        </article>
      ))}
    </div>
  )
}

function SearchResultGrid({ cards, onOpenCard }: { cards: TarotCard[]; onOpenCard: (cardId: string) => void }) {
  return (
    <div className="search-result-grid" aria-label="Resultados relacionados">
      {cards.map((card) => (
        <button className="search-result-tile" key={card.id} type="button" onClick={() => onOpenCard(card.id)}>
          <TarotCardArt card={card} size="tiny" />
          <span>
            <strong>{card.shortName}</strong>
            <small>{card.keywordsUpright.slice(0, 2).join(' · ')}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

function getFilterLabel(filter: CardFilter) {
  return filters.find((item) => item.id === filter)?.label ?? 'Todas las cartas'
}

function CardDetailPage({
  card,
  orientation,
  isFavorite,
  spreadCount,
  onBack,
  onOrientationChange,
  onToggleFavorite,
  onCopy,
  onAddToSpread,
  onOpenRelated,
  onOpenSpread,
}: {
  card: TarotCard
  orientation: Orientation
  isFavorite: boolean
  spreadCount: number
  onBack: () => void
  onOrientationChange: (orientation: Orientation) => void
  onToggleFavorite: () => void
  onCopy: () => void
  onAddToSpread: () => void
  onOpenRelated: (cardId: string) => void
  onOpenSpread: () => void
}) {
  const isUpright = orientation === 'upright'
  const leadMeaning = isUpright ? card.oneLineUpright : card.oneLineReversed
  const arcanaLabel = card.arcana === 'major' ? `Arcano Mayor ${card.roman}` : `${card.rankEs} de ${card.suitEs}`
  const keywords = (isUpright ? card.keywordsUpright : card.keywordsReversed).slice(0, 3)
  const quickMeaning = isUpright ? card.quickUpright : card.quickReversed
  const detailAreas: Array<{ title: string; text: string; icon: DetailIconName }> = [
    { title: 'Amor', text: isUpright ? card.loveUpright : card.loveReversed, icon: 'heart' },
    { title: 'Trabajo', text: isUpright ? card.workUpright : card.workReversed, icon: 'work' },
    { title: 'Dinero', text: isUpright ? card.moneyUpright : card.moneyReversed, icon: 'money' },
    { title: 'Consejo', text: isUpright ? card.adviceUpright : card.adviceReversed, icon: 'advice' },
    { title: 'Sí / No', text: card.yesNo, icon: 'question' },
  ]

  return (
    <main className="page detail-page detail-page-redesign" style={{ '--detail-accent': card.accent } as CSSProperties}>
      <header className="detail-cover">
        <img
          className="detail-cover-image"
          src={card.image.full}
          alt=""
          loading="eager"
          decoding="async"
          onError={(event) => fallbackToThumb(event, card.image.thumb)}
        />
        <div className="detail-cover-vignette" />
        <nav className="detail-cover-nav" aria-label="Acciones de carta">
          <button className="round-ghost detail-nav-button" type="button" onClick={onBack} aria-label="Volver">
            ←
          </button>
          <button
            className={`round-ghost detail-nav-button ${isFavorite ? 'active' : ''}`}
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Quitar de guardadas' : 'Guardar carta'}
          >
            <DetailIcon name="bookmark" />
          </button>
        </nav>

        <section className="detail-cover-copy">
          <p className="detail-eyebrow">{arcanaLabel}</p>
          <h1>{card.nameEs}</h1>
          <p className="detail-english-name">{card.nameEn}</p>
          <div className="detail-star-rule" aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>
          <p className="detail-cover-lead">{leadMeaning}</p>
          <div className="detail-keyword-pills" aria-label="Palabras clave">
            {keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </section>
      </header>

      <section className="detail-meaning-switch" aria-label="Significados por orientación">
        <button
          className={`detail-meaning-card ${orientation === 'upright' ? 'active' : 'muted'}`}
          type="button"
          onClick={() => onOrientationChange('upright')}
          aria-pressed={orientation === 'upright'}
        >
          <span className="detail-meaning-heading">
            <span className="detail-meaning-icon glow"><DetailIcon name="spark" /></span>
            <strong>Derecha</strong>
          </span>
          <span className="detail-meaning-line" />
          <span>{card.oneLineUpright}</span>
        </button>
        <span className="detail-meaning-separator" aria-hidden="true">
          <i>✦</i>
        </span>
        <button
          className={`detail-meaning-card reversed ${orientation === 'reversed' ? 'active' : 'muted'}`}
          type="button"
          onClick={() => onOrientationChange('reversed')}
          aria-pressed={orientation === 'reversed'}
        >
          <span className="detail-meaning-heading">
            <span className="detail-meaning-icon"><DetailIcon name="reversed" /></span>
            <strong>Invertida</strong>
          </span>
          <span className="detail-meaning-line" />
          <span>{card.oneLineReversed}</span>
        </button>
      </section>

      <section className="detail-area-grid" aria-label="Áreas de interpretación">
        {detailAreas.map((item) => (
          <article className="detail-area-card" key={item.title}>
            <span className="detail-area-icon"><DetailIcon name={item.icon} /></span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="detail-fast-meaning">
        <div className="detail-countdown" aria-hidden="true">
          <span>10</span>
          <small>S</small>
        </div>
        <div>
          <h2>En 10 segundos</h2>
          <p>{quickMeaning}</p>
        </div>
        <div className="detail-eye-mark" aria-hidden="true">
          <DetailIcon name="eye" />
        </div>
      </section>

      <section className="detail-related-section">
        <div className="detail-related-heading">
          <h2>Parecidas</h2>
          <span>✦</span>
        </div>
        <div className="detail-related-row">
          {card.relatedCards.slice(0, 3).map((cardId) => {
            const related = cardsById.get(cardId)
            if (!related) return null
            const relatedCode = related.arcana === 'major' ? related.roman : related.rankEs
            return (
              <button key={cardId} className="detail-related-card" type="button" onClick={() => onOpenRelated(cardId)}>
                <img src={related.image.thumb} alt="" loading="lazy" decoding="async" onError={hideBrokenImage} />
                <span>{relatedCode ? `${relatedCode} • ${related.shortName}` : related.shortName}</span>
              </button>
            )
          })}
        </div>
      </section>

      <nav className="detail-bottom-actions" aria-label="Acciones del detalle">
        <button type="button" onClick={onCopy}>
          <DetailIcon name="copy" />
          <span>Copiar</span>
        </button>
        <i aria-hidden="true" />
        <button type="button" onClick={onToggleFavorite}>
          <DetailIcon name="bookmark" />
          <span>{isFavorite ? 'Guardada' : 'Guardar'}</span>
        </button>
        <i aria-hidden="true" className="with-star" />
        <button type="button" onClick={onAddToSpread}>
          <DetailIcon name="spread" />
          <span>Tirada</span>
        </button>
        <i aria-hidden="true" />
        <button type="button" onClick={onOpenSpread} disabled={spreadCount === 0}>
          <DetailIcon name="eye" />
          <span>Ver {spreadCount}/3</span>
        </button>
      </nav>
    </main>
  )
}

function PhotoPage({
  stage,
  onStageChange,
  onOpenCard,
  onOpenSpread,
  onAddCardToSpread,
  onAddDetectedToSpread,
}: {
  stage: PhotoStage
  onStageChange: (stage: PhotoStage) => void
  onOpenCard: (cardId: string) => void
  onOpenSpread: () => void
  onAddCardToSpread: (cardId: string, orientation: Orientation) => void
  onAddDetectedToSpread: () => void
}) {
  if (stage === 'detected') {
    return (
      <DetectedCardsPage
        onBack={() => onStageChange('camera')}
        onCorrect={() => onStageChange('correct')}
        onOpenCard={onOpenCard}
        onOpenSpread={onOpenSpread}
        onAddDetectedToSpread={onAddDetectedToSpread}
      />
    )
  }

  if (stage === 'correct') {
    return <CorrectionPage onBack={() => onStageChange('detected')} onConfirm={() => onStageChange('detected')} onOpenCard={onOpenCard} />
  }

  return <CameraPage onCorrect={() => onStageChange('correct')} onOpenCard={onOpenCard} onAddCardToSpread={onAddCardToSpread} />
}

function CameraPage({
  onCorrect,
  onOpenCard,
  onAddCardToSpread,
}: {
  onCorrect: () => void
  onOpenCard: (cardId: string) => void
  onAddCardToSpread: (cardId: string, orientation: Orientation) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const stableFramesRef = useRef(0)
  const scanTimerRef = useRef<number | undefined>(undefined)
  const scanInFlightRef = useRef(false)
  const lastBestCardIdRef = useRef<string | null>(null)
  const [cameraState, setCameraState] = useState<CameraStatus>('idle')
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanCandidates, setScanCandidates] = useState<CameraMatch[]>([])
  const bestCandidate = scanCandidates[0]

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported')
      return
    }

    try {
      stableFramesRef.current = 0
      lastBestCardIdRef.current = null
      setScanCandidates([])
      setScanStatus('scanning')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraState('active')
      rememberCameraPermission()
    } catch {
      setCameraState('denied')
      setScanStatus('idle')
    }
  }, [])

  const scanCurrentVideoFrame = useCallback(async () => {
    if (scanInFlightRef.current || !videoRef.current) return

    scanInFlightRef.current = true
    try {
      const candidates = await matchCameraFrame(videoRef.current)
      const bestId = candidates[0]?.card.id ?? null
      stableFramesRef.current = bestId && bestId === lastBestCardIdRef.current ? stableFramesRef.current + 1 : 1
      lastBestCardIdRef.current = bestId

      if (candidates.length > 0 && isConfidentCameraMatch(candidates, stableFramesRef.current)) {
        setScanCandidates(candidates)
        setScanStatus('confident')
        window.clearInterval(scanTimerRef.current)
      }
    } catch {
      stableFramesRef.current = 0
    } finally {
      scanInFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    const autoStartTimer = window.setTimeout(() => {
      if (shouldAutoStartCamera()) void requestCamera()
    }, 0)

    return () => {
      window.clearTimeout(autoStartTimer)
      stopCamera(streamRef.current)
    }
  }, [requestCamera])

  useEffect(() => {
    window.clearInterval(scanTimerRef.current)

    if (cameraState !== 'active' || scanStatus !== 'scanning') return

    stableFramesRef.current = 0
    scanTimerRef.current = window.setInterval(() => {
      void scanCurrentVideoFrame()
    }, 350)

    return () => window.clearInterval(scanTimerRef.current)
  }, [cameraState, scanStatus, scanCurrentVideoFrame])

  function stopCurrentCamera() {
    window.clearInterval(scanTimerRef.current)
    stopCamera(streamRef.current)
    streamRef.current = null
    setCameraState('idle')
    setScanStatus('idle')
    setScanCandidates([])
    stableFramesRef.current = 0
    lastBestCardIdRef.current = null
  }

  async function scanManualFrame() {
    window.clearInterval(scanTimerRef.current)
    await resolveOneShotMatches(() => (videoRef.current ? matchCameraFrame(videoRef.current) : Promise.resolve([])))
  }

  async function scanUploadedImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    window.clearInterval(scanTimerRef.current)
    await resolveOneShotMatches(() => matchImageFile(file))
  }

  async function resolveOneShotMatches(getMatches: () => Promise<CameraMatch[]>) {
    setScanStatus('scanning')
    setScanCandidates([])
    stableFramesRef.current = 0
    lastBestCardIdRef.current = null

    try {
      const candidates = await getMatches()
      setScanCandidates(candidates)
      setScanStatus(isConfidentCameraMatch(candidates, 2) ? 'confident' : 'uncertain')
    } catch {
      setScanCandidates([])
      setScanStatus('uncertain')
    }
  }

  return (
    <main className="camera-page">
      <div className="camera-bg">
        {cameraState === 'active' ? <video ref={videoRef} autoPlay muted playsInline /> : <div className="camera-fallback-art" />}
        <div className="camera-vignette" />
      </div>
      <header className="camera-topbar">
        <button className="round-glass" type="button" onClick={stopCurrentCamera} aria-label="Cerrar cámara">
          ×
        </button>
        <div className="brand-mark small" aria-hidden="true">
          <SunIcon />
        </div>
        <button className="round-glass" type="button" aria-label="Ayuda">
          ?
        </button>
      </header>

      <div className="camera-toast">
        <span className="pulse-dot" />
        <span>
          <strong>{cameraState === 'active' ? 'Apuntá a una carta' : 'Mostrame la carta'}</strong>
          <small>{cameraState === 'active' ? getScanHint(scanStatus) : 'La leo en tu teléfono, sin subir la foto'}</small>
        </span>
      </div>

      <section className="camera-guides" aria-label="Guías de cartas">
        <div className={`scan-frame ${scanStatus === 'confident' ? 'locked' : ''}`}>
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      {bestCandidate && scanStatus === 'confident' && (
        <section className="scan-sheet confident" aria-live="polite">
          <div className="scan-result-main">
            <TarotCardArt card={bestCandidate.card} size="small" />
            <div>
              <small>Detectada · {formatConfidence(bestCandidate.confidence)} confianza</small>
              <h1>{bestCandidate.card.nameEs}</h1>
              <p>{bestCandidate.card.oneLineUpright}</p>
            </div>
          </div>
          <div className="scan-actions">
            <button type="button" onClick={() => onOpenCard(bestCandidate.card.id)}>Ver interpretación</button>
            <button type="button" onClick={() => onAddCardToSpread(bestCandidate.card.id, bestCandidate.orientation)}>Tirada</button>
          </div>
        </section>
      )}

      {scanStatus === 'uncertain' && scanCandidates.length > 0 && (
        <section className="scan-sheet uncertain" aria-live="polite">
          <div className="scan-sheet-title">
            <h1>Creo que es una de estas</h1>
            <p>Elegí la carta que coincide mejor.</p>
          </div>
          <div className="scan-candidates">
            {scanCandidates.map((candidate) => (
              <button key={candidate.card.id} type="button" onClick={() => onOpenCard(candidate.card.id)}>
                <TarotCardArt card={candidate.card} size="tiny" />
                <span>
                  <strong>{candidate.card.shortName}</strong>
                  <small>{formatConfidence(candidate.confidence)}</small>
                </span>
              </button>
            ))}
          </div>
          <button className="scan-secondary" type="button" onClick={onCorrect}>No es ninguna</button>
        </section>
      )}

      <footer className="camera-controls">
        {cameraState !== 'active' && (
          <div className="camera-permission-card">
            <h1>Reconocer carta</h1>
            <p>Funciona mejor con Rider-Waite o mazos visualmente parecidos.</p>
            <button className="camera-start" type="button" onClick={() => void requestCamera()}>
              Permitir cámara
            </button>
            <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
              Subir foto
            </button>
          </div>
        )}
        {cameraState === 'denied' && <p>Necesito permiso de cámara. También podés subir una foto o buscar manualmente.</p>}
        {cameraState === 'unsupported' && <p>Esta cámara no está disponible en el navegador. Usá subir foto como fallback.</p>}
        {cameraState === 'active' && scanStatus === 'scanning' && (
          <div className="camera-action-row">
            <button className="manual-capture" type="button" onClick={scanManualFrame}>
              Capturar manual
            </button>
            <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
              Subir foto
            </button>
          </div>
        )}
        <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={scanUploadedImage} />
      </footer>
    </main>
  )
}

function DetectedCardsPage({
  onBack,
  onCorrect,
  onOpenCard,
  onOpenSpread,
  onAddDetectedToSpread,
}: {
  onBack: () => void
  onCorrect: () => void
  onOpenCard: (cardId: string) => void
  onOpenSpread: () => void
  onAddDetectedToSpread: () => void
}) {
  const detected = detectedDemoIds.map((cardId, index) => ({
    card: cardsById.get(cardId)!,
    confidence: [92, 88, 83][index],
    orientation: index === 1 ? 'Invertida' : 'Derecha',
  }))

  return (
    <main className="page page-with-nav detected-page">
      <header className="detected-header">
        <button className="round-ghost" type="button" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <div>
          <div className="brand-mark small" aria-hidden="true">
            <SunIcon />
          </div>
          <h1>Cartas detectadas</h1>
          <p>Se detectaron 3 cartas</p>
        </div>
        <span />
      </header>
      <div className="detected-list">
        {detected.map(({ card, confidence, orientation }) => (
          <button className="detected-card" key={card.id} type="button" onClick={() => onOpenCard(card.id)}>
            <TarotCardArt card={card} size="small" />
            <span>
              <strong>{card.nameEs}</strong>
              <small>{confidence}% de confianza</small>
              <em>{card.keywordsUpright.slice(0, 3).join(' · ')}</em>
            </span>
            <b>{orientation}</b>
          </button>
        ))}
      </div>
      <p className="privacy-note">Tus fotos se procesan localmente. Para matching real falta cargar templates del mazo físico.</p>
      <div className="photo-actions">
        <button type="button" onClick={onOpenSpread}>Ver juntas</button>
        <button type="button" onClick={onCorrect}>Corregir</button>
        <button type="button" onClick={onAddDetectedToSpread}>Guardar tirada</button>
      </div>
    </main>
  )
}

function CorrectionPage({
  onBack,
  onConfirm,
  onOpenCard,
}: {
  onBack: () => void
  onConfirm: () => void
  onOpenCard: (cardId: string) => void
}) {
  const candidates = ['the_high_priestess', 'the_moon', 'seven_of_cups']
    .map((id, index) => ({ card: cardsById.get(id)!, confidence: [54, 36, 24][index] }))
    .filter((item) => item.card)
  const [selected, setSelected] = useState(candidates[0]?.card.id ?? 'the_moon')

  return (
    <main className="page correction-page">
      <header className="detail-topbar">
        <button className="round-ghost" type="button" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <div className="brand-mark small" aria-hidden="true">
          <SunIcon />
        </div>
        <span className="top-spacer" />
      </header>
      <PageHeader title="Corregir carta" subtitle="No estoy segura de esta carta" centered />
      <div className="photo-preview">
        <span>Recorte detectado</span>
      </div>
      <p className="center-muted">Elegí la carta que mejor coincida</p>
      <div className="candidate-list">
        {candidates.map(({ card, confidence }) => (
          <button
            className={`candidate ${selected === card.id ? 'selected' : ''}`}
            key={card.id}
            type="button"
            onClick={() => setSelected(card.id)}
            onDoubleClick={() => onOpenCard(card.id)}
          >
            <span className="radio-dot" />
            <TarotCardArt card={card} size="tiny" />
            <span>
              <strong>{card.nameEs}</strong>
              <small>{confidence}% de confianza</small>
              <em>{card.keywordsUpright.slice(0, 3).join(' · ')}</em>
            </span>
          </button>
        ))}
      </div>
      <button className="primary-fixed-action" type="button" onClick={onConfirm}>
        Confirmar selección
      </button>
    </main>
  )
}

function SavedPage({
  favoriteIds,
  recents,
  spread,
  onOpenCard,
  onOpenSpread,
  onGoSearch,
}: {
  favoriteIds: string[]
  recents: StoredRecent[]
  spread: SpreadItem[]
  onOpenCard: (cardId: string) => void
  onOpenSpread: () => void
  onGoSearch: () => void
}) {
  const favorites = favoriteIds.map((id) => cardsById.get(id)).filter((card): card is TarotCard => Boolean(card))
  const recentCards = recents.map((item) => cardsById.get(item.cardId)).filter((card): card is TarotCard => Boolean(card))

  return (
    <main className="page page-with-nav">
      <PageHeader title="Guardadas" subtitle="Favoritos, historial y tirada actual" />
      {spread.length > 0 && (
        <section className="saved-spread">
          <SectionTitle title="Tirada actual" caption={`${spread.length}/3 cartas`} />
          <button type="button" onClick={onOpenSpread}>
            Ver resumen simple
          </button>
        </section>
      )}
      <SavedSection title="Favoritos" cards={favorites} empty="Todavía no guardaste cartas." onOpenCard={onOpenCard} onEmptyAction={onGoSearch} />
      <SavedSection title="Historial reciente" cards={recentCards} empty="Tu historial aparece después de abrir una carta." onOpenCard={onOpenCard} onEmptyAction={onGoSearch} />
    </main>
  )
}

function SavedSection({
  title,
  cards,
  empty,
  onOpenCard,
  onEmptyAction,
}: {
  title: string
  cards: TarotCard[]
  empty: string
  onOpenCard: (cardId: string) => void
  onEmptyAction: () => void
}) {
  return (
    <section className="saved-section">
      <SectionTitle title={title} />
      {cards.length > 0 ? (
        <div className="compact-list">
          {cards.map((card) => (
            <CompactCardResult key={card.id} card={card} onOpen={() => onOpenCard(card.id)} />
          ))}
        </div>
      ) : (
        <EmptyState title={empty} text="Buscá una carta y tocá Guardar para verla acá." action="Ir a buscar" onAction={onEmptyAction} />
      )}
    </section>
  )
}

function SpreadPage({
  spread,
  onBack,
  onOpenCard,
  onCopy,
  onClear,
}: {
  spread: SpreadItem[]
  onBack: () => void
  onOpenCard: (cardId: string) => void
  onCopy: (text: string) => void
  onClear: () => void
}) {
  const cards = spread.map((item) => ({ item, card: cardsById.get(item.cardId) })).filter((entry): entry is { item: SpreadItem; card: TarotCard } => Boolean(entry.card))
  const themes = summarizeThemes(cards.map((entry) => entry.card))
  const summary =
    cards.length === 0
      ? 'Agregá hasta 3 cartas desde búsqueda o foto para verlas juntas.'
      : `Estas cartas juntas tocan ${themes.length > 0 ? themes.join(', ') : 'un proceso de lectura'} sin generar una interpretación automática.`
  const copy = `Tirada actual\n${cards.map(({ card }, index) => `${index + 1}. ${card.nameEs}: ${card.oneLineUpright}`).join('\n')}\n\n${summary}`

  return (
    <main className="page spread-page">
      <header className="detail-topbar">
        <button className="round-ghost" type="button" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <h1>Tirada actual</h1>
        <span className="top-spacer" />
      </header>
      {cards.length > 0 ? (
        <section className="spread-cards">
          {cards.map(({ item, card }, index) => (
            <button key={card.id} type="button" onClick={() => onOpenCard(card.id)}>
              <span className="spread-number">{index + 1}</span>
              <TarotCardArt card={card} size="grid" />
              <strong>{card.shortName}</strong>
              <small>{item.orientation === 'upright' ? 'Derecha' : 'Invertida'}</small>
              <p>{item.orientation === 'upright' ? card.oneLineUpright : card.oneLineReversed}</p>
            </button>
          ))}
        </section>
      ) : (
        <EmptyState title="Tirada vacía" text="Agregá cartas desde los resultados o desde Foto." />
      )}
      <section className="spread-summary">
        <h2>Resumen simple</h2>
        <p>{summary}</p>
      </section>
      <div className="spread-actions">
        <button type="button" onClick={() => onCopy(copy)} disabled={cards.length === 0}>Copiar</button>
        <button type="button" onClick={onClear} disabled={cards.length === 0}>Vaciar</button>
      </div>
    </main>
  )
}

function SearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = false,
  variant = 'default',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoFocus?: boolean
  variant?: 'default' | 'primary' | 'compact'
}) {
  return (
    <label className={`search-bar search-bar-${variant}`}>
      <span aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          ×
        </button>
      )}
      <i aria-hidden="true">✦</i>
    </label>
  )
}

function FilterChips({
  value,
  onChange,
  withPhoto = false,
  onPhoto,
  compact = false,
}: {
  value: CardFilter
  onChange: (value: CardFilter) => void
  withPhoto?: boolean
  onPhoto?: () => void
  compact?: boolean
}) {
  return (
    <div className={`chip-row ${compact ? 'compact' : ''}`} aria-label="Filtros">
      {withPhoto && (
        <button type="button" onClick={onPhoto} className="chip photo-chip">
          Foto
        </button>
      )}
      {filters.map((filter) => (
        <button className={`chip ${value === filter.id ? 'active' : ''}`} key={filter.id} type="button" onClick={() => onChange(filter.id)}>
          {filter.label}
        </button>
      ))}
    </div>
  )
}

function TarotCardArt({ card, size }: { card: TarotCard; size: 'tiny' | 'small' | 'medium' | 'large' | 'grid' | 'rail' }) {
  const sprite = cardSprite[card.id as keyof typeof cardSprite]
  const useSprite = size !== 'large' && Boolean(sprite)
  const spriteColumn = sprite ? sprite.x / sprite.w : 0
  const spriteRow = sprite ? sprite.y / sprite.h : 0
  const spriteRows = getSpriteRows()
  const showFallbackLabel = !useSprite && size !== 'large'

  return (
    <span className={`tarot-art tarot-art-${size} ${useSprite ? 'has-image' : ''}`} style={{ '--card-accent': card.accent } as CSSProperties}>
      {size === 'large' ? (
        <img src={card.image.full} alt={card.nameEs} loading="lazy" decoding="async" onError={(event) => fallbackToThumb(event, card.image.thumb)} />
      ) : sprite ? (
        <span
          className="tarot-sprite"
          style={
            {
              '--sprite-url': `url(${cardSpriteImage})`,
              '--sprite-x': `${(spriteColumn / Math.max(1, cardSpriteColumns - 1)) * 100}%`,
              '--sprite-y': `${(spriteRow / Math.max(1, spriteRows - 1)) * 100}%`,
              '--sprite-columns': cardSpriteColumns,
              '--sprite-rows': spriteRows,
            } as CSSProperties
          }
          aria-hidden="true"
        />
      ) : (
        <img src={card.image.thumb} alt="" loading="lazy" decoding="async" onError={hideBrokenImage} />
      )}
      <span className="tarot-css-fallback" aria-hidden="true">
        <span className="tarot-stars" />
        <span className="tarot-moon" />
        <span className="tarot-glyph">{card.glyph}</span>
      </span>
      {showFallbackLabel && <span className="tarot-name">{card.shortName}</span>}
    </span>
  )
}

function getSpriteRows() {
  const entries = Object.values(cardSprite)
  if (entries.length === 0) return 1
  return Math.max(...entries.map((entry) => entry.y / entry.h)) + 1
}

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true
}

function fallbackToThumb(event: SyntheticEvent<HTMLImageElement>, thumbSrc: string) {
  if (event.currentTarget.src !== new URL(thumbSrc, window.location.href).href) {
    event.currentTarget.src = thumbSrc
    return
  }

  hideBrokenImage(event)
}

function PageHeader({ title, subtitle, centered = false, compact = false }: { title: string; subtitle: string; centered?: boolean; compact?: boolean }) {
  return (
    <header className={`page-header ${centered ? 'centered' : ''} ${compact ? 'compact' : ''}`}>
      <div className="brand-mark small" aria-hidden="true">
        <SunIcon />
      </div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}

function SectionTitle({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {caption && <span>{caption}</span>}
    </div>
  )
}

function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string
  text: string
  action?: string
  onAction?: () => void
}) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      {action && <button type="button" onClick={onAction}>{action}</button>}
    </section>
  )
}

function BottomNav({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: ReactNode }> = [
    { id: 'search', label: 'Buscar', icon: <SearchIcon /> },
    { id: 'photo', label: 'Foto', icon: <CameraIcon /> },
    { id: 'saved', label: 'Guardadas', icon: <BookmarkIcon /> },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <button className={activeTab === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => onChange(item.id)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function summarizeThemes(cards: TarotCard[]) {
  const counts = new Map<string, number>()
  cards.flatMap((card) => card.keywordsUpright.slice(0, 4)).forEach((keyword) => counts.set(keyword, (counts.get(keyword) ?? 0) + 1))
  const repeated = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([keyword]) => keyword)
  return repeated.length > 0 ? repeated.slice(0, 3) : cards.flatMap((card) => card.keywordsUpright.slice(0, 1)).slice(0, 3)
}

function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

function rememberCameraPermission() {
  try {
    window.localStorage.setItem(cameraPermissionStorageKey, 'granted')
  } catch {
    // Storage can be unavailable in private contexts; camera permission still works.
  }
}

function shouldAutoStartCamera() {
  try {
    return window.localStorage.getItem(cameraPermissionStorageKey) === 'granted'
  } catch {
    return false
  }
}

function getScanHint(status: ScanStatus) {
  if (status === 'confident') return 'Resultado local, sin subir la foto'
  if (status === 'uncertain') return 'Elegí una candidata para continuar'
  return 'Reconozco Rider-Waite en tu teléfono'
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function DetailIcon({ name }: { name: DetailIconName }) {
  if (name === 'spark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
      </svg>
    )
  }

  if (name === 'reversed') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" />
      </svg>
    )
  }

  if (name === 'heart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8.3c0-2.5-2.1-4.5-4.7-4.5-1.9 0-3.6 1.1-4.3 2.7-.7-1.6-2.4-2.7-4.3-2.7C5.1 3.8 3 5.8 3 8.3c0 7.2 9 12 9 12s9-4.8 9-12z" />
      </svg>
    )
  }

  if (name === 'work') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8.8c0-1.1.8-2 1.8-2.2A43 43 0 0 1 12 6.2c2.1 0 4.2.1 6.2.4 1.1.2 1.8 1.1 1.8 2.2v8.7c0 1.1-.8 2-1.9 2.2-2 .3-4.1.4-6.1.4s-4.1-.1-6.1-.4A2.2 2.2 0 0 1 4 17.5V8.8z" />
        <path d="M8.5 6.2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.2M4 12.5c2.5.9 5.1 1.3 8 1.3s5.5-.4 8-1.3M12 12.3h.01" />
      </svg>
    )
  }

  if (name === 'money') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6v12M9 15.2l.9.6c1.2.9 3.1.9 4.2 0 1.2-.9 1.2-2.3 0-3.2-.6-.4-1.3-.6-2.1-.6-.7 0-1.5-.2-2-.7-1.1-.9-1.1-2.3 0-3.1s2.9-.9 4 0l.4.3" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )
  }

  if (name === 'advice') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.5 3.5a.6.6 0 0 1 1 0l2.1 5.1c.1.2.3.3.5.3l5.5.5c.5 0 .7.6.3 1l-4.2 3.6c-.2.1-.2.3-.2.5l1.3 5.4c.1.5-.4.9-.9.6l-4.7-2.9a.6.6 0 0 0-.6 0l-4.7 2.9c-.5.3-1-.1-.9-.6l1.3-5.4c0-.2 0-.4-.2-.5l-4.2-3.6c-.4-.4-.2-1 .3-1l5.5-.5c.2 0 .4-.1.5-.3l2.1-5.1z" />
      </svg>
    )
  }

  if (name === 'question') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.9 7.5a3.1 3.1 0 0 1 4.2 0 2.4 2.4 0 0 1 0 3.7c-.2.2-.4.3-.7.5-.7.4-1.4 1-1.4 1.8v.7" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 17.3h.01" />
      </svg>
    )
  }

  if (name === 'eye') {
    return (
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <path d="M10 30Q30 10 50 30Q30 50 10 30z" />
        <circle cx="30" cy="30" r="6" />
        <circle cx="30" cy="30" r="2" fill="currentColor" />
        <path d="M30 18V8M30 42v10M18 30H8M42 30h10M22 22l-7-7M38 38l7 7M38 22l7-7M22 38l-7 7" />
      </svg>
    )
  }

  if (name === 'copy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
        <path d="M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      </svg>
    )
  }

  if (name === 'bookmark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v17l-6-3.8L6 21z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.3 4.3" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v17l-6-3.5L6 21z" />
    </svg>
  )
}

export default App
