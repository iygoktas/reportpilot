# ReportPilot — Design System

## Design Philosophy
Minimal, clean, professional. Every element earns its place on screen. Inspired by Vercel (zero noise), Linear (progressive disclosure), Stripe (data presentation). Light mode only.

## Font
**Inter** — loaded via `next/font/google`. Used everywhere. No other fonts.
- Headings: Inter semibold (600) or bold (700)
- Body: Inter regular (400)
- Small text: Inter medium (500)

## Color Palette

### Core Colors (Tailwind classes in parentheses)
| Purpose | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| Page background | #F8FAFC | bg-slate-50 | Main content area background |
| Surface/cards | #FFFFFF | bg-white | Cards, sidebar, navbar, modals |
| Primary | #3B82F6 | blue-500 | Buttons, links, active states, accents |
| Primary hover | #2563EB | blue-600 | Button hover, link hover |
| Primary light | #EFF6FF | blue-50 | Active sidebar item bg, highlight areas |
| Primary subtle | #DBEAFE | blue-100 | Badge backgrounds, soft highlights |
| Text primary | #1E293B | slate-800 | Headings, main text |
| Text secondary | #64748B | slate-500 | Descriptions, helper text, timestamps |
| Text muted | #94A3B8 | slate-400 | Placeholder text, disabled states |
| Border | #E2E8F0 | slate-200 | Card borders, dividers, separators |
| Border hover | #CBD5E1 | slate-300 | Input focus borders |
| Success | #22C55E | green-500 | Positive metrics (↑ 23%), success toasts |
| Success bg | #F0FDF4 | green-50 | Success metric card background |
| Danger | #EF4444 | red-500 | Negative metrics (↓ 5%), error states, delete buttons |
| Danger bg | #FEF2F2 | red-50 | Error metric card background |
| Warning | #F59E0B | amber-500 | Warning states |

