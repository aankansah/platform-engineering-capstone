import type { TimelineEvent } from '../types'

type EventDetailsProps = {
  event: TimelineEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsProps) {
  if (!isOpen || !event) {
    return null
  }

  const title = String(event.title ?? event.name ?? 'Event detail')
  const message = String(event.message ?? 'Task status updated.')
  const status = String(event?.status ?? '-')
  const priority = String(event?.priority ?? '-')
  const service = String(event?.service ?? '-')
  const taskId = String(event?.taskId ?? '-')
  const timestamp = event?.timestamp
    ? new Date(event.timestamp).toLocaleString()
    : '-'
  const enrichmentDetails = getEnrichmentDetails(event)

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
    >
      <section
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/50 bg-white shadow-2xl shadow-slate-950/30"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-[#f7fbff] px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Event Detail
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {message}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase text-blue-700">
                {status}
              </span>
              <button
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white"
                onClick={onClose}
                type="button"
              >
                x
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid gap-4">
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Detail label="Task ID" value={taskId} mono />
              <Detail label="Service" value={service} />
              <Detail label="Priority" value={priority} />
              <Detail label="Time" value={timestamp} />
            </dl>

            {event?.description ? (
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Description
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {String(event.description)}
                </p>
              </section>
            ) : null}

            {enrichmentDetails.length > 0 ? (
              <section className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Enrichment Added
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {enrichmentDetails.map((detail) => (
                    <Detail
                      key={detail.label}
                      label={detail.label}
                      value={detail.value}
                    />
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

function getEnrichmentDetails(event: TimelineEvent) {
  const metadata =
    event.metadata && typeof event.metadata === 'object'
      ? (event.metadata as Record<string, unknown>)
      : {}

  return [
    ['Category', event.category],
    ['Priority Rank', metadata.priorityRank],
    ['Estimated Effort', metadata.estimatedEffort],
    ['Description Words', metadata.descriptionWordCount],
    ['Description Chars', metadata.descriptionLength],
    ['Name Chars', metadata.nameLength],
    ['Enriched By', event.enrichedBy],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => ({
      label: String(label),
      value: String(value),
    }))
}

function Detail({
  label,
  mono,
  value,
}: {
  label: string
  mono?: boolean
  value: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f7fbff] p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-2 break-words text-sm font-semibold text-slate-950 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
