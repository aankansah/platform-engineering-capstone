import { useCallback, useState } from 'react'
import { createTask } from '../api/queries/tasks'
import type { TaskPayload } from '../types'

export function useCreateTaskMutation() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const submitTask = useCallback(async (task: TaskPayload) => {
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      await createTask(task)
      setSubmitMessage('Task submitted to the processing pipeline.')
      return true
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : 'Unable to submit task',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    isSubmitting,
    submitMessage,
    submitTask,
  }
}
