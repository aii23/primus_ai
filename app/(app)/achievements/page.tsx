'use client'

import { useEffect } from 'react'
import { useState } from 'react'
import { Trophy, CheckCircle2, Clock, Lock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AchievementCard } from '@/components/achievement-card'
import { trpc } from '@/lib/trpc/react'
import type { AchievementStatus } from '@/lib/types'

type FilterType = 'all' | 'available' | 'claimed' | 'locked'

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const utils = trpc.useUtils()

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: achievements = [], isLoading } = trpc.achievements.listMine.useQuery()

  const checkMutation = trpc.achievements.checkAndUpdate.useMutation({
    onSuccess: () => utils.achievements.listMine.invalidate(),
    onError: () => {
      // Silently ignore — user may not be authenticated yet
    },
  })

  const claimMutation = trpc.achievements.claim.useMutation({
    onSuccess: () => utils.achievements.listMine.invalidate(),
    onError: (err) => toast.error(err.message ?? 'Failed to claim achievement.'),
  })

  // Check conditions once on mount
  useEffect(() => {
    checkMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Derived state ─────────────────────────────────────────────────────────
  const filtered = achievements.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const counts = {
    all: achievements.length,
    available: achievements.filter((a) => a.status === 'available').length,
    claimed: achievements.filter((a) => a.status === 'claimed').length,
    locked: achievements.filter((a) => a.status === 'locked').length,
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClaim = async (achievementId: string) => {
    await claimMutation.mutateAsync({ achievementId })
  }

  const handleRefresh = () => {
    checkMutation.mutate()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">
            Unlock and claim achievements to showcase your verified reputation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5">
            <Trophy className="size-3" />
            {counts.claimed}/{counts.all} Claimed
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={checkMutation.isPending}
          >
            <RefreshCw className={`size-3 mr-1.5 ${checkMutation.isPending ? 'animate-spin' : ''}`} />
            Check conditions
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="size-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{counts.all}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="size-4" />
            <span className="text-sm">Claimed</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{counts.claimed}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-warning">
            <Clock className="size-4" />
            <span className="text-sm">Available</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{counts.available}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4" />
            <span className="text-sm">Locked</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{counts.locked}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="available">Available ({counts.available})</TabsTrigger>
          <TabsTrigger value="claimed">Claimed ({counts.claimed})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({counts.locked})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card h-52 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={{
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    status: achievement.status as AchievementStatus,
                    progress: achievement.progress,
                    maxProgress: achievement.maxProgress,
                    requirement: achievement.requirement,
                    source: achievement.source as 'cursor' | 'claude_console' | 'chatgpt' | 'claude' | 'multi',
                    unlockedAt: achievement.unlockedAt?.toISOString(),
                    claimedAt: achievement.claimedAt?.toISOString(),
                  }}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <Trophy className="size-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No {filter} achievements found.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
