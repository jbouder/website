import { site } from '../data/site'
import { useClock } from '../hooks/use-terminal'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '#work', label: 'work' },
  { href: '#about', label: 'about' },
  { href: '#resume', label: 'resume' },
  { href: '#contact', label: 'contact' },
]

export default function Header() {
  const clock = useClock()

  return (
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
        <ThemeToggle />
        <div
          className="hidden min-w-[64px] text-right text-xs tabular-nums md:block"
          style={{ color: 'var(--ink-dim)' }}
          suppressHydrationWarning
        >
          {clock}
        </div>
      </div>
    </header>
  )
}
