import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system' | 'party'
export type ResolvedTheme = 'light' | 'dark' | 'party'

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system', 'party']

const STORAGE_KEY = 'jb-theme'

/** Matches the light --bg / dark --bg tokens in styles.css. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#f2f5f2',
  dark: '#0b0d0c',
  party: '#0b0d0c',
}

/**
 * Runs inline in <head> before first paint so the stored theme applies with
 * no flash. Mirrors the resolution logic in ThemeProvider below.
 */
export const THEME_BOOTSTRAP = `(function(){try{var m=localStorage.getItem('${STORAGE_KEY}');if(m!=='light'&&m!=='dark'&&m!=='party')m='system';var t=m==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):m;var d=document.documentElement;d.dataset.theme=t;d.dataset.themeMode=m;}catch(e){}})()`

type ThemeContextValue = {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readMode(): ThemeMode {
  if (typeof document === 'undefined') return 'system'
  const m = document.documentElement.dataset.themeMode
  return m === 'light' || m === 'dark' || m === 'party' ? m : 'system'
}

function readResolved(): ResolvedTheme {
  if (typeof document === 'undefined') return 'dark'
  const t = document.documentElement.dataset.theme
  return t === 'light' || t === 'party' ? t : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers read what the bootstrap script already applied, so the
  // provider and the document agree from the first client render.
  const [mode, setModeState] = useState<ThemeMode>(readMode)
  const [resolved, setResolved] = useState<ResolvedTheme>(readResolved)

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private browsing etc. — theme still applies for this visit.
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const theme: ResolvedTheme =
        mode === 'system' ? (mq.matches ? 'light' : 'dark') : mode
      const root = document.documentElement
      root.dataset.theme = theme
      root.dataset.themeMode = mode
      setResolved(theme)
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLOR[theme])
    }
    apply()
    if (mode !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
