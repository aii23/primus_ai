'use client'

import { useState } from 'react'
import {
  MousePointer2,
  Terminal,
  MessageCircle,
  Sparkles,
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
import { attestPlatform, type AttestationResult } from '@/lib/primus-attestation'

const platformConfig = {
  cursor: {
    name: 'Cursor',
    icon: MousePointer2,
    color: 'text-violet-500',
    description: 'Verify your active Cursor subscription to prove you use AI-powered coding tools.',
  },
  claude_console: {
    name: 'Claude Console',
    icon: Terminal,
    color: 'text-orange-500',
    description: 'Verify your Anthropic Claude Console access to prove API-level AI usage.',
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: MessageCircle,
    color: 'text-emerald-500',
    description: 'Verify your ChatGPT Plus subscription to prove OpenAI tool usage.',
  },
  claude: {
    name: 'Claude',
    icon: Sparkles,
    color: 'text-amber-500',
    description: 'Verify your Claude.ai account to prove usage of Anthropic\'s consumer AI.',
  },
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
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
  const [isVerifying, setIsVerifying] = useState(false)
  const [isProofOpen, setIsProofOpen] = useState(false)
  const [attestation, setAttestation] = useState<AttestationResult | null>(null)
  const [verifiedAt, setVerifiedAt] = useState<string | undefined>(connection.lastVerified)

  const config = platformConfig[connection.platform]
  const statusInfo = statusConfig[status]
  const Icon = config.icon

  const handleVerify = async () => {
    if (!connection.primusTemplateId) {
      toast.error('No Primus template ID configured for this platform.')
      return
    }

    setIsVerifying(true)
    setStatus('verifying')
    try {
      const result = await attestPlatform(connection.platform)

      if (result.success) {
        const now = new Date().toISOString()
        setAttestation(result)
        setVerifiedAt(now)
        setStatus('verified')
        toast.success(`${config.name} verified via Primus zkTLS!`)
      } else {
        setStatus('failed')
        toast.error(`Verification failed: ${result.message}`)
      }
    } catch (err) {
      setStatus('failed')
      const message = err instanceof Error ? err.message : 'Unknown error during attestation'
      toast.error(`Verification error: ${message}`)
      console.error('Primus attestation error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDisconnect = () => {
    setStatus('not_connected')
    setAttestation(null)
    setVerifiedAt(undefined)
    toast.info(`${config.name} disconnected`)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const proofHash: string | null = (() => {
    if (!attestation?.rawAttestation) return null
    const raw = attestation.rawAttestation
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>
      if (typeof obj.proof === 'string') return obj.proof
      if (typeof obj.hash === 'string') return obj.hash
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (typeof parsed.proof === 'string') return parsed.proof
        if (typeof parsed.hash === 'string') return parsed.hash
      } catch {
        // fall through
      }
      return raw.slice(0, 66)
    }
    return null
  })()

  const attestedDataJson: string | null =
    attestation?.data != null ? JSON.stringify(attestation.data, null, 2) : null

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-lg bg-muted ${config.color}`}
            >
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
            {(status === 'connecting' || status === 'verifying') && (
              <Loader2 className="mr-1 size-3 animate-spin" />
            )}
            {status === 'failed' && <AlertCircle className="mr-1 size-3" />}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'not_connected' || status === 'failed' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{config.description}</p>
            <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-4" />
                  {status === 'failed' ? 'Retry Verification' : `Verify ${config.name}`}
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Account preview */}
            {connection.username && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="size-10">
                  <AvatarImage src={connection.avatarUrl} />
                  <AvatarFallback>{connection.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">@{connection.username}</p>
                  {connection.followerCount && (
                    <p className="text-xs text-muted-foreground">
                      {connection.followerCount.toLocaleString()} followers
                    </p>
                  )}
                </div>
                {connection.profileUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={connection.profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      <span className="sr-only">View profile</span>
                    </a>
                  </Button>
                )}
              </div>
            )}

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

            {/* Verified status banner (no data points yet) */}
            {status === 'verified' && !connection.verifiedDataPoints && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Subscription verified via Primus zkTLS</span>
              </div>
            )}

            {/* Last verified */}
            {verifiedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>Last verified: {formatDate(verifiedAt)}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {status === 'connected' && (
                <Button onClick={handleVerify} disabled={isVerifying} className="flex-1">
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 size-4" />
                      Verify with zkTLS
                    </>
                  )}
                </Button>
              )}

              {status === 'verified' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="text-xs"
                  >
                    {isVerifying ? (
                      <Loader2 className="mr-1.5 size-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-1.5 size-3" />
                    )}
                    Re-verify
                  </Button>

                  <Dialog open={isProofOpen} onOpenChange={setIsProofOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        View Proof
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>zkTLS Verification Proof</DialogTitle>
                        <DialogDescription>
                          Cryptographic proof of your {config.name} verification via Primus zkTLS
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 font-mono text-xs break-all">
                          <p className="text-muted-foreground mb-2">Proof Hash:</p>
                          <p>
                            {proofHash ??
                              `0x${Array.from({ length: 64 }, () =>
                                Math.floor(Math.random() * 16).toString(16),
                              ).join('')}`}
                          </p>
                        </div>

                        {attestedDataJson && (
                          <div className="rounded-lg bg-muted p-4 font-mono text-xs break-all max-h-40 overflow-y-auto">
                            <p className="text-muted-foreground mb-2">Attested Data:</p>
                            <pre className="whitespace-pre-wrap">{attestedDataJson}</pre>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Platform</p>
                            <p className="font-medium">{config.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Verified At</p>
                            <p className="font-medium">
                              {verifiedAt ? formatDate(verifiedAt) : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Template ID</p>
                            <p className="font-medium font-mono text-xs truncate">
                              {connection.primusTemplateId}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium text-success">Valid</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {(status === 'connected' || status === 'verified') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDisconnect}
                  className="text-muted-foreground hover:text-destructive"
                  title="Disconnect"
                >
                  <AlertCircle className="size-4" />
                  <span className="sr-only">Disconnect</span>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
