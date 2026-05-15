import type { TimelineEvent } from '../types'
import { TimelineItem } from './TimelineItem'

type TimelineProps = {
  events: TimelineEvent[]
  eventsError: string
  lastUpdated: Date | null
}

export function Timeline({ events, eventsError, lastUpdated }: TimelineProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#d2e4ea] bg-white shadow-sm">
      <div className="flex flex-col gap-3 bg-gradient-to-r from-[#151c2f] via-[#10273b] to-[#0b3441] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Processing Timeline
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Auto-refreshes every 2 seconds from{' '}
            <span className="font-mono">/events</span>.
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

        {events.length === 0 ? (
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
          <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto">
            {events.map((event, index) => (
              <TimelineItem
                event={event}
                index={index}
                key={eventKey(event, index)}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

function eventKey(event: TimelineEvent, index: number) {
  return String(event.id ?? `${event.taskId ?? 'event'}-${event.timestamp ?? index}`)
}
