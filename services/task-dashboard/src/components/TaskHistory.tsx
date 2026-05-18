import type { TimelineEvent } from '../types'

type TaskHistoryProps = {
  tasks: TimelineEvent[]
}

export function TaskHistory({ tasks }: TaskHistoryProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#d2e4ea] bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#f7fbff] px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Submitted Tasks
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Task History
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Every submitted task appears here while processing events continue in
          the event log.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {tasks.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-[#bdd4dd] bg-[#f4fafb] px-6 text-center">
            <div>
              <p className="text-base font-semibold text-slate-800">
                No tasks submitted yet
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create a task from the form to see it listed here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {tasks.map((task, index) => (
              <article
                className="w-full p-5 transition hover:bg-blue-50/45"
                key={`${task.taskId ?? 'task'}-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {String(task.name ?? task.title ?? 'Untitled task')}
                  </h3>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700">
                    {String(task.priority ?? '-')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {String(task.description ?? 'No description provided.')}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
