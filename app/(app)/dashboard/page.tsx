import Link from 'next/link'
import { ArrowRight, Trophy } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TrustScoreDisplay } from '@/components/trust-score-display'
import { StatsGrid } from '@/components/stats-grid'
import { PlatformStatus } from '@/components/platform-status'
import { ActivityFeed } from '@/components/activity-feed'
import {
  mockUser,
  mockConnections,
  mockStats,
  mockReputation,
  mockActivity,
  mockAchievements,
} from '@/lib/mock-data'

export default function DashboardPage() {
  const claimedAchievements = mockAchievements.filter(a => a.status === 'claimed')
  const availableAchievements = mockAchievements.filter(a => a.status === 'available')

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
            <AvatarFallback>
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {mockUser.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">{mockUser.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            Score: {mockReputation.overallScore}/100
          </Badge>
          <Badge variant="outline" className="text-sm">
            {claimedAchievements.length} Achievements
          </Badge>
        </div>
      </div>

      {/* Stats overview */}
      <StatsGrid stats={mockStats} />

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
        <PlatformStatus connections={mockConnections} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trust Score */}
        <div className="lg:col-span-1">
          <TrustScoreDisplay reputation={mockReputation} />
        </div>

        {/* Activity & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  {claimedAchievements.length} claimed, {availableAchievements.length} available
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/achievements">
                  View All <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Trophy className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{achievement.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">
                          {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity feed */}
          <ActivityFeed events={mockActivity} />
        </div>
      </div>

      {/* Skills section */}
      <Card>
        <CardHeader>
          <CardTitle>Verified Skills</CardTitle>
          <CardDescription>Skills extracted from your connected platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockStats.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
