import { SOURCES, type Source } from '../types/models'

const KEY = 'acq_source'

/** Capture ?source= on first landing and persist for the session (Manual §3.1). */
export function captureSource(): Source {
  const param = new URLSearchParams(window.location.search).get('source')
  if (param && (SOURCES as readonly string[]).includes(param)) {
    try { sessionStorage.setItem(KEY, param) } catch { /* ignore */ }
    return param as Source
  }
  try {
    const saved = sessionStorage.getItem(KEY)
    if (saved && (SOURCES as readonly string[]).includes(saved)) return saved as Source
  } catch { /* ignore */ }
  return 'direct'
}
