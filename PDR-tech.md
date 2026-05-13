# PDR técnico — Carta Clara / Tarot Fast Search

## 0. Decisión madre

La app tiene que comportarse como una **app estática offline-first**, no como una web que “consulta datos”.

La arquitectura base:

```txt
Static Hosting
  ├─ index.html
  ├─ assets JS/CSS
  ├─ data/*.json
  ├─ cards/*.webp
  └─ vision/templates/*

Browser
  ├─ React UI
  ├─ MiniSearch local
  ├─ Service Worker
  ├─ Cache Storage
  ├─ IndexedDB
  ├─ Web Worker para visión
  └─ OpenCV.js lazy-loaded solo en Foto
```

No hay backend. No hay login. No hay API. No hay DB remota. El deploy publica archivos estáticos versionados, y el navegador resuelve búsqueda, favoritos, historial, offline y matching visual localmente.

Vite encaja bien porque su build de producción genera assets estáticos optimizados, y una PWA puede usar service workers para interceptar requests, cachear recursos y sostener experiencias offline. ([vitejs][1])

---

# 1. Objetivo técnico principal

La métrica técnica no es “tener muchas features”. Es:

```txt
Intento del usuario → significado útil visible
Manual: < 3 s
Search result visible: < 100 ms
App usable: < 1–2 s
Foto MVP: < 8 s
```

Para lograrlo, la información se organiza en **capas de peso**:

```txt
Capa 1 — App shell
UI mínima, tabs, search bar, skeletons.

Capa 2 — Search data
Resumen mínimo de 78 cartas + índice local.

Capa 3 — Detail data
Contenido profundo de cada carta, lazy.

Capa 4 — Images
Thumbnails primero, imágenes grandes después.

Capa 5 — Vision
OpenCV.js + templates/descriptores, solo cuando se abre Foto.
```

La clave: **la pantalla Buscar nunca debe esperar a Foto, OpenCV, imágenes grandes ni contenido profundo**.

---

# 2. Stack recomendado

| Capa                    | Decisión                                           |
| ----------------------- | -------------------------------------------------- |
| Framework               | React + TypeScript                                 |
| Build                   | Vite                                               |
| PWA                     | `vite-plugin-pwa` + Workbox                        |
| Routing                 | React Router o TanStack Router                     |
| UI styling              | Tailwind + CSS variables                           |
| Estado UI               | Zustand o Zustand-like simple                      |
| Datos locales           | IndexedDB vía Dexie o `idb`                        |
| Preferencias pequeñas   | `localStorage` solo para settings mínimos          |
| Search                  | MiniSearch                                         |
| Validación de contenido | Zod                                                |
| Tests                   | Vitest + Playwright                                |
| Visión por foto         | OpenCV.js en Web Worker                            |
| Deploy                  | Vercel / Netlify / Cloudflare Pages / GitHub Pages |

MiniSearch es la mejor opción inicial porque soporta búsqueda local en memoria, offline, fuzzy search, prefix search, ranking y field boosting, justo lo que necesita este producto. Además, permite serializar/deserializar el índice, así que el índice puede generarse en build y cargarse rápido en el navegador. ([Luca Ong][2])

---

# 3. Organización estratégica de la información

Este es el corazón del producto.

## 3.1 Fuente editable

La fuente humana debe vivir separada del código:

```txt
content/
  cards/
    major/
      the_fool.json
      the_magician.json
      the_moon.json
    cups/
      ace_of_cups.json
      two_of_cups.json
    swords/
    wands/
    pentacles/
```

Cada carta se edita como documento completo, claro y validable.

Ejemplo:

```ts
export type CardSource = {
  id: string;
  slug: string;

  name: {
    es: string;
    en: string;
    short?: string;
  };

  taxonomy: {
    arcana: "major" | "minor";
    suit?: "cups" | "swords" | "wands" | "pentacles";
    rank?: "ace" | "two" | "three" | "page" | "knight" | "queen" | "king";
    number?: number;
    roman?: string;
  };

  search: {
    aliases: string[];
    keywords: string[];
    tags: string[];
    typoHints?: string[];
  };

  meaning: {
    upright: CardMeaning;
    reversed: CardMeaning;
  };

  related: string[];

  media: {
    thumbnail: string;
    full: string;
    template?: string;
  };

  meta: {
    contentVersion: string;
    updatedAt: string;
  };
};

export type CardMeaning = {
  keywords: string[];
  oneLine: string;
  quick: string;
  love: string;
  work: string;
  money: string;
  advice: string;
  yesNo?: string;
};
```

