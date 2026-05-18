import type { TimelineEvent } from '../types'

type TimelineItemProps = {
  event: TimelineEvent
  index: number
  onSelect?: () => void
}

export function TimelineItem({ event, index, onSelect }: TimelineItemProps) {
  const status = String(event.status ?? 'event')
  const service = String(event.service ?? 'Pipeline')
  const message = String(event.message ?? 'Task status updated.')
  const timestamp = event.timestamp
    ? new Date(event.timestamp).toLocaleString()
    : 'Timestamp pending'

  return (
    <li className="grid grid-cols-[24px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <span className="flex size-6 items-center justify-center rounded-full border border-white/80 bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-900/20">
          {index + 1}
        </span>
        <span className="mt-2 h-full w-px bg-blue-200" />
      </div>
      <article className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">{service}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
              {message}
            </p>
          </div>
          <span className="w-fit rounded-full border border-blue-200 bg-white px-2 py-1 text-xs font-semibold uppercase text-blue-700">
            {status}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-semibold">{timestamp}</span>
          <button
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
            onClick={onSelect}
            title="View event detail"
            type="button"
          >
            <EyeIcon />
          </button>
        </div>
      </article>
    </li>
  )
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
