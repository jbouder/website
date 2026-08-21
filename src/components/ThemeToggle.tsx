import { useEffect, useState } from 'react'
import { THEME_MODES, useTheme } from '../lib/theme'
import type { ThemeMode } from '../lib/theme'

const ICONS: Record<ThemeMode, string> = {
  light: '○',
  dark: '●',
  system: '◐',
  party: '✦',
}

export default function ThemeToggle() {
  const { mode, setMode } = useTheme()

  // The server doesn't know the stored mode, and React won't patch mismatched
  // attributes during hydration — so render the SSR default until mounted,
  // then swap to the real mode (a genuine prop change React applies).
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const active = hydrated ? mode : 'system'

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!dir) return
    e.preventDefault()
    const idx = THEME_MODES.indexOf(active)
    const next = THEME_MODES[(idx + dir + THEME_MODES.length) % THEME_MODES.length]
    setMode(next)
    e.currentTarget
      .querySelectorAll('button')
      [THEME_MODES.indexOf(next)]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="theme-group"
      onKeyDown={onKeyDown}
    >
      {THEME_MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={active === m}
          aria-label={`${m} theme`}
          title={`theme --set ${m}`}
          tabIndex={active === m ? 0 : -1}
          className="theme-opt"
          onClick={() => setMode(m)}
        >
          <span aria-hidden="true">{ICONS[m]}</span>
        </button>
      ))}
    </div>
  )
}
