'use client'

import { trpc } from '@/lib/trpc/react'
import { IntegrationCard } from '@/components/integration-card'
import { PRIMUS_TEMPLATE_IDS } from '@/lib/primus-attestation'
import { parseVerifiedSummary } from '@/lib/platform-verified-summary'
import type { PlatformConnection, AIPlatform, ConnectionStatus } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

const ALL_PLATFORMS: AIPlatform[] = ['cursor', 'claude_console', 'chatgpt', 'claude']

function defaultConnection(platform: AIPlatform): PlatformConnection {
  return {
    id: `default_${platform}`,
    platform,
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS[platform],
  }
}

export default function ConnectionsPage() {
  const { data: dbRows, isLoading } = trpc.connections.list.useQuery(undefined, {
    retry: false,
  })

  const connections: PlatformConnection[] = ALL_PLATFORMS.map((platform) => {
    const row = dbRows?.find((c) => c.platform === platform)
    if (!row) return defaultConnection(platform)

    return {
      id: row.id,
      platform: row.platform as AIPlatform,
      status: row.status as ConnectionStatus,
      username: row.username ?? undefined,
      lastVerified: row.lastVerified?.toISOString(),
      connectedAt: row.connectedAt?.toISOString(),
      primusTemplateId: row.primusTemplateId ?? PRIMUS_TEMPLATE_IDS[platform],
      verifiedSummary: parseVerifiedSummary(row.verifiedSummary) ?? undefined,
      attestationData: row.attestationData ?? undefined,
    }
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect and verify your accounts across platforms to build your reputation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? ALL_PLATFORMS.map((p) => (
              <Skeleton key={p} className="h-48 w-full rounded-lg" />
            ))
          : connections.map((connection) => (
              <IntegrationCard key={connection.platform} connection={connection} />
            ))}
      </div>

      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          More integrations coming soon: Stack Overflow, Discord, GitLab, and more.
        </p>
      </div>
    </div>
  )
}
