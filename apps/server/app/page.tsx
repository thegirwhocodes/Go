import Link from 'next/link';

export const metadata = {
  title: 'Class on Time — the commitment device for showing up.',
  description:
    'Class on Time reads your calendar, walks you to class 30 minutes early, and charges you $100 every time you’re late. The honest accountability app for people who keep failing themselves.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 text-amber-950 antialiased">
      <Nav />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-amber-50/80 border-b border-amber-900/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-lg font-black tracking-tight">Class on Time</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-amber-900/80">
          <a href="#features" className="hover:text-amber-950">Features</a>
          <a href="#how" className="hover:text-amber-950">How it works</a>
          <a href="#pricing" className="hover:text-amber-950">Pricing</a>
          <a href="#faq" className="hover:text-amber-950">FAQ</a>
        </nav>
        <Link
          href="#waitlist"
          className="rounded-full bg-amber-950 px-5 py-2 text-sm font-bold text-amber-50 hover:bg-amber-900 transition"
        >
          Join waitlist
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold text-orange-900 mb-8">
        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        Now in private alpha
      </div>
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.02]">
        Show up early.
        <br />
        <span className="text-orange-500">Or pay $100.</span>
      </h1>
      <p className="mx-auto mt-8 max-w-2xl text-xl text-amber-900/80 leading-relaxed">
        Class on Time is a commitment device for people who keep failing themselves. We connect to your calendar, walk you to class 30 minutes early, and charge you $100 every time you don&apos;t make it. No exceptions, no excuses, no escape.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="#waitlist"
          className="rounded-full bg-amber-950 px-8 py-4 text-base font-bold text-amber-50 hover:bg-amber-900 transition shadow-lg"
        >
          Get early access →
        </Link>
        <Link
          href="#how"
          className="rounded-full border-2 border-amber-950/20 px-8 py-4 text-base font-bold text-amber-950 hover:bg-amber-100 transition"
        >
          See how it works
        </Link>
      </div>
      <ProductShot />
    </section>
  );
}

