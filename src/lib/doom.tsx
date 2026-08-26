import { Suspense, createContext, lazy, useContext, useMemo, useState } from 'react'

/**
 * DOOM can be launched from two places — the hero terminal (`doom`) and the
 * assistant chat (`iddqd`) — so the overlay is hosted once here, above both.
 * Code-split so the overlay (and the ~6.5 MB wasm it fetches on mount) costs
 * nothing until someone actually invokes it.
 */
const DoomOverlay = lazy(() => import('../components/DoomOverlay'))

type DoomContextValue = {
  isDoomOpen: boolean
  openDoom: () => void
  closeDoom: () => void
}

const DoomContext = createContext<DoomContextValue | null>(null)

export function DoomProvider({ children }: { children: React.ReactNode }) {
  const [isDoomOpen, setIsDoomOpen] = useState(false)
  const value = useMemo(
    () => ({
      isDoomOpen,
      openDoom: () => setIsDoomOpen(true),
      closeDoom: () => setIsDoomOpen(false),
    }),
    [isDoomOpen],
  )

  return (
    <DoomContext.Provider value={value}>
      {children}
      {isDoomOpen && (
        <Suspense fallback={null}>
          <DoomOverlay onClose={() => setIsDoomOpen(false)} />
        </Suspense>
      )}
    </DoomContext.Provider>
  )
}

export function useDoom(): DoomContextValue {
  const context = useContext(DoomContext)
  if (!context) throw new Error('useDoom requires a <DoomProvider>')
  return context
}
