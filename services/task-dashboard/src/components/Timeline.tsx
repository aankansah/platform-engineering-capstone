import type { TimelineEvent } from '../types'
import { TimelineItem } from './TimelineItem'

type TimelineProps = {
  events: TimelineEvent[]
  eventsError: string
  lastUpdated: Date | null
  onSelectEvent?: (eventId: string) => void
}

export function Timeline({
  events,
  eventsError,
  lastUpdated,
  onSelectEvent,
}: TimelineProps) {
  const groups = groupEvents(events)

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#d2e4ea] bg-white shadow-sm">
      <div className="flex flex-col gap-3 bg-[#151c2f] px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Event Log</h2>
          <p className="mt-1 text-sm text-slate-300">
            Auto-refreshes every 2 seconds from{' '}
            <span className="font-mono">/api/events</span>.
          </p>
        </div>
        <div className="w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : 'Waiting for events'}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-5">
        {eventsError && (
          <div className="mb-5 rounded-xl border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800">
            {eventsError}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="flex min-h-64 flex-1 items-center justify-center rounded-lg border border-dashed border-[#bdd4dd] bg-[#f4fafb] px-6 text-center">
            <div>
              <p className="text-base font-semibold text-slate-800">
                No timeline events yet
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Submit a task, then the Java validator and Rust processor events
                will appear here as the API consumes them.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
            {groups.map((group) => (
              <section
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                key={group.taskId}
              >
                <div className="mb-3 rounded-md bg-white px-3 py-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">
                    {group.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="min-w-0 truncate font-mono">
                      {group.taskId}
                    </span>
                    {group.taskId !== 'ungrouped' && (
                      <button
                        className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                        onClick={() => copyText(group.taskId)}
                        title="Copy task ID"
                        type="button"
                      >
                        <ClipboardIcon />
                      </button>
                    )}
                  </div>
                </div>
                <ol className="space-y-3">
                  {group.events.map((event, index) => (
                    <TimelineItem
                      event={event}
                      index={index}
                      key={eventKey(event, index)}
                      onSelect={() => onSelectEvent?.(eventKey(event, index))}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function eventKey(event: TimelineEvent, index: number) {
  return String(event.id ?? `${event.taskId ?? 'event'}-${event.service ?? 'service'}-${event.timestamp ?? index}`)
}

function groupEvents(events: TimelineEvent[]) {
  const groups = new Map<string, { taskId: string; title: string; events: TimelineEvent[] }>()

  for (const event of events) {
    const taskId = String(event.taskId ?? 'ungrouped')
    const group = groups.get(taskId) ?? {
      taskId,
      title: 'Untitled task',
      events: [],
    }
    const title = event.name ?? event.title

    if (title && group.title === 'Untitled task') {
      group.title = String(title)
    }

    group.events.push(event)
    groups.set(taskId, group)
  }

  return Array.from(groups.values())
}

async function copyText(value: string) {
  await navigator.clipboard?.writeText(value)
}

function ClipboardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 5h6" />
      <path d="M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z" />
      <path d="M8 6h8" />
    </svg>
  )
}
