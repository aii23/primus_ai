'use client'

import { useState } from 'react'
import {
  Star,
  MousePointer2,
  Terminal,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Achievement, AchievementStatus } from '@/lib/types'

const iconMap: Record<string, typeof Star> = {
  'mouse-pointer-2': MousePointer2,
  terminal:         Terminal,
  'message-circle': MessageCircle,
  sparkles:         Sparkles,
  'shield-check':   ShieldCheck,
  star:             Star,
}

const sourceIcons = {
  cursor:        MousePointer2,
  claude_console: Terminal,
  chatgpt:       MessageCircle,
  claude:        Sparkles,
  multi:         ShieldCheck,
}

const sourceLabels: Record<string, string> = {
  cursor:        'Cursor',
  claude_console: 'Claude Console',
  chatgpt:       'ChatGPT',
  claude:        'Claude',
  multi:         'Multi-platform',
}

const statusConfig: Record<AchievementStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  locked:   { label: 'Locked',       variant: 'outline' },
  available: { label: 'Available',   variant: 'secondary' },
  claiming:  { label: 'Claiming...', variant: 'secondary' },
  claimed:   { label: 'Claimed',     variant: 'default' },
}

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const [status, setStatus] = useState<AchievementStatus>(achievement.status)

  const Icon = iconMap[achievement.icon] ?? Star
  const SourceIcon = sourceIcons[achievement.source]
  const statusInfo = statusConfig[status]
  const progress = Math.min((achievement.progress / achievement.maxProgress) * 100, 100)
  const isComplete = progress >= 100

  const handleClaim = async () => {
    setStatus('claiming')
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStatus('claimed')
    toast.success(`Achievement "${achievement.title}" claimed!`)
  }

  return (
    <Card className={`relative overflow-hidden transition-all ${status === 'locked' ? 'opacity-60' : ''}`}>
      {status === 'claimed' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex size-12 items-center justify-center rounded-xl ${
            status === 'claimed'
              ? 'bg-primary text-primary-foreground'
              : status === 'locked'
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary'
          }`}>
            {status === 'locked' ? <Lock className="size-5" /> : <Icon className="size-5" />}
          </div>
          <Badge variant={statusInfo.variant} className="shrink-0">
            {status === 'claimed'  && <CheckCircle2 className="mr-1 size-3" />}
            {status === 'claiming' && <Loader2 className="mr-1 size-3 animate-spin" />}
            {status === 'locked'   && <Lock className="mr-1 size-3" />}
            {statusInfo.label}
          </Badge>
        </div>
        <div className="pt-3">
          <CardTitle className="text-base">{achievement.title}</CardTitle>
          <CardDescription className="text-xs mt-1">{achievement.description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">
              {achievement.progress.toLocaleString()}/{achievement.maxProgress.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <p className="text-xs text-muted-foreground">{achievement.requirement}</p>

        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <SourceIcon className="size-3" />
            {sourceLabels[achievement.source] ?? achievement.source}
          </Badge>

          {status === 'available' && isComplete && (
            <Button size="sm" onClick={handleClaim}>
              Claim
            </Button>
          )}
          {status === 'available' && !isComplete && (
            <span className="text-xs text-muted-foreground">{Math.round(progress)}% complete</span>
          )}
          {status === 'claimed' && achievement.claimedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(achievement.claimedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {status === 'locked' && (
            <span className="text-xs text-muted-foreground">Verify tool to unlock</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
