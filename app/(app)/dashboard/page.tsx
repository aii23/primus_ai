'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, Trophy } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TrustScoreDisplay } from '@/components/trust-score-display'
import { PlatformStatus } from '@/components/platform-status'
import { ActivityFeed } from '@/components/activity-feed'
import { trpc } from '@/lib/trpc/react'
import { PRIMUS_TEMPLATE_IDS } from '@/lib/primus-attestation'
import { parseVerifiedSummary } from '@/lib/platform-verified-summary'
import type { PlatformConnection, AIPlatform, ConnectionStatus, ReputationData, TrustScoreFactor } from '@/lib/types'
import { mockActivity } from '@/lib/mock-data'

const ALL_PLATFORMS: AIPlatform[] = ['cursor', 'claude_console', 'chatgpt', 'claude']

const PLATFORM_LABEL: Record<AIPlatform, string> = {
  cursor: 'Cursor',
  claude_console: 'Claude Console',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
}

function defaultConnection(platform: AIPlatform): PlatformConnection {
  return {
    id: `default_${platform}`,
    platform,
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS[platform],
  }
}

function shortAddress(address: string) {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function reputationFromDb(row: {
  overallScore: number
  profileCompletion: number
  factors: unknown
  lastUpdated: Date
} | null): ReputationData {
  if (!row) {
    return {
      overallScore: 0,
      profileCompletion: 0,
      lastUpdated: new Date().toISOString(),
      factors: [],
    }
  }
  const raw = row.factors
  const factors = Array.isArray(raw)
    ? (raw.filter(
        (f): f is TrustScoreFactor =>
          f !== null &&
          typeof f === 'object' &&
          'name' in f &&
          'score' in f &&
          'maxScore' in f &&
          'description' in f,
      ) as TrustScoreFactor[])
    : []

  return {
    overallScore: row.overallScore,
    profileCompletion: row.profileCompletion,
    lastUpdated: row.lastUpdated.toISOString(),
    factors,
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const address = session?.address ?? ''

  const { data: dbRows, isLoading: connectionsLoading } = trpc.connections.list.useQuery(undefined, {
    retry: false,
  })

  const { data: achievements = [], isLoading: achievementsLoading } = trpc.achievements.listMine.useQuery()

  const { data: reputationRow, isLoading: statsLoading } = trpc.stats.get.useQuery(undefined, {
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

  const claimedAchievements = achievements.filter((a) => a.status === 'claimed')
  const availableAchievements = achievements.filter((a) => a.status === 'available')
  const reputation = reputationFromDb(reputationRow ?? null)

  const verifiedPlatforms = connections
    .filter((c) => c.status === 'verified')
    .map((c) => PLATFORM_LABEL[c.platform])

  const displayName = address ? shortAddress(address) : 'there'
  const avatarSeed = address || 'guest'
  const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}`

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{address ? address.slice(2, 4).toUpperCase() : '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {displayName}</h1>
            <p className="text-muted-foreground">Wallet-connected developer profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            Score: {statsLoading ? '…' : `${reputation.overallScore}/100`}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {achievementsLoading ? '…' : `${claimedAchievements.length}`} Achievements
          </Badge>
        </div>
      </div>

      {/* Platform status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Platform Status</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/connections">
              Manage <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        {connectionsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ALL_PLATFORMS.map((p) => (
              <Skeleton key={p} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <PlatformStatus connections={connections} />
        )}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trust Score */}
        <div className="lg:col-span-1">
          {statsLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : (
            <TrustScoreDisplay reputation={reputation} />
          )}
        </div>

        {/* Activity & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  {achievementsLoading
                    ? 'Loading…'
                    : `${claimedAchievements.length} claimed, ${availableAchievements.length} available`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/achievements">
                  View All <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="size-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {availableAchievements.slice(0, 3).map((achievement) => {
                    const max = achievement.maxProgress || 1
                    const pct = Math.min(100, Math.round((achievement.progress / max) * 100))
                    return (
                      <div key={achievement.id} className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Trophy className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{achievement.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {availableAchievements.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No available achievements right now.{' '}
                      <Link href="/achievements" className="text-primary underline-offset-4 hover:underline">
                        View all
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <ActivityFeed events={mockActivity} />
        </div>
      </div>

      {/* Verified stack from connections */}
      <Card>
        <CardHeader>
          <CardTitle>Verified stack</CardTitle>
          <CardDescription>Platforms with a verified connection</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionsLoading ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          ) : verifiedPlatforms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {verifiedPlatforms.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Verify a connection on the{' '}
              <Link href="/connections" className="text-primary underline-offset-4 hover:underline">
                Connections
              </Link>{' '}
              page to show platforms here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
