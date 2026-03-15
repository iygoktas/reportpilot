import Link from 'next/link';
import { Link2, Sparkles, Send, Check, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

// Pre-defined chart bar heights as full Tailwind class strings so the
// scanner picks them up — no inline styles needed.
const CHART_BARS = [
  'h-[38%]', 'h-[58%]', 'h-[44%]', 'h-[70%]', 'h-[54%]',
  'h-[80%]', 'h-[62%]', 'h-[74%]', 'h-[50%]', 'h-[84%]',
  'h-[67%]', 'h-[92%]',
] as const;

const SIDEBAR_WIDTHS = ['w-10', 'w-14', 'w-11', 'w-12'] as const;

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold text-stone-800 tracking-tight">
            ReportPilot
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href={ctaHref}
              className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href={ctaHref}
              className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
            >
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-20 pb-8 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full mb-8 border border-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analytics Reports
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 leading-tight tracking-tight">
            Stop wasting hours
            <br className="hidden sm:block" />
            {' '}on client reports
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Let AI generate professional reports from your Google Analytics in minutes
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 shadow-sm"
            >
              Start Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-stone-200 text-stone-600 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50 px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200"
            >
              See how it works <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-5 text-sm text-stone-400">
            Join 100+ freelancers saving 4 hours every week
          </p>
        </div>

        {/* ── Dashboard mockup ─────────────────────────────────────────────── */}
        <div className="mt-16 max-w-4xl mx-auto px-0 md:px-4">
          {/* 3-D tilt wrapper — subtle perspective lift */}
          <div className="[transform:perspective(1400px)_rotateX(5deg)] hover:[transform:perspective(1400px)_rotateX(2deg)] transition-all duration-500 [will-change:transform]">
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-2xl shadow-stone-300/40 bg-white">

              {/* Browser chrome */}
              <div className="bg-stone-100 border-b border-stone-200 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded-md border border-stone-200 h-6 flex items-center px-3 gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full bg-stone-300 shrink-0" />
                  <div className="h-2 w-40 bg-stone-200 rounded-full" />
                </div>
              </div>

              {/* App shell */}
              <div className="flex h-72 select-none">

                {/* Sidebar */}
                <div className="w-40 bg-white border-r border-stone-100 p-4 shrink-0 flex flex-col gap-1.5">
                  {/* Logo skeleton */}
                  <div className="h-5 w-24 bg-stone-800 rounded mb-3" />
                  {/* Active nav item */}
                  <div className="h-7 w-full bg-orange-50 rounded-md flex items-center px-2.5 gap-2">
                    <div className="w-3 h-3 rounded-sm bg-orange-300" />
                    <div className="h-1.5 w-12 bg-orange-300 rounded-full" />
                  </div>
                  {/* Inactive nav items */}
                  {SIDEBAR_WIDTHS.map((w, i) => (
                    <div key={i} className="h-7 w-full rounded-md flex items-center px-2.5 gap-2">
                      <div className="w-3 h-3 rounded-sm bg-stone-200" />
                      <div className={`h-1.5 ${w} bg-stone-200 rounded-full`} />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 bg-stone-50 p-5 flex flex-col gap-3 min-w-0">

                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-36 bg-stone-700 rounded" />
                      <div className="h-2.5 w-24 bg-stone-300 rounded" />
                    </div>
                    <div className="h-7 w-24 bg-orange-600 rounded-md shrink-0" />
                  </div>

                  {/* Metric cards */}
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-2.5 space-y-1.5">
                      <div className="h-1.5 w-10 bg-stone-300 rounded-full" />
                      <div className="h-4 w-9 bg-stone-700 rounded" />
                      <div className="h-1.5 w-7 bg-teal-400 rounded-full" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-lg p-2.5 space-y-1.5">
                      <div className="h-1.5 w-8 bg-stone-300 rounded-full" />
                      <div className="h-4 w-10 bg-stone-700 rounded" />
                      <div className="h-1.5 w-6 bg-teal-400 rounded-full" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-lg p-2.5 space-y-1.5">
                      <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
                      <div className="h-4 w-8 bg-stone-700 rounded" />
                      <div className="h-1.5 w-9 bg-stone-300 rounded-full" />
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 space-y-1.5">
                      <div className="h-1.5 w-10 bg-stone-300 rounded-full" />
                      <div className="h-4 w-9 bg-stone-700 rounded" />
                      <div className="h-1.5 w-6 bg-red-400 rounded-full" />
                    </div>
                  </div>

                  {/* Chart card */}
                  <div className="flex-1 bg-white border border-stone-200 rounded-lg p-3 min-h-0">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="h-2 w-24 bg-stone-200 rounded-full" />
                      <div className="flex gap-3">
                        <div className="h-1.5 w-16 bg-orange-300 rounded-full" />
                        <div className="h-1.5 w-16 bg-stone-200 rounded-full" />
                      </div>
                    </div>
                    {/* Fake bar chart — all heights are full Tailwind classes */}
                    <div className="flex items-end gap-0.5 h-16 px-1">
                      {CHART_BARS.map((barH, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm ${barH} ${
                            i >= CHART_BARS.length - 3
                              ? 'bg-orange-500'
                              : i % 2 === 0
                              ? 'bg-orange-200'
                              : 'bg-orange-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade so the mockup blends into the section below */}
          <div className="h-16 bg-gradient-to-b from-transparent to-stone-50 -mt-16 relative z-10 pointer-events-none" />
        </div>
      </section>

      {/* ── 3-Step Section ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-stone-50 border-y border-stone-200 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-semibold text-stone-800 tracking-tight">
              From data to report in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">

            {/* Subtle connecting line — desktop only, sits behind z-10 icons */}
            <div className="hidden md:block absolute top-[1.4rem] left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

            {/* Step 1 */}
            <div className="relative text-center">
              {/* Decorative number — behind everything */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-7xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                01
              </span>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 ring-4 ring-stone-50 mb-5">
                  <Link2 className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Connect</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-xs mx-auto">
                  Link your Google Analytics account in one click
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-7xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                02
              </span>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 ring-4 ring-stone-50 mb-5">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Generate</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-xs mx-auto">
                  AI analyzes your data and writes professional insights
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-7xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                03
              </span>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 ring-4 ring-stone-50 mb-5">
                  <Send className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Send</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-xs mx-auto">
                  Download PDF and impress your clients
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-sm mx-auto">

          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-10">
            Pricing
          </p>

          <div className="relative bg-white border border-orange-600 rounded-xl shadow-sm ring-1 ring-orange-100 p-8 overflow-hidden">

            {/* Top gradient line accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

            {/* Most Popular badge */}
            <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Most Popular
            </div>

            <p className="text-base font-semibold text-stone-800 mb-1">Pro Plan</p>

            <div className="flex items-end gap-1 mt-4 mb-7">
              <span className="text-5xl font-bold text-stone-800">$19</span>
              <span className="text-lg text-stone-500 mb-2">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Unlimited reports',
                'AI-powered insights',
                'PDF export',
                'Google Analytics integration',
                'Up to 5 clients',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-base text-stone-700">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={ctaHref}
              className="block w-full bg-orange-600 text-white hover:bg-orange-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-center"
            >
              Start Free
            </Link>
            <p className="mt-3 text-sm text-stone-500 text-center">
              First report free, no credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-stone-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-base font-semibold text-stone-800 tracking-tight">
            ReportPilot
          </span>
          <p className="text-sm text-stone-400">
            © 2026 ReportPilot · Built by a freelancer, for freelancers
          </p>
          <a
            href="mailto:hello@reportpilot.io"
            className="text-sm text-stone-500 hover:text-stone-700 transition-all duration-200"
          >
            hello@reportpilot.io
          </a>
        </div>
      </footer>

    </div>
  );
}
