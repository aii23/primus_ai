import { GitBranch, Users, Briefcase, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AggregatedStats } from '@/lib/types'

interface StatsGridProps {
  stats: AggregatedStats
}

const statItems = [
  {
    key: 'totalRepos' as const,
    label: 'Repositories',
    icon: GitBranch,
  },
  {
    key: 'totalFollowers' as const,
    label: 'Total Followers',
    icon: Users,
  },
  {
    key: 'yearsExperience' as const,
    label: 'Years Experience',
    icon: Briefcase,
    suffix: ' yrs',
  },
  {
    key: 'contributionsThisYear' as const,
    label: 'Contributions',
    icon: Activity,
  },
]

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon
        const value = stats[item.key]
        return (
          <Card key={item.key}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                  {item.suffix || ''}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
