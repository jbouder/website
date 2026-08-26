import { useEffect, useState } from 'react'
import { about, processes } from '../data/site'
import type { ProcessEntry as Proc } from '../data/site'
import { useDoom } from '../lib/doom'

/**
 * The About sidebar, styled as a process monitor. Same content as the old
 * CURRENTLY card — what's being built and explored — but rendered as htop:
 * animated CPU cores and a process table. The console's `htop` command
 * prints the text version of the same data.
 */

const PROCS: Proc[] = processes

/** Doom shows up in the table while it's actually running. Of course it does. */
const DOOM_PROC: Proc = {
  pid: 666,
  cpu: 35,
  mem: '6.5',
  time: '0:57',
  command: './doom -iwad doom1.wad',
}

const CORES = [34, 58, 21, 76] // SSR-stable starting loads

function jitter(base: number): number {
  if (base === 0) return 0
  const next = base + (Math.random() - 0.5) * 18
  return Math.round(Math.min(98, Math.max(2, next)))
}

export default function Htop() {
  const { isDoomOpen } = useDoom()
  const [cores, setCores] = useState(CORES)
  const [loads, setLoads] = useState(PROCS.map((p) => p.cpu))
  const [doomLoad, setDoomLoad] = useState(DOOM_PROC.cpu)

  // Animate after mount only, so the server render stays deterministic.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setCores((current) => current.map(jitter))
      setLoads(PROCS.map((p) => jitter(p.cpu)))
      setDoomLoad(jitter(DOOM_PROC.cpu))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const rows = isDoomOpen ? [...PROCS, DOOM_PROC] : PROCS
  const rowLoad = (proc: Proc, i: number) =>
    proc === DOOM_PROC ? doomLoad : loads[i]

  return (
    <div
      id="htop"
      data-reveal
      style={{ border: '1px solid var(--line)', background: 'var(--card-tint)' }}
    >
      <div
        className="flex justify-between px-[18px] py-3 text-[11px] tracking-[.14em]"
        style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-dim)' }}
      >
        <span>HTOP — CURRENTLY</span>
        <span suppressHydrationWarning>
          tasks: {rows.length}, {rows.filter((_, i) => rowLoad(rows[i], i) > 0).length} running
        </span>
      </div>

      <div className="px-[18px] pt-3.5 pb-1 flex flex-col gap-1.5">
        {cores.map((pct, i) => (
          <div key={i} className="htop-core">
            <span style={{ color: 'var(--ink-dim)' }}>{i + 1}</span>
            <span style={{ color: 'var(--ink-faint)' }}>[</span>
            <span className="htop-track">
              <span
                className="htop-fill"
                style={{ width: `${pct}%` }}
                suppressHydrationWarning
              />
            </span>
            <span style={{ color: 'var(--ink-faint)' }}>]</span>
            <span
              className="w-9 text-right tabular-nums"
              style={{ color: 'var(--ink-mid)' }}
              suppressHydrationWarning
            >
              {pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="px-[18px] pb-3.5 pt-2">
        <div className="htop-row" style={{ color: 'var(--ink-dim)' }}>
          <span>PID</span>
          <span className="text-right">CPU%</span>
          <span className="text-right">TIME+</span>
          <span>COMMAND</span>
        </div>
        {rows.map((proc, i) => (
          <div key={proc.pid} className="htop-row">
            <span style={{ color: 'var(--ink-dim)' }}>{proc.pid}</span>
            <span
              className="text-right tabular-nums"
              style={{ color: 'var(--ink-mid)' }}
              suppressHydrationWarning
            >
              {rowLoad(proc, i).toFixed(1)}
            </span>
            <span className="text-right tabular-nums" style={{ color: 'var(--ink-dim)' }}>
              {proc.time}
            </span>
            <span style={{ color: proc.cpu === 0 ? 'var(--ink-faint)' : 'var(--acc)' }}>
              {proc.command}
            </span>
          </div>
        ))}
      </div>

      <div
        className="px-[18px] py-3 text-[12px]"
        style={{ borderTop: '1px solid var(--line-soft)', color: 'var(--ink-dim)' }}
      >
        load average:{' '}
        <span style={{ color: 'var(--acc)' }}>
          {about.currently.find((row) => row.label === 'status')?.value}
        </span>
      </div>
    </div>
  )
}
