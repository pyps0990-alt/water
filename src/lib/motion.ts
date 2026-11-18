import { useEffect, useRef, useState } from 'react'

export const prefersMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: no-preference)').matches

const supportsViewTimeline = () =>
  typeof CSS !== 'undefined' && CSS.supports('(animation-timeline: view()) and (animation-range: entry)')

/**
 * Scroll-reveal fallback. Browsers with view() timelines animate [data-reveal] in pure CSS;
 * others get a one-shot IntersectionObserver. Re-scans when `dep` changes (new content).
 */
export function useRevealFallback(dep?: unknown) {
  useEffect(() => {
    if (supportsViewTimeline() || !prefersMotion() || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { (e.target as HTMLElement).dataset.reveal = 'in'; io.unobserve(e.target) }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    document.querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal="true"]').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight) { el.dataset.reveal = 'in'; return } // already on screen: no flash
      el.dataset.reveal = 'pending'
      io.observe(el)
    })
    return () => io.disconnect()
  }, [dep])
}

/** Returns [ref, armed]: armed is true until the element first scrolls into view (motion users only). */
export function useArmUntilVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [armed, setArmed] = useState(() => prefersMotion() && 'IntersectionObserver' in window)
  useEffect(() => {
    if (!armed || !ref.current) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { requestAnimationFrame(() => setArmed(false)); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [armed])
  return [ref, armed] as const
}
