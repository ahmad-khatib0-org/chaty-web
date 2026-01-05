import 'server-only'
import { headers } from 'next/headers'
const CircuitBreaker = require('opossum')

import { AuthCheckResponse } from '@/types/server'
import { Trans } from './translation'

export function getPasswordRequirements(lang: string) {
  const tr = Trans.tr
  return [
    { re: '[0-9]', label: tr(lang, 'password.numbers') },
    { re: '[a-z]', label: tr(lang, 'password.lowercase') },
    { re: '[A-Z]', label: tr(lang, 'password.uppercase') },
    { re: "[$&+,:;=?@#|'<>.^*()%!-]", label: tr(lang, 'password.symbols') },
  ]
}

class OAuthServiceStatusChecker {
  private breaker: typeof CircuitBreaker
  static url = process.env['OAUTH_HEALTH_CHECK_URL'] as string

  constructor() {
    const options = {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      autoRenewAbortController: true,
      abortMessage: 'Hydra health check timed out',
    }

    this.breaker = new CircuitBreaker(this.checkHydraHealth.bind(this), options)
    this.setupEventListeners()
  }

  private async checkHydraHealth({ signal }: { signal?: AbortSignal } = {}): Promise<boolean> {
    try {
      const res = await fetch(OAuthServiceStatusChecker.url, {
        signal, // allows the circuit breaker to abort the request
        method: 'GET',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`Hydra health status: ${res.status}`)
      }

      const healthData = await res.json()
      return healthData.status === 'ok'
    } catch (err: any) {
      // Handle abort error specifically
      if (err.name === 'AbortError') {
        console.warn('Hydra health check was aborted due to timeout')
        throw new Error('Health check timeout')
      }

      console.error('Hydra health check failed:', err)
      throw err
    }
  }

  async isOauthServiceAlive(): Promise<boolean> {
    try {
      return await this.breaker.fire()
    } catch {
      return false
    }
  }

  private setupEventListeners(): void {
    this.breaker.on('open', () => {
      console.warn('Hydra circuit breaker opened - service unavailable')
    })

    this.breaker.on('halfOpen', () => {
      console.log('Hydra circuit breaker half-open - testing service')
    })

    this.breaker.on('close', () => {
      console.log('Hydra circuit breaker closed - service available')
    })

    this.breaker.on('failure', (error: Error) => {
      console.error('Hydra health check failed:', error.message)
    })

    this.breaker.on('timeout', (error: Error) => {
      console.warn('Hydra health check timed out:', error.message)
    })

    this.breaker.on('success', (result: boolean) => {
      console.log('Hydra health check succeeded:', result)
    })

    this.breaker.on('reject', (error: Error) => {
      console.warn('Hydra health check rejected (circuit open):', error.message)
    })
  }

  getStats() {
    return this.breaker.stats
  }

  closeCircuit() {
    this.breaker.close()
  }
}

export const oauthServiceStatusChecker = new OAuthServiceStatusChecker()

/**
 * Checks user authentication against the check endpoint with retry mechanism.
 * @param headers - Optional headers to forward (e.g., Cookie header from incoming request)
 * @param maxRetries - The maximum number of times to retry on internal server errors. Defaults to 2.
 * @returns An object containing the success status, user info, and an error flag.
 */
export async function getUserAuthInfo(
  headers?: Record<string, string>,
  maxRetries: number = 2
): Promise<AuthCheckResponse> {
  let attempt = 0
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const endpoint = `${process.env.BASE_URL ?? ''}/api/auth/check`

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { ...headers, 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (response.ok) {
        const { email } = (await response.json()) as { email?: string }
        return { isInternalError: false, success: !!email, email: email ?? '' }
      }

      if (response.status >= 400 && response.status < 500) {
        return { success: false, isInternalError: false, email: '' }
      }

      if (response.status >= 500) {
        attempt++
        if (attempt <= maxRetries) {
          console.warn(`Auth check failed (server error), retrying... Attempt ${attempt} of ${maxRetries}`)
          await delay(1000 * attempt)
          continue
        } else {
          return { success: false, isInternalError: true, email: '' }
        }
      }
    } catch (error) {
      // Network error - transient
      attempt++
      const msg = `Auth check failed (network error), retrying... Attempt ${attempt} of ${maxRetries}`
      console.error(msg, error)
      if (attempt <= maxRetries) {
        await delay(1000 * attempt)
        continue
      } else {
        return { success: false, isInternalError: true, email: '' }
      }
    }
  }

  return { success: false, isInternalError: true, email: '' }
}

/**
 * Reads all incoming client headers from the Next.js request and converts
 * them into a simple Record<string, string> object for forwarding to an
 * internal fetch call.
 * Note: Headers will be lowercased due to standard Web Headers API behavior.
 * @returns A Record<string, string> object containing all client headers.
 */
export async function getForwardableHeaders(): Promise<Record<string, string>> {
  const requestHeaders = await headers()
  const forwardedHeaders: Record<string, string> = {}

  requestHeaders.forEach((value, key) => {
    forwardedHeaders[key.toLowerCase()] = value
  })

  return forwardedHeaders
}

export function getOAuthRequestErrMsg(lang: string, code: string, desc: string): string {
  const tr = (id: string): string => {
    return Trans.tr(lang, id)
  }

  switch (code) {
    case 'invalid_request':
      if (desc.includes('redirect_uri')) {
        return tr('oauth.invalid_request.redirect_uri')
      }
      return tr('oauth.invalid_request.general')
    case 'access_denied':
      return tr('oauth.access_denied.user')
    case 'unauthorized_client':
      return tr('oauth.unauthorized_client')
    case 'unsupported_response_type':
      return tr('oauth.unsupported_response_type')
    case 'invalid_scope':
      return tr('oauth.invalid_scope')
    case 'server_error':
      return tr('oauth.server_error.internal')
    case 'temporarily_unavailable':
      return tr('oauth.temporarily_unavailable')
    default:
      return tr('oauth.unknown_error')
  }
}
