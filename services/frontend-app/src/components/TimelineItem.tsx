import type { TimelineEvent } from '../types'

type TimelineItemProps = {
  event: TimelineEvent
  index: number
}

export function TimelineItem({ event, index }: TimelineItemProps) {
  const status = String(event.status ?? 'event')
  const service = String(event.service ?? 'Pipeline')
  const message = String(event.message ?? 'Task status updated.')
  const timestamp = event.timestamp
    ? new Date(event.timestamp).toLocaleString()
    : 'Timestamp pending'

  return (
    <li className="grid grid-cols-[32px_1fr] gap-4">
      <div className="flex flex-col items-center">
        <span className="flex size-8 items-center justify-center rounded-full border border-white/80 bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-900/20">
          {index + 1}
        </span>
        <span className="mt-2 h-full w-px bg-blue-200" />
      </div>
      <article className="rounded-xl border border-white/70 bg-white/70 p-4 shadow-lg shadow-blue-950/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">{service}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{message}</p>
          </div>
          <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {status}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
          <div>
            <dt className="uppercase tracking-wide">Task</dt>
            <dd className="mt-1 font-mono font-semibold text-slate-800">
              {event.taskId ?? '-'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide">Priority</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {event.priority ?? '-'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide">Time</dt>
            <dd className="mt-1 font-semibold text-slate-800">{timestamp}</dd>
          </div>
        </dl>
      </article>
    </li>
  )
}
