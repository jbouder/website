import { createClientOnlyFn } from '@tanstack/react-start'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { MODEL_ID } from './assistant'

/**
 * WebLLM is ~6 MB of WASM glue and only ever runs in the browser. Wrapping the
 * dynamic import in `createClientOnlyFn` keeps it out of the SSR module graph
 * entirely, so it never ships inside the Cloudflare Worker bundle — only the
 * client chunk, and only fetched when a visitor opens the assistant.
 */
export const createEngine = createClientOnlyFn(
  async (onProgress: (text: string) => void): Promise<MLCEngineInterface> => {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    return CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report) => onProgress(report.text),
    })
  },
)
