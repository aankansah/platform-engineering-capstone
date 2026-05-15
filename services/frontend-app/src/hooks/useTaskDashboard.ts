import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useCreateTaskMutation } from './useCreateTaskMutation'
import { useEventsQuery } from './useEventsQuery'
import type { TaskPayload } from '../types'

const defaultTask: TaskPayload = {
  taskId: 'task-123',
  name: 'Process Customer Data',
  description: 'Validate, enrich, and publish customer processing status.',
  priority: 'high',
}

export function useTaskDashboard() {
  const [task, setTask] = useState<TaskPayload>(defaultTask)
  const {
    events,
    eventsError,
    lastUpdated,
    prependEvent,
    refetchEvents,
  } = useEventsQuery()
  const {
    isSubmitting,
    submitMessage,
    submitTask: createTask,
  } = useCreateTaskMutation()

  const taskEvents = useMemo(() => {
    return events.filter((event) => !event.taskId || event.taskId === task.taskId)
  }, [events, task.taskId])

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const submitted = await createTask(task)

    if (!submitted) {
      return
    }

    prependEvent({
      id: `${task.taskId}-submitted-${Date.now()}`,
      taskId: task.taskId,
      service: 'Frontend',
      status: 'submitted',
      message: `${task.name} queued with ${task.priority} priority.`,
      description: task.description,
      priority: task.priority,
      timestamp: new Date().toISOString(),
    })
    void refetchEvents()
  }

  return {
    eventsError,
    isSubmitting,
    lastUpdated,
    setTask,
    submitMessage,
    submitTask,
    task,
    taskEvents,
  }
}
