const Mustache = require('mustache')
import { getCookie } from 'cookies-next/client'

import { Translations } from './i18n'
import { TranslationsEN } from './i18n/en'
import { AVAILABLE_LANGUAGES, ClientCookies, DEFAULT_LANGUAGE_SYMBOL } from './app'

const en = TranslationsEN

export const tr = <P extends Record<string, any>>(
  lang: string,
  id: keyof Translations,
  params?: P
): string => {
  let result = ''
  if (id.includes('{{') && id.includes('}}') && !params) {
    throw Error(`The translation id: ${id} needs translations parameters`)
  }
  if (!AVAILABLE_LANGUAGES[lang]) lang = DEFAULT_LANGUAGE_SYMBOL

  switch (lang) {
    case 'en':
      result = Mustache.render(en[id], params)
  }

  return result
}

export const getLang = (): string => {
  const lang = getCookie(ClientCookies.acceptLanguage)
  if (lang) {
    if (AVAILABLE_LANGUAGES[lang]) return lang
  }
  return DEFAULT_LANGUAGE_SYMBOL
}
