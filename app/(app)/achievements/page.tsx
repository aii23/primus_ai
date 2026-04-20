'use client'

import { useState } from 'react'
import { Trophy, CheckCircle2, Clock, Lock } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AchievementCard } from '@/components/achievement-card'
import { mockAchievements } from '@/lib/mock-data'

type FilterType = 'all' | 'available' | 'claimed' | 'locked'

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredAchievements = mockAchievements.filter((achievement) => {
    if (filter === 'all') return true
    return achievement.status === filter
  })

  const counts = {
    all: mockAchievements.length,
    available: mockAchievements.filter(a => a.status === 'available').length,
    claimed: mockAchievements.filter(a => a.status === 'claimed').length,
    locked: mockAchievements.filter(a => a.status === 'locked').length,
  }

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
          {filteredAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
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
