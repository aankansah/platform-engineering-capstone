export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const EVENTS_REFRESH_INTERVAL_MS = Number(
  import.meta.env.VITE_EVENTS_REFRESH_INTERVAL_MS ?? 2000,
)
