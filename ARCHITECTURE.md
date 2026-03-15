# ReportPilot — Architecture

## Target User
- Freelance digital marketers and small agencies (1-5 clients)
- Spending 4-6 hours/week on manual client reporting
- Budget: $19/month (competitors charge $49-159+)
- First report free, then paid subscription

## User Flow
1. Landing page → "Start Free"
2. Google OAuth one-click signup (Supabase Auth)
3. "Connect Google Analytics" → Google OAuth consent → token saved
4. "Add Client" → name, website, GA4 property dropdown, start date
5. Dashboard: client cards with mini metrics + trend arrows
6. "Generate Report" → select period → AI generates narrative (5-15 sec)
7. Review: metric cards + trend chart + AI narrative
8. Edit narrative if needed (textarea)
9. Download PDF → email to client manually
10. After first free report → Stripe paywall → $19/month subscription
11. Repeat monthly

## Database Schema (Supabase PostgreSQL)

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    stripe_customer_id TEXT,
    plan TEXT DEFAULT 'free',  -- 'free' | 'pro'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (the agency's end-clients)
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website_url TEXT,
    ga4_property_id TEXT,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth integrations (Google tokens)
CREATE TABLE public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,     -- 'google'
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated reports
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data_snapshot JSONB NOT NULL,
    previous_data_snapshot JSONB,
    ai_narrative TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'draft',  -- 'draft' | 'final'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: users can only access their own data
-- Enable RLS on ALL tables
-- Policy: user_id = auth.uid() for clients, integrations
-- Policy: client.user_id = auth.uid() for reports (via join)
```

## API Routes

### Auth
- `POST /api/auth/callback` — Google OAuth callback, save tokens

### Analytics
- `GET /api/analytics/properties` — List user's GA4 properties
- `GET /api/analytics/data?property_id=X&start=Y&end=Z` — Fetch GA4 metrics

### Reports
- `POST /api/reports/generate` — Generate report (fetch GA4 data + Claude AI)
- `GET /api/reports/[id]` — Get single report
- `PUT /api/reports/[id]` — Update report (edit narrative)
- `GET /api/reports?client_id=X` — List reports for a client

### Integrations
- `POST /api/integrations/google/connect` — Start Google OAuth flow
- `DELETE /api/integrations/google/disconnect` — Remove Google connection

### Stripe
- `POST /api/stripe/checkout` — Create checkout session
- `POST /api/stripe/webhook` — Handle Stripe webhooks (subscription created/cancelled)
- `GET /api/stripe/portal` — Get Stripe customer portal link

## AI Report Generation Flow
1. Fetch current period GA4 data (this month)
2. Fetch previous period GA4 data (last month)
3. If client has start_date, fetch baseline data
4. Send all data to Claude API with prompt template
5. Claude returns structured narrative
6. Save report to database
7. Display to user

## AI Prompt Structure
Include in every Claude API call:
- Current period metrics: sessions, users, pageviews, avg duration, bounce rate, top 5 pages, traffic sources
- Previous period metrics (same fields)
- Baseline metrics from start_date (if available)
- Client name and website

Output format (strict):
1. Executive Summary (2-3 sentences)
2. Key Wins (3 bullets with numbers and % changes)
3. Areas of Attention (honest but constructive)
4. Recommendations (2-3 actionable steps)

Tone: Professional, clear, no jargon. Reader is business owner. Feel: "my money is well spent."
Language: ENGLISH only.

## MVP Scope

### Phase 1 — IN:
- Landing page with pricing
- Google OAuth login
- Google Analytics GA4 connection
- Client CRUD (add, list, view, delete)
- Report generation (GA4 + Claude AI)
- Report view with metric cards, trend chart, AI narrative
- Edit narrative
- PDF export
- Report history
- Stripe subscription ($19/month)
- Settings (profile, integrations, billing)
- Empty states for all pages
- Loading states (skeleton) for all async operations
- Error states with retry
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- 404 page
- Report generation loading with progress messages

### Phase 2 — OUT:
- Meta Ads / Google Ads integration
- Automated monthly scheduling
- Email delivery (Resend)
- White-label branding
- Client portal
- Multiple report templates
- Team/multi-user support
- Dark mode
- Collapsible sidebar

## Important Technical Notes

### Google OAuth Scopes
Only request `analytics.readonly` scope. Requesting more triggers Google's verification process which takes weeks.

### Token Refresh
Google access tokens expire after 1 hour. Always check expiry before API calls and refresh using refresh_token if expired.

### Stripe Webhooks on Localhost
Use Stripe CLI to forward webhooks during development:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Vercel Environment Variables
.env.local works locally but must be separately configured in Vercel dashboard for production deployment.

### Supabase RLS
If data isn't returning from queries, 99% of the time it's a missing RLS policy. Always set up RLS policies immediately after creating tables.
