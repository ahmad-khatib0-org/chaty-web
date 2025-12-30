import { cookies, headers } from 'next/headers'

import { ServerCookies, Headers } from '@/types/server'

export interface ClientInformation {
  languageSymbol: string
  languageName: string
  currency: string
  location: string
  ip: string
}

export const DEFAULT_LANGUAGE_SYMBOL = 'en'
export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCATION = 'fr'

export const AVAILABLE_LANGUAGES: { [key: string]: string } = {
  en: 'English',
}

export async function getClientInformation(): Promise<ClientInformation & { needsCheckCookies: boolean }> {
  const h = await headers()
  const c = await cookies()

  let needsCheckCookies = false

  let currency = c.get(ServerCookies.Currency)?.value
  if (!currency) {
    currency = DEFAULT_CURRENCY
    needsCheckCookies = true
  }

  let languageSymbol = c.get(ServerCookies.AcceptLanguage)?.value
  if (!languageSymbol) {
    languageSymbol = DEFAULT_LANGUAGE_SYMBOL
    needsCheckCookies = true
  }

  let languageName = c.get(ServerCookies.LanguageName)?.value
  if (!languageName) {
    languageName = AVAILABLE_LANGUAGES[languageSymbol]
    needsCheckCookies = true
  }

  let location = c.get(ServerCookies.Country)?.value
  if (!location) {
    location = DEFAULT_LOCATION
    needsCheckCookies = true
  }

  let ip = h.get(Headers.XForwardedFor)
  if (ip) ip = ip.split(',')[0].trim()
  else ip = h.get('x-real-ip') ?? ''

  return { currency, languageSymbol, languageName, location, ip, needsCheckCookies }
}
