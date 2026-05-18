export function WelcomeAlert() {
  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-950">
            <span className="text-2xl font-bold">Welcome</span> to the capstone control room.
          </p>
          <p className="mt-1 leading-6 text-slate-600 font-medium">
            Submit a task, follow the event timeline, and use the project info
            button to explore the platform architecture.
          </p>
        </div>
        <span className="w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Live Workflow
        </span>
      </div>
    </section>
  )
}
