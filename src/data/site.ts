/**
 * All personal content for the site lives here.
 * Edit this file to update copy without touching components.
 */

export const site = {
  name: 'johnny bouder',
  title: 'Johnny Bouder — Frontend Engineer',
  description:
    'Johnny Bouder is a frontend engineer focused on open source, developer experience, and the web platform.',
  email: 'jbouder@openteams.com',
  prompt: '~/jbouder', // shown in the header title bar
  tagline:
    'Frontend engineer on a relentless quest for knowledge. I build interfaces, open-source tools, and the developer experience around them — lately that means AI agents, WebGPU experiments, and design systems that people actually enjoy using.',
}

export const stats = [
  { label: 'UPTIME', value: '18 yrs' },
  { label: 'STACK', value: 'React / TS / Python' },
  { label: 'FOCUS', value: 'UI, UX, & DX' },
  { label: 'LOCATION', value: 'Remote / US' },
]

export type WorkEntry = {
  index: string
  name: string
  description: string
  meta: string
  href: string
}

export const work: WorkEntry[] = [
  {
    index: '001',
    name: 'acolyte',
    description:
      'An app to help web developers with their daily tasks — the sidekick every dev deserves.',
    meta: 'TS · 2024',
    href: 'https://github.com/jbouder/acolyte',
  },
  {
    index: '002',
    name: 'holotable',
    description:
      'Generative business intelligence dashboard concept. Ask a question, get a dashboard.',
    meta: 'TS · 2025',
    href: 'https://github.com/jbouder/holotable',
  },
  {
    index: '003',
    name: 'agent-quest',
    description:
      'Claude Code agents in a gaming context — coding agents leveling up, spending gold, and completing quests.',
    meta: 'TS · 2026',
    href: 'https://github.com/jbouder/agent-quest',
  },
  {
    index: '004',
    name: 'webgpu-playground',
    description:
      'Experimental WebGPU exploration tool — shaders, compute, and things browsers were not supposed to do.',
    meta: 'TS · 2025',
    href: 'https://github.com/jbouder/webgpu-playground',
  },
  {
    index: '005',
    name: 'motion-lab',
    description:
      'A playground for motion and transition experiments. Where easing curves go to be judged.',
    meta: 'TS · 2025',
    href: 'https://github.com/jbouder/motion-lab',
  },
]

export const about = {
  paragraphs: [
    'I have spent my career one refresh away from the user — building frontends, component libraries, and the tooling that makes shipping them less painful. The bio says "relentless quest for knowledge" and it is not a bit: if there is a new web API, runtime, or agent framework, I have probably already broken something with it.',
    'Most of my work lives where developer experience meets open source: design systems teams actually adopt, starter kits that skip the boilerplate arguments, and lately, coding agents — figuring out what software development looks like when the IDE talks back.',
    'Off the clock: side projects that occasionally escape into production, and an ever-growing list of experiments in the lab.',
  ],
  currently: [
    { label: 'building', value: 'agent-quest' },
    { label: 'exploring', value: 'AI coding agents' },
    { label: 'stack', value: 'React, TS, TanStack' },
    { label: 'status', value: 'open to interesting problems' },
  ],
}

export type ResumeEntry = {
  period: string
  role: string
  org: string
  description: string
}

export const resume: ResumeEntry[] = [
  {
    period: '2026 — now',
    role: 'Director of Engineering — AI Experience',
    org: 'OpenTeams',
    description:
      'Leading engineering for AI experience — open-source platforms, agentic workflows, and the frontends that make them usable.',
  },
  {
    period: '2008 — 2026',
    role: 'Principal Software Engineer',
    org: 'MetroStar',
    description:
      'Led frontend engineering across government digital services. Created Comet, the open-source React component library and starter kit.',
  },
]

export const socials = [
  { label: 'github', href: 'https://github.com/jbouder' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/johnny-bouder/' },
  { label: 'openteams', href: 'https://www.openteams.com' },
]
