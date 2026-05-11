import Link from "next/link";

export const metadata = {
  title: "go. — get to class, or pay $100",
  description:
    "Go connects your calendar, walks you to class 30 minutes early, and charges $100 if you’re late.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <Stake />
      <HowItWorks />
      <MoneyMoves />
      <FounderNote />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight inline-flex items-baseline ${className}`}>
      go<span className="text-[var(--orange)]">.</span>
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--neutral)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark className="text-2xl" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink)]/75">
          <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
          <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
          <a href="#faq" className="hover:text-[var(--ink)]">FAQ</a>
        </nav>
        <Link
          href="#waitlist"
          className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-[var(--ink)]/85 transition"
        >
          Get the app
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-28 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
        <MapShot />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--neutral-card)] px-3 py-1 text-xs font-medium text-[var(--ink)]/70 ring-1 ring-[var(--neutral)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)]" />
            Now in private alpha
          </div>
          <h1 className="font-display mt-6 text-[clamp(48px,7vw,92px)] font-bold leading-[0.95] tracking-tight">
            Get to class.
            <br />
            <span className="text-[var(--orange)]">Or pay $100.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-[var(--ink)]/70">
            Go connects your calendar, walks you to class thirty minutes early, and charges $100 every time you don&apos;t make it.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="#waitlist"
              className="rounded-full bg-[var(--ink)] px-7 py-3.5 text-base font-semibold text-[var(--bg)] hover:bg-[var(--ink)]/85 transition"
            >
              Connect calendar →
            </Link>
            <Link
              href="#how"
              className="rounded-full px-6 py-3.5 text-base font-semibold text-[var(--ink)]/80 hover:text-[var(--ink)] transition"
            >
              How it works
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--orange)]/10 px-3 py-1.5 text-xs font-mono font-medium text-[var(--orange)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange)] animate-pulse" />
            Live $100 stake · Apple Pay or bank
          </p>
        </div>
      </div>
    </section>
  );
}

// Stylized campus map with an animated route. Not a real Mapbox embed —
// chosen for instant load + reliability. Real interactive map is in the
// mobile app where it belongs.
function MapShot() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[#1a1d24] shadow-2xl ring-1 ring-[var(--ink)]/10 md:aspect-[5/6]">
      {/* dusk gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a1d3a] via-[#3a2a35] to-[#1f2d3a]" />

      {/* ambient golden glow at the route's midpoint */}
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--orange)]/30 blur-3xl" />

      {/* low-poly campus blocks */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="block" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3d3851" />
            <stop offset="100%" stopColor="#2a253d" />
          </linearGradient>
          <linearGradient id="block2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4a3a45" />
            <stop offset="100%" stopColor="#332732" />
          </linearGradient>
        </defs>

        {/* roads */}
        <path d="M 0 380 Q 200 360 400 400" stroke="#3a3a4a" strokeWidth="22" fill="none" opacity="0.7" />
        <path d="M 60 0 Q 80 250 120 500" stroke="#3a3a4a" strokeWidth="18" fill="none" opacity="0.6" />
        <path d="M 250 0 Q 280 200 320 500" stroke="#3a3a4a" strokeWidth="14" fill="none" opacity="0.5" />

        {/* trees scattered */}
        {[
          [40, 100], [90, 60], [160, 130], [220, 80], [330, 50],
          [50, 230], [340, 200], [60, 320], [380, 320], [180, 460], [380, 460],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <circle r="9" fill="#1d3a2e" opacity="0.95" />
            <circle r="6" fill="#2d5a44" opacity="0.95" />
            <circle r="3" fill="#4a8867" opacity="0.6" />
          </g>
        ))}

        {/* buildings — low-poly */}
        <g>
          <polygon points="120,180 200,160 200,260 120,260" fill="url(#block)" />
          <polygon points="120,180 200,160 200,180 120,200" fill="#4a4366" opacity="0.6" />
        </g>
        <g>
          <polygon points="220,130 290,115 290,210 220,225" fill="url(#block2)" />
          <polygon points="220,130 290,115 290,135 220,150" fill="#5a4555" opacity="0.6" />
        </g>
        <g>
          <polygon points="240,300 340,280 340,400 240,420" fill="url(#block)" />
          <polygon points="240,300 340,280 340,305 240,325" fill="#4a4366" opacity="0.6" />
          {/* gold-lit window */}
          <rect x="270" y="330" width="14" height="18" fill="#ffb86b" opacity="0.9" />
          <rect x="295" y="328" width="14" height="18" fill="#ffb86b" opacity="0.7" />
        </g>

        {/* the route line (animated stroke draw) */}
        <path
          className="route-line"
          d="M 70 430 Q 130 380 165 320 Q 200 270 250 280 Q 290 290 295 340"
          stroke="#FF5C1A"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* destination pin */}
        <g transform="translate(295 340)">
          <circle r="14" fill="#FF5C1A" opacity="0.25" />
          <circle r="8" fill="#FF5C1A" />
          <circle r="3" fill="#FAFAF7" />
        </g>

        {/* walker sprite at the start */}
        <g transform="translate(70 430)" className="walk-bob">
          <circle r="10" fill="#0A0A0A" />
          <circle r="6" fill="#FAFAF7" />
          <text x="0" y="3" textAnchor="middle" fontSize="9">🚶‍♀️</text>
        </g>
      </svg>

      {/* floating UI card — Uber-style "leave at" */}
      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[var(--bg)] p-4 shadow-lg ring-1 ring-[var(--ink)]/5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50">Next class</p>
            <p className="mt-0.5 font-display text-lg font-semibold">Econ 333 — Olin Library</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50">4:00 pm</p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[var(--neutral)] pt-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-[var(--forest)]" />
            Leave by <span className="font-display font-bold">3:18 pm</span>
          </div>
          <span className="rounded-full bg-[var(--orange)]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[var(--orange)]">
            $100 ON THE LINE
          </span>
        </div>
      </div>
    </div>
  );
}

function Stake() {
  return (
    <section id="pricing" className="border-y border-[var(--neutral)] bg-[var(--neutral-card)]/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center font-mono text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
          The deal
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8">
          <div className="reveal rounded-3xl bg-[var(--bg)] p-10 ring-1 ring-[var(--neutral)]">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--forest)]">To use Go</p>
            <p className="font-display mt-4 text-[clamp(64px,10vw,128px)] font-bold leading-none tracking-tight">$0</p>
            <p className="mt-4 text-base text-[var(--ink)]/65">
              Unlimited calendar commitments. Voice roll call. Walking map. No subscription. No premium tier.
            </p>
          </div>
          <div className="reveal rounded-3xl bg-[var(--ink)] p-10 text-[var(--bg)]">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--orange)]">If you&apos;re late</p>
            <p className="font-display mt-4 text-[clamp(64px,10vw,128px)] font-bold leading-none tracking-tight text-[var(--orange)]">$100</p>
            <p className="mt-4 text-base text-[var(--bg)]/65">
              Charged silently when you miss the geofence by even a minute. Cancel ≥ 2 hours before for $25 — within 2 hours, also $100.
            </p>
          </div>
        </div>
        <p className="mt-10 mx-auto max-w-lg text-center text-sm text-[var(--ink)]/55">
          We make money from your failures. Which means we&apos;re aligned with you preventing them.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Connect",
      body: "Google Calendar + Apple Pay or your bank. Once, in under 90 seconds.",
    },
    {
      n: "02",
      title: "Commit",
      body: "Every morning, speak your day out loud. The app records each “yes” as binding evidence.",
    },
    {
      n: "03",
      title: "Walk",
      body: "The map fires a notification thirty minutes early. Follow the route. Hit the geofence on time.",
    },
    {
      n: "04",
      title: "Or pay",
      body: "Miss the geofence by a minute and the charge fires off-session. No appeals. That’s the point.",
    },
  ];
  return (
    <section id="how" className="bg-[var(--ink)] py-28 text-[var(--bg)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-[var(--orange)]">How it works</p>
          <h2 className="font-display mt-3 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-tight">
            Four steps.
            <br />
            No way around any of them.
          </h2>
        </div>
        <ol className="mt-16 grid gap-12 md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="reveal">
              <p className="font-mono text-sm font-medium tracking-widest text-[var(--orange)]">{s.n}</p>
              <p className="font-display mt-3 text-2xl font-semibold">{s.title}</p>
              <p className="mt-3 leading-relaxed text-[var(--bg)]/65">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MoneyMoves() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">How the money moves</p>
          <h2 className="font-display mt-3 text-[clamp(36px,4.5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Transparent on purpose.
          </h2>
        </div>
        <div className="mt-12 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowCard label="Card or bank linked" sub="via Stripe Setup­Intent (off-session)" />
          <Arrow />
          <FlowCard label="Arrival verified" sub="50m geofence around the building" highlight />
          <Arrow />
          <FlowCard label="$0 charged" sub="If you made it on time" subColor="forest" />
        </div>
        <div className="mt-3 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowCard label="Card or bank linked" sub="via Stripe Setup­Intent (off-session)" muted />
          <Arrow muted />
          <FlowCard label="Geofence missed" sub="GPS confirms you weren't there" muted />
          <Arrow muted />
          <FlowCard label="$100 charged" sub="Silent · automatic · no email" subColor="orange" />
        </div>
        <p className="mt-10 max-w-lg text-sm text-[var(--ink)]/55">
          We can&apos;t fake an arrival. You can&apos;t fake an arrival. The geofence is the only judge.
        </p>
      </div>
    </section>
  );
}

function FlowCard({
  label,
  sub,
  highlight = false,
  muted = false,
  subColor = "ink",
}: {
  label: string;
  sub: string;
  highlight?: boolean;
  muted?: boolean;
  subColor?: "ink" | "forest" | "orange";
}) {
  const subTint =
    subColor === "forest"
      ? "text-[var(--forest)]"
      : subColor === "orange"
      ? "text-[var(--orange)]"
      : "text-[var(--ink)]/55";
  return (
    <div
      className={`reveal rounded-2xl p-5 ring-1 ${
        highlight
          ? "bg-[var(--ink)] text-[var(--bg)] ring-[var(--ink)]"
          : muted
          ? "bg-[var(--neutral-card)]/50 ring-[var(--neutral)]"
          : "bg-[var(--bg)] ring-[var(--neutral)]"
      }`}
    >
      <p className={`font-display text-base font-semibold ${highlight ? "" : ""}`}>{label}</p>
      <p className={`mt-1 text-xs font-medium ${highlight ? "text-[var(--bg)]/70" : subTint}`}>{sub}</p>
    </div>
  );
}

function Arrow({ muted = false }: { muted?: boolean }) {
  return (
    <div className={`hidden items-center justify-center md:flex ${muted ? "text-[var(--ink)]/30" : "text-[var(--ink)]/50"}`}>
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
        <path d="M1 7H21M21 7L15 1M21 7L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function FounderNote() {
  return (
    <section className="bg-[var(--neutral-card)]/40 py-24">
      <div className="mx-auto max-w-2xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">A note from the founder</p>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--ink)]/85">
          <p>
            I&apos;ve tried alarms, calendar apps, accountability buddies, and every productivity system marketed at students. I was still late to class. Repeatedly. Embarrassingly.
          </p>
          <p>
            The thing that finally worked, for me, was money. A real charge — not a pop-up, not a streak I could ignore. Go is the cleanest implementation of that I could build. If it works for me, it might work for you.
          </p>
          <p className="text-base text-[var(--ink)]/60">
            — Naomi · Wesleyan &apos;27
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "What if I have a real emergency?",
      a: "You can cancel up to two hours before required arrival for $25. Inside two hours it&apos;s the full $100 — same as being late. We treat genuine emergencies the same as everyone else, because the moment we don&apos;t, every late arrival becomes an “emergency.”",
    },
    {
      q: "Can I just remove my card to dodge a charge?",
      a: "No. Removing a payment method triggers a 7-day lockup before it actually detaches. The bill clears before your card disappears. This is the anti-escape mechanism — it&apos;s why the app works.",
    },
    {
      q: "How do you know if I was late?",
      a: "GPS geofence. Your phone has to enter a 50-meter radius around the building before required-arrival time. We don&apos;t take your word for it; your phone&apos;s location services do.",
    },
    {
      q: "Where does the $100 go?",
      a: "During alpha, charges go to a holding account while we figure out the right destination. The frontrunner is an anti-charity — a cause you specifically don&apos;t support. Final answer ships before public launch.",
    },
    {
      q: "iOS only?",
      a: "For now, yes. Android once iOS is proven.",
    },
    {
      q: "Who built this?",
      a: "A Wesleyan student who kept being late. Built for herself first; opened up because every friend who saw the demo asked when they could have it.",
    },
  ];
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="max-w-xl">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">Reasonable questions</p>
          <h2 className="font-display mt-3 text-[clamp(40px,5vw,56px)] font-bold tracking-tight leading-[1.05]">
            We thought of these.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-[var(--neutral)] border-y border-[var(--neutral)]">
          {items.map((it) => (
            <details key={it.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-start justify-between gap-6 text-lg font-medium text-[var(--ink)]">
                {it.q}
                <span className="mt-1 text-[var(--ink)]/40 transition group-open:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p
                className="mt-4 max-w-2xl leading-relaxed text-[var(--ink)]/70"
                dangerouslySetInnerHTML={{ __html: it.a }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="waitlist" className="bg-[var(--ink)] py-28 text-[var(--bg)]">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-[clamp(40px,6vw,80px)] font-bold tracking-tight leading-[1]">
          Stop being late.
        </h2>
        <p className="mt-6 text-lg text-[var(--bg)]/65">
          Private alpha is open to a small batch of college students this semester.
        </p>
        <a
          href="mailto:hello@go-place.vercel.app?subject=go.%20waitlist&body=I%20want%20early%20access.%0A%0AName%3A%0ASchool%3A%0AWhy%3A"
          className="mt-10 inline-block rounded-full bg-[var(--orange)] px-10 py-4 text-base font-semibold text-[var(--ink)] hover:bg-[var(--orange)]/90 transition"
        >
          Request an invite →
        </a>
        <p className="mt-4 text-xs text-[var(--bg)]/40">We reply within 48 hours.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--neutral)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8 text-sm text-[var(--ink)]/55">
        <Wordmark className="text-lg text-[var(--ink)]" />
        <div className="flex flex-wrap gap-6">
          <a href="#faq" className="hover:text-[var(--ink)]">FAQ</a>
          <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
          <a href="https://github.com/thegirwhocodes/Go" className="hover:text-[var(--ink)]">Source</a>
        </div>
        <span className="font-mono text-xs">© 2026 go.</span>
      </div>
    </footer>
  );
}
