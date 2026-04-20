export type ConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'verifying' | 'verified' | 'failed'

export type AchievementStatus = 'locked' | 'available' | 'claiming' | 'claimed'

export interface PlatformConnection {
  id: string
  platform: 'github' | 'linkedin' | 'twitter'
  status: ConnectionStatus
  username?: string
  profileUrl?: string
  avatarUrl?: string
  followerCount?: number
  verifiedDataPoints?: string[]
  lastVerified?: string
  connectedAt?: string
}

export interface TrustScoreFactor {
  name: string
  score: number
  maxScore: number
  description: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string
  bio?: string
  location?: string
  joinedAt: string
}

export interface AggregatedStats {
  totalRepos: number
  totalFollowers: number
  totalConnections: number
  yearsExperience: number
  contributionsThisYear: number
  skills: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  status: AchievementStatus
  progress: number
  maxProgress: number
  requirement: string
  source: 'github' | 'linkedin' | 'twitter' | 'multi'
  unlockedAt?: string
  claimedAt?: string
}

export interface ActivityEvent {
  id: string
  type: 'connection' | 'verification' | 'achievement' | 'score_update'
  title: string
  description: string
  timestamp: string
  platform?: 'github' | 'linkedin' | 'twitter'
}

export interface ReputationData {
  overallScore: number
  factors: TrustScoreFactor[]
  profileCompletion: number
  lastUpdated: string
}
