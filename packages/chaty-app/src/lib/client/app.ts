import 'client-only'

export const DEFAULT_LANGUAGE_SYMBOL = 'en'
export const DEFAULT_LANGUAGE_NAME = 'English'
export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_COUNTRY = 'fr'

export const AVAILABLE_LANGUAGES: { [key: string]: string } = {
  en: 'English',
}

export const ClientCookies = {
  acceptLanguage: 'accept_language',
  userID: 'user_id',
  deviceID: 'device_id',
  currencyCode: 'currency_code',
  countryCode: 'country_code',
} as const

/**
 * Generation counter
 */
let counter = 0

/**
 * Generates a guaranteed unique ID for use within the client.
 * This should never be used to uniquely identify something across the network.
 * @returns a unique identifier
 */
export function insecureUniqueId() {
  return Math.random().toString().substring(2) + new Date() + ++counter
}
