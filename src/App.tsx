import { startTransition, useDeferredValue, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './App.css'
import { cardsById, detectedDemoIds, tarotCards, type TarotCard } from './data/cards'
import { filterCards, filters, getPopularCards, searchCards, type CardFilter } from './lib/search'
import {
  readFavorites,
  readRecents,
  removeFavorite,
  saveFavorite,
  saveRecent,
  type StoredRecent,
} from './lib/storage'

type Tab = 'search' | 'photo' | 'cards' | 'saved'
type Orientation = 'upright' | 'reversed'

type SpreadItem = {
  cardId: string
  orientation: Orientation
  source: 'search' | 'photo'
  confidence?: number
}

type PhotoStage = 'camera' | 'detected' | 'correct'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<CardFilter>('all')
  const [gridQuery, setGridQuery] = useState('')
  const [gridFilter, setGridFilter] = useState<CardFilter>('all')
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
          onAddDetectedToSpread={() => {
            detectedDemoIds.forEach((cardId, index) => addToSpread(cardId, index === 1 ? 'reversed' : 'upright', 'photo'))
          }}
        />
      )}
      {activeTab === 'cards' && (
        <CardsPage
          query={gridQuery}
          filter={gridFilter}
          favoriteIds={favoriteIds}
          onQueryChange={setGridQuery}
          onFilterChange={setGridFilter}
          onOpenCard={(cardId) => openCard(cardId, 'grid')}
          onToggleFavorite={toggleFavorite}
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
  const results = searchCards(deferredQuery, filter, 12)
  const hasQuery = deferredQuery.trim().length > 0
  const best = results[0]?.card
  const recentCards = recents.map((item) => cardsById.get(item.cardId)).filter((card): card is TarotCard => Boolean(card)).slice(0, 6)
  const popularCards = getPopularCards()

  return (
    <main className="page page-with-nav">
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

      <SearchBar value={query} onChange={onQueryChange} placeholder="Buscar carta, número o keyword..." autoFocus />
      <FilterChips value={filter} onChange={onFilterChange} withPhoto onPhoto={onGoPhoto} />

      {hasQuery ? (
        <section className="stack-lg">
          {best ? (
            <>
              <SectionTitle title="Mejor resultado" caption={`Respuesta local · ${results.length} coincidencias`} />
              <ResultHero
                card={best}
                isFavorite={favoriteIds.includes(best.id)}
                onOpen={() => onOpenCard(best.id)}
                onCopy={() => onCopy(best)}
                onToggleFavorite={() => onToggleFavorite(best.id)}
                onAddToSpread={() => onAddToSpread(best.id)}
              />
              <SectionTitle title="Más resultados" />
              <div className="compact-list">
                {results.slice(1).map((result) => (
                  <CompactCardResult
                    key={result.card.id}
                    card={result.card}
                    score={result.score}
                    onOpen={() => onOpenCard(result.card.id)}
                  />
                ))}
              </div>
              <SuggestionList query={deferredQuery} onPick={onQueryChange} />
            </>
          ) : (
            <EmptyState
              title="No encontré esa carta."
              text="Probá con nombre, número o una palabra como amor, trabajo o XVIII."
            />
          )}
        </section>
      ) : (
        <section className="stack-lg">
          <QuickPrompt onPick={onQueryChange} />
          <CardRail title="Recientes" cards={recentCards.length > 0 ? recentCards : popularCards.slice(0, 4)} onOpen={onOpenCard} />
          <CardRail title="Populares" cards={popularCards} onOpen={onOpenCard} />
          <div className="metric-panel">
            <span>78 cartas</span>
            <span>ES/EN</span>
            <span>Offline-first</span>
          </div>
        </section>
      )}
    </main>
  )
}

function ResultHero({
  card,
  isFavorite,
  onOpen,
  onCopy,
  onToggleFavorite,
  onAddToSpread,
}: {
  card: TarotCard
  isFavorite: boolean
  onOpen: () => void
  onCopy: () => void
  onToggleFavorite: () => void
  onAddToSpread: () => void
}) {
  return (
    <article className="result-hero glow-card">
      <button className="hero-card-main" type="button" onClick={onOpen}>
        <TarotCardArt card={card} size="medium" />
        <div className="result-copy">
          <p className="meta-line">{card.arcana === 'major' ? `Arcano Mayor ${card.roman}` : `${card.rankEs} de ${card.suitEs}`}</p>
          <h2>{card.nameEs}</h2>
          <p className="keywords">{card.keywordsUpright.slice(0, 4).join(' · ')}</p>
        </div>
      </button>
      <div className="meaning-pair">
        <MeaningLine label="Derecha" text={card.oneLineUpright} />
        <MeaningLine label="Invertida" text={card.oneLineReversed} />
      </div>
      <div className="action-grid">
        <button type="button" onClick={onOpen}>
          Ver
        </button>
        <button type="button" onClick={onCopy}>
          Copiar
        </button>
        <button type="button" onClick={onToggleFavorite}>
          {isFavorite ? 'Guardada' : 'Guardar'}
        </button>
        <button type="button" onClick={onAddToSpread}>
          Tirada
        </button>
      </div>
    </article>
  )
}

function CompactCardResult({ card, score, onOpen }: { card: TarotCard; score: number; onOpen: () => void }) {
  return (
    <button className="compact-result" type="button" onClick={onOpen}>
      <TarotCardArt card={card} size="tiny" />
      <span className="compact-copy">
        <strong>{card.nameEs}</strong>
        <small>{card.keywordsUpright.slice(0, 3).join(' · ')}</small>
      </span>
      <span className="score-pill">{Math.min(99, Math.round(score / 12))}%</span>
    </button>
  )
}

function CardsPage({
  query,
  filter,
  favoriteIds,
  onQueryChange,
  onFilterChange,
  onOpenCard,
  onToggleFavorite,
}: {
  query: string
  filter: CardFilter
  favoriteIds: string[]
  onQueryChange: (query: string) => void
  onFilterChange: (filter: CardFilter) => void
  onOpenCard: (cardId: string) => void
  onToggleFavorite: (cardId: string) => void
}) {
  const deferredQuery = useDeferredValue(query)
  const cards = deferredQuery.trim()
    ? searchCards(deferredQuery, filter, 78).map((result) => result.card)
    : filterCards(tarotCards, filter)

  return (
    <main className="page page-with-nav">
      <PageHeader title="Todas las cartas" subtitle="Grilla completa del mazo" />
      <SearchBar value={query} onChange={onQueryChange} placeholder="Buscar en las 78 cartas..." />
      <FilterChips value={filter} onChange={onFilterChange} />
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
              {favoriteIds.includes(card.id) ? 'Guardada' : 'Guardar'}
            </button>
          </article>
        ))}
      </div>
    </main>
  )
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
  const detailItems = [
    ['Resumen', isUpright ? card.oneLineUpright : card.oneLineReversed, 'i'],
    ['En 10 segundos', isUpright ? card.quickUpright : card.quickReversed, '10'],
    ['Amor', isUpright ? card.loveUpright : card.loveReversed, 'a'],
    ['Trabajo', isUpright ? card.workUpright : card.workReversed, 't'],
    ['Dinero', isUpright ? card.moneyUpright : card.moneyReversed, '$'],
    ['Consejo', isUpright ? card.adviceUpright : card.adviceReversed, '!'],
    ['Sí / No', card.yesNo, '?'],
  ]

  return (
    <main className="page detail-page">
      <header className="detail-topbar">
        <button className="round-ghost" type="button" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <div className="brand-mark small" aria-hidden="true">
          <SunIcon />
        </div>
        <button className={`round-ghost ${isFavorite ? 'active' : ''}`} type="button" onClick={onToggleFavorite}>
          {isFavorite ? '★' : '☆'}
        </button>
      </header>

      <section className="detail-hero">
        <TarotCardArt card={card} size="large" />
        <div className="detail-title">
          <h1>{card.nameEs}</h1>
          <p>{card.nameEn} · {card.arcana === 'major' ? `Arcano Mayor ${card.roman}` : `${card.rankEs} de ${card.suitEs}`}</p>
          <span>{card.keywordsUpright.slice(0, 4).join(' · ')}</span>
        </div>
      </section>

      <div className="segmented" role="group" aria-label="Orientación">
        <button className={orientation === 'upright' ? 'selected' : ''} type="button" onClick={() => onOrientationChange('upright')}>
          Derecha
        </button>
        <button className={orientation === 'reversed' ? 'selected' : ''} type="button" onClick={() => onOrientationChange('reversed')}>
          Invertida
        </button>
      </div>

      <section className="detail-list">
        {detailItems.map(([title, text, icon]) => (
          <article className="detail-row" key={title}>
            <span className="row-icon">{icon}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="related-section">
        <SectionTitle title="Parecidas" />
        <div className="related-row">
          {card.relatedCards.slice(0, 3).map((cardId) => {
            const related = cardsById.get(cardId)
            if (!related) return null
            return (
              <button key={cardId} type="button" onClick={() => onOpenRelated(cardId)}>
                <TarotCardArt card={related} size="tiny" />
                <span>{related.shortName}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="detail-actions">
        <button type="button" onClick={onCopy}>Copiar</button>
        <button type="button" onClick={onToggleFavorite}>{isFavorite ? 'Guardada' : 'Guardar'}</button>
        <button type="button" onClick={onAddToSpread}>Tirada</button>
        <button type="button" onClick={onOpenSpread} disabled={spreadCount === 0}>Ver {spreadCount}/3</button>
      </div>
    </main>
  )
}

function PhotoPage({
  stage,
  onStageChange,
  onOpenCard,
  onOpenSpread,
  onAddDetectedToSpread,
}: {
  stage: PhotoStage
  onStageChange: (stage: PhotoStage) => void
  onOpenCard: (cardId: string) => void
  onOpenSpread: () => void
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

  return <CameraPage onDetected={() => onStageChange('detected')} />
}

function CameraPage({ onDetected }: { onDetected: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cameraState, setCameraState] = useState<'idle' | 'active' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    return () => stopCamera(streamRef.current)
  }, [])

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraState('active')
    } catch {
      setCameraState('denied')
    }
  }

  return (
    <main className="camera-page">
      <div className="camera-bg">
        {cameraState === 'active' ? <video ref={videoRef} autoPlay muted playsInline /> : <div className="camera-fallback-art" />}
        <div className="camera-vignette" />
      </div>
      <header className="camera-topbar">
        <button className="round-glass" type="button" onClick={() => stopCamera(streamRef.current)} aria-label="Cerrar cámara">
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
          <strong>Enfocá 1 a 3 cartas</strong>
          <small>{cameraState === 'active' ? 'Detectando bordes...' : 'Cámara local con fallback'}</small>
        </span>
      </div>

      <section className="camera-guides" aria-label="Guías de cartas">
        <div />
        <div />
        <div />
      </section>

      <footer className="camera-controls">
        {cameraState !== 'active' && (
          <button className="camera-start" type="button" onClick={() => void startCamera()}>
            Activar cámara
          </button>
        )}
        {cameraState === 'denied' && <p>Necesito permiso de cámara. También podés subir una foto o buscar manualmente.</p>}
        {cameraState === 'unsupported' && <p>Esta cámara no está disponible en el navegador. Usá subir foto como fallback.</p>}
        <div className="camera-action-row">
          <span />
          <button className="shutter" type="button" aria-label="Capturar foto" onClick={onDetected}>
            <span />
          </button>
          <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
            Subir foto
          </button>
        </div>
        <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={onDetected} />
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
            <CompactCardResult key={card.id} card={card} score={900} onOpen={() => onOpenCard(card.id)} />
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
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoFocus?: boolean
}) {
  return (
    <label className="search-bar">
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
}: {
  value: CardFilter
  onChange: (value: CardFilter) => void
  withPhoto?: boolean
  onPhoto?: () => void
}) {
  return (
    <div className="chip-row" aria-label="Filtros">
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

function QuickPrompt({ onPick }: { onPick: (query: string) => void }) {
  return (
    <section className="quick-panel">
      <h2>Buscá una carta</h2>
      <p>Probá “La Luna”, “3 espadas”, “amor” o “XVIII”.</p>
      <div>
        {['luna', '3 espadas', 'amor', 'xviii'].map((item) => (
          <button key={item} type="button" onClick={() => onPick(item)}>
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}

function SuggestionList({ query, onPick }: { query: string; onPick: (query: string) => void }) {
  const clean = query.trim() || 'luna'
  const suggestions = [`${clean} significado`, `${clean} invertida`, `${clean} amor`, `${clean} trabajo`]

  return (
    <section className="suggestions">
      <h2>Sugerencias</h2>
      {suggestions.map((suggestion) => (
        <button key={suggestion} type="button" onClick={() => onPick(suggestion)}>
          <SearchIcon />
          <span>{suggestion}</span>
        </button>
      ))}
    </section>
  )
}

function CardRail({ title, cards, onOpen }: { title: string; cards: TarotCard[]; onOpen: (cardId: string) => void }) {
  return (
    <section className="card-rail-section">
      <SectionTitle title={title} />
      <div className="card-rail">
        {cards.map((card) => (
          <button key={card.id} type="button" onClick={() => onOpen(card.id)}>
            <TarotCardArt card={card} size="rail" />
            <strong>{card.shortName}</strong>
            <small>{card.arcana === 'major' ? card.roman : card.suitEs}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

function TarotCardArt({ card, size }: { card: TarotCard; size: 'tiny' | 'small' | 'medium' | 'large' | 'grid' | 'rail' }) {
  return (
    <span className={`tarot-art tarot-art-${size}`} style={{ '--card-accent': card.accent } as CSSProperties} aria-hidden="true">
      <span className="tarot-stars" />
      <span className="tarot-moon" />
      <span className="tarot-glyph">{card.glyph}</span>
      <span className="tarot-name">{card.shortName}</span>
    </span>
  )
}

function MeaningLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="meaning-line">
      <span />
      <div>
        <strong>{label}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

function PageHeader({ title, subtitle, centered = false }: { title: string; subtitle: string; centered?: boolean }) {
  return (
    <header className={`page-header ${centered ? 'centered' : ''}`}>
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
    { id: 'cards', label: 'Cartas', icon: <CardsIcon /> },
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

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="3" width="10" height="15" rx="2" />
      <path d="M5 7 4 19a2 2 0 0 0 2 2h9" />
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
