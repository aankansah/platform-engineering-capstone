import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Priority, TaskPayload } from '../types'

type TaskFormProps = {
  task: TaskPayload
  setTask: Dispatch<SetStateAction<TaskPayload>>
  isSubmitting: boolean
  submitMessage: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function TaskForm({
  task,
  setTask,
  isSubmitting,
  submitMessage,
  onSubmit,
}: TaskFormProps) {
  const payloadPreview: TaskPayload = {
    taskId: task.taskId,
    name: task.name,
    description: task.description,
    priority: task.priority,
  }

  return (
    <form className="flex h-full min-h-0 flex-col" onSubmit={onSubmit}>
      <div className="border-b border-slate-200/70 px-5 py-5">
        <h2 className="text-xl font-semibold text-slate-950">Create Task</h2>
        <p className="mt-1 text-sm text-slate-600">
          Payload is posted to <span className="font-mono">/tasks</span>.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Task ID
          </span>
          <input
            className="w-full rounded-xl border border-[#c8d8e3] bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none ring-blue-400 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
            value={task.taskId}
            onChange={(event) =>
              setTask((currentTask) => ({
                ...currentTask,
                taskId: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </span>
          <input
            className="w-full rounded-xl border border-[#c8d8e3] bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none ring-blue-400 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
            value={task.name}
            onChange={(event) =>
              setTask((currentTask) => ({
                ...currentTask,
                name: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="mb-4 flex min-h-44 flex-1 flex-col">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </span>
          <textarea
            className="min-h-36 flex-1 resize-none rounded-xl border border-[#c8d8e3] bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none ring-blue-400 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
            value={task.description}
            onChange={(event) =>
              setTask((currentTask) => ({
                ...currentTask,
                description: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Priority
          </span>
          <select
            className="w-full rounded-xl border border-[#c8d8e3] bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none ring-blue-400 transition focus:border-blue-500 focus:ring-2"
            value={task.priority}
            onChange={(event) =>
              setTask((currentTask) => ({
                ...currentTask,
                priority: event.target.value as Priority,
              }))
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <pre className="mt-5 overflow-auto rounded-xl border border-[#c8d8e3] bg-[#f7fbff] p-4 text-xs font-semibold leading-5 text-blue-950 shadow-inner">
          {JSON.stringify(payloadPreview, null, 2)}
        </pre>
      </div>

      <div className="border-t border-slate-200 bg-white p-5">
        <button
          className="w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Task'}
        </button>

        {submitMessage && (
          <p className="mt-4 rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700">
            {submitMessage}
          </p>
        )}
      </div>
    </form>
  )
}
