'use client'

import { useState } from 'react'
import {
  Github,
  Linkedin,
  Twitter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { PlatformConnection, ConnectionStatus } from '@/lib/types'

const platformConfig = {
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'text-foreground',
    description: 'Connect your GitHub to verify open source contributions and coding activity.',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0A66C2]',
    description: 'Connect your LinkedIn to verify professional experience and network.',
  },
  twitter: {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'text-foreground',
    description: 'Connect your X account to verify social presence and engagement.',
  },
}

const statusConfig: Record<ConnectionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_connected: { label: 'Not Connected', variant: 'outline' },
  connecting: { label: 'Connecting...', variant: 'secondary' },
  connected: { label: 'Connected', variant: 'secondary' },
  verifying: { label: 'Verifying...', variant: 'secondary' },
  verified: { label: 'Verified', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
}

interface IntegrationCardProps {
  connection: PlatformConnection
}

export function IntegrationCard({ connection }: IntegrationCardProps) {
  const [status, setStatus] = useState<ConnectionStatus>(connection.status)
  const [isProofOpen, setIsProofOpen] = useState(false)

  const config = platformConfig[connection.platform]
  const statusInfo = statusConfig[status]
  const Icon = config.icon

  const handleConnect = async () => {
    setStatus('connecting')
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStatus('connected')
    toast.success(`${config.name} connected successfully!`)
  }

  const handleVerify = async () => {
    setStatus('verifying')
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStatus('verified')
    toast.success(`${config.name} verification complete!`)
  }

  const handleDisconnect = () => {
    setStatus('not_connected')
    toast.info(`${config.name} disconnected`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${config.color}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="text-xs">
                {status === 'not_connected' ? 'Not connected' : `@${connection.username}`}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="shrink-0">
            {status === 'verified' && <CheckCircle2 className="mr-1 size-3" />}
            {status === 'connecting' || status === 'verifying' ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : null}
            {status === 'failed' && <AlertCircle className="mr-1 size-3" />}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'not_connected' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{config.description}</p>
            <Button onClick={handleConnect} className="w-full">
              Connect {config.name}
            </Button>
          </div>
        ) : (
          <>
            {/* Connected account preview */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Avatar className="size-10">
                <AvatarImage src={connection.avatarUrl} />
                <AvatarFallback>{connection.username?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">@{connection.username}</p>
                <p className="text-xs text-muted-foreground">
                  {connection.followerCount?.toLocaleString()} followers
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={connection.profileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  <span className="sr-only">View profile</span>
                </a>
              </Button>
            </div>

            {/* Verified data points */}
            {status === 'verified' && connection.verifiedDataPoints && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3 text-success" />
                  <span>Verified Data Points</span>
                </div>
                <ul className="space-y-1.5">
                  {connection.verifiedDataPoints.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-3 text-success shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last verified timestamp */}
            {connection.lastVerified && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>Last verified: {formatDate(connection.lastVerified)}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {status === 'connected' && (
                <Button onClick={handleVerify} className="flex-1">
                  <ShieldCheck className="mr-2 size-4" />
                  Verify Now
                </Button>
              )}
              {status === 'verified' && (
                <Dialog open={isProofOpen} onOpenChange={setIsProofOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      View Proof
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Verification Proof</DialogTitle>
                      <DialogDescription>
                        Cryptographic proof of your {config.name} verification
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4 font-mono text-xs break-all">
                        <p className="text-muted-foreground mb-2">Proof Hash:</p>
                        <p>0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Platform</p>
                          <p className="font-medium">{config.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Verified At</p>
                          <p className="font-medium">{connection.lastVerified && formatDate(connection.lastVerified)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account</p>
                          <p className="font-medium">@{connection.username}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium text-success">Valid</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-destructive"
              >
                <AlertCircle className="size-4" />
                <span className="sr-only">Disconnect</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
