/**
 * The hero terminal's command interpreter.
 *
 * Pure logic, no React: `runShellCommand` maps one line of input to output
 * lines plus an optional side effect (scroll, open a link, launch DOOM…)
 * that the Terminal component performs. Content comes from `src/data/site.ts`
 * so the shell never drifts from the page it navigates.
 */

import { about, bio, processes, resume, site, socials, stats, work } from '../data/site'
import type { ThemeMode } from './theme'

export type ShellAction =
  | { type: 'open'; href: string }
  | { type: 'clear' }
  | { type: 'doom' }
  | { type: 'theme'; mode: ThemeMode }
  | { type: 'exit' }

export type ShellResult = { lines: string[]; action?: ShellAction }

/**
 * The console is an alternate view of the site, not a navigator of it —
 * commands print content into the panel rather than scrolling the page.
 * These are the printable "sections", keyed by every name a visitor might
 * try. Each returns its content as terminal lines.
 */
const aboutLines = () => ['# about', '', ...about.paragraphs.flatMap((p) => [p, ''])]

const workLines = () =>
  work.map((w) => `${w.index}  ${w.name.padEnd(12)} ${w.meta.padEnd(11)} ${w.description}`)

const resumeLines = () =>
  resume.flatMap((r) => [
    `${r.period.padEnd(14)}${r.role} · ${r.org}`,
    `${' '.repeat(14)}${r.description}`,
    '',
  ])

const contactLines = () => [
  `email:     ${site.email}`,
  ...socials.map((s) => `${s.label.padEnd(11)}${s.href}`),
]

const SECTIONS: Record<string, () => string[]> = {
  work: workLines,
  'selected-work': workLines,
  projects: workLines,
  about: aboutLines,
  resume: resumeLines,
  history: resumeLines,
  contact: contactLines,
}

const FILES = ['about.md', 'resume.txt', 'contact.txt', '.plan'] as const

const OPEN_TARGETS: Record<string, string> = {
  ...Object.fromEntries(work.map((w) => [w.name, w.href])),
  ...Object.fromEntries(socials.map((s) => [s.label, s.href])),
}

export const COMMANDS = [
  'help',
  'ls',
  'cat',
  'cd',
  'open',
  'man',
  'neofetch',
  'htop',
  'history',
  'echo',
  'clear',
  'party',
  'theme',
  'doom',
  'whoami',
  'pwd',
  'uptime',
  'date',
  'sudo',
  'vim',
  'exit',
] as const

/** Edit distance, for "did you mean" suggestions (also used by the 404 page). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const row = [i]
    for (let j = 1; j <= n; j++) {
      row.push(
        Math.min(
          prev[j] + 1,
          row[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        ),
      )
    }
    prev = row
  }
  return prev[n]
}

/** Closest candidate within a sane edit distance, or null. */
export function didYouMean(input: string, candidates: string[]): string | null {
  let best: string | null = null
  let bestDist = Infinity
  for (const c of candidates) {
    const d = levenshtein(input.toLowerCase(), c.toLowerCase())
    if (d < bestDist) {
      best = c
      bestDist = d
    }
  }
  return best && bestDist <= Math.max(2, Math.floor(input.length / 3))
    ? best
    : null
}

const HELP = [
  'available commands:',
  '',
  '  help             this list',
  '  ls [-la] [dir]   list files',
  '  cat <file>       print a file (try about.md, or .plan)',
  '  cd <dir>         print a section (work, about, resume, contact)',
  '  open <project>   open a project on github',
  '  man jbouder      read the manual',
  '  neofetch         system information',
  '  htop             see what is running',
  '  history          this session so far',
  '  theme <mode>     light, dark, system, or party',
  '  party [on|off]   confetti, colors, regret',
  '  doom             it runs doom. of course it runs doom.',
  '  clear            wipe the terminal',
  '',
  'tab completes, up-arrow recalls. this shell has no sandbox escape. probably.',
]

