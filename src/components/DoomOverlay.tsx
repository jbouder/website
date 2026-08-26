import { useEffect, useRef, useState } from 'react'

/**
 * DOOM (1993), running in a fullscreen terminal-styled overlay.
 *
 * The engine is a wasm32 port of linuxdoom-1.10 with the shareware WAD baked
 * into the binary (see public/doom/README.md). This component is only ever
 * loaded via React.lazy from the assistant, and the ~6.5 MB wasm is only
 * fetched once this overlay actually mounts — a visitor who never types the
 * cheat code downloads none of it.
 */

const DOOM_WASM_URL = '/doom/doom.wasm'
const SCREEN_WIDTH = 320 * 2
const SCREEN_HEIGHT = 200 * 2

type DoomExports = {
  main: () => void
  add_browser_event: (type: 0 | 1, keyCode: number) => void
  doom_loop_step: () => void
}

/** Doom's keycodes mostly match the browser's legacy keyCode, except these. */
function doomKeyCode(keyCode: number): number {
  switch (keyCode) {
    case 8:
      return 127 // KEY_BACKSPACE
    case 17:
      return 0x80 + 0x1d // KEY_RCTRL
    case 18:
      return 0x80 + 0x38 // KEY_RALT
    case 37:
      return 0xac // KEY_LEFTARROW
    case 38:
      return 0xad // KEY_UPARROW
    case 39:
      return 0xae // KEY_RIGHTARROW
    case 40:
      return 0xaf // KEY_DOWNARROW
    default:
      if (keyCode >= 65 && keyCode <= 90) return keyCode + 32 // A-Z to ascii
      if (keyCode >= 112 && keyCode <= 123) return keyCode + 75 // F1-F12
      return keyCode
  }
}

export default function DoomOverlay({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Everything the async boot needs to hand to the cleanup function.
    let cancelled = false
    let frame = 0
    let detachKeys: (() => void) | null = null

    const boot = async () => {
      const memory = new WebAssembly.Memory({ initial: 108 })
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas 2d context unavailable')

      const readString = (offset: number, length: number) =>
        new TextDecoder('utf8').decode(
          new Uint8Array(memory.buffer, offset, length),
        )

      const importObject = {
        js: {
          js_console_log: (o: number, l: number) =>
            console.log('[doom]', readString(o, l)),
          js_stdout: (o: number, l: number) =>
            console.log('[doom]', readString(o, l)),
          js_stderr: (o: number, l: number) =>
            console.warn('[doom]', readString(o, l)),
          js_milliseconds_since_start: () => performance.now(),
          js_draw_screen: (ptr: number) => {
            const screen = new Uint8ClampedArray(
              memory.buffer,
              ptr,
              SCREEN_WIDTH * SCREEN_HEIGHT * 4,
            )
            ctx.putImageData(new ImageData(screen, SCREEN_WIDTH, SCREEN_HEIGHT), 0, 0)
          },
        },
        env: { memory },
      }

      // instantiateStreaming needs an application/wasm content-type; fall
      // back to a plain ArrayBuffer if the server disagrees.
      const { instance } = await WebAssembly.instantiateStreaming(
        fetch(DOOM_WASM_URL),
        importObject,
      ).catch(async () => {
        const bytes = await (await fetch(DOOM_WASM_URL)).arrayBuffer()
        const module = await WebAssembly.compile(bytes)
        return { module, instance: await WebAssembly.instantiate(module, importObject) }
      })
      if (cancelled) return

      const exports = instance.exports as unknown as DoomExports
      exports.main()

      const onKeyDown = (event: KeyboardEvent) => {
        exports.add_browser_event(0, doomKeyCode(event.keyCode))
        event.preventDefault()
      }
      const onKeyUp = (event: KeyboardEvent) => {
        exports.add_browser_event(1, doomKeyCode(event.keyCode))
        event.preventDefault()
      }
      // The overlay covers the page, so it owns the keyboard while mounted.
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      detachKeys = () => {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
      }

      setIsLoading(false)

      const step = () => {
        exports.doom_loop_step()
        frame = window.requestAnimationFrame(step)
      }
      frame = window.requestAnimationFrame(step)
    }

    boot().catch((cause) => {
      if (cancelled) return
      setIsLoading(false)
      setError(cause instanceof Error ? cause.message : 'failed to load doom.')
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      detachKeys?.()
    }
  }, [])

  return (
    <div className="doom-overlay" role="dialog" aria-label="DOOM">
      <section className="doom-frame">
        <header className="assistant-head">
          <div className="flex items-center gap-2.5 truncate">
            <span className="status-dot" />
            <span style={{ color: 'var(--ink)' }}>~/jbouder — doom</span>
          </div>
          {/* The keyboard belongs to the game (Esc opens Doom's own menu),
              so quitting is mouse-only. */}
          <button
            type="button"
            className="assistant-icon"
            onClick={onClose}
            aria-label="Quit DOOM"
          >
            ✕ quit
          </button>
        </header>

        <div className="doom-screen">
          <canvas
            ref={canvasRef}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            aria-label="DOOM game screen"
          />
          {isLoading && (
            <p className="doom-note">loading doom.wasm — about 6.5 MB…</p>
          )}
          {error && (
            <p className="doom-note" role="alert">
              error: {error}
            </p>
          )}
        </div>

        <footer className="doom-foot">
          <span>enter to start · arrows move · ctrl shoots · space opens</span>
          <span>doom (1993) · wasm</span>
        </footer>
      </section>
    </div>
  )
}
