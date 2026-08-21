/**
 * Everything the local assistant knows, derived from `src/data/site.ts`.
 *
 * The model runs entirely in the visitor's browser (WebLLM + WebGPU), so this
 * knowledge base is the only grounding it gets — there is no retrieval step and
 * no server. Edit `src/data/site.ts` and the assistant's answers follow.
 */

import { about, bio, resume, site, socials, stats, work } from '../data/site'

/**
 * The assistant is desktop-only (see `MIN_WIDTH`), so there is no need to trade
 * capability away for a phone-sized model — this is the same model acolyte
 * serves to desktops.
 */
export const MODEL_ID = 'Qwen3-1.7B-q4f16_1-MLC'

/**
 * Below this width the assistant does not render at all. Phones would be
 * downloading ~1 GB of weights over cellular to run a model their memory
 * budget is unlikely to hold.
 */
export const MIN_WIDTH = 768

/** "Qwen3-1.7B-q4f16_1-MLC" -> "qwen3 1.7b", for the panel header. */
export function formatModelName(id: string): string {
  const match = id.match(/^([A-Za-z]+[\d.]*)-([\d.]+B)/)
  return (match ? `${match[1]} ${match[2]}` : id).toLowerCase()
}

const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n')

const knowledge = [
  `# Johnny Bouder`,
  bio.summary,
  `Refer to Johnny using ${bio.pronouns} pronouns.`,
  '',
  `## Headline`,
  site.title,
  site.tagline,
  '',
  `## At a glance`,
  list(stats.map((s) => `${s.label.toLowerCase()}: ${s.value}`)),
  '',
  `## In his own words`,
  about.paragraphs.join('\n\n'),
  '',
  `## Currently`,
  list(about.currently.map((row) => `${row.label}: ${row.value}`)),
  '',
  `## Experience`,
  resume
    .map((entry) => `- ${entry.period} — ${entry.role} at ${entry.org}. ${entry.description}`)
    .join('\n'),
  '',
  `## Education`,
  bio.education,
  '',
  `## Military service`,
  bio.military,
  '',
  `## Stack`,
  `Asked what his stack is, answer with exactly this: ${bio.stack}`,
  '',
  `## Skills (broader than the stack above)`,
  list(bio.skills.map((s) => `${s.label}: ${s.value}`)),
  '',
  `## Notable work and highlights`,
  list(bio.highlights),
  '',
  `## Selected projects (all open source on GitHub)`,
  work
    .map((entry) => `- ${entry.name} (${entry.meta}) — ${entry.description} ${entry.href}`)
    .join('\n'),
  '',
  `## Writing`,
  bio.writing.map((post) => `- "${post.title}" (${post.href}) — ${post.summary}`).join('\n'),
  '',
  `## Outside of work`,
  bio.family,
  `Things he is into: ${bio.interests.join(', ')}.`,
  '',
  `## Contact and availability`,
  bio.availability,
  list(socials.map((s) => `${s.label}: ${s.href}`)),
  '',
  `## This website`,
  `The site you are on is Johnny's terminal-styled portfolio. It has four themes — light, dark, system, and party — switchable from the toggle in the header. Party mode cycles the colors through the rainbow and rains confetti glyphs down the page. Visitors can also toggle it right here in the chat by typing "party on" or "party off".`,
].join('\n')

export const SYSTEM_PROMPT = `You are the assistant on Johnny Bouder's personal website. Visitors ask you about Johnny — his background, his work, his skills, and how to reach him. You run locally in the visitor's browser.

Answer using ONLY the profile below. It is the complete set of facts you have.

${knowledge}

Rules:
- The profile above is your ONLY source of truth. If a fact is not written in it, you do not know that fact. Do not fill the gap from general knowledge, and do not guess a name, place, school, date, or number that does not appear above.
- Facts the profile does NOT contain include (among others) his age, salary, graduation year, exact address, the names or number of his children, his dogs' names or breeds, and any employer or school not named above. Asked about any of these, say it is not something the site covers and point the visitor at ${site.email}.
- Keep answers about his family brief and general. The profile says he is a husband, a father, and has two dogs; that is all you know and all you should say.
- Example — visitor: "What year did he graduate?" You: "That isn't something this site covers — ${site.email} is the best way to ask him directly."
- If part of a question is covered and part is not, answer the covered part and say plainly that the rest is not covered.
- Answer in 1-3 short sentences unless the visitor asks for detail. Be direct and conversational.
- Talk about Johnny in the third person. You are his site's assistant, not Johnny.
- Your replies are rendered as plain text, so no markdown: no headings, no bold, no [text](url) links. Write URLs bare, exactly once. Use plain sentences, or a short dash list when listing things.
- Skip preamble like "Based on the profile" — just answer.`

/** Starter prompts shown in the empty panel. */
export const SUGGESTIONS = [
  'What does Johnny do?',
  'What has he built?',
  'What is his stack?',
  'Turn on party mode 🎉',
]

export type PartyIntent = 'on' | 'off' | 'toggle'

/**
 * Party mode is toggled like a shell built-in: matched deterministically here
 * and handled without the model, so it is instant, reliable, and available
 * even while the weights are still downloading. Descriptive questions
 * ("what is party mode?") fall through to the model, which knows about it
 * from the profile above.
 */
export function partyCommand(input: string): PartyIntent | null {
  const text = input.toLowerCase()
  if (!/\bparty\b/.test(text)) return null
  if (/\b(off|disable|stop|exit|end|quit|kill|down)\b/.test(text)) return 'off'
  if (/\btoggle\b/.test(text)) return 'toggle'
  if (/\b(on|enable|start|activate|turn|engage|launch|begin|sudo)\b/.test(text)) {
    return 'on'
  }
  // A bare "party" / "party mode" / "party time" reads as a command;
  // anything longer without a verb is a question for the model.
  return text.split(/\s+/).length <= 3 ? 'toggle' : null
}