## 3.2 Artefactos generados para runtime

No conviene que la app cargue esos JSON completos al inicio. En build se generan archivos optimizados:

```txt
public/data/
  manifest.json
  cards.summary.v1.json
  cards.search-docs.v1.json
  cards.search-index.v1.json
  cards.detail/
    the_moon.v1.json
    three_of_swords.v1.json
```

### `cards.summary.v1.json`

Se carga al abrir la app.

Contiene solo lo necesario para búsqueda, recientes, populares y cards compactas:

```ts
export type CardSummary = {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  arcana: "major" | "minor";
  suit?: Suit;
  number?: number;
  roman?: string;
  thumbnail: string;

  keywordsUpright: string[];
  keywordsReversed: string[];

  oneLineUpright: string;
  oneLineReversed: string;

  popularityRank?: number;
};
```

### `cards.detail/[id].json`

Se carga solo cuando el usuario entra al detalle.

```ts
export type CardDetail = CardSummary & {
  quickUpright: string;
  quickReversed: string;

  loveUpright: string;
  loveReversed: string;

  workUpright: string;
  workReversed: string;

  moneyUpright: string;
  moneyReversed: string;

  adviceUpright: string;
  adviceReversed: string;

  yesNo: string;
  relatedCards: string[];

  associations?: {
    element?: string;
    astrology?: string;
    numerology?: string;
  };

  fullImage: string;
};
```

### `cards.search-docs.v1.json`

Documento diseñado solo para ranking.

```ts
export type SearchDoc = {
  id: string;

  nameEs: string;
  nameEn: string;
  aliases: string[];

  numberText: string[];
  suitText: string[];
  rankText: string[];

  keywords: string[];
  oneLine: string[];
  quick: string[];
  contexts: string[];
};
```

## 3.3 Por qué esta separación importa

La app debe abrir con:

```txt
App shell
+ summaries
+ índice search
```

No con:

```txt
78 detalles profundos
+ 78 imágenes grandes
+ OpenCV
+ templates
+ todo el mazo visual
```

Eso mata la promesa de “menos de 3 segundos”.

---

# 4. Build pipeline de contenido

Crear scripts de build:

```txt
scripts/
  validate-content.ts
  generate-summaries.ts
  generate-search-docs.ts
  generate-search-index.ts
  optimize-card-images.ts
  generate-vision-manifest.ts
```

Pipeline:

```txt
1. Leer content/cards/**/*.json
2. Validar con Zod
3. Confirmar que existen 78 cartas
4. Confirmar aliases mínimos español/inglés
5. Confirmar límites de caracteres
6. Generar summaries
7. Generar search docs
8. Generar índice MiniSearch serializado
9. Optimizar imágenes
10. Generar manifest versionado
11. Fallar build si falta algo
```

Reglas editoriales automatizadas:

```txt
oneLine <= 160 caracteres
quick <= 450 caracteres
keywords upright: 3–6
keywords reversed: 3–6
aliases: mínimo 6 por carta
relatedCards: 2–4
thumbnail obligatorio
full image obligatoria
```

Esto evita que el contenido se vuelva una enciclopedia lenta e inconsistente.

---

# 5. Search técnico

## 5.1 Estrategia de búsqueda

La búsqueda no debe depender solo de MiniSearch. Debe tener un pipeline híbrido:

```txt
Input usuario
  ↓
normalizeQuery()
  ↓
exact/alias/number lookup
  ↓
MiniSearch fuzzy/prefix
  ↓
merge + rerank
  ↓
resultados UI
```

Normalización:

```ts
function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
```

Debe convertir:

```txt
"la luna" → "la luna"
"Lúna" → "luna"
"XVIII" → "18" + "xviii"
"3 espadas" → "three swords" + "tres espadas" + "3 de espadas"
"empratriz" → fuzzy match → "La Emperatriz"
```

## 5.2 Lookup rápido antes del fuzzy

