import { prisma } from '@/lib/prisma'

const NONCE_TTL_MS = 5 * 60 * 1000

function normalizeAddress(address: string) {
  return address.toLowerCase()
}

export async function setAuthNonce(address: string, nonce: string) {
  const addr = normalizeAddress(address)
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS)
  await prisma.authNonce.upsert({
    where: { address: addr },
    create: { address: addr, nonce, expiresAt },
    update: { nonce, expiresAt },
  })
}

/** Returns the stored nonce if present and not expired; otherwise null. */
export async function getAuthNonce(address: string): Promise<string | null> {
  const addr = normalizeAddress(address)
  const row = await prisma.authNonce.findUnique({ where: { address: addr } })
  if (!row) return null
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.authNonce.delete({ where: { address: addr } }).catch(() => {})
    return null
  }
  return row.nonce
}

export async function deleteAuthNonce(address: string) {
  const addr = normalizeAddress(address)
  await prisma.authNonce.delete({ where: { address: addr } }).catch(() => {})
}
