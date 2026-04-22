'use client'

import { SessionProvider } from 'next-auth/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi'
import { useState } from 'react'

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // QueryClient is created inside the component so each request has its own
  // cache in SSR and the client is not shared across users.
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