Crear mapas en memoria:

```ts
type SearchLookup = {
  byId: Map<CardId, CardSummary>;
  bySlug: Map<string, CardId>;
  byAlias: Map<string, CardId[]>;
  byNumber: Map<string, CardId[]>;
  bySuit: Map<string, CardId[]>;
};
```

Para queries como `luna`, `moon`, `18`, `xviii`, `the moon`, `3 espadas`, la respuesta debería salir casi instantánea sin depender de scoring difuso.

## 5.3 Pesos de ranking

```ts
const SEARCH_BOOSTS = {
  nameEs: 10,
  nameEn: 10,
  aliases: 9,
  numberText: 8,
  rankText: 8,
  suitText: 7,
  keywords: 6,
  oneLine: 4,
  quick: 2,
  contexts: 1,
};
```

Regla: una búsqueda por `amor` puede devolver varias cartas; una búsqueda por `luna` debe devolver **La Luna** primero, siempre.

## 5.4 Requisitos de aceptación search

```txt
Query "luna" → La Luna #1
Query "moon" → La Luna #1
Query "the moon" → La Luna #1
Query "18" → La Luna #1
Query "xviii" → La Luna #1
Query "empratriz" → La Emperatriz #1
Query "emperatris" → La Emperatriz top 3
Query "3 espadas" → Tres de Espadas #1
Query "three swords" → Tres de Espadas #1
Query "ruptura" → Tres de Espadas top 3
Query "confusion" → La Luna top 3
```

---

# 6. Storage local

Hay dos tipos de datos:

```txt
A. Datos de producto
Cartas, significados, imágenes, search index.
Vienen del build estático.

B. Datos de usuario
Favoritos, historial, notas, tirada actual, estado de aprendizaje.
Viven en IndexedDB.
```

IndexedDB es la opción correcta para datos estructurados locales; MDN la describe como una API de cliente para cantidades significativas de datos estructurados, con índices para búsquedas eficientes. Para assets pedidos por URL, como HTML, JS, CSS e imágenes, conviene Cache Storage; para datos de usuario estructurados, IndexedDB. ([MDN Web Docs][3])

Schema recomendado:

```ts
export type UserFavorite = {
  cardId: string;
  createdAt: number;
  note?: string;
};

export type RecentCard = {
  cardId: string;
  viewedAt: number;
  source: "search" | "photo" | "grid" | "related";
};

export type LearningState = {
  cardId: string;
  status: "unknown" | "review" | "learned";
  updatedAt: number;
};

export type CurrentSpread = {
  id: string;
  cards: Array<{
    cardId: string;
    orientation: "upright" | "reversed" | "unknown";
    source: "search" | "photo";
    confidence?: number;
  }>;
  createdAt: number;
  updatedAt: number;
};
```

Usar `localStorage` solo para:

```txt
theme
lastSelectedTab
hasSeenInstallHint
hasAcceptedCameraPrivacyCopy
```

No usar `localStorage` para historial grande, favoritos con notas o datos de mazo.

Importante: el storage del navegador puede ser “best effort” y estar sujeto a cuotas/evicción; por eso el contenido base debe ser recuperable desde assets estáticos versionados, y los datos personales deben tolerar errores de escritura. ([MDN Web Docs][4])

---

# 7. PWA y offline

## 7.1 Manifest

```json
{
  "name": "Carta Clara",
  "short_name": "Carta Clara",
  "description": "Tarot fast search y reconocimiento de cartas",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0E0B16",
  "background_color": "#0E0B16",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 7.2 Service worker

Para MVP, usar `vite-plugin-pwa`. Para más control, usar `injectManifest`, porque permite escribir un service worker propio y que el plugin inyecte el manifest de precache. ([Vite PWA][5])

Caching recomendado:

```txt
Precache obligatorio:
- index.html
- main JS/CSS
- manifest
- icons
- cards.summary.v1.json
- cards.search-index.v1.json
- thumbnails populares/recientes default
- offline fallback

