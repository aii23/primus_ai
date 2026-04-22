import { NextRequest, NextResponse } from 'next/server'
import { generateNonce } from 'siwe'
import { nonceStore } from '@/lib/nonce-store'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Valid Ethereum address required' },
      { status: 400 }
    )
  }

  const nonce = generateNonce()
  nonceStore.set(address, nonce)

  return NextResponse.json({ nonce })
}
