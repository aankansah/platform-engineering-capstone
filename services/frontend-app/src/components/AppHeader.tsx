type AppHeaderProps = {
  eventsError: string
}

export function AppHeader({ eventsError }: AppHeaderProps) {
  const hasEventsError = Boolean(eventsError)
  const statusLabel = hasEventsError
    ? 'Events API unreachable'
    : 'Event stream healthy'
  const statusTone = hasEventsError
    ? 'bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.9)]'
    : 'bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.85)]'

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-950 via-[#081426] to-[#06111f] px-5 shadow-xl shadow-slate-950/25 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <img className="size-8" src="/favicon.svg" alt="App logo" />
        <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
          Polyglot Task Pipeline
        </span>
        <span className="hidden h-5 w-px bg-white/30 sm:block" />
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 sm:flex">
        <span className={`size-2.5 animate-pulse rounded-full ${statusTone}`} />
        {statusLabel}
      </div>
    </header>
  )
}
