const NONCE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface NonceEntry {
  nonce: string
  expiresAt: number
}

// In-memory store keyed by lowercased address.
// Sufficient for single-process dev/staging; swap for Redis in production.
const store = new Map<string, NonceEntry>()

export const nonceStore = {
  set(address: string, nonce: string) {
    store.set(address.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + NONCE_TTL_MS,
    })
  },

  get(address: string): string | undefined {
    const entry = store.get(address.toLowerCase())
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      store.delete(address.toLowerCase())
      return undefined
    }
    return entry.nonce
  },

  delete(address: string) {
    store.delete(address.toLowerCase())
  },
}
