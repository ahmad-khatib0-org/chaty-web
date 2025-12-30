import { createHash } from 'crypto'

type BuildEnv = {
  NEXT_PHASE?: string
  __NEXT_OPTIMIZE_FONTS?: string
  __NEXT_OPTIMIZE_CSS?: string
  npm_lifecycle_event?: string
  CI?: string
}

export function isBuildStage() {
  // Server-side check only (process exists)
  if (typeof process === 'undefined') return false

  const env = process.env as BuildEnv

  const isNextBuild = [
    // Next.js build process
    env.NEXT_PHASE === 'phase-production-build',
    // Next.js optimization phases
    env.__NEXT_OPTIMIZE_FONTS === 'true',
    env.__NEXT_OPTIMIZE_CSS === 'true',
    // npm/yarn build command
    env.npm_lifecycle_event === 'build',
    // CI environment (GitHub Actions, CircleCI, etc.)
    env.CI === 'true',
  ]

  return isNextBuild.some(Boolean)
}

// Helper function to calculate content hash
export function calculateHash(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}
