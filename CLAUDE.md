# ReportPilot

## What is this?
AI-powered client reporting tool for freelance marketers and small agencies. Connects to Google Analytics GA4, generates AI-powered insights, produces client-ready PDF reports.

**Core value:** "Prove your value to your client" — not just show data, but tell the ROI story.

## Tech Stack
- Next.js 14+ (App Router) + TypeScript
- React + Tailwind CSS + shadcn/ui
- Recharts (charts)
- Supabase (PostgreSQL + Auth + RLS)
- Anthropic Claude API — claude-sonnet-4-20250514 (AI narratives)
- Google Analytics Data API (GA4)
- Stripe (payments)
- @react-pdf/renderer (PDF generation)
- Lucide React (icons)
- Zod (validation)
- Vercel (deployment)

## Project Structure
```
reportpilot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── login/              # Auth pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── clients/            # Client management
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── reports/
│   │   │   ├── [id]/
│   │   │   └── generate/
│   │   ├── settings/
│   │   └── api/
│   │       ├── auth/callback/
│   │       ├── analytics/
│   │       ├── reports/
│   │       ├── ai/
│   │       ├── stripe/
│   │       └── integrations/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, Header, MobileNav
│   │   ├── dashboard/
│   │   ├── reports/
│   │   └── charts/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── google-analytics.ts
│   │   ├── anthropic.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   └── types/
│       ├── database.ts
│       ├── analytics.ts
│       └── reports.ts
├── supabase/migrations/
├── public/
├── CLAUDE.md
├── ARCHITECTURE.md
├── DESIGN.md
├── RULES.md
├── .env.local
└── package.json
```

## Key Files to Read
- **DESIGN.md** — Read before creating ANY UI component or page.
- **ARCHITECTURE.md** — Read before working on database, API routes, or business logic.
- **RULES.md** — Read before installing packages, creating files, or making architecture decisions.

## Commands
```bash
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Code Conventions
- TypeScript strict mode
- Server Components by default, 'use client' only when needed
- Tailwind + shadcn/ui only for styling
- Zod for API input validation
- Always handle loading states (Skeleton)
- Always handle error states (try-catch + user message)
- English for code, variable names, and comments
- Desktop-first responsive design (must not break on mobile)
