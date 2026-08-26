import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { useClock } from '../hooks/use-terminal'
import { useDoom } from '../lib/doom'
import Terminal from './Terminal'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '#work', label: 'work' },
  { href: '#about', label: 'about' },
  { href: '#resume', label: 'resume' },
  { href: '#contact', label: 'contact' },
]

export default function Header() {
  const clock = useClock()
  const { isDoomOpen } = useDoom()
  // Interactive mode: a Quake-style console that drops down under the header.
  // Once opened it stays mounted (just hidden), so the session — scrollback,
  // history, the lot — survives toggling the mode.
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const [hasConsoleOpened, setHasConsoleOpened] = useState(false)

  // Both states change in the same commit, so opening renders (and focuses)
  // the terminal immediately — no intermediate render with a missing panel.
  const toggleConsole = () => {
    setHasConsoleOpened(true)
    setIsConsoleOpen((open) => !open)
  }

  useEffect(() => {
    if (isDoomOpen) return // the keyboard belongs to DOOM
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const isTermInput = !!target?.classList?.contains('term-input')
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      // Backtick toggles the console, Quake-style — including from inside
      // the console's own prompt, but not while typing anywhere else.
      // Match the physical key too: some keyboards/synthesizers report
      // code 'Backquote' with a different key value.
      const isBacktick = event.key === '`' || event.code === 'Backquote'
      if (isBacktick && (!isTyping || isTermInput)) {
        event.preventDefault()
        toggleConsole()
        return
      }
      if (event.key === 'Escape' && isConsoleOpen) {
        setIsConsoleOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isConsoleOpen, isDoomOpen])

  return (
    <>
      <header
        className="sticky top-0 z-20 flex items-center justify-between gap-6 px-8 py-3.5 text-[13px] tracking-[.02em] backdrop-blur-md"
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'var(--header-bg)',
        }}
      >
        <div className="flex items-center gap-2.5" style={{ color: 'var(--ink-mid)' }}>
          <span className="status-dot" />
          <span style={{ color: 'var(--ink)' }}>{site.prompt}</span>
          <span className="hidden sm:inline">— zsh</span>
        </div>
        <nav className="flex gap-1">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="px-2.5 py-1.5">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {/* The interactive-mode toggle rides at the end of the theme
              group, styled as one more segment. */}
          <div className="flex items-center">
            <ThemeToggle />
            <button
              type="button"
              className="theme-opt term-toggle"
              onClick={toggleConsole}
              aria-pressed={isConsoleOpen}
              aria-label="Toggle interactive terminal"
              title="interactive mode (`)"
            >
              <span aria-hidden="true">&gt;_</span>
            </button>
          </div>
          <div
            className="hidden min-w-[64px] text-right text-xs tabular-nums md:block"
            style={{ color: 'var(--ink-dim)' }}
            suppressHydrationWarning
          >
            {clock}
          </div>
        </div>
      </header>
      {hasConsoleOpened && (
        <div
          className="console-panel"
          role="region"
          aria-label="Interactive terminal"
          hidden={!isConsoleOpen}
        >
          <Terminal
            isActive={isConsoleOpen}
            onExit={() => setIsConsoleOpen(false)}
          />
        </div>
      )}
    </>
  )
}
