type ProjectInfoFabProps = {
  onClick: () => void
}

export function ProjectInfoFab({ onClick }: ProjectInfoFabProps) {
  return (
    <button
      className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full border border-white/30 bg-gradient-to-r from-[#151c2f] via-[#12263a] to-[#0d3a42] px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-slate-950/30 transition hover:-translate-y-1 hover:shadow-slate-950/40"
      onClick={onClick}
      type="button"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-lg shadow-inner">
        i
      </span>
      <span>Read More</span>
    </button>
  )
}
