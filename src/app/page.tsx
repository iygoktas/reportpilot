import Link from 'next/link';
import {
  Link2,
  Sparkles,
  Send,
  Check,
  BarChart3,
  Star,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

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
          <span className="flex items-center gap-2 text-xl font-semibold text-stone-800 tracking-tight">
            <BarChart3 className="w-5 h-5 text-orange-600" />
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

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 leading-tight tracking-tight">
            Client reports that
            <br className="hidden sm:block" />
            {' '}write themselves
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Connect Google Analytics, let AI write the insights, download a client-ready PDF. Done in 2 minutes.
          </p>

          {/* Single CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href={ctaHref}
              className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-sm"
            >
              Generate Your First Report — Free
            </Link>
          </div>

          {/* Fine print */}
          <p className="mt-4 text-sm text-stone-400">
            No credit card required · Free forever for 1 report
          </p>

          {/* Social proof row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Overlapping avatar circles */}
            <div className="flex items-center">
              {[
                'bg-stone-300',
                'bg-stone-400',
                'bg-stone-200',
                'bg-stone-350',
                'bg-stone-500',
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${bg} border-2 border-white ${i !== 0 ? '-ml-2' : ''}`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500 font-medium">
              100+ freelancers saving 4 hours/week
            </span>
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-stone-50 border-y border-stone-200 px-6 scroll-mt-16">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-semibold text-stone-800 tracking-tight">
              From data to report in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

            {/* Connecting dashed line — desktop only */}
            <div className="hidden md:block absolute top-[3.5rem] left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px border-t border-dashed border-stone-300 z-0" />

            {/* Step 1 */}
            <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-6 z-10">
              <span className="absolute top-4 right-5 text-5xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                01
              </span>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-5">
                <Link2 className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Connect</h3>
              <p className="text-base text-stone-500 leading-relaxed">
                Link your Google Analytics account in one click
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-6 z-10">
              <span className="absolute top-4 right-5 text-5xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                02
              </span>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-5">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Generate</h3>
              <p className="text-base text-stone-500 leading-relaxed">
                AI analyzes your data and writes professional insights
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 p-6 z-10">
              <span className="absolute top-4 right-5 text-5xl font-bold text-stone-100 select-none leading-none pointer-events-none">
                03
              </span>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-5">
                <Send className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Send</h3>
              <p className="text-base text-stone-500 leading-relaxed">
                Download PDF and impress your clients
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-stone-800 tracking-tight">
              What freelancers say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white rounded-xl p-6 border-l-4 border-orange-200 shadow-sm border border-stone-200">
              <p className="text-orange-200 text-4xl font-serif leading-none mb-3">&ldquo;</p>
              <p className="text-base text-stone-600 italic leading-relaxed mb-4">
                ReportPilot saves me 4 hours every month. My clients think I hired a data analyst.
              </p>
              <p className="text-sm font-semibold text-stone-800">Sarah Chen</p>
              <p className="text-sm text-stone-500">Freelance Digital Marketer</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-l-4 border-orange-200 shadow-sm border border-stone-200">
              <p className="text-orange-200 text-4xl font-serif leading-none mb-3">&ldquo;</p>
              <p className="text-base text-stone-600 italic leading-relaxed mb-4">
                The AI insights are surprisingly good. I used to dread monthly reports, now they take 2 minutes.
              </p>
              <p className="text-sm font-semibold text-stone-800">Marcus Rivera</p>
              <p className="text-sm text-stone-500">Agency Owner</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-l-4 border-orange-200 shadow-sm border border-stone-200">
              <p className="text-orange-200 text-4xl font-serif leading-none mb-3">&ldquo;</p>
              <p className="text-base text-stone-600 italic leading-relaxed mb-4">
                My client retention went up after I started sending these reports. They can see the value I bring.
              </p>
              <p className="text-sm font-semibold text-stone-800">Priya Sharma</p>
              <p className="text-sm text-stone-500">SEO Consultant</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Report Preview ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-stone-50 border-y border-stone-200 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-stone-800 tracking-tight">
              Reports your clients will love
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10">

            {/* Left — Report mockup (60%) */}
            <div className="w-full lg:w-[60%] bg-white rounded-2xl shadow-lg border border-stone-200 p-6 space-y-4">

              {/* Report header */}
              <div>
                <h3 className="text-base font-semibold text-stone-800">Monthly Report: Acme Corp</h3>
                <p className="text-sm text-stone-400">February 2026</p>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Sessions</p>
                  <p className="text-lg font-bold text-stone-800">2,363</p>
                  <p className="text-xs text-teal-600 font-medium">↑ 15%</p>
                </div>
                <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Users</p>
                  <p className="text-lg font-bold text-stone-800">1,920</p>
                  <p className="text-xs text-teal-600 font-medium">↑ 37%</p>
                </div>
                <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Duration</p>
                  <p className="text-lg font-bold text-stone-800">2m55s</p>
                  <p className="text-xs text-teal-600 font-medium">↑ 28%</p>
                </div>
                <div className="bg-stone-50 border-l-4 border-stone-300 rounded-lg p-3">
                  <p className="text-xs text-stone-400 mb-1">Bounce</p>
                  <p className="text-lg font-bold text-stone-800">39.1%</p>
                  <p className="text-xs text-stone-400 font-medium">→ stable</p>
                </div>
              </div>

              {/* AI Analysis — Key Wins */}
              <div className="bg-teal-50/50 rounded-xl p-4 border-l-4 border-teal-600">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Key Wins</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Organic traffic up 37% — SEO work is paying off',
                    'Blog content driving 2× more sessions than last month',
                    'Mobile users increased by 29%, conversion held steady',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Analysis — Recommendations */}
              <div className="bg-orange-50/50 rounded-xl p-4 border-l-4 border-orange-600">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Recommendations</span>
                </div>
                <ol className="space-y-2">
                  {[
                    'Increase blog publishing cadence to 3×/week',
                    'Add retargeting ads to capture returning visitors',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Right — Feature list (40%) */}
            <div className="w-full lg:w-[40%] pt-4">
              <ul className="space-y-5">
                {[
                  {
                    icon: <FileText className="w-5 h-5 text-orange-600" />,
                    title: 'AI-written executive summary',
                    desc: 'Claude reads your data and writes a professional narrative your clients actually understand.',
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
                    title: 'Key wins highlighted',
                    desc: 'Every win is surfaced and explained — no more digging through dashboards.',
                  },
                  {
                    icon: <Lightbulb className="w-5 h-5 text-orange-600" />,
                    title: 'Actionable recommendations',
                    desc: "Numbered next steps so clients know exactly what you're doing for them.",
                  },
                  {
                    icon: <Send className="w-5 h-5 text-stone-500" />,
                    title: 'Professional PDF export',
                    desc: 'Download a branded, print-ready PDF in one click. Send it in any format.',
                  },
                ].map(({ icon, title, desc }, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      {icon}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-stone-800 mb-0.5">{title}</p>
                      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-4xl font-semibold text-stone-800 tracking-tight">
              Simple, honest pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Free card */}
            <div className="bg-white border border-stone-200 rounded-xl p-8">
              <p className="text-base font-semibold text-stone-800 mb-1">Free</p>
              <div className="flex items-end gap-1 mt-4 mb-7">
                <span className="text-5xl font-bold text-stone-800">$0</span>
                <span className="text-lg text-stone-500 mb-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '1 client',
                  '1 report/month',
                  'AI insights',
                  'PDF export',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-base text-stone-700">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref}
                className="block w-full border border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-center"
              >
                Start Free
              </Link>
            </div>

            {/* Pro card */}
            <div className="relative bg-white border-2 border-orange-600 rounded-xl p-8 overflow-hidden">
              {/* Most Popular badge */}
              <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>
              {/* Top gradient line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

              <p className="text-base font-semibold text-stone-800 mb-1">Pro</p>
              <div className="flex items-end gap-1 mt-4 mb-7">
                <span className="text-5xl font-bold text-stone-800">$19</span>
                <span className="text-lg text-stone-500 mb-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '5 clients',
                  'Unlimited reports',
                  'AI insights',
                  'PDF export',
                  'Priority support',
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
                Start Free Trial
              </Link>
            </div>

          </div>

          <p className="mt-6 text-sm text-stone-400 text-center">
            First report free, no credit card required
          </p>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-stone-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-base font-semibold text-stone-800 tracking-tight">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            ReportPilot
          </span>
          <p className="text-sm text-stone-400">
            © 2026 ReportPilot · Built by a freelancer, for freelancers
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">Twitter/X</a>
            <a
              href="mailto:hello@reportpilot.io"
              className="text-sm text-stone-500 hover:text-stone-700 transition-all duration-200"
            >
              hello@reportpilot.io
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
