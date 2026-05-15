import { API_BASE_URL } from '../../config/constants'
import type { TaskPayload } from '../../types'

export async function createTask(task: TaskPayload) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error(`Task submission failed with ${response.status}`)
  }
}
