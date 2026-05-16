export type Priority = 'low' | 'medium' | 'high'

export type TaskPayload = {
  name: string
  description: string
  priority: Priority
}

export type TimelineEvent = {
  id?: string
  taskId?: string
  service?: string
  status?: string
  message?: string
  timestamp?: string
  priority?: Priority
  [key: string]: unknown
}
