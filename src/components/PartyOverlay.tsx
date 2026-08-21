import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/theme'

/**
 * Party-mode canvas: a confetti-cannon burst when the theme switches on,
 * then an ambient rain of rainbow terminal glyphs. Sits between the fx
 * layers and the content (z-index 3) so text stays fully readable, and
 * renders nothing under prefers-reduced-motion.
 */
export default function PartyOverlay() {
  const { resolved } = useTheme()
  if (resolved !== 'party') return null
  return <PartyCanvas />
}

const GLYPHS = ['0', '1', '$', '#', '>', '*', '{', '}', ';', '+', '/', '=']

type Confetto = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  hue: number
  size: number
  life: number
  maxLife: number
}

type Glyph = {
  x: number
  y: number
  vy: number
  hue: number
  size: number
  char: string
  sway: number
  phase: number
}

function PartyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const confetti: Confetto[] = []
    const cannon = (ox: number, oy: number, angle: number) => {
      for (let i = 0; i < 70; i++) {
        const a = angle + (Math.random() - 0.5) * 0.9
        const speed = 480 + Math.random() * 560
        confetti.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 12,
          hue: Math.random() * 360,
          size: 4 + Math.random() * 5,
          life: 0,
          maxLife: 2.4 + Math.random() * 1.4,
        })
      }
    }
    // Two cannons from the bottom corners, firing toward the middle.
    cannon(-10, h * 0.95, -Math.PI / 3.1)
    cannon(w + 10, h * 0.95, -Math.PI + Math.PI / 3.1)

    const glyphs: Glyph[] = Array.from({ length: 36 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: 26 + Math.random() * 55,
      hue: Math.random() * 360,
      size: 10 + Math.random() * 7,
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      sway: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
    }))

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)

      for (let i = confetti.length - 1; i >= 0; i--) {
        const p = confetti[i]
        p.life += dt
        if (p.life > p.maxLife || p.y > h + 30) {
          confetti.splice(i, 1)
          continue
        }
        p.vy += 950 * dt
        p.vx *= 1 - 0.6 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        const fade = Math.min(1, (p.maxLife - p.life) / 0.6)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = 0.9 * fade
        ctx.fillStyle = `hsl(${p.hue} 95% 65%)`
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62)
        ctx.restore()
      }

      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      for (const g of glyphs) {
        g.y += g.vy * dt
        g.phase += dt
        if (g.y > h + 24) {
          g.y = -24
          g.x = Math.random() * w
          g.hue = Math.random() * 360
          g.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
        ctx.globalAlpha = 0.55
        ctx.fillStyle = `hsl(${g.hue} 90% 62%)`
        ctx.font = `${g.size}px 'JetBrains Mono Variable', monospace`
        ctx.fillText(g.char, g.x + Math.sin(g.phase) * g.sway, g.y)
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="party-canvas" aria-hidden="true" />
}
