import { createFileRoute } from '@tanstack/react-router'
import { about, resume, site, socials, stats, work } from '../data/site'
import { useReveal } from '../hooks/use-terminal'

export const Route = createFileRoute('/')({ component: App })

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="cmd">
      <span className="prompt-char">$</span> {children}
    </h2>
  )
}

function App() {
  useReveal()

  return (
    <main className="relative z-[5] mx-auto max-w-[1180px] px-8">
      <Hero />
      <Work />
      <About />
      <Resume />
      <Contact />
    </main>
  )
}

function Hero() {
  return (
    <section
      className="pt-[120px] pb-24"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div className="mb-7 text-[13px]" style={{ color: 'var(--ink-dim)' }}>
        <span style={{ color: 'var(--acc)' }}>$</span> whoami --verbose
      </div>
      <h1
        className="m-0 font-bold"
        style={{
          fontSize: 'clamp(44px, 8.5vw, 116px)',
          lineHeight: 0.95,
          letterSpacing: '-.045em',
          color: 'var(--ink-bright)',
        }}
      >
        <span
          className="typed"
          style={{ '--typed-ch': site.name.length } as React.CSSProperties}
        >
          {site.name}
        </span>
        <span className="cursor" aria-hidden="true" />
      </h1>
      <p
        className="mt-9 mb-0 max-w-[640px] text-[17px] leading-[1.75]"
        style={{ color: 'var(--ink-soft)', textWrap: 'pretty' }}
      >
        {site.tagline}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href="#work" className="btn btn-acc">
          ./selected-work
        </a>
        <a href="#contact" className="btn">
          ./say-hello
        </a>
      </div>
      <div
        className="mt-[72px] grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          background: 'var(--line)',
          border: '1px solid var(--line)',
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="px-5 py-[18px]"
            style={{ background: 'var(--bg)' }}
          >
            <div
              className="text-[11px] tracking-[.12em]"
              style={{ color: 'var(--ink-dim)' }}
            >
              {s.label}
            </div>
            <div className="mt-2 text-[22px]" style={{ color: 'var(--ink-bright)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Work() {
  return (
    <section
      id="work"
      className="py-24"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div data-reveal className="mb-11 flex items-baseline justify-between">
        <Cmd>ls -la ./selected-work</Cmd>
        <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
          {work.length} entries
        </span>
      </div>

      <div className="flex flex-col" style={{ borderTop: '1px solid var(--line)' }}>
        {work.map((entry) => (
          <a
            key={entry.index}
            href={entry.href}
            target="_blank"
            rel="noreferrer"
            data-reveal
            className="work-row"
          >
            <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              {entry.index}
            </span>
            <span
              className="text-[21px]"
              style={{ letterSpacing: '-.02em', color: 'var(--ink-bright)' }}
            >
              {entry.name}
            </span>
            <span
              className="work-desc text-sm leading-[1.6]"
              style={{ color: 'var(--ink-mid)' }}
            >
              {entry.description}
            </span>
            <span className="work-meta text-xs" style={{ color: 'var(--ink-dim)' }}>
              {entry.meta}
            </span>
            <span className="work-arrow" style={{ color: 'var(--acc)' }}>
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section
      id="about"
      className="py-24"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div className="grid items-start gap-[72px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div data-reveal>
          <div className="mb-9">
            <Cmd>cat about.md</Cmd>
          </div>
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              className="mb-[22px] text-[17px] leading-[1.8] last:mb-0"
              style={{ color: 'var(--ink-body)', textWrap: 'pretty' }}
            >
              {p}
            </p>
          ))}
        </div>
        <div
          data-reveal
          style={{
            border: '1px solid var(--line)',
            background: 'rgba(255,255,255,.012)',
          }}
        >
          <div
            className="px-[18px] py-3 text-[11px] tracking-[.14em]"
            style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-dim)' }}
          >
            CURRENTLY
          </div>
          <div className="flex flex-col">
            {about.currently.map((row, i) => (
              <div
                key={row.label}
                className="flex justify-between gap-4 px-[18px] py-3.5 text-[13px]"
                style={
                  i < about.currently.length - 1
                    ? { borderBottom: '1px solid var(--line-soft)' }
                    : undefined
                }
              >
                <span style={{ color: 'var(--ink-dim)' }}>{row.label}</span>
                <span
                  className="text-right"
                  style={{
                    color:
                      i === about.currently.length - 1
                        ? 'var(--acc)'
                        : 'var(--ink)',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Resume() {
  return (
    <section
      id="resume"
      className="py-24"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div data-reveal className="mb-11 flex items-baseline justify-between gap-6">
        <Cmd>history | head -20</Cmd>
      </div>
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--line)' }}>
        {resume.map((entry) => (
          <div
            key={entry.period}
            data-reveal
            className="grid gap-8 py-6 sm:grid-cols-[130px_minmax(0,1fr)]"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <span className="text-[13px]" style={{ color: 'var(--ink-dim)' }}>
              {entry.period}
            </span>
            <div>
              <div className="text-lg" style={{ color: 'var(--ink-bright)' }}>
                {entry.role} <span style={{ color: 'var(--ink-faint)' }}>·</span>{' '}
                {entry.org}
              </div>
              <div
                className="mt-2 max-w-[620px] text-sm leading-[1.65]"
                style={{ color: 'var(--ink-mid)' }}
              >
                {entry.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="pt-[110px] pb-[130px]">
      <div data-reveal>
        <div className="mb-8">
          <Cmd>mail -s &quot;hello&quot;</Cmd>
        </div>
        <a href={`mailto:${site.email}`} className="email-link">
          {site.email}
        </a>
        <div className="mt-12 flex flex-wrap gap-2.5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="btn-sm"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