const MAN_PAGE = [
  'JBOUDER(1)                       User Commands                      JBOUDER(1)',
  '',
  'NAME',
  '       jbouder — AI experience engineer; terminal enthusiast',
  '',
  'SYNOPSIS',
  '       jbouder [--build] [--lead] [--advocate] [--verbose] <problem>...',
  '',
  'DESCRIPTION',
  '       Frontend-focused engineer and engineering leader with ~18 years in',
  '       production. Builds AI-enabled experiences, open-source tools, and',
  '       the developer experience around them. Currently Director of',
  '       Engineering for AI Experience at OpenTeams; previously Principal',
  '       Software Engineer at MetroStar, where he created Comet, an open-',
  '       source React component library for federal digital services.',
  '       Formerly a Sergeant and combat engineer in the United States',
  '       Marine Corps, which explains both the discipline and the deadline',
  '       calm.',
  '',
  'OPTIONS',
  '       --build',
  '              Ships design systems, starter kits, and side projects that',
  '              occasionally escape into production.',
  '',
  '       --lead',
  '              Grows engineering teams without meetings metastasizing.',
  '',
  '       --advocate',
  '              Open source, developer experience, accessibility.',
  '',
  '       --verbose',
  '              You are reading it.',
  '',
  'EXIT STATUS',
  '       Does not exit; see UPTIME (18 years and counting).',
  '',
  'BUGS',
  '       Known issue: yak shaving. Will absolutely refactor the thing that',
  '       was not broken. Accepts payment in Reese’s Peanut Butter Cups.',
  '',
  'SEE ALSO',
  '       acolyte(1), holotable(1), motion-lab(1), agent-quest(1),',
  '       doom(6), party(7)',
  '',
  `johnnybouder.com                  ${new Date().getFullYear()}                          JBOUDER(1)`,
]

/** neofetch: ASCII "JB" alongside the spec sheet, composed into one block. */
function neofetch(themeMode: ThemeMode): string[] {
  const art = [
    '   ██╗██████╗ ',
    '   ██║██╔══██╗',
    '   ██║██████╔╝',
    '██ ██║██╔══██╗',
    '╚████║██████╔╝',
    ' ╚═══╝╚═════╝ ',
    '              ',
  ]
  const statValue = (label: string) =>
    stats.find((s) => s.label === label)?.value ?? ''
  const info = [
    `jbouder@johnnybouder.com`,
    `------------------------`,
    `Host:     johnnybouder.com`,
    `Kernel:   TanStack Start on Cloudflare Workers`,
    `Uptime:   ${statValue('UPTIME')} in production`,
    `Shell:    zsh (this one)`,
    `Theme:    ${themeMode}`,
    `Stack:    ${statValue('STACK')}`,
    `Focus:    ${statValue('FOCUS')}`,
    `Location: ${statValue('LOCATION')}`,
    `CPU:      coffee (8 cores) @ 3.0GHz`,
    `GPU:      WebGPU — runs a 1.7B LLM, and DOOM`,
    `Memory:   two dogs, one guitar, ∞ open tabs`,
  ]
  const rows = Math.max(art.length, info.length)
  return Array.from({ length: rows }, (_, i) =>
    `${(art[i] ?? ' '.repeat(14)).padEnd(16)}${info[i] ?? ''}`.trimEnd(),
  )
}

/** htop as text: jittered core bars plus the shared process table. */
function htopLines(): string[] {
  const bar = (base: number) => {
    const pct = base === 0 ? 0 : Math.round(Math.min(98, Math.max(2, base + (Math.random() - 0.5) * 18)))
    const width = 24
    const filled = Math.round((pct / 100) * width)
    return `[${'|'.repeat(filled).padEnd(width)}${String(pct).padStart(3)}%]`
  }
  return [
    `  1 ${bar(34)}   tasks: ${processes.length} total, ${processes.filter((p) => p.cpu > 0).length} running`,
    `  2 ${bar(58)}   load average: ${about.currently.find((r) => r.label === 'status')?.value}`,
    `  3 ${bar(21)}   uptime: 18 years`,
    `  4 ${bar(76)}`,
    '',
    '  PID   CPU%   TIME+    COMMAND',
    ...processes.map(
      (p) =>
        `  ${String(p.pid).padEnd(6)}${p.cpu.toFixed(1).padStart(4)}   ${p.time.padStart(6)}   ${p.command}`,
    ),
  ]
}

