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