Runtime cache:
- card detail JSON → cache-first con versión
- thumbnails restantes → cache-first
- full card images → cache-first lazy
- vision templates → cache-first lazy solo al usar Foto
- OpenCV chunk → cache-first lazy
```

Workbox precaching trabaja con una lista de URLs y revisiones; eso sirve perfecto para assets estáticos versionados de una app sin backend. ([Chrome for Developers][6])

---

# 8. Performance architecture

## 8.1 Code splitting obligatorio

Rutas:

```txt
/             Buscar
/foto         Foto
/cartas       Grilla
/guardadas    Favoritos/historial
/carta/:id    Detalle
/tirada       Tirada actual
```

Chunks:

```txt
main
search
cards-grid
card-detail
saved
photo
opencv-worker
```

La ruta `/foto` debe ser lazy:

```ts
const PhotoPage = lazy(() => import("@/features/photo/PhotoPage"));
```

OpenCV.js no debe entrar en el bundle inicial. OpenCV.js debe cargarse solo cuando el usuario abre Foto. OpenCV.js está documentado para usarse en páginas web, pero es una dependencia pesada para el objetivo de búsqueda instantánea. ([OpenCV Documentation][7])

## 8.2 Budgets recomendados

```txt
Initial JS gzip: ideal < 180 KB, aceptable < 250 KB
Initial CSS gzip: < 40 KB
cards.summary gzip: < 60 KB
search-index gzip: < 120 KB
First meaningful UI: < 1 s ideal, < 2 s aceptable
Search query response: < 50 ms ideal, < 100 ms aceptable
Photo route extra chunk: permitido, pero lazy
```

## 8.3 Reglas anti-lentitud

No hacer:

```txt
- Cargar 78 imágenes full al inicio
- Cargar OpenCV al inicio
- Indexar search desde cero en cada boot si ya se puede cargar serializado
- Guardar datos grandes en localStorage
- Usar fuentes externas desde Google Fonts en runtime
- Animaciones pesadas en la pantalla Buscar
```

Sí hacer:

```txt
- Self-host fonts
- Preload solo fuente principal
- Lazy image loading
- Virtualizar grilla si crece
- Usar thumbnails pequeños WebP/AVIF
- Usar Web Worker para visión
- Usar CSS transitions simples
```

---

# 9. Módulos de código

Estructura recomendada:

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    pwaUpdate.ts

  components/
    ui/
    layout/
    feedback/

  features/
    search/
      SearchPage.tsx
      SearchBar.tsx
      SearchResults.tsx
      searchEngine.ts
      searchNormalize.ts
      searchRanking.ts

    cards/
      CardsPage.tsx
      CardDetailPage.tsx
      CardGrid.tsx
      cardRepository.ts
      cardTypes.ts

    saved/
      SavedPage.tsx
      favoritesStore.ts
      historyStore.ts

    spread/
      CurrentSpreadPage.tsx
      spreadRules.ts

    photo/
      PhotoPage.tsx
      CameraView.tsx
      DetectedCardsPage.tsx
      photoWorkerClient.ts
      correctionFlow.ts

  workers/
    photo.worker.ts
    opencvLoader.ts
    cardMatcher.ts
    contourDetector.ts
    perspective.ts
    perceptualHash.ts

  db/
    db.ts
    schema.ts
    migrations.ts

  data/
    generatedManifest.ts

  lib/
    normalize.ts
    time.ts
    clipboard.ts
    haptics.ts
```

Separación importante:

```txt
features/search no debe importar features/photo.
features/cards no debe importar OpenCV.
workers/photo no debe tocar React.
db no debe depender de UI.
```

---

# 10. Card repository

Crear una abstracción simple:

```ts
export interface CardRepository {
  getSummaries(): Promise<CardSummary[]>;
  getSummary(cardId: CardId): CardSummary | undefined;
  getDetail(cardId: CardId): Promise<CardDetail>;
  preloadDetail(cardId: CardId): void;
}
```

Implementación:

```ts
class StaticCardRepository implements CardRepository {
  private summariesById = new Map<CardId, CardSummary>();
  private detailCache = new Map<CardId, Promise<CardDetail>>();

  async getSummaries() {
    const response = await fetch("/data/cards.summary.v1.json");
    const summaries = await response.json();
    summaries.forEach((card) => this.summariesById.set(card.id, card));
    return summaries;
  }

  getSummary(cardId: CardId) {
    return this.summariesById.get(cardId);
  }

  getDetail(cardId: CardId) {
    if (!this.detailCache.has(cardId)) {
      this.detailCache.set(
        cardId,
        fetch(`/data/cards.detail/${cardId}.v1.json`).then((r) => r.json())
      );
    }

    return this.detailCache.get(cardId)!;
  }

  preloadDetail(cardId: CardId) {
    void this.getDetail(cardId);
  }
}
```

