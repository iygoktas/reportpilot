# ReportPilot — Design System

## Design Philosophy
Warm, confident, approachable. Premium but human. Inspired by Stripe's polish meets Basecamp's warmth. Light mode only. Every element earns its place on screen.

## Fonts
- **Headings:** Plus Jakarta Sans (Google Fonts) — weight 600-700
- **Body:** Inter — weight 400-500
- Both loaded via `next/font/google` in layout.tsx. No other fonts.

### Size Scale
| Element | Tailwind | Weight | Color |
|---------|----------|--------|-------|
| Page title (h1) | text-3xl | font-semibold (600) | stone-900 |
| Section title (h2) | text-2xl | font-semibold (600) | stone-900 |
| Card title (h3) | text-xl | font-semibold (600) | stone-900 |
| Body text | text-base | font-normal (400) | stone-700 |
| Small/secondary | text-sm | font-normal (400) | stone-500 |
| Badge/label | text-sm | font-medium (500) | varies |

## Color Palette

### Primary: Orange (Brand, CTAs, active states)
| Purpose | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| Primary bg tint | #fffbf5 | orange-50 | Page bg tint, sidebar selected bg |
| Primary light | #fff1e6 | orange-100 | Card highlights, section backgrounds |
| Primary accent | #FDBA74 | orange-200 | Light accents, progress bars |
| Primary medium | #F97316 | orange-400 | Secondary buttons, links, icons |
| **Primary CTA** | #EA580C | **orange-600** | **Buttons, active nav, logo accent** |
| Primary hover | #C2410C | orange-700 | Button hover states |
| Primary dark text | #9a3412 | orange-800 | Text on orange backgrounds |
| Primary darkest | #431407 | orange-900 | Darkest text on orange fills |

### Secondary: Teal (Positive metrics, success, connections)
| Purpose | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| Success bg | #f0fdfa | teal-50 | Success card backgrounds |
| Success light | #ccfbf1 | teal-100 | Light success surfaces |
| Success accent light | #5EEAD4 | teal-200 | Light accents |
| Success accent | #14B8A6 | teal-400 | Positive metric values, secondary actions |
| **Success text** | #0D9488 | **teal-600** | **Connected badges, % increases, success states** |
| Success dark text | #115e59 | teal-800 | Text on teal backgrounds |

### Neutral: Stone grays (warm grays — NOT slate, NOT zinc)
| Purpose | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| Page background | #fafaf9 | stone-50 | Main content area background |
| Surface/cards | #FFFFFF | bg-white | Cards, sidebar, navbar, modals |
| Surface alt | #f5f5f4 | stone-100 | Table headers, alt rows |
| Border | #e7e5e4 | stone-200 | Card borders, dividers, separators |
| Border hover | #d6d3d1 | stone-300 | Input focus, disabled borders, outline buttons |
| Text muted | #78716c | stone-500 | Descriptions, placeholders, helper text |
| Text body | #44403c | stone-700 | Body text |
| Text primary | #1c1917 | stone-900 | Headings, main text |

### Semantic
| State | Background | Text/Border | Badge bg |
|-------|-----------|-------------|----------|
| Success | teal-50 | teal-600 | rgba(13,148,136,0.1) |
| Warning | #fffbeb | #D97706 (amber-500) | rgba(245,158,11,0.1) |
| Danger | #fef2f2 | #DC2626 (red-500) | rgba(239,68,68,0.1) |
| Neutral | stone-100 | stone-500 | stone-100 |

### Badge System
| Badge | Background | Text |
|-------|-----------|------|
| GA4 Connected | teal-50 | teal-600 |
| Draft | orange-100 | orange-600 |
| Published | teal-50 | teal-600 |
| Pro plan | orange-100 | orange-700 |
| Free plan | stone-100 | stone-500 |
| Limit warning (e.g. 4/5) | amber bg | amber text |
| Danger zone | red-50 | red-600 |

