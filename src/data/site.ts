/**
 * All personal content for the site lives here.
 * Edit this file to update copy without touching components.
 */

export const site = {
  name: 'johnny bouder',
  title: 'Johnny Bouder — AI Experience Engineer',
  description:
    'Johnny Bouder is a frontend-focused AI experience engineer and director focused on open source, developer experience, and web applications.',
  email: 'jbouder@openteams.com',
  prompt: '~/jbouder', // shown in the header title bar
  tagline:
    'Engineer, leader, advocate…on a relentless quest for knowledge. I build AI-enabled experiences, open-source tools, and the developer experience around them — lately that means AI agents, lots of experimentation, and design systems that people actually enjoy using.',
}

export const stats = [
  { label: 'UPTIME', value: '18 yrs' },
  { label: 'STACK', value: 'React / TS / Python' },
  { label: 'FOCUS', value: 'UI / UX / DX' },
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
    meta: 'TS · 2025',
    href: 'https://github.com/jbouder/acolyte',
  },
  {
    index: '002',
    name: 'holotable',
    description:
      'Generative business intelligence dashboard concept. Ask a question, get a dashboard.',
    meta: 'TS · 2026',
    href: 'https://github.com/jbouder/holotable',
  },
  {
    index: '003',
    name: 'motion-lab',
    description:
      'A playground for motion and transition experiments. Where easing curves go to be judged.',
    meta: 'TS · 2026',
    href: 'https://github.com/jbouder/motion-lab',
  },
  {
    index: '004',
    name: 'agent-quest',
    description:
      'Claude Code agents in a gaming context — coding agents leveling up, spending gold, and completing quests.',
    meta: 'TS · 2026',
    href: 'https://github.com/jbouder/agent-quest',
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
  {
    period: '2003 — 2007',
    role: 'Sergeant — Combat Engineer',
    org: 'United States Marine Corps',
    description:
      'Served as a combat engineer, reaching the rank of Sergeant before moving into software.',
  },
]

export const socials = [
  { label: 'github', href: 'https://github.com/jbouder' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/johnny-bouder/' },
  { label: 'openteams', href: 'https://www.openteams.com' },
]

/**
 * Extra biographical detail that does not appear anywhere on the page but is
 * fair game for the assistant to answer from. Everything here is public.
 * The assistant is instructed to answer only from this file — see
 * `src/lib/assistant.ts`.
 */
export const bio = {
  /** Drives how the assistant refers to Johnny. Change here and it changes everywhere. */
  pronouns: 'he/him',
  summary:
    'Johnny Bouder is a frontend-focused engineer and engineering leader with roughly 18 years of experience building for the web. He currently leads AI experience engineering at OpenTeams, and before that spent his career at MetroStar building government digital services and open-source design systems.',

  education:
    'Studied computer science at George Mason University (GMU) in Virginia.',

  military:
    'Served in the United States Marine Corps (USMC) from 2003 to 2007 as a combat engineer, reaching the rank of Sergeant, before starting his software career.',

  /** The short answer to "what's your stack?" — one of the assistant's suggested questions. */
  stack:
    'React, TypeScript, shadcn/ui, Tailwind CSS, TanStack, Python, and FastAPI.',

  skills: [
    {
      label: 'languages',
      value: 'TypeScript, JavaScript, Python, C#, HTML, CSS',
    },
    {
      label: 'frontend',
      value:
        'React, TanStack (Start / Router / Query), Tailwind CSS, shadcn/ui, Storybook',
    },
    {
      label: 'backend',
      value: 'Python, FastAPI, PostgreSQL',
    },
    {
      label: 'ai',
      value:
        'Coding agents, agentic workflows, MCP, local in-browser inference (WebLLM / WebGPU)',
    },
    {
      label: 'platform',
      value: 'Cloudflare Workers, Docker, AWS, Azure',
    },
    {
      label: 'practice',
      value:
        'Design systems, developer experience, accessibility, open-source maintenance, technical leadership',
    },
  ],

  highlights: [
    'Created Comet at MetroStar: an open-source React + TypeScript component library built on the U.S. Web Design System (USWDS) 3.0, with 40+ components split across packages (comet-uswds, comet-data-viz, comet-extras) plus a comet-starter app. It was built to accelerate delivery of federal digital services.',
    'Now Director of Engineering for AI Experience at OpenTeams, leading open-source AI platforms, agentic workflows, and the frontends that make them usable.',
    'Writes about working alongside AI coding tools without losing craft — the argument being that speed is a gift and spending some of it on quality is how you stay in control.',
    'Builds a steady stream of public experiments: acolyte (a web developer sidekick app), holotable (generative BI dashboards), motion-lab (motion and easing experiments), agent-quest (coding agents in a game), webgpu-playground, and a collection of coding-agent skills.',
  ],

  writing: [
    {
      title: 'Slow Down — Simple Lessons for Guiding AI and Shipping Better Code',
      href: 'https://openteams.com/slow-down-ship-better-code/',
      summary:
        'Argues for deliberate restraint with AI coding tools: have the agent draft a plan first and review it, split big changes into separate PRs, be specific about requirements and edge cases, do the small edits yourself so your skills stay sharp, and let a different agent review the PR for an unbiased read.',
    },
  ],

  family: 'Johnny is a husband and a father. He has two dogs.',

  // Noun phrases, so the assistant can drop them straight into a sentence.
  interests: [
    'Star Wars',
    'anime',
    'Magic: The Gathering (MTG)',
    'playing guitar',
    'heavy metal',
    'science fiction',
    'the outdoors and traveling',
    'making cheese at home',
    'Reese’s Peanut Butter Cups, which he accepts as payment',
  ],

  availability:
    'Open to interesting problems. The best way to reach him is email at jbouder@openteams.com; he is also on GitHub as @jbouder and on LinkedIn.',
}