Esto permite que search sea rapidísimo y detalle siga siendo rico sin cargar todo.

---

# 11. Photo matcher técnico

## 11.1 Principio

El modo Foto no debe ser “IA”. Debe ser:

```txt
Detección geométrica
+ normalización visual
+ comparación contra templates locales
+ ranking de candidatos
+ corrección humana rápida
```

La cámara se accede con `getUserMedia`, que requiere contexto seguro HTTPS y permiso del usuario. Siempre tiene que existir fallback a subir foto y a búsqueda manual. ([MDN Web Docs][8])

## 11.2 Pipeline MVP

```txt
1. Usuario abre Foto
2. Cargar PhotoPage
3. Pedir permiso de cámara
4. Abrir stream
5. Enviar frames reducidos al worker
6. Detectar rectángulos/cartas
7. Corregir perspectiva
8. Normalizar crop
9. Comparar contra templates
10. Devolver top candidates
11. Mostrar confianza + permitir corregir
```

## 11.3 Worker

```txt
Main thread:
- UI cámara
- overlay
- botón captura
- feedback

Worker:
- OpenCV init
- frame processing
- contour detection
- perspective transform
- ORB/pHash/template matching
```

## 11.4 Matching

Usar 3 señales:

```txt
A. ORB descriptors
Bueno para reconocer patrones aunque haya perspectiva o luz variable.

B. Perceptual hash / dHash
Bueno como fallback barato.

C. Template matching
Bueno cuando la carta está frontal y bien recortada.
```

OpenCV documenta matching de features con ORB descriptors y Brute Force Matcher; para este caso, encaja bien porque compara una imagen recortada contra templates locales sin modelo generativo. ([OpenCV Documentation][9])

Score compuesto:

```ts
export type VisionScore = {
  cardId: CardId;
  orientation: "upright" | "reversed" | "unknown";
  confidence: number;

  signals: {
    orbGoodMatches: number;
    orbDistanceAvg: number;
    hashDistance: number;
    templateScore?: number;
    rectangleQuality: number;
  };
};
```

Reglas UX:

```txt
confidence >= 0.82 → aceptar como match fuerte
0.55–0.81 → mostrar top 3 y pedir confirmación
< 0.55 → “No estoy segura” + buscar manual/subir otra foto
```

## 11.5 Assets de visión

```txt
public/vision/
  rider-waite-smith-v1/
    manifest.json
    templates/
      the_moon.webp
      three_of_swords.webp
    descriptors/
      the_moon.orb.json
      three_of_swords.orb.json
    hashes/
      hashes.json
```

Manifest:

```ts
export type VisionDeckManifest = {
  deckId: string;
  deckName: string;
  version: string;
  cardAspectRatio: number;

  cards: Array<{
    cardId: string;
    template: string;
    descriptor?: string;
    hash: string;
  }>;
};
```

## 11.6 Roadmap Foto

```txt
V1.0
- Subir foto o captura manual
- Carta única
- Top 3 candidatos
- Corrección manual

V1.1
- Cámara en vivo
- Detección de 1 carta
- Overlay de borde

V1.2
- Detección de 1 a 3 cartas
- Ver juntas
- Orientación derecha/invertida simple

V1.3
- Perfil de mazo personalizado
- Calibración con fotos propias
```

---

# 12. Tirada actual sin AI

Como no hay AI generativa en MVP, la tirada actual se resuelve por reglas.

```ts
export type SpreadCard = {
  cardId: CardId;
  orientation: "upright" | "reversed";
};

export type SpreadSummary = {
  headline: string;
  repeatedThemes: string[];
  cardLines: Array<{
    cardId: CardId;
    text: string;
  }>;
  advice: string;
};
```

Reglas simples:

