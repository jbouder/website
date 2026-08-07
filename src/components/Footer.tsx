import { useScrollPct } from '../hooks/use-terminal'

export default function Footer() {
  const pct = useScrollPct()

  return (
    <footer
      className="relative z-[5] flex flex-wrap justify-between gap-4 px-8 py-3.5 text-xs"
      style={{
        borderTop: '1px solid var(--line)',
        color: 'var(--ink-faint)',
        background: 'var(--bg-footer)',
      }}
    >
      <span>© 2026 Johnny Bouder — built with TanStack Start</span>
      <span suppressHydrationWarning>
        {pct}% — press <span style={{ color: 'var(--ink-mid)' }}>esc</span> to
        exit vim
      </span>
    </footer>
  )
}