### NEVER use:
- Blue (#3B82F6) or any blue variants — replaced with orange
- Slate grays — replaced with stone grays
- Pure black (#000000) — always use stone-900
- Dark mode colors or dark backgrounds
- Any color not in this palette

## Layout

### Desktop (md breakpoint and above)
```
┌──────────────────────────────────────────────┐
│ ┌─────────┐ ┌──────────────────────────────┐ │
│ │         │ │                              │ │
│ │ Sidebar │ │    Main Content Area         │ │
│ │ (white) │ │    (stone-50 background)     │ │
│ │ w-64    │ │                              │ │
│ │         │ │                              │ │
│ │         │ │                              │ │
│ │         │ │                              │ │
│ │ [User]  │ │                              │ │
│ └─────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
- Sidebar: fixed left, w-64, white bg, right shadow-sm, orange-600 active accent (left border 3px)
- Content: fills remaining space, stone-50 background, padding 24px (p-6)

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
- Bottom nav: white bg, top border, icons stone-500 by default, active icon orange-600
- Content: full width, p-4
- Touch targets minimum 44x44px

## Component Styles

### Buttons
```
Primary:    bg-orange-600 text-white hover:bg-orange-700 rounded-xl px-6 py-3 font-medium shadow-sm
Secondary:  bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-xl px-6 py-3
Danger:     bg-red-500 text-white hover:bg-red-600 rounded-xl px-6 py-3 font-medium
Ghost:      text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl px-4 py-2
```

### Cards
```
bg-white border border-stone-200 rounded-xl shadow-sm p-6
Hover (if clickable): hover:shadow-md hover:border-orange-100 transition-all duration-200
```

### Inputs
```
bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-700
placeholder:text-stone-400
focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
```

### Metric Cards (on report page)
```
Positive: bg-teal-50/50 border-l-4 border-teal-600 rounded-xl p-5
  Number: text-4xl font-semibold text-stone-900
  Change: text-teal-600 font-medium "↑ 23%"

Negative: bg-red-50/50 border-l-4 border-red-500 rounded-xl p-5
  Number: text-4xl font-semibold text-stone-900
  Change: text-red-500 font-medium "↓ 5%"

Neutral: bg-stone-50 border-l-4 border-stone-300 rounded-xl p-5
  Number: text-4xl font-semibold text-stone-900
  Change: text-stone-500 font-medium "→ 0%"
```

### AI Analysis Cards (report page)
```
Executive Summary:  bg-stone-50 rounded-xl p-6 shadow-sm
Key Wins:           bg-teal-50/50 rounded-xl p-6 shadow-sm border-l-4 border-teal-600
Areas of Attention: bg-amber-50/50 rounded-xl p-6 shadow-sm border-l-4 border-amber-500
Recommendations:    bg-orange-50/50 rounded-xl p-6 shadow-sm border-l-4 border-orange-600
```

### Sidebar Menu Items
```
Default:  flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-700
Active:   flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 border-l-3 border-orange-600 font-medium
Icon:     w-5 h-5 (20px Lucide icons)
```

### User Card (sidebar bottom)
```
Container: bg-stone-50 rounded-lg p-3 flex items-center gap-3
Avatar:    w-8 h-8 rounded-full (Google profile picture or initials with orange bg)
Name:      text-sm font-medium text-stone-700
Badge Pro: bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full
Badge Free: bg-stone-100 text-stone-500 text-xs font-medium px-2 py-0.5 rounded-full
```

### Toast Notifications
```
Use shadcn/ui Toast component.
Success: teal left border accent
Error: red left border accent
Info: orange left border accent
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
Skeleton: bg-stone-200 animate-pulse rounded

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
  Icon: Lucide icon, 48px, text-stone-300
  Title: text-lg font-medium text-stone-700
  Description: text-sm text-stone-500
  CTA button: primary style (orange-600)

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
  Description: text-sm text-stone-500 with error context
  Button: "Try Again" (secondary style)
```

## Page-Specific Designs

### Landing Page
- **Navbar:** sticky top, backdrop-blur-sm bg-white/80, bottom border
  - Left: "ReportPilot" text logo with orange chart icon
  - Right: "Login" ghost button + "Start Free" primary orange button
- **Hero section:** centered text
  - Headline: "Client reports that write themselves" (Plus Jakarta Sans, font-bold)
  - Subheadline: description text (text-stone-500)
  - CTA: single orange-600 primary button
  - Social proof: avatars + stars
  - Below: report preview mockup
- **How It Works:** numbered cards (01, 02, 03)
  - Each: orange icon + title + short description
  - Step 1: "Connect" — Link your Google Analytics account in one click
  - Step 2: "Generate" — AI analyzes your data and writes professional insights
  - Step 3: "Send" — Download PDF and impress your clients
- **Testimonials:** 3 quote cards with orange-200 left border
- **Report Preview:** "Reports your clients will love" with feature list
- **Pricing section:** Free ($0) + Pro ($19) side by side
  - Pro card: orange border + "Most Popular" badge
  - Feature list with check icons
  - "First report free, no credit card required" small text
- **Footer:** minimal
  - "Built by a freelancer, for freelancers"
  - Logo, copyright, contact email link

### Login Page
- Full page, bg-stone-50
- Centered white card: max-w-sm, shadow-lg, rounded-xl, p-8
- Inside card (top to bottom):
  - "ReportPilot" text logo (text-xl font-bold text-stone-900)
  - Spacing
  - "Welcome back" (text-2xl font-bold text-stone-900, Plus Jakarta Sans)
  - "Sign in to continue to your dashboard" (text-sm text-stone-500)
  - Spacing
  - "Continue with Google" button (white bg, border, Google icon, full width)
  - Spacing
  - "By signing in, you agree to our Terms of Service" (text-xs text-stone-400 text-center)

### Dashboard
- Page title: "Dashboard" (text-2xl font-semibold, Plus Jakarta Sans)
- 4 stat cards row: Total Clients, Reports Generated, GA4 Connected, Plan
- Client cards in 2-column grid (lg:grid-cols-2, md:grid-cols-1)
- Each client card:
  - Client name (font-semibold) + website URL (text-sm text-stone-500)
  - GA4 Connected badge (teal)
  - Mini metrics row: Sessions + Users with trend arrows
  - "Generate Report" primary button (right-aligned)
  - Last report date or "No reports yet"
- Empty state if no clients

### Client Detail Page
- Back link: "← Back to Dashboard"
- Details card with icons (client name, website, GA4 property)
- Reports list for this client with "Generate New Report" button
- Danger Zone: white bg, red left border only (not red bg), "Delete Client" button with confirmation dialog

### Report View Page
- Header: "Monthly Report: [Client Name]" + period + action buttons
- Action buttons: "Download PDF" primary (orange) + "Edit Narrative" secondary
- 4 metric cards in grid-cols-4 (sessions, users, duration, bounce rate)
- Period comparison trend chart (Recharts, orange line, clean grid)
- AI Analysis: 4 separate colored cards:
  - Executive Summary (stone-50 bg)
  - Key Wins (teal-50 bg, teal left border)
  - Areas of Attention (amber-50 bg, amber left border)
  - Recommendations (orange-50 bg, orange left border)
- Top Pages + Traffic Sources tables side by side

### Settings Page
- Sections: Profile, Integrations, Billing
- Profile: name, email (read-only from Google), save button
- Integrations: Google Analytics connection status with teal connected badge, connect/disconnect button
- Billing: current plan, orange progress bar (usage), Stripe portal link

### 404 Page
- Centered: "404" large text + "Page not found" + "Back to Dashboard" orange button