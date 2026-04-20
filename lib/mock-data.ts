import type {
  UserProfile,
  PlatformConnection,
  Achievement,
  AggregatedStats,
  ReputationData,
  ActivityEvent,
} from './types'
import { PRIMUS_TEMPLATE_IDS } from './primus-attestation'

export const mockUser: UserProfile = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  role: 'Senior Software Engineer',
  avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alex',
  bio: 'Full-stack developer passionate about open source and building developer tools.',
  location: 'San Francisco, CA',
  joinedAt: '2024-01-15',
}

export const mockConnections: PlatformConnection[] = [
  {
    id: 'conn_cursor',
    platform: 'cursor',
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS.cursor,
  },
  {
    id: 'conn_claude_console',
    platform: 'claude_console',
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS.claude_console,
  },
  {
    id: 'conn_chatgpt',
    platform: 'chatgpt',
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS.chatgpt,
  },
  {
    id: 'conn_claude',
    platform: 'claude',
    status: 'not_connected',
    primusTemplateId: PRIMUS_TEMPLATE_IDS.claude,
  },
]

export const mockAchievements: Achievement[] = [
  {
    id: 'ach_1',
    title: 'Cursor Power User',
    description: 'Verified an active Cursor subscription',
    icon: 'mouse-pointer-2',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    requirement: 'Connect and verify your Cursor account',
    source: 'cursor',
  },
  {
    id: 'ach_2',
    title: 'Claude Console Pro',
    description: 'Verified access to Anthropic Claude Console',
    icon: 'terminal',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    requirement: 'Connect and verify your Claude Console account',
    source: 'claude_console',
  },
  {
    id: 'ach_3',
    title: 'ChatGPT Plus',
    description: 'Verified an active ChatGPT Plus subscription',
    icon: 'message-circle',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    requirement: 'Connect and verify your ChatGPT account',
    source: 'chatgpt',
  },
  {
    id: 'ach_4',
    title: 'Claude Verified',
    description: 'Verified an active Claude.ai account',
    icon: 'sparkles',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    requirement: 'Connect and verify your Claude account',
    source: 'claude',
  },
  {
    id: 'ach_5',
    title: 'Full AI Stack',
    description: 'Verified all four AI tool accounts',
    icon: 'shield-check',
    status: 'locked',
    progress: 0,
    maxProgress: 4,
    requirement: 'Verify Cursor, Claude Console, ChatGPT, and Claude',
    source: 'multi',
  },
  {
    id: 'ach_6',
    title: 'Early Adopter',
    description: 'One of the first to verify their AI tool stack',
    icon: 'star',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    requirement: 'Verify at least one AI tool during the beta period',
    source: 'multi',
  },
]

export const mockStats: AggregatedStats = {
  totalRepos: 156,
  totalFollowers: 8267,
  totalConnections: 5420,
  yearsExperience: 8,
  contributionsThisYear: 1234,
  skills: ['TypeScript', 'React', 'Node.js', 'Python', 'Go', 'PostgreSQL', 'AWS', 'Docker'],
}

export const mockReputation: ReputationData = {
  overallScore: 78,
  profileCompletion: 25,
  lastUpdated: '2026-04-20T08:00:00Z',
  factors: [
    {
      name: 'AI Tool Verification',
      score: 0,
      maxScore: 100,
      description: 'Based on verified AI tool subscriptions',
    },
    {
      name: 'Stack Completeness',
      score: 0,
      maxScore: 100,
      description: 'Based on the number of tools verified in your stack',
    },
    {
      name: 'Verification Freshness',
      score: 0,
      maxScore: 100,
      description: 'Based on how recently each tool was re-verified',
    },
    {
      name: 'Community Trust',
      score: 80,
      maxScore: 100,
      description: 'Based on on-chain attestation proofs',
    },
  ],
}

export const mockActivity: ActivityEvent[] = [
  {
    id: 'act_1',
    type: 'score_update',
    title: 'Dashboard Ready',
    description: 'Connect your AI tools to start building your verified reputation',
    timestamp: new Date().toISOString(),
  },
]
