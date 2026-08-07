import { useEffect, useState } from 'react'

/** HH:MM:SS clock. Empty on the server; ticks after hydration. */
export function useClock() {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const tick = () => {
      const d = new Date()
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}

/** Page scroll progress, 0–100. */
export function useScrollPct() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return pct
}

/**
 * Reveal-on-scroll for elements marked with `data-reveal`.
 * Progressive enhancement: content is fully visible without JS; on mount,
 * offscreen elements are hidden and revealed as they enter the viewport.
 */
export function useReveal() {
  useEffect(() => {
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    )
    const pending = nodes.filter(
      (n) => n.getBoundingClientRect().top >= window.innerHeight,
    )
    pending.forEach((n) => {
      n.classList.add('reveal')
      n.dataset.hidden = 'true'
    })

    const reveal = (el: HTMLElement, delay = 0) => {
      setTimeout(() => {
        el.dataset.hidden = 'false'
        el.dataset.revealed = 'true'
      }, delay)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (!e.isIntersecting) return
          reveal(e.target as HTMLElement, 60 * idx)
          io.unobserve(e.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    pending.forEach((n) => io.observe(n))

    // Sweep: anything scrolled fully past without intersecting gets revealed.
    const sweep = () => {
      pending.forEach((n) => {
        if (n.dataset.hidden === 'true' && n.getBoundingClientRect().bottom <= 0) {
          reveal(n)
          io.unobserve(n)
        }
      })
    }
    window.addEventListener('scroll', sweep, { passive: true })
    window.addEventListener('hashchange', sweep)

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', sweep)
      window.removeEventListener('hashchange', sweep)
    }
  }, [])
}
