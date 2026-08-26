import { useEffect, useRef, useState } from 'react'
import { useScrollPct } from '../hooks/use-terminal'
import { useDoom } from '../lib/doom'

/**
 * The footer has claimed to be vim since day one. Now it is: `j`/`k` scroll,
 * `gg`/`G` jump, `:` opens a command line, and the percentage was already
 * tracking scroll like a real ruler. `:q` behaves exactly as well as you'd
 * expect.
 */

const MESSAGE_MS = 4000
const GG_WINDOW_MS = 600

function executeEx(command: string): string {
  switch (command.trim()) {
    case 'q':
    case 'quit':
      return 'E37: No write since last change (add ! to override)'
    case 'q!':
      return 'E382: Cannot close the last window — you live here now'
    case 'w':
      return '"johnnybouder.com" written to /dev/null'
    case 'wq':
    case 'wq!':
    case 'x':
      return '"johnnybouder.com" written. still here, though.'
    case 'help':
      return 'j/k scroll · gg top · G bottom · :q to dream'
    case '':
      return ''
    default:
      return `E492: Not an editor command: ${command.trim()}`
  }
}

export default function Footer() {
  const pct = useScrollPct()
  const { isDoomOpen } = useDoom()
  // null = normal mode; a string = the ex command being typed after `:`.
  const [exBuffer, setExBuffer] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastG = useRef(0)

  const flash = (text: string) => {
    if (messageTimer.current) clearTimeout(messageTimer.current)
    setMessage(text)
    if (text) messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS)
  }

  useEffect(() => {
    if (isDoomOpen) return // the keyboard belongs to DOOM

    const isTyping = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)

    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      // Ex mode: the footer is a tiny vim command line.
      if (exBuffer !== null) {
        event.preventDefault()
        if (event.key === 'Enter') {
          setExBuffer(null)
          flash(executeEx(exBuffer))
        } else if (event.key === 'Escape') {
          setExBuffer(null)
        } else if (event.key === 'Backspace') {
          if (exBuffer === '') setExBuffer(null)
          else setExBuffer(exBuffer.slice(0, -1))
        } else if (event.key.length === 1) {
          setExBuffer(exBuffer + event.key)
        }
        return
      }

      // All jumps are instant, faithful to vim — and the page's global
      // `scroll-behavior: smooth` would get cancelled by the htop widget's
      // animation ticks anyway, so 'instant' must be explicit.
      switch (event.key) {
        case 'j':
          event.preventDefault()
          window.scrollBy({ top: 90, behavior: 'instant' })
          break
        case 'k':
          event.preventDefault()
          window.scrollBy({ top: -90, behavior: 'instant' })
          break
        case 'g': {
          if (event.shiftKey) {
            // Some input synthesizers report shift+g as 'g' with shiftKey
            // set rather than 'G'; treat it as G.
            event.preventDefault()
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'instant',
            })
            break
          }
          const now = Date.now()
          if (now - lastG.current < GG_WINDOW_MS) {
            lastG.current = 0
            event.preventDefault()
            window.scrollTo({ top: 0, behavior: 'instant' })
          } else {
            lastG.current = now
          }
          break
        }
        case 'G':
          event.preventDefault()
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'instant',
          })
          break
        case ':':
          event.preventDefault()
          setExBuffer('')
          break
        case 'Escape':
          flash('you pressed esc. you are still in vim. everyone is.')
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exBuffer, isDoomOpen])

  useEffect(
    () => () => {
      if (messageTimer.current) clearTimeout(messageTimer.current)
    },
    [],
  )

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
        {exBuffer !== null ? (
          <span style={{ color: 'var(--ink)' }}>
            :{exBuffer}
            <span className="assistant-caret" aria-hidden="true" />
          </span>
        ) : message ? (
          <span style={{ color: 'var(--acc2)' }}>{message}</span>
        ) : (
          <>
            {pct}% — press <span style={{ color: 'var(--ink-mid)' }}>esc</span>{' '}
            to exit vim
          </>
        )}
      </span>
    </footer>
  )
}