### NEVER use:
- Pure black (#000000) — always use slate-800 or slate-900
- Any color not in this palette
- Dark mode colors or dark backgrounds

## Layout

### Desktop (md breakpoint and above)
```
┌──────────────────────────────────────────────┐
│ ┌─────────┐ ┌──────────────────────────────┐ │
│ │         │ │                              │ │
│ │ Sidebar │ │    Main Content Area         │ │
│ │ (white) │ │    (slate-50 background)     │ │
│ │ w-64    │ │                              │ │
│ │         │ │                              │ │
│ │         │ │                              │ │
│ │         │ │                              │ │
│ │ [User]  │ │                              │ │
│ └─────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
- Sidebar: fixed left, width 256px (w-64), white background, right border
- Content: fills remaining space, slate-50 background, padding 24px (p-6)

### Mobile (below md breakpoint)
```
┌──────────────────────┐
│   Top Header Bar     │
├──────────────────────┤
│                      │
│   Main Content       │
│   (full width)       │
│                      │
│                      │
├──────────────────────┤
│ 🏠  👥  📄  ⚙️     │
│ Bottom Navigation    │
└──────────────────────┘
```
- Sidebar hidden completely
- Top header: logo + page title
- Bottom nav: 4 icons (Dashboard, Clients, Reports, Settings)
- Bottom nav: white bg, top border, icons gray by default, active icon blue with small blue dot below
- Content: full width, no side padding wasted

## Component Styles

### Buttons
```
Primary:    bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 font-medium
Secondary:  bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2
Danger:     bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 font-medium
Ghost:      text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg px-4 py-2
```

### Cards
```
bg-white border border-slate-200 rounded-lg shadow-sm p-6
Hover (if clickable): hover:shadow-md hover:border-slate-300 transition
```

### Inputs
```
bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800
placeholder:text-slate-400
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
```

### Metric Cards (on report page)
```
Positive: bg-green-50 border border-green-200 rounded-lg p-4
  Number: text-2xl font-bold text-slate-800
  Change: text-green-500 font-medium text-sm "↑ 23%"

Negative: bg-red-50 border border-red-200 rounded-lg p-4
  Number: text-2xl font-bold text-slate-800
  Change: text-red-500 font-medium text-sm "↓ 5%"

Neutral: bg-white border border-slate-200 rounded-lg p-4
  Number: text-2xl font-bold text-slate-800
  Change: text-slate-500 font-medium text-sm "→ 0%"
```

### Sidebar Menu Items
```
Default:  flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700
Active:   flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium
Icon:     w-5 h-5 (20px Lucide icons)
```

### User Card (sidebar bottom)
```
Container: bg-slate-50 rounded-lg p-3 flex items-center gap-3
Avatar:    w-8 h-8 rounded-full (Google profile picture or initials with blue bg)
Name:      text-sm font-medium text-slate-700
Badge Pro: bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full
Badge Free: bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full
```

### Toast Notifications
```
Use shadcn/ui Toast component.
Success: green left border accent
Error: red left border accent
Info: blue left border accent
Position: bottom-right on desktop, bottom-center on mobile
```

### Modals / Dialogs
```
Use shadcn/ui Dialog component.
Overlay: bg-black/50 backdrop blur
Modal: bg-white rounded-xl shadow-xl max-w-md mx-auto p-6
```

### Loading States
```
Use shadcn/ui Skeleton component.
Skeleton: bg-slate-200 animate-pulse rounded

Report generation loading:
  Centered spinner + changing text messages:
  "Connecting to Google Analytics..." (0-3s)
  "Analyzing your data..." (3-6s)
  "Generating insights..." (6-10s)
  "Almost ready..." (10s+)
```

### Empty States
```
Centered in content area:
  Icon: Lucide icon, 48px, text-slate-300
  Title: text-lg font-medium text-slate-700
  Description: text-sm text-slate-500
  CTA button: primary style

Example (empty dashboard):
  Icon: BarChart3
  Title: "No clients yet"
  Description: "Add your first client to start generating reports"
  Button: "Add Client"
```

### Error States
```
Centered or inline:
  Icon: AlertCircle, text-red-500
  Title: "Something went wrong"
  Description: text-sm text-slate-500 with error context
  Button: "Try Again" (secondary style)
```

## Page-Specific Designs

### Login Page
- Full page, bg-slate-50
- Centered white card: max-w-sm, shadow-lg, rounded-xl, p-8
- Inside card (top to bottom):
  - "ReportPilot" text logo (text-xl font-bold text-slate-800)
  - Spacing
  - "Welcome back" (text-2xl font-bold text-slate-800)
  - "Sign in to continue to your dashboard" (text-sm text-slate-500)
  - Spacing
  - "Continue with Google" button (white bg, border, Google icon, full width)
  - Spacing
  - "By signing in, you agree to our Terms of Service" (text-xs text-slate-400 text-center)

### Landing Page
- **Navbar:** sticky top, white bg, bottom border
  - Left: "ReportPilot" text logo
  - Right: "Login" ghost button + "Start Free" primary button
- **Hero section:** centered text
  - Headline: "Stop wasting hours on client reports" (text-4xl font-bold)
  - Subheadline: "Let AI generate professional reports from your Google Analytics in minutes" (text-lg text-slate-500)
  - CTA: "Start Free — No credit card required" primary button large
  - Below: product screenshot/mockup (add later when dashboard is built)
- **3-step section:** 3 columns
  - Each: Lucide icon (blue, 40px) + title + short description
  - Step 1: "Connect" — Link your Google Analytics account in one click
  - Step 2: "Generate" — AI analyzes your data and writes professional insights
  - Step 3: "Send" — Download PDF and impress your clients
- **Pricing section:** single centered card
  - "Pro Plan" title
  - "$19/month" large price
  - Feature list with check icons
  - "Start Free" button
  - "First report free, no credit card required" small text
- **Footer:** minimal
  - Logo, copyright, contact email link

### Dashboard
- Page title: "Dashboard" (text-2xl font-bold)
- Subtitle: "Hi [name], you have [n] active clients" (text-slate-500)
- Plan indicator: "Pro Plan — 3/5 clients" or "Free Plan — upgrade for more"
- Client cards in 2-column grid (lg:grid-cols-2, md:grid-cols-1)
- Each client card:
  - Client name (font-semibold) + website URL (text-sm text-slate-500)
  - Mini metrics row: Sessions + Users with trend arrows
  - "Generate Report" primary button
  - Last report date or "No reports yet"
- Empty state if no clients

### Client Detail Page
- Back link: "← Back to Dashboard"
- Client name heading + website
- Connected GA4 property info
- Recent metrics overview
- Reports list for this client
- "Generate New Report" button
- "Delete Client" danger button (with confirmation)

### Report View Page
- Header: "Monthly Report: [Client Name]" + period
- 4 metric cards in row (sessions, users, duration, bounce rate)
- Trend line chart (Recharts, blue line, clean grid)
- AI Narrative sections with clear headings
- Action buttons: "Download PDF" primary + "Edit Narrative" secondary + "Back to Client"

### Settings Page
- Tabs or sections: Profile, Integrations, Billing
- Profile: name, email (read-only from Google), save button
- Integrations: Google Analytics connection status, connect/disconnect button
- Billing: current plan, Stripe portal link, usage (3/5 clients)

### 404 Page
- Centered: "Page not found" + "Back to Dashboard" button
