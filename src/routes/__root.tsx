import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Assistant from '../components/Assistant'
import Footer from '../components/Footer'
import Header from '../components/Header'
import PartyOverlay from '../components/PartyOverlay'
import { site } from '../data/site'
import { THEME_BOOTSTRAP, ThemeProvider } from '../lib/theme'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: site.title },
      { name: 'description', content: site.description },
      { name: 'theme-color', content: '#0b0d0c' },
      { property: 'og:title', content: site.title },
      { property: 'og:description', content: site.description },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The bootstrap script sets data-theme before hydration, so the server
    // markup (no data-theme, dark tokens via :root) never matches exactly.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must run before first paint to avoid a theme flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="page-bg">
            <div className="fx-grid" aria-hidden="true" />
            <div className="fx-scan-wrap" aria-hidden="true">
              <div className="fx-scan" />
            </div>
            <PartyOverlay />
            <Header />
            {children}
            <Footer />
            <Assistant />
          </div>
        </ThemeProvider>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
