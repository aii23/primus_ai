'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReputationData } from '@/lib/types'

interface TrustScoreDisplayProps {
  reputation: ReputationData
}

export function TrustScoreDisplay({ reputation }: TrustScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-primary'
    if (score >= 40) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trust Score</CardTitle>
        <CardDescription>Your overall reputation across all platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main score display */}
        <div className="flex items-center justify-center">
          <div className="relative flex size-32 items-center justify-center">
            <svg className="absolute size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${reputation.overallScore * 2.83} 283`}
                className={getScoreColor(reputation.overallScore)}
              />
            </svg>
            <div className="text-center">
              <span className={`text-3xl font-bold ${getScoreColor(reputation.overallScore)}`}>
                {reputation.overallScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* Score factors */}
        <div className="space-y-4">
          {reputation.factors.map((factor) => (
            <div key={factor.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{factor.name}</span>
                <span className="text-muted-foreground">
                  {factor.score}/{factor.maxScore}
                </span>
              </div>
              <Progress value={(factor.score / factor.maxScore) * 100} className="h-2" />
            </div>
          ))}
        </div>

        {/* Profile completion */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Profile Completion</span>
            <span className="font-medium">{reputation.profileCompletion}%</span>
          </div>
          <Progress value={reputation.profileCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Complete more verifications to increase your trust score
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
