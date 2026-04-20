# Plan

Build a Next.js developer dashboard with EVM wallet authentication (RainbowKit/wagmi), a profile/achievements system, and Primus zkTLS integrations that prove LLM provider spend/usage from OpenAI, Anthropic, and Gemini. UI scaffolded via V0, attestation results stored server-side.

## Scope

- **In:**
  - Next.js project setup with App Router
  - EVM wallet connect (auth only) via RainbowKit + wagmi
  - Developer dashboard page (profile, wallet, LLM usage summary)
  - Achievements page derived from dashboard data
  - Primus zkTLS applications for OpenAI, Anthropic, Gemini (spend/usage attestations)
  - Backend API routes to store and retrieve attestation results
  - Integration of Primus attestation flow into the dashboard UI

- **Out:**
  - On-chain transactions or smart contract interactions
  - Additional LLM providers beyond OpenAI/Anthropic/Gemini
  - Production deployment / CI/CD
  - User-to-user social features

## Action Items

- [ ] **1. Scaffold Next.js project** -- init with App Router, TypeScript, Tailwind CSS, install core deps (rainbowkit, wagmi, viem, @primuslabs/zktls-js-sdk or equivalent)
- [ ] **2. Set up EVM wallet auth** -- configure RainbowKit provider, connect/disconnect flow, persist wallet session, protect dashboard routes behind wallet auth
- [ ] **3. Design dashboard UI in V0** -- generate developer dashboard layout (wallet address, profile info, LLM usage cards, attestation status) and achievements page, export components into the project
- [ ] **4. Build backend API routes** -- create Next.js API routes for storing attestations (`POST /api/attestations`), retrieving per-wallet (`GET /api/attestations/:address`), and achievements calculation logic. Set up a lightweight DB (SQLite/Prisma or JSON store to start)
- [ ] **5. Build Primus zkTLS application for OpenAI** -- create attestation config targeting OpenAI billing/usage API, implement the prove flow, verify attestation, and store result via backend API
- [ ] **6. Build Primus zkTLS application for Anthropic** -- same pattern as OpenAI, targeting Anthropic's usage/billing endpoints
- [ ] **7. Build Primus zkTLS application for Gemini** -- same pattern, targeting Google AI Studio billing/usage endpoints
- [ ] **8. Integrate Primus flows into dashboard** -- add "Verify Usage" buttons per provider on dashboard, trigger zkTLS attestation, display verified results and attestation proofs
- [ ] **9. Build achievements page** -- derive achievements/badges from stored attestations (e.g., "$100+ spent on OpenAI", "Multi-provider user", "Power user"), display on dedicated achievements page
- [ ] **10. Validate end-to-end** -- test wallet connect → trigger attestation → store result → display on dashboard → achievements derived correctly

## Open Questions

- What database do you prefer for storing attestations? (Prisma + SQLite for simplicity, or Postgres, or something else?)
- Do you have existing Primus developer credentials / access to their SDK, or do we need to set that up first?
- Should achievements be pre-defined (hardcoded tiers) or configurable/dynamic?