function ProductShot() {
  return (
    <div className="mt-20 mx-auto max-w-4xl">
      <div className="rounded-[2.5rem] border-4 border-amber-900/15 bg-gradient-to-b from-orange-200 via-amber-200 to-yellow-100 p-10 shadow-2xl">
        <div className="flex items-center justify-between text-8xl">
          <span title="you" className="drop-shadow-lg">🧍‍♀️</span>
          <span className="text-base font-mono text-amber-900/50 tracking-widest">— 12 MIN WALK —</span>
          <span title="library" className="drop-shadow-lg">🏛️</span>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-sm font-mono text-amber-900/70">
          <div className="rounded-2xl bg-amber-50/80 p-4 text-center backdrop-blur">
            <div className="text-3xl">🗓️</div>
            <div className="mt-2 text-xs uppercase tracking-wide">Next class</div>
            <div className="font-bold text-amber-950 mt-1">Econ 333</div>
            <div className="text-xs">4:00 pm</div>
          </div>
          <div className="rounded-2xl bg-amber-50/80 p-4 text-center backdrop-blur">
            <div className="text-3xl">⏰</div>
            <div className="mt-2 text-xs uppercase tracking-wide">Leave by</div>
            <div className="font-bold text-amber-950 mt-1">3:18 pm</div>
            <div className="text-xs">in 42 min</div>
          </div>
          <div className="rounded-2xl bg-amber-50/80 p-4 text-center backdrop-blur">
            <div className="text-3xl">💸</div>
            <div className="mt-2 text-xs uppercase tracking-wide">On the line</div>
            <div className="font-bold text-amber-950 mt-1">$100</div>
            <div className="text-xs">if late</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-amber-900/10 bg-amber-100/40 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-amber-900/60 mb-8">
          Built on tools you trust
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-amber-900/70 font-semibold">
          <span>Stripe</span>
          <span>Apple Pay</span>
          <span>Google Calendar</span>
          <span>Mapbox</span>
          <span>iOS</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: '🗓️',
      title: 'Calendar-native',
      body: 'Connect Google Calendar once. Every class, exam, and meeting becomes a commitment automatically. No manual setup.',
    },
    {
      icon: '🗣️',
      title: 'Voice roll call',
      body: 'Every morning at 7am, the app asks you out loud: are you going to today’s classes? You answer by voice. Audio saved as proof.',
    },
    {
      icon: '🗺️',
      title: 'Live walking map',
      body: 'A cartoon 3D map of your campus walks alongside you. GPS-verified arrival — you can’t fake being there.',
    },
    {
      icon: '💸',
      title: 'Automatic penalty',
      body: 'Late? $100 charged silently via Apple Pay or your bank. Cancel early ($25) or late ($100). Same money either way.',
    },
    {
      icon: '🔒',
      title: 'No escape',
      body: 'You can’t remove your card to dodge a charge. A 7-day lockup means the bill clears before the method detaches.',
    },
    {
      icon: '🧠',
      title: 'Learns your places',
      body: '“Gym” means Freeman the first time you confirm it. After that, the app remembers — every commitment routes correctly.',
    },
  ];
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Features</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight">
            Designed so you can&apos;t talk yourself out of it.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="rounded-3xl bg-orange-50 p-7 border border-amber-900/5 hover:border-orange-300 transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-black">{f.title}</h3>
              <p className="mt-2 text-amber-900/80 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Connect', body: 'Google Calendar + a payment method. Apple Pay works in 30 seconds; ACH via your bank in 90.' },
    { n: '02', title: 'Commit', body: 'Each morning, speak your day out loud. The app records every “yes” and saves it as evidence.' },
    { n: '03', title: 'Walk', body: 'The map fires a notification 30 minutes before required arrival. Follow the route, hit the geofence on time — pay nothing.' },
    { n: '04', title: 'Or pay', body: 'Miss the geofence by even a minute, and $100 is charged off-session. No notifications. No appeals. That’s the point.' },
  ];
  return (
    <section id="how" className="bg-amber-900 text-amber-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-300">How it works</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight">
            Four steps. No way around any of them.
          </h2>
        </div>
        <ol className="grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n}>
              <div className="font-mono text-sm font-bold text-orange-300 tracking-wider">{s.n}</div>
              <div className="mt-2 text-2xl font-black">{s.title}</div>
              <p className="mt-3 text-amber-100/80 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Pricing</p>
        <h2 className="mt-3 text-5xl font-black tracking-tight">Free to start. $100 if you fail.</h2>
        <p className="mt-6 text-lg text-amber-900/80">
          You only pay when you don&apos;t show up. No subscription, no monthly fee, no premium tier. The app makes money from your future failures — which means we&apos;re aligned with you preventing them.
        </p>
        <div className="mt-12 rounded-3xl border-4 border-amber-950/10 bg-amber-100/40 p-10 text-left">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-amber-950/10 pb-6">
            <h3 className="text-3xl font-black">Class on Time</h3>
            <div>
              <span className="text-5xl font-black">$0</span>
              <span className="text-amber-900/60">/mo</span>
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-amber-950">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Unlimited calendar commitments tracked</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Voice-driven morning roll call</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>3D walking map with departure alerts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-900 font-bold mt-0.5">$100</span>
              <span>per late arrival or no-show, charged automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-900 font-bold mt-0.5">$25</span>
              <span>per cancellation made more than 2 hours before</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: 'What if I get sick or have a real emergency?',
      a: 'You can cancel any commitment up to 2 hours before required arrival for $25. Same-day cancellations within 2 hours are treated as no-shows ($100). The point of a commitment device is that even genuine reasons cost something — otherwise people use "emergency" as a loophole.',
    },
    {
      q: 'Can I just remove my payment method to dodge a charge?',
      a: 'No. Removing a payment method triggers a 7-day lockup before it actually detaches. That gives the app plenty of time to settle outstanding charges before your method disappears. This is the core anti-escape mechanism — it’s why the app works.',
    },
    {
      q: 'How do you know if I was actually late?',
      a: 'GPS geofence. Your phone has to enter a 50-meter radius around the building before required-arrival time. We don’t take your word for it — your phone’s location services confirm it, recorded and timestamped.',
    },
    {
      q: 'Where does my $100 go?',
      a: 'During alpha, charges go to a holding account while we figure out the right answer. The frontrunner is donating it to a charity you specifically don’t support — the standard "anti-charity" pattern from StickK. Final answer comes before public launch.',
    },
    {
      q: 'iOS only?',
      a: 'For now, yes. Android is on the roadmap once we’ve proven the iOS version works at scale.',
    },
    {
      q: 'Who built this?',
      a: 'A Wesleyan University student who kept being late to class and ran out of self-improvement tricks. Built for herself first; opening up because the friends who saw the demo all asked when they could have it.',
    },
  ];
  return (
    <section id="faq" className="bg-orange-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">FAQ</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight">Reasonable questions.</h2>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <details key={item.q} className="group rounded-2xl bg-white border border-amber-900/10 p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold">
                {item.q}
                <span className="text-amber-900/40 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-4 text-amber-900/80 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="waitlist" className="bg-amber-950 py-24 text-amber-50">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-5xl font-black tracking-tight">Stop being late to class.</h2>
        <p className="mt-6 text-xl text-amber-100/80">
          Private alpha is open to a small batch of college students this semester. Get on the waitlist for an invite.
        </p>
        <a
          href="mailto:hello@classontime.app?subject=Class%20on%20Time%20waitlist&body=I%20want%20early%20access.%0A%0AName%3A%0ASchool%3A%0AWhy%3A"
          className="mt-10 inline-block rounded-full bg-orange-400 px-10 py-4 text-lg font-black text-amber-950 hover:bg-orange-300 transition shadow-xl"
        >
          Request an invite →
        </a>
        <p className="mt-4 text-sm text-amber-200/60">
          We&apos;ll get back within 48 hours.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-amber-900/10 bg-amber-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <span className="text-base font-black">Class on Time</span>
            </div>
            <p className="mt-3 text-sm text-amber-900/60 max-w-xs">
              The commitment device for showing up. Built honestly, designed mean.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-semibold text-amber-900/80">
            <a href="#features" className="hover:text-amber-950">Features</a>
            <a href="#how" className="hover:text-amber-950">How it works</a>
            <a href="#pricing" className="hover:text-amber-950">Pricing</a>
            <a href="#faq" className="hover:text-amber-950">FAQ</a>
            <a href="#waitlist" className="hover:text-amber-950">Waitlist</a>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-amber-900/10 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900/50">
          <span>© 2026 Class on Time</span>
          <span className="font-mono">classontime.app</span>
        </div>
      </div>
    </footer>
  );
}
