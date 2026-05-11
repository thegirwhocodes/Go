import Link from 'next/link';

export const metadata = {
  title: 'Class on Time — show up 30 minutes early or pay $100',
  description:
    'A commitment-device app. Connect your calendar, walk to class 30 min early, or get charged $100 every time you’re late. Mapbox 3D sprite map. Voice-driven daily check-in.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 text-amber-950">
      <Nav />
      <Hero />
      <HowItWorks />
      <Honesty />
      <Waitlist />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <span className="text-xl font-black tracking-tight">🌳 Class on Time</span>
      <Link
        href="#waitlist"
        className="rounded-full bg-amber-900 px-5 py-2 text-sm font-bold text-amber-50 hover:bg-amber-800"
      >
        join the alpha
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
      <h1 className="text-6xl font-black tracking-tight leading-[1.05] sm:text-7xl md:text-8xl">
        show up <span className="underline decoration-orange-400 decoration-8 underline-offset-8">30 min early.</span>
        <br />
        or pay $100.
      </h1>
      <p className="mx-auto mt-8 max-w-2xl text-xl text-amber-900/80 leading-relaxed">
        Class on Time reads your calendar, walks with you to class, and quietly charges you when you don’t make it. The honest commitment device — built because nothing else worked.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="#waitlist"
          className="rounded-full bg-amber-900 px-7 py-3 text-base font-bold text-amber-50 hover:bg-amber-800"
        >
          join the waitlist →
        </Link>
        <Link
          href="#how"
          className="rounded-full border-2 border-amber-900/30 px-7 py-3 text-base font-bold text-amber-900 hover:bg-amber-100"
        >
          how it works
        </Link>
      </div>
      <Sprite />
    </section>
  );
}

function Sprite() {
  return (
    <div className="mt-16 mx-auto max-w-3xl">
      <div className="rounded-[2.5rem] border-4 border-amber-900/20 bg-gradient-to-b from-orange-200 via-amber-200 to-yellow-100 p-8 shadow-2xl">
        <div className="flex items-center justify-between text-7xl">
          <span title="you">🧍‍♀️</span>
          <span className="text-2xl text-amber-900/60">— walking —</span>
          <span title="olin library">🏛️</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm font-mono text-amber-900/70">
          <div className="rounded-2xl bg-amber-50/70 p-3 text-center">
            <div className="text-2xl">🗓️</div>
            <div className="mt-1">Econ 333</div>
            <div>4:00 pm</div>
          </div>
          <div className="rounded-2xl bg-amber-50/70 p-3 text-center">
            <div className="text-2xl">⏰</div>
            <div className="mt-1">leave by</div>
            <div className="font-bold text-amber-950">3:18 pm</div>
          </div>
          <div className="rounded-2xl bg-amber-50/70 p-3 text-center">
            <div className="text-2xl">💸</div>
            <div className="mt-1">on the line</div>
            <div className="font-bold text-amber-950">$100</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-orange-100 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-4xl font-black tracking-tight">how it works</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          <Step n="1" title="connect" body="Google Calendar + Apple Pay or your bank. One-time setup, 90 seconds." />
          <Step n="2" title="commit" body="Each morning the app asks out loud: are you still going to today's classes? You answer by voice." />
          <Step n="3" title="walk" body="A cartoon 3D map walks with you. Get to the building 30 min early. Be late → $100 charged silently." />
        </ol>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-3xl bg-amber-50 p-6">
      <div className="text-3xl font-black text-orange-500">{n}</div>
      <div className="mt-2 text-2xl font-black">{title}</div>
      <p className="mt-3 text-amber-900/80 leading-relaxed">{body}</p>
    </li>
  );
}

function Honesty() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-4xl font-black tracking-tight">the honest part</h2>
      <div className="mt-6 space-y-4 text-lg text-amber-900/90 leading-relaxed">
        <p>
          You can&apos;t lie to it. GPS verifies you got there. You can&apos;t cancel-for-free either — cancelling within 2 hours of class is the same $100. Cancelling earlier costs $25.
        </p>
        <p>
          You can&apos;t remove your card to escape a charge — there&apos;s a 7-day lockup before a payment method detaches. Plenty of time for the bill to clear.
        </p>
        <p className="text-amber-700 italic">
          The point of a commitment device is that you can&apos;t talk yourself out of it later. Designed mean on purpose.
        </p>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" className="bg-amber-900 py-20 text-amber-50">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-4xl font-black tracking-tight">join the alpha</h2>
        <p className="mt-4 text-lg text-amber-100/80">
          iOS only for now. TestFlight invites going out to Wesleyan students first.
        </p>
        <a
          href="mailto:nivie@wesleyan.edu?subject=Class%20on%20Time%20alpha&body=Hi%20Naomi%20%E2%80%94%20I%27d%20like%20a%20TestFlight%20invite."
          className="mt-8 inline-block rounded-full bg-orange-400 px-8 py-4 text-lg font-bold text-amber-950 hover:bg-orange-300"
        >
          email naomi for an invite →
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-amber-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>built by naomi @ wesleyan · 2026</span>
        <span className="font-mono">
          api: <code>{`/api/*`}</code> · source:{' '}
          <a
            className="underline hover:text-amber-900"
            href="https://github.com/thegirwhocodes/Go"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </span>
      </div>
    </footer>
  );
}