function ls(args: string[]): ShellResult {
  const flags = args.filter((a) => a.startsWith('-')).join('')
  const target = args.find((a) => !a.startsWith('-'))
  const all = flags.includes('a')
  const long = flags.includes('l')

  if (target && SECTIONS[target.replace(/\/$/, '')] === workLines) {
    return {
      lines: work.map((w) =>
        long
          ? `lrwxr-xr-x  jbouder  staff   ${w.name} -> ${w.href}`
          : w.name,
      ),
    }
  }
  if (target) {
    return { lines: [`ls: ${target}: No such file or directory`] }
  }

  const rows: Array<[string, string]> = [
    ['drwxr-xr-x', 'selected-work/'],
    ['-rw-r--r--', 'about.md'],
    ['-rw-r--r--', 'resume.txt'],
    ['-rw-r--r--', 'contact.txt'],
    ['-rwxr-xr-x', 'doom*'],
  ]
  if (all) rows.splice(1, 0, ['-rw-------', '.plan'])
  return {
    lines: long
      ? [`total ${rows.length}`, ...rows.map(([mode, name]) => `${mode}  jbouder  staff   ${name}`)]
      : [rows.map(([, name]) => name).join('   ')],
  }
}

function cat(target: string | undefined): ShellResult {
  switch (target) {
    case 'about.md':
      return { lines: aboutLines() }
    case 'resume.txt':
      return { lines: resumeLines() }
    case 'contact.txt':
      return { lines: contactLines() }
    case '.plan':
      // A tribute to the finest .plan files ever written.
      return {
        lines: [
          ...about.currently.map((row) => `+ ${row.label}: ${row.value}`),
          '- sleep',
        ],
      }
    case 'selected-work':
    case 'selected-work/':
      return { lines: ['cat: selected-work: Is a directory'] }
    case 'doom':
      return { lines: ['cat: doom: binary file. just run it.'] }
    case undefined:
      return { lines: ['usage: cat <file>'] }
    default: {
      const guess = didYouMean(target, [...FILES])
      return {
        lines: [
          `cat: ${target}: No such file or directory`,
          ...(guess ? [`did you mean: ${guess}?`] : []),
        ],
      }
    }
  }
}

/** cd prints the section it "enters" — this shell is a view, not a page. */
function cd(target: string | undefined): ShellResult {
  if (!target || target === '~' || target === '/' || target === '~/') {
    return { lines: [] }
  }
  const section = SECTIONS[target.replace(/\/$/, '')]
  if (section) return { lines: section() }
  return { lines: [`cd: no such file or directory: ${target}`] }
}

function open(target: string | undefined): ShellResult {
  if (!target) {
    return { lines: [`usage: open <${Object.keys(OPEN_TARGETS).join('|')}>`] }
  }
  const href = OPEN_TARGETS[target.toLowerCase()]
  if (href) {
    return {
      lines: [`opening ${href} …`],
      action: { type: 'open', href },
    }
  }
  const guess = didYouMean(target, Object.keys(OPEN_TARGETS))
  return {
    lines: [
      `open: ${target}: not found`,
      ...(guess ? [`did you mean: open ${guess}?`] : []),
    ],
  }
}

