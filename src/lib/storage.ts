export type StoredFavorite = {
  cardId: string
  createdAt: number
}

export type StoredRecent = {
  cardId: string
  viewedAt: number
  source: 'search' | 'photo' | 'grid' | 'saved' | 'related'
}

const DB_NAME = 'carta-clara'
const DB_VERSION = 1
const FAVORITES_STORE = 'favorites'
const RECENTS_STORE = 'recents'
const FAVORITES_FALLBACK = 'carta-clara:favorites'
const RECENTS_FALLBACK = 'carta-clara:recents'

let dbPromise: Promise<IDBDatabase> | null = null

export async function readFavorites() {
  return readStore<StoredFavorite>(FAVORITES_STORE, FAVORITES_FALLBACK).then((items) =>
    items.sort((a, b) => b.createdAt - a.createdAt),
  )
}

export async function readRecents() {
  return readStore<StoredRecent>(RECENTS_STORE, RECENTS_FALLBACK).then((items) =>
    items.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 20),
  )
}

export async function saveFavorite(cardId: string) {
  const favorite = { cardId, createdAt: Date.now() }
  await writeItem(FAVORITES_STORE, FAVORITES_FALLBACK, favorite)
  return favorite
}

export async function removeFavorite(cardId: string) {
  await deleteItem(FAVORITES_STORE, FAVORITES_FALLBACK, cardId)
}

export async function saveRecent(cardId: string, source: StoredRecent['source']) {
  const recent = { cardId, viewedAt: Date.now(), source }
  await writeItem(RECENTS_STORE, RECENTS_FALLBACK, recent)
  return recent
}

async function openDb() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
        db.createObjectStore(FAVORITES_STORE, { keyPath: 'cardId' })
      }
      if (!db.objectStoreNames.contains(RECENTS_STORE)) {
        db.createObjectStore(RECENTS_STORE, { keyPath: 'cardId' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open IndexedDB'))
  })

  return dbPromise
}

async function readStore<T>(storeName: string, fallbackKey: string): Promise<T[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    return await requestToPromise<T[]>(store.getAll())
  } catch (error) {
    console.warn('Falling back to localStorage read', error)
    return readFallback<T>(fallbackKey)
  }
}

async function writeItem<T extends { cardId: string }>(storeName: string, fallbackKey: string, item: T) {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    await requestToPromise(store.put(item))
  } catch (error) {
    console.warn('Falling back to localStorage write', error)
    const items = readFallback<T>(fallbackKey).filter((entry) => entry.cardId !== item.cardId)
    writeFallback(fallbackKey, [item, ...items])
  }
}

async function deleteItem(storeName: string, fallbackKey: string, cardId: string) {
  try {
    const db = await openDb()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    await requestToPromise(store.delete(cardId))
  } catch (error) {
    console.warn('Falling back to localStorage delete', error)
  }

  const fallbackItems = readFallback<{ cardId: string }>(fallbackKey).filter((entry) => entry.cardId !== cardId)
  writeFallback(fallbackKey, fallbackItems)
}

function requestToPromise<T = unknown>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function readFallback<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch (error) {
    console.warn('Could not read fallback storage', error)
    return []
  }
}

function writeFallback<T>(key: string, value: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Could not write fallback storage', error)
  }
}
