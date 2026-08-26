import { Link, useLocation } from '@tanstack/react-router'
import { didYouMean } from '../lib/shell'

/** Pages the 404 can plausibly redirect to, by their zsh-ish names. */
const KNOWN_PATHS: Record<string, string> = {
  work: '/#work',
  'selected-work': '/#work',
  projects: '/#work',
  about: '/#about',
  resume: '/#resume',
  cv: '/#resume',
  contact: '/#contact',
  hello: '/#contact',
  home: '/',
}

export default function NotFound() {
  const { pathname } = useLocation()
  const slug = pathname.replace(/^\/+|\/+$/g, '') || pathname
  const guess = didYouMean(slug, Object.keys(KNOWN_PATHS))

  return (
    <main className="relative z-[5] mx-auto max-w-[1180px] px-8">
      <section className="pt-[140px] pb-[160px]">
        <div className="text-[13px]" style={{ color: 'var(--ink-dim)' }}>
          <span style={{ color: 'var(--acc)' }}>$</span> open {pathname}
        </div>
        <h1
          className="mt-6 mb-0 font-bold"
          style={{
            fontSize: 'clamp(24px, 4vw, 44px)',
            letterSpacing: '-.03em',
            color: 'var(--ink-bright)',
            textWrap: 'balance',
          }}
        >
          zsh: no such file or directory: {pathname}
        </h1>
        <p className="mt-5 text-[15px]" style={{ color: 'var(--ink-soft)' }}>
          exit code 127 — whatever lived here has been{' '}
          <code style={{ color: 'var(--acc2)' }}>rm</code>&apos;d, renamed, or
          never existed.
          {guess && (
            <>
              {' '}
              did you mean{' '}
              <a href={KNOWN_PATHS[guess]} style={{ color: 'var(--acc)' }}>
                {guess}
              </a>
              ?
            </>
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/" className="btn btn-acc">
            cd ~
          </Link>
          {guess && (
            <a href={KNOWN_PATHS[guess]} className="btn">
              ./{guess}
            </a>
          )}
        </div>
      </section>
    </main>
  )
}