```txt
1 carta:
- Mostrar oneLine de orientación seleccionada.

2 cartas:
- Mostrar ambas líneas.
- Detectar keywords repetidas.
- Consejo: combinar advice_1 + advice_2.

3 cartas:
- Mostrar pasado/presente/consejo si el usuario quiere.
- O mostrar “tema principal” por keywords repetidas.
```

Ejemplo de composición:

```ts
function summarizeSpread(cards: SpreadCard[], details: CardDetail[]) {
  const keywords = collectKeywords(cards, details);
  const repeatedThemes = findRepeatedThemes(keywords);

  return {
    headline: buildHeadline(repeatedThemes, details),
    repeatedThemes,
    cardLines: cards.map((card) => ({
      cardId: card.cardId,
      text: getOneLine(card, details),
    })),
    advice: buildAdvice(cards, details),
  };
}
```

No fingir “interpretación profunda”. El copy puede decir:

```txt
Resumen simple
Estas cartas juntas parecen tocar estos temas: confusión, verdad difícil y cuidado.
```

---

# 13. Seguridad y privacidad

Requisitos:

```txt
- No subir fotos.
- No usar APIs externas para reconocimiento.
- No meter analytics invasivo.
- No cargar scripts de terceros innecesarios.
- Self-host de fuentes.
- CSP básica.
- Cámara solo al abrir Foto.
- Cerrar stream al salir de Foto.
```

Al salir de Foto:

```ts
function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}
```

Copy de privacidad:

```txt
Tus fotos se procesan en este dispositivo.
No se suben ni se guardan por defecto.
```

---

# 14. Estados técnicos obligatorios

## App boot

```txt
loading shell
loading summaries
search ready
offline ready
update available
storage error
```

## Search

```txt
empty
typing
results
no results
suggestions
```

## Detail

```txt
summary loaded
detail loading
detail loaded
detail unavailable offline
```

## Foto

```txt
camera unsupported
permission pending
permission denied
camera active
processing
low confidence
detected
manual correction
```

## Offline

```txt
offline but search ready
offline missing detail
offline missing image
offline photo unavailable until module cached
```

---

# 15. Accesibilidad técnica

Requisitos mínimos:

```txt
- Tap targets >= 44px
- Textos importantes >= 16px
- Contraste AA como mínimo
- Focus visible
- Inputs con labels reales
- Botones con aria-label cuando sean icon-only
- No depender solo de color para confianza o estado
- Soporte prefers-reduced-motion
- Skeletons no invasivos
```

Detalle importante para iPhone: el input de búsqueda debería usar `font-size: 16px` o más para evitar zoom automático.

---

# 16. Versionado

Usar tres versiones distintas:

```ts
export type AppManifest = {
  appVersion: string;
  contentVersion: string;
  searchIndexVersion: string;
  visionVersion: string;
};
```

Ejemplo:

```json
{
  "appVersion": "0.1.0",
  "contentVersion": "cards-es-en-2026-01",
  "searchIndexVersion": "search-2026-01-a",
  "visionVersion": "rws-v1"
}
```

Reglas:

```txt
Cambio de copy → contentVersion
Cambio de aliases/ranking → searchIndexVersion
Cambio de templates/descriptores → visionVersion
Cambio de UI/código → appVersion
```

IDs de cartas nunca deben cambiar. Si cambia `the_moon`, se rompen favoritos, historial y tiradas guardadas.

---

# 17. Testing

## Unit tests

```txt
normalizeText()
romanToNumber()
search ranking
content validation
spread summary rules
favorite/history storage
```

## Search regression tests

Crear fixtures:

```ts
const SEARCH_CASES = [
  ["luna", "the_moon"],
  ["moon", "the_moon"],
  ["the moon", "the_moon"],
  ["18", "the_moon"],
  ["xviii", "the_moon"],
  ["empratriz", "the_empress"],
  ["emperatris", "the_empress"],
  ["3 espadas", "three_of_swords"],
  ["three swords", "three_of_swords"],
  ["ruptura", "three_of_swords"],
];
```

## E2E

```txt
- Abrir app
- Buscar "luna"
- Ver card principal
- Abrir detalle
- Cambiar derecha/invertida
- Guardar favorito
- Recargar
- Favorito persiste
- Modo offline sigue mostrando búsqueda
```

## Foto QA dataset

Crear carpeta local:

