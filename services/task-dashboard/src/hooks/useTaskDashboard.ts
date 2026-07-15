import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useCreateTaskMutation } from './useCreateTaskMutation'
import { useEventsQuery } from './useEventsQuery'
import type { TaskPayload, TimelineEvent } from '../types'

const defaultTask: TaskPayload = {
  name: '',
  description: '',
  priority: 'medium',
}

export function useTaskDashboard() {
  const [task, setTask] = useState<TaskPayload>(defaultTask)
  const [selectedEventId, setSelectedEventId] = useState('')
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

  const tasks = useMemo(() => {
    const byTaskId = new Map<string, TimelineEvent>()

    for (const event of [...events].reverse()) {
      if (!event.taskId) {
        continue
      }

      const current = byTaskId.get(event.taskId)
      byTaskId.set(event.taskId, {
        ...current,
        ...event,
        title: current?.title ?? event.title ?? event.name,
        name: current?.name ?? event.name ?? event.title,
        description: current?.description ?? event.description,
        priority: current?.priority ?? event.priority,
      })
    }

    return Array.from(byTaskId.values()).reverse()
  }, [events])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) {
      return null
    }

    return events.find((event, index) => eventKey(event, index) === selectedEventId) ?? null
  }, [events, selectedEventId])

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const submitted = await createTask(task)

    if (!submitted) {
      return
    }

    const localEvent: TimelineEvent = {
      id: `${submitted.taskId}-submitted-${Date.now()}`,
      taskId: submitted.taskId,
      service: 'Frontend',
      status: 'SUBMITTED',
      message: `${submitted.name} submitted from dashboard.`,
      title: submitted.name,
      name: submitted.name,
      description: submitted.description,
      priority: submitted.priority,
      timestamp: new Date().toISOString(),
    }

    prependEvent(localEvent)
    setTask(defaultTask)
    void refetchEvents()
  }

  return {
    eventsError,
    isSubmitting,
    lastUpdated,
    setTask,
    selectedEvent,
    setSelectedEventId,
    submitMessage,
    submitTask,
    task,
    tasks,
    events,
  }
}

export function eventKey(event: TimelineEvent, index: number) {
  return String(event.id ?? `${event.taskId ?? 'event'}-${event.service ?? 'service'}-${event.timestamp ?? index}`)
}
