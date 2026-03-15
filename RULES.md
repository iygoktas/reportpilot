# ReportPilot — Rules for Claude Code

These rules are non-negotiable. If you need to break any of them, STOP and ask the developer first. Do not proceed on your own.

---

## 1. No Unauthorized Dependencies
DO NOT run `npm install` for any package not on this list:

### Allowed Packages
```
next
react
react-dom
typescript
tailwindcss
@supabase/supabase-js
@supabase/ssr
stripe
@anthropic-ai/sdk
zod
recharts
@react-pdf/renderer
lucide-react
```
Plus any shadcn/ui components added via `npx shadcn-ui@latest add [component]`.

Everything else: **ASK FIRST.** Explain why you need it and wait for approval.

---

## 2. No Unauthorized Files or Folders
- DO NOT create directories outside the structure defined in CLAUDE.md.
- DO NOT create new files outside the defined structure without asking.
- If a new file is needed, explain where it goes and why before creating it.

---

## 3. No Database Schema Changes
- DO NOT add new tables or columns.
- DO NOT modify existing table definitions.
- DO NOT change or remove RLS policies.
- The schema is defined in ARCHITECTURE.md — follow it exactly.
- If a schema change is needed, explain the reason and wait for approval.

---

## 4. No AI Prompt Modifications
- DO NOT change the tone, format, or structure of the AI report prompt.
- The prompt is defined in ARCHITECTURE.md.
- Keep tone: professional, clear, no jargon, client-friendly.
- Keep format: executive summary → key wins → concerns → recommendations.
- Keep language: ENGLISH for all report output. Never Turkish.

---

## 5. No Architecture Decisions Without Asking
- DO NOT switch Server Components to Client Components unless necessary (explain why).
- DO NOT introduce state management libraries (Redux, Zustand, Jotai, etc.).
- DO NOT add API routes not defined in ARCHITECTURE.md.
- DO NOT change the authentication or payment flow.
- DO NOT add middleware not defined in the project structure.

---

## 6. No Styling Deviations
- DO NOT use CSS modules, styled-components, inline styles, or any CSS approach other than Tailwind utility classes.
- DO NOT install UI libraries other than shadcn/ui (no MUI, Chakra, Ant Design, Mantine, etc.).
- DO NOT add dark mode, theme switching, or dark color variants.
- DO NOT add complex animations, transitions beyond simple hover effects, or visual effects.
- DO NOT use colors outside the palette defined in DESIGN.md.
- DO NOT use pure black (#000000) anywhere — use slate-800 or slate-900.
- Always read DESIGN.md before creating any UI component.

---

## 7. No Silent Error Handling
- DO NOT use empty catch blocks: `catch(e) {}` or `catch(_) {}`.
- DO NOT suppress TypeScript errors with `@ts-ignore`, `@ts-expect-error`, or `as any`.
- DO NOT use the `any` type — always define proper types.
- Every API call must have try-catch with user-friendly error handling.
- Every async operation must have a loading state.
- Every page must handle empty state, loading state, and error state.

---

## 8. No Overengineering
- DO NOT add caching layers, Redis, or CDN configuration.
- DO NOT add rate limiting or request throttling.
- DO NOT create abstract base classes, factory patterns, or complex design patterns.
- DO NOT build features not listed in Phase 1 of ARCHITECTURE.md.
- DO NOT add testing frameworks or write tests in MVP phase.
- DO NOT optimize for performance unless there's a visible problem.
- Keep it simple. Make it work first. Optimize later.

---

## 9. Responsive Design Rules
- Desktop-first approach: design for desktop, then ensure mobile doesn't break.
- Always use Tailwind responsive prefixes (md:, lg:) for layout changes.
- Sidebar visible on desktop (md and above), hidden on mobile.
- Bottom navigation bar visible on mobile only (below md breakpoint).
- No horizontal scrolling on any screen size.
- Touch targets minimum 44x44px on mobile.
- Test every component at both desktop and mobile widths.

---

## 10. Git and Code Quality
- DO NOT make git commits — the developer handles git manually.
- DO NOT push to any remote repository.
- DO NOT modify .env.local or any environment configuration files.
- DO NOT delete existing files without asking.
- Use descriptive English variable and function names.
- Add brief comments only where logic is complex or non-obvious.

---

## Summary
When in doubt about ANYTHING: **ASK.** A 30-second question saves hours of rework. Show the plan before executing. The developer will approve or redirect.