export function runShellCommand(
  input: string,
  ctx: { themeMode: ThemeMode; history: string[] },
): ShellResult {
  const [cmd = '', ...args] = input.trim().split(/\s+/)
  const arg = args[0] as string | undefined

  switch (cmd.toLowerCase()) {
    case '':
      return { lines: [] }
    case 'help':
    case '?':
      return { lines: HELP }
    case 'ls':
    case 'll':
      return ls(cmd.toLowerCase() === 'll' ? ['-la', ...args] : args)
    case 'cat':
      return cat(arg)
    case 'cd':
      return cd(arg)
    case 'open':
      return open(arg)
    case 'man':
      if (!arg) return { lines: ['What manual page do you want?'] }
      if (arg === 'jbouder') return { lines: MAN_PAGE }
      if (arg === 'doom') return { lines: ['No manual entry for doom. iddqd.'] }
      return { lines: [`No manual entry for ${arg}`] }
    case 'neofetch':
    case 'fastfetch':
    case 'screenfetch':
      return { lines: neofetch(ctx.themeMode) }
    case 'htop':
    case 'top':
    case 'ps':
      return { lines: htopLines() }
    case 'history':
      return {
        lines: ctx.history.map(
          (h, i) => `  ${String(i + 1).padStart(3)}  ${h}`,
        ),
      }
    case 'echo':
      return { lines: [args.join(' ')] }
    case 'clear':
      return { lines: [], action: { type: 'clear' } }
    case 'party': {
      const wantsOff = args.some((a) => /^(off|stop|down)$/i.test(a))
      const isParty = ctx.themeMode === 'party'
      if (wantsOff || (isParty && args.length === 0)) {
        return isParty
          ? {
              lines: ['party mode: OFF. back to serious terminal business.'],
              action: { type: 'theme', mode: 'system' },
            }
          : { lines: ['no party running. `party on` fixes that.'] }
      }
      return isParty
        ? { lines: ['the party is already in full swing. look around.'] }
        : {
            lines: ['🎉 party mode: ON. `party off` when you need to look employable.'],
            action: { type: 'theme', mode: 'party' },
          }
    }
    case 'theme': {
      if (arg === 'light' || arg === 'dark' || arg === 'system' || arg === 'party') {
        return {
          lines: [`theme set to ${arg}`],
          action: { type: 'theme', mode: arg },
        }
      }
      return { lines: ['usage: theme <light|dark|system|party>'] }
    }
    case 'doom':
    case './doom':
    case 'iddqd':
      return {
        lines: [
          cmd.toLowerCase() === 'iddqd'
            ? 'degreelessness mode ON.'
            : 'W_Init: Init WADfiles. adding doom1.wad',
          'rip and tear.',
        ],
        action: { type: 'doom' },
      }
    case 'whoami':
      return { lines: [site.name, site.title] }
    case 'pwd':
      return { lines: ['/home/jbouder'] }
    case 'uptime':
      return {
        lines: ['up 18 years, 1 user, load average: 0.42 0.42 0.42'],
      }
    case 'date':
      return { lines: [new Date().toString()] }
    case 'sudo':
      if (args.join(' ').startsWith('rm -rf')) {
        return { lines: ['nice try.'] }
      }
      return {
        lines: [
          'jbouder is not in the sudoers file. This incident will be reported.',
        ],
      }
    case 'vim':
    case 'vi':
    case 'nvim':
      return {
        lines: [
          'vim is already running — this whole site is one buffer.',
          'see the footer. `:q` if you think it will help.',
        ],
      }
    case 'emacs':
      return { lines: ['zsh: command not found: emacs (this is a vim household)'] }
    case 'exit':
    case 'logout':
    case 'quit':
      return { lines: ['logout'], action: { type: 'exit' } }
    case 'rm':
      return { lines: [`rm: ${args.join(' ') || '.'}: Permission denied`] }
    case 'whois':
    case 'finger':
      return { lines: [bio.summary] }
    default: {
      const guess = didYouMean(cmd, [...COMMANDS])
      return {
        lines: [
          `zsh: command not found: ${cmd}`,
          ...(guess ? [`did you mean: ${guess}?`] : []),
        ],
      }
    }
  }
}

/** Argument completions per command; first token completes from COMMANDS. */
const ARG_COMPLETIONS: Record<string, string[]> = {
  cat: [...FILES, 'selected-work/'],
  cd: ['selected-work/', 'work', 'about', 'resume', 'contact', '~'],
  ls: ['selected-work/'],
  open: Object.keys(OPEN_TARGETS),
  man: ['jbouder'],
  party: ['on', 'off'],
  theme: ['light', 'dark', 'system', 'party'],
}

/**
 * Tab completion. Returns the new input when it can extend it (unique match
 * or a longer common prefix), plus the candidate list when it is ambiguous —
 * classic shell behavior: extend as far as possible, then show options.
 */
export function completeShellInput(input: string): {
  completed?: string
  options?: string[]
} {
  const endsWithSpace = /\s$/.test(input)
  const tokens = input.trimStart().split(/\s+/).filter(Boolean)

  let pool: string[]
  let partial: string
  let prefix: string
  if (tokens.length === 0) return {}
  if (tokens.length === 1 && !endsWithSpace) {
    pool = [...COMMANDS]
    partial = tokens[0]
    prefix = input.slice(0, input.length - partial.length)
  } else {
    pool = ARG_COMPLETIONS[tokens[0].toLowerCase()] ?? []
    partial = endsWithSpace ? '' : tokens[tokens.length - 1]
    prefix = input.slice(0, input.length - partial.length)
  }

  const matches = pool.filter((p) =>
    p.toLowerCase().startsWith(partial.toLowerCase()),
  )
  if (matches.length === 0) return {}
  if (matches.length === 1) {
    const suffix = matches[0].endsWith('/') ? '' : ' '
    return { completed: `${prefix}${matches[0]}${suffix}` }
  }
  // Extend to the longest common prefix, and list the options.
  let common = matches[0]
  for (const m of matches.slice(1)) {
    while (!m.toLowerCase().startsWith(common.toLowerCase())) {
      common = common.slice(0, -1)
    }
  }
  return {
    completed: common.length > partial.length ? `${prefix}${common}` : undefined,
    options: matches,
  }
}
