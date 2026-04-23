import Link from 'next/link'
import { MousePointer2, Terminal, MessageCircle, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlatformConnection, ConnectionStatus } from '@/lib/types'

interface PlatformStatusProps {
  connections: PlatformConnection[]
}

const platformConfig = {
  cursor:        { name: 'Cursor',         icon: MousePointer2, color: 'text-violet-500' },
  claude_console: { name: 'Claude Console', icon: Terminal,      color: 'text-orange-500' },
  chatgpt:       { name: 'ChatGPT',         icon: MessageCircle, color: 'text-emerald-500' },
  claude:        { name: 'Claude',          icon: Sparkles,      color: 'text-amber-500' },
}

const statusConfig: Record<ConnectionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  not_connected: { icon: AlertCircle,  color: 'text-muted-foreground', label: 'Not Connected' },
  connecting:    { icon: Clock,        color: 'text-warning',          label: 'Connecting' },
  connected:     { icon: Clock,        color: 'text-warning',          label: 'Pending Verification' },
  verifying:     { icon: Clock,        color: 'text-warning',          label: 'Verifying' },
  verified:      { icon: CheckCircle2, color: 'text-success',          label: 'Verified' },
  failed:        { icon: AlertCircle,  color: 'text-destructive',      label: 'Failed' },
}

export function PlatformStatus({ connections }: PlatformStatusProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {connections.map((connection) => {
        const platform = platformConfig[connection.platform]
        const status = statusConfig[connection.status]
        const Icon = platform.icon
        const StatusIcon = status.icon

        return (
          <Link key={connection.id} href="/connections" className="min-w-0">
            <Card className="min-w-0 overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer">
              <CardContent className="flex min-w-0 items-center gap-2 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted ${platform.color}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{platform.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {connection.username ? `@${connection.username}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  title={status.label}
                  className={`min-w-0 max-w-[45%] gap-1 overflow-hidden ${status.color}`}
                >
                  <StatusIcon className="size-3 shrink-0" />
                  <span className="hidden min-w-0 truncate text-left sm:inline-block sm:max-w-[5.5rem] md:max-w-[7rem]">
                    {status.label}
                  </span>
                </Badge>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