```txt
test-fixtures/photo/
  good-light/
  low-light/
  angled/
  three-cards/
  reversed/
  blurry/
```

Métricas:

```txt
Carta única buena luz: > 80%
Carta única baja luz: > 60%
1–3 cartas MVP: > 65%
Top 3 candidate accuracy: > 90%
```

---

# 18. Definition of Done técnico para MVP

El MVP está técnicamente listo cuando:

```txt
- Hay 78 cartas validadas por script.
- La app abre sin backend.
- La búsqueda funciona offline después de la primera carga.
- "luna", "moon", "18", "xviii", "3 espadas" funcionan.
- Search responde en <100ms en iPhone real.
- Detalle carga lazy.
- Favoritos e historial persisten en IndexedDB.
- PWA instala en iPhone.
- Service worker cachea app shell + datos mínimos.
- No hay OpenCV en bundle inicial.
- Foto tiene fallback a subir foto y buscar manual.
- Cámara se apaga al salir del tab Foto.
- Build falla si falta imagen, alias o significado.
```

---

# 19. Plan de implementación recomendado

## Sprint 0 — Fundación

```txt
- Vite + React + TS
- Router
- Design tokens
- Layout mobile
- PWA manifest
- Service worker básico
- Content schema con Zod
```

## Sprint 1 — Contenido + Search

```txt
- Cargar 78 summaries
- MiniSearch prebuild
- Normalización español/inglés
- Exact lookup + fuzzy ranking
- Search page
- Result card
- Empty/no-results states
```

## Sprint 2 — Detalle + Persistencia

```txt
- Card detail lazy
- Derecha/invertida
- Copiar significado
- Favoritos
- Historial
- Guardadas tab
- Offline básico
```

## Sprint 3 — Cartas + Tirada actual

```txt
- Grilla 78 cartas
- Filtros
- Tirada actual hasta 3 cartas
- Resumen por reglas
```

## Sprint 4 — Foto MVP

```txt
- Photo route lazy
- Cámara con fallback
- Subir foto
- Worker
- Carta única
- Top 3 candidatos
- Corrección manual
```

## Sprint 5 — Foto 1–3 cartas

```txt
- Detección múltiple
- Overlay
- Confianza por carta
- Ver juntas
- Orientación básica
```

---

# 20. Decisiones técnicas finales

Mi recomendación cerrada:

```txt
Nombre producto en UI: Carta Clara
Nombre técnico repo: tarot-fast-search-pwa

Framework: React + Vite + TypeScript
Search: MiniSearch
Storage usuario: IndexedDB con Dexie o idb
PWA: vite-plugin-pwa + Workbox
Vision: OpenCV.js lazy en worker
Contenido: JSON por carta + build pipeline
Deploy: static hosting HTTPS
Backend: ninguno
```

La idea brutalmente importante: **la app no busca datos; ya los tiene preparados**. El navegador solo tiene que hacer lookup, ranking, render y cache. Para Foto, se carga un “módulo pesado” aparte, pero Buscar nunca debe pagar ese costo.

La arquitectura queda así:

```txt
Buscar = instantáneo, liviano, siempre disponible.
Detalle = rico, pero lazy.
Foto = poderoso, pero aislado.
Offline = diseñado desde el inicio.
Datos = versionados, validados y precompilados.
```

Eso sostiene perfecto el concepto del producto: no una web de tarot, sino un **radar de significado**.

[1]: https://vite.dev/guide/ "Getting Started | Vite"
[2]: https://lucaong.github.io/minisearch/ "MiniSearch"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API "IndexedDB API - Web APIs | MDN"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria "Storage quotas and eviction criteria - Web APIs | MDN"
[5]: https://vite-pwa-org.netlify.app/guide/inject-manifest "Advanced (injectManifest) | Guide | Vite PWA"
[6]: https://developer.chrome.com/docs/workbox/modules/workbox-precaching "workbox-precaching  |  Modules  |  Chrome for Developers"
[7]: https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html "OpenCV: OpenCV.js Tutorials"
[8]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MediaDevices: getUserMedia() method - Web APIs | MDN"
[9]: https://docs.opencv.org/3.4/dc/dc3/tutorial_py_matcher.html "OpenCV: Feature Matching"

