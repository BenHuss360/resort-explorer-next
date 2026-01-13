'use client'

const DB_NAME = 'resort-explorer'
const DB_VERSION = 1
const HOTSPOTS_STORE = 'hotspots'
const PROJECT_STORE = 'project'

interface CachedData<T> {
  data: T
  timestamp: number
  projectId: number
}

class CacheManager {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  private openDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db)
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create hotspots store
        if (!db.objectStoreNames.contains(HOTSPOTS_STORE)) {
          const hotspotsStore = db.createObjectStore(HOTSPOTS_STORE, { keyPath: 'projectId' })
          hotspotsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Create project store
        if (!db.objectStoreNames.contains(PROJECT_STORE)) {
          const projectStore = db.createObjectStore(PROJECT_STORE, { keyPath: 'projectId' })
          projectStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })

    return this.dbPromise
  }

  async cacheHotspots<T>(projectId: number, hotspots: T[]): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(HOTSPOTS_STORE, 'readwrite')
      const store = transaction.objectStore(HOTSPOTS_STORE)

      const cachedData: CachedData<T[]> = {
        data: hotspots,
        timestamp: Date.now(),
        projectId,
      }

      return new Promise((resolve, reject) => {
        const request = store.put(cachedData)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to cache hotspots:', error)
    }
  }

  async getCachedHotspots<T>(projectId: number): Promise<{ data: T[]; timestamp: number } | null> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(HOTSPOTS_STORE, 'readonly')
      const store = transaction.objectStore(HOTSPOTS_STORE)

      return new Promise((resolve, reject) => {
        const request = store.get(projectId)
        request.onsuccess = () => {
          const result = request.result as CachedData<T[]> | undefined
          if (result) {
            resolve({ data: result.data, timestamp: result.timestamp })
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get cached hotspots:', error)
      return null
    }
  }

  async cacheProject<T>(projectId: number, project: T): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(PROJECT_STORE, 'readwrite')
      const store = transaction.objectStore(PROJECT_STORE)

      const cachedData: CachedData<T> = {
        data: project,
        timestamp: Date.now(),
        projectId,
      }

      return new Promise((resolve, reject) => {
        const request = store.put(cachedData)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to cache project:', error)
    }
  }

  async getCachedProject<T>(projectId: number): Promise<{ data: T; timestamp: number } | null> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(PROJECT_STORE, 'readonly')
      const store = transaction.objectStore(PROJECT_STORE)

      return new Promise((resolve, reject) => {
        const request = store.get(projectId)
        request.onsuccess = () => {
          const result = request.result as CachedData<T> | undefined
          if (result) {
            resolve({ data: result.data, timestamp: result.timestamp })
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get cached project:', error)
      return null
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([HOTSPOTS_STORE, PROJECT_STORE], 'readwrite')

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(HOTSPOTS_STORE).clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(PROJECT_STORE).clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
      ])
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  // Check if data is stale (older than maxAge in milliseconds)
  isStale(timestamp: number, maxAge: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp > maxAge
  }
}

// Singleton instance
export const cacheManager = new CacheManager()
