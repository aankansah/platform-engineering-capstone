import { useCallback, useEffect, useState } from 'react'
import { getEvents } from '../api/queries/events'
import { EVENTS_REFRESH_INTERVAL_MS } from '../config/constants'
import type { TimelineEvent } from '../types'

export function useEventsQuery() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [eventsError, setEventsError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refetchEvents = useCallback(async () => {
    try {
      const nextEvents = await getEvents()

      setEvents(nextEvents)
      setEventsError('')
      setLastUpdated(new Date())
    } catch (error) {
      setEventsError(
        error instanceof Error ? error.message : 'Unable to load events',
      )
    }
  }, [])

  const prependEvent = useCallback((event: TimelineEvent) => {
    setEvents((currentEvents) => [event, ...currentEvents])
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refetchEvents()
    }, 0)
    const intervalId = window.setInterval(() => {
      void refetchEvents()
    }, EVENTS_REFRESH_INTERVAL_MS)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [refetchEvents])

  return {
    events,
    eventsError,
    lastUpdated,
    prependEvent,
    refetchEvents,
  }
}
