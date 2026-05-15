import { API_BASE_URL } from '../../config/constants'
import type { TimelineEvent } from '../../types'

type EventsResponse = TimelineEvent[] | { events?: TimelineEvent[] }

export async function getEvents() {
  const response = await fetch(`${API_BASE_URL}/events`)

  if (!response.ok) {
    throw new Error(`Events request failed with ${response.status}`)
  }

  const data = (await response.json()) as EventsResponse

  return Array.isArray(data) ? data : data.events ?? []
}
