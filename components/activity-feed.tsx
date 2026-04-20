import {
  Link2,
  ShieldCheck,
  Trophy,
  TrendingUp,
  MousePointer2,
  Terminal,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActivityEvent } from '@/lib/types'

interface ActivityFeedProps {
  events: ActivityEvent[]
}

const typeIcons = {
  connection:   Link2,
  verification: ShieldCheck,
  achievement:  Trophy,
  score_update: TrendingUp,
}

const platformIcons = {
  cursor:        MousePointer2,
  claude_console: Terminal,
  chatgpt:       MessageCircle,
  claude:        Sparkles,
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest reputation updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => {
            const TypeIcon = typeIcons[event.type]
            const PlatformIcon = event.platform ? platformIcons[event.platform] : null

            return (
              <div key={event.id} className="flex gap-4">
                <div className="relative">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <TypeIcon className="size-4 text-muted-foreground" />
                  </div>
                  {index < events.length - 1 && (
                    <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{event.title}</p>
                    {PlatformIcon && (
                      <PlatformIcon className="size-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
