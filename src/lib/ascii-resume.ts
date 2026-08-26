/**
 * The resume served to `curl johnnybouder.com` — wttr.in-style plain text,
 * built from the same `src/data/site.ts` that renders the page. Assembled
 * server-side only (see the GET handler in `src/routes/index.tsx`).
 */

import { about, resume, site, socials, stats, work } from '../data/site'

const WIDTH = 78

function wrap(text: string, indent = 0): string[] {
  const pad = ' '.repeat(indent)
  const words = text.split(' ')
  const lines: string[] = []
  let line = pad
  for (const word of words) {
    if (line.length > indent && line.length + word.length + 1 > WIDTH) {
      lines.push(line)
      line = pad + word
    } else {
      line = line.length > indent ? `${line} ${word}` : pad + word
    }
  }
  if (line.trim()) lines.push(line)
  return lines
}

function rule(char = '─'): string {
  return char.repeat(WIDTH)
}

export function asciiResume(): string {
  const lines = [
    '',
    '     ██╗ ██████╗ ██╗  ██╗███╗   ██╗███╗   ██╗██╗   ██╗',
    '     ██║██╔═══██╗██║  ██║████╗  ██║████╗  ██║╚██╗ ██╔╝',
    '     ██║██║   ██║███████║██╔██╗ ██║██╔██╗ ██║ ╚████╔╝ ',
    '██   ██║██║   ██║██╔══██║██║╚██╗██║██║╚██╗██║  ╚██╔╝  ',
    '╚█████╔╝╚██████╔╝██║  ██║██║ ╚████║██║ ╚████║   ██║   ',
    ' ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝   ╚═╝   ',
    '██████╗  ██████╗ ██╗   ██╗██████╗ ███████╗██████╗ ',
    '██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔══██╗',
    '██████╔╝██║   ██║██║   ██║██║  ██║█████╗  ██████╔╝',
    '██╔══██╗██║   ██║██║   ██║██║  ██║██╔══╝  ██╔══██╗',
    '██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████╗██║  ██║',
    '╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝',
    '',
    site.title,
    rule('═'),
    '',
    ...wrap(site.tagline),
    '',
    stats.map((s) => `${s.label}: ${s.value}`).join('   '),
    '',
    'EXPERIENCE',
    rule(),
    ...resume.flatMap((entry) => [
      `${entry.period.padEnd(14)}${entry.role} · ${entry.org}`,
      ...wrap(entry.description, 14),
      '',
    ]),
    'SELECTED WORK',
    rule(),
    ...work.flatMap((entry) => [
      `${entry.name.padEnd(14)}${entry.meta}`,
      ...wrap(entry.description, 14),
      `${' '.repeat(14)}${entry.href}`,
      '',
    ]),
    'ABOUT',
    rule(),
    ...about.paragraphs.flatMap((p) => [...wrap(p), '']),
    'CONTACT',
    rule(),
    `email:        ${site.email}`,
    ...socials.map((s) => `${s.label.padEnd(14)}${s.href}`),
    '',
    rule('═'),
    'The interactive version lives at https://johnnybouder.com — it has a',
    'working shell (try `man jbouder`), an in-browser LLM, and it runs DOOM.',
    'You are seeing plain text because your user agent looks like a terminal.',
    'Respect.',
    '',
  ]
  return lines.join('\n')
}
