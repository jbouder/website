import { useEffect, useRef, useState } from 'react'
import { completeShellInput, runShellCommand } from '../lib/shell'
import type { ShellAction } from '../lib/shell'
import { useDoom } from '../lib/doom'
import { useTheme } from '../lib/theme'

/**
 * The working prompt, hosted in the header's interactive-mode console panel.
 * It actually runs — `ls`, `cat about.md`, `man jbouder`, tab completion,
 * up-arrow history, the lot. Command logic lives in `src/lib/shell.ts`; this
 * component owns input handling and side effects. `onExit` is how the `exit`
 * command closes the panel around it.
 */

type Entry = { cmd: string; output: string[] }

/** Keep the scrollback bounded so a long session can't grow without limit. */
const MAX_ENTRIES = 50

export default function Terminal({
  onExit,
  isActive = true,
}: {
  onExit?: () => void
  /** False while the console is toggled closed but kept mounted. */
  isActive?: boolean
}) {
  const { mode, setMode } = useTheme()
  const { openDoom } = useDoom()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  // null = editing a fresh line; a number = browsing history at that index.
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  // Opening the console is an explicit act, so the prompt takes focus.
  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  // Pin the scrollback to the newest line.
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [entries])

  const performAction = (action: ShellAction) => {
    switch (action.type) {
      case 'open':
        window.open(action.href, '_blank', 'noopener,noreferrer')
        break
      case 'clear':
        setEntries([])
        break
      case 'theme':
        setMode(action.mode)
        break
      case 'doom':
        openDoom()
        break
      case 'exit':
        onExit?.()
        break
    }
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    setInput('')
    setHistoryIndex(null)
    setDraft('')
    if (!cmd) return

    const nextHistory = [...history, cmd]
    setHistory(nextHistory)
    const { lines, action } = runShellCommand(cmd, {
      themeMode: mode,
      history: nextHistory,
    })
    if (action?.type === 'clear') {
      performAction(action)
      return
    }
    setEntries((current) =>
      [...current, { cmd, output: lines }].slice(-MAX_ENTRIES),
    )
    // Defer page-level effects past the commit and the scrollback pin above —
    // an instant container scroll cancels an in-flight smooth window scroll.
    if (action) {
      requestAnimationFrame(() => requestAnimationFrame(() => performAction(action)))
    }
  }

  const complete = () => {
    const { completed, options } = completeShellInput(input)
    if (completed) setInput(completed)
    if (options && options.length > 1) {
      // Ambiguous: list the candidates, shell-style, without consuming input.
      setEntries((current) =>
        [...current, { cmd: input, output: [options.join('   ')] }].slice(
          -MAX_ENTRIES,
        ),
      )
    }
  }

  const browseHistory = (direction: -1 | 1) => {
    if (history.length === 0) return
    if (historyIndex === null) {
      if (direction === 1) return
      setDraft(input)
      setHistoryIndex(history.length - 1)
      setInput(history[history.length - 1])
      return
    }
    const next = historyIndex + direction
    if (next < 0) return
    if (next >= history.length) {
      setHistoryIndex(null)
      setInput(draft)
      return
    }
    setHistoryIndex(next)
    setInput(history[next])
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        run(input)
        break
      case 'Tab':
        event.preventDefault()
        complete()
        break
      case 'ArrowUp':
        event.preventDefault()
        browseHistory(-1)
        break
      case 'ArrowDown':
        event.preventDefault()
        browseHistory(1)
        break
      case 'c':
        // ctrl-c abandons the current line, like it should.
        if (event.ctrlKey) {
          event.preventDefault()
          setEntries((current) =>
            [...current, { cmd: `${input}^C`, output: [] }].slice(-MAX_ENTRIES),
          )
          setInput('')
          setHistoryIndex(null)
        }
        break
      case 'l':
        if (event.ctrlKey) {
          event.preventDefault()
          setEntries([])
        }
        break
    }
  }

  return (
    <div
      className="term"
      onClick={(event) => {
        // Clicking anywhere in the terminal focuses the prompt, unless the
        // visitor is selecting output text.
        if (window.getSelection()?.toString()) return
        if (event.target instanceof HTMLAnchorElement) return
        inputRef.current?.focus()
      }}
    >
      <div className="term-scroll" ref={scrollRef}>
        {entries.length === 0 && (
          <div className="term-hint">
            # interactive mode — try <span className="term-kbd">help</span>.
            tab completes, up-arrow recalls, esc closes.
          </div>
        )}
        <div aria-live="polite">
          {entries.map((entry, i) => (
            <div key={i}>
              <div className="term-cmd">
                <span style={{ color: 'var(--acc)' }}>$</span> {entry.cmd}
              </div>
              {entry.output.length > 0 && (
                <pre className="term-out">{entry.output.join('\n')}</pre>
              )}
            </div>
          ))}
        </div>
        <form
          className="term-prompt"
          onSubmit={(event) => {
            event.preventDefault()
            run(input)
          }}
        >
          <span style={{ color: 'var(--acc)' }}>$</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setHistoryIndex(null)
            }}
            onKeyDown={onKeyDown}
            aria-label="Terminal command input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </form>
      </div>
    </div>
  )
}
