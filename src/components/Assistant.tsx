import { useEffect, useRef, useState } from 'react'
import type {
  ChatCompletionMessageParam,
  MLCEngineInterface,
} from '@mlc-ai/web-llm'
import {
  MIN_WIDTH,
  MODEL_ID,
  SUGGESTIONS,
  SYSTEM_PROMPT,
  formatModelName,
} from '../lib/assistant'
import { createEngine } from '../lib/assistant-engine'

/** Turns kept in the prompt. Small models drift badly with long histories. */
const MAX_HISTORY = 8
const MAX_TOKENS = 400

type Message = { role: 'user' | 'assistant'; content: string }

/**
 * Qwen3 emits `<think>…</think>` reasoning even with thinking disabled on some
 * prompts. Strip it so the visitor only sees the answer, including while the
 * block is still streaming in (unterminated tag).
 */
function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/i, '')
    .trimStart()
}

function unavailableReason(): string {
  if (typeof navigator === 'undefined') return ''
  if (!('gpu' in navigator)) {
    return 'this browser has no WebGPU support, so the model can’t run here. Try Chrome or Edge on desktop.'
  }
  return ''
}

/**
 * True only on viewports wide enough for the assistant. Starts false so the
 * server-rendered markup (no assistant) matches the first client render, then
 * flips after mount and tracks resizes.
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`)
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return isDesktop
}

export default function Assistant() {
  const isDesktop = useIsDesktop()
  const engine = useRef<MLCEngineInterface | null>(null)
  const engineLoad = useRef<Promise<MLCEngineInterface> | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState('')

  // The composer is locked while the weights download and while a reply
  // streams, so a question can never be submitted into a model that is not
  // ready to answer it.
  const isLocked = isBusy || isPreparing

  const loadEngine = async () => {
    if (engine.current) return engine.current
    if (engineLoad.current) return engineLoad.current

    const reason = unavailableReason()
    if (reason) throw new Error(reason)

    setStatus('booting local model…')
    setIsPreparing(true)
    engineLoad.current = (async () => {
      const created = await createEngine((text) => setStatus(text.toLowerCase()))
      engine.current = created
      setStatus('')
      return created
    })()

    try {
      return await engineLoad.current
    } catch (cause) {
      // Let a later attempt retry from scratch rather than reusing the
      // rejected promise for the rest of the session.
      engineLoad.current = null
      throw cause
    } finally {
      setIsPreparing(false)
    }
  }

  // Start the download as soon as the panel opens — it is the slow part, and
  // by the time the visitor has typed a question it is usually ready.
  useEffect(() => {
    if (!isOpen || engine.current) return
    void loadEngine().catch((cause) => {
      setStatus('')
      setError(cause instanceof Error ? cause.message : 'unknown error.')
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Pin to the newest output as it streams.
  useEffect(() => {
    const node = scroller.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, streaming, status])

  const ask = async (question: string) => {
    const input = question.trim()
    if (!input || isLocked) return

    const history = [...messages, { role: 'user' as const, content: input }]
    setMessages(history)
    setPrompt('')
    setError('')
    setIsBusy(true)

    try {
      const localEngine = await loadEngine()
      const payload: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-MAX_HISTORY),
      ]

      const stream = await localEngine.chat.completions.create({
        messages: payload,
        temperature: 0.2,
        max_tokens: MAX_TOKENS,
        stream: true,
        extra_body: { enable_thinking: false },
      })

      let reply = ''
      for await (const chunk of stream) {
        reply += chunk.choices[0]?.delta?.content ?? ''
        setStreaming(stripThinking(reply))
      }

      const answer = stripThinking(reply).trim()
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: answer || 'No answer came back — try rephrasing that.',
        },
      ])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'unknown error.')
    } finally {
      setStreaming('')
      setStatus('')
      setIsBusy(false)
    }
  }

  // The input is disabled while generating, which drops focus. Put it back so
  // the visitor can type a follow-up without reaching for the mouse.
  useEffect(() => {
    if (isOpen && !isLocked) inputRef.current?.focus()
  }, [isOpen, isLocked])

  const isEmpty = messages.length === 0 && !streaming

  if (!isDesktop) return null

  return (
    <div className="assistant-dock">
      {isOpen && (
        <section className="assistant-panel" aria-label="Ask about Johnny">
          <header className="assistant-head">
            <div className="flex items-center gap-2.5 truncate">
              <span className="status-dot" />
              <span style={{ color: 'var(--ink)' }}>~/jbouder — ask</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="assistant-icon"
                onClick={() => {
                  setMessages([])
                  setError('')
                }}
                disabled={messages.length === 0 || isLocked}
                aria-label="Clear conversation"
              >
                clear
              </button>
              <button
                type="button"
                className="assistant-icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="assistant-log" ref={scroller} aria-live="polite">
            {isEmpty && (
              <div className="assistant-intro">
                <p>
                  Ask me anything about Johnny — his work, his stack, how to
                  reach him. The model runs entirely in your browser, so nothing
                  you type leaves this tab.
                </p>
                <p style={{ color: 'var(--ink-faint)' }}>
                  Opening this downloads the weights once (about 1 GB, cached by
                  your browser after that).
                </p>
                <div className="assistant-chips">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="assistant-chip"
                      onClick={() => void ask(s)}
                      disabled={isLocked}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, i) => (
              <div
                key={`${message.role}-${i}`}
                className={
                  message.role === 'user' ? 'assistant-user' : 'assistant-reply'
                }
              >
                {message.role === 'user' && (
                  <span className="assistant-prompt-char">$</span>
                )}
                <span>{message.content}</span>
              </div>
            ))}

            {streaming && (
              <div className="assistant-reply">
                <span>{streaming}</span>
                <span className="assistant-caret" aria-hidden="true" />
              </div>
            )}

            {isLocked && !streaming && (
              <p className="assistant-status">{status || 'thinking…'}</p>
            )}

            {error && (
              <p className="assistant-error" role="alert">
                error: {error}
              </p>
            )}
          </div>

          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault()
              void ask(prompt)
            }}
          >
            <span className="assistant-prompt-char">$</span>
            <input
              ref={inputRef}
              className="assistant-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                isPreparing ? 'loading model…' : 'ask about johnny…'
              }
              aria-label="Ask about Johnny"
              disabled={isLocked}
            />
            <button
              type="submit"
              className="assistant-send"
              disabled={isLocked || !prompt.trim()}
            >
              ↵
            </button>
          </form>

          <div className="assistant-foot">
            <span>{formatModelName(MODEL_ID)} · webllm</span>
            <span>local · private</span>
          </div>
        </section>
      )}

      <button
        type="button"
        className="assistant-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close assistant' : 'Ask about Johnny'}
      >
        <span style={{ color: 'var(--acc)' }}>&gt;_</span> ask
      </button>
    </div>
  )
}
