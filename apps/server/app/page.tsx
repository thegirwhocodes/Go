export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-amber-50">
      <h1 className="text-5xl font-black tracking-tight text-amber-900">Class on Time</h1>
      <p className="max-w-md text-center text-amber-800">
        Show up 30 minutes early to every class, every time. Or pay $100. Your choice.
      </p>
      <div className="text-sm text-amber-700/80">
        This is the server side. The app lives in <code>apps/mobile</code>.
      </div>
    </main>
  );
}
