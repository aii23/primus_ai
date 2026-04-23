import { prisma } from "../lib/prisma";

// ─── Condition shapes ─────────────────────────────────────────────────────────
// Mirrors lib/achievement-conditions.ts — kept inline so the seed file avoids
// importing app types while still using the same Prisma client (driver adapter).

type FieldNonempty = {
  type: "platform_field_nonempty";
  platform: string;
  field: string;
};
type FieldGt = {
  type: "platform_field_gt";
  platform: string;
  field: string;
  value: number;
};
type PlatformVerif = { type: "platform_verified"; platform: string };
type MinPlatforms = { type: "min_platforms_verified"; count: number };
type AchievementCondition =
  | FieldNonempty
  | FieldGt
  | PlatformVerif
  | MinPlatforms;

interface AchievementSeed {
  id: string;
  title: string;
  description: string;
  icon: string;
  maxProgress: number;
  requirement: string;
  source: string;
  condition: AchievementCondition;
}

const achievementDefinitions: AchievementSeed[] = [
  {
    id: "ach_cursor_power_user",
    title: "Cursor Power User",
    description: "Verified an active Cursor subscription",
    icon: "mouse-pointer-2",
    maxProgress: 1,
    requirement: "Connect and verify your Cursor account",
    source: "cursor",
    // Unlocks when the Cursor connection has non-empty membershipType in verifiedSummary
    // (e.g. "Pro" | "Business" | "Enterprise")
    condition: {
      type: "platform_field_nonempty",
      platform: "cursor",
      field: "membershipType",
    },
  },
  {
    id: "ach_claude_console_pro",
    title: "Claude Console Pro",
    description: "Verified access to Anthropic Claude Console",
    icon: "terminal",
    maxProgress: 1,
    requirement: "Connect and verify your Claude Console account",
    source: "claude_console",
    // Unlocks when the claude_console connection reaches "verified" status
    condition: { type: "platform_verified", platform: "claude_console" },
  },
  {
    id: "ach_chatgpt_plus",
    title: "ChatGPT Plus",
    description: "Verified an active ChatGPT Plus subscription",
    icon: "message-circle",
    maxProgress: 1,
    requirement: "Connect and verify your ChatGPT account",
    source: "chatgpt",
    // Unlocks when the ChatGPT connection has non-empty planType in verifiedSummary
    // (e.g. "Plus" | "Team" | "Enterprise")
    condition: {
      type: "platform_field_nonempty",
      platform: "chatgpt",
      field: "planType",
    },
  },
  {
    id: "ach_claude_verified",
    title: "Claude Verified",
    description: "Verified an active Claude.ai account",
    icon: "sparkles",
    maxProgress: 1,
    requirement: "Connect and verify your Claude account",
    source: "claude",
    // Unlocks when the claude connection reaches "verified" status
    condition: { type: "platform_verified", platform: "claude" },
  },
  {
    id: "ach_full_ai_stack",
    title: "Full AI Stack",
    description: "Verified all four AI tool accounts",
    icon: "shield-check",
    maxProgress: 4,
    requirement: "Verify Cursor, Claude Console, ChatGPT, and Claude",
    source: "multi",
    // Progress tracks how many platforms are verified; unlocks at 4
    condition: { type: "min_platforms_verified", count: 4 },
  },
  {
    id: "ach_early_adopter",
    title: "Early Adopter",
    description: "One of the first to verify their AI tool stack",
    icon: "star",
    maxProgress: 1,
    requirement: "Verify at least one AI tool during the beta period",
    source: "multi",
    // Unlocks as soon as a single platform is verified
    condition: { type: "min_platforms_verified", count: 1 },
  },
];

async function main() {
  console.log("Seeding achievement definitions…");

  for (const def of achievementDefinitions) {
    await prisma.achievementDefinition.upsert({
      where: { id: def.id },
      create: def,
      update: {
        title: def.title,
        description: def.description,
        icon: def.icon,
        maxProgress: def.maxProgress,
        requirement: def.requirement,
        source: def.source,
        condition: JSON.stringify(def.condition),
      },
    });
    console.log(`  ✓ ${def.id}`);
  }

  console.log(
    `Done — seeded ${achievementDefinitions.length} achievement definitions.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
