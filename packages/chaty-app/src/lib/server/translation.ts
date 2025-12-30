import * as path from 'path'
import { readdir, readFile } from 'fs/promises'
import { cookies } from 'next/headers'
const Mustache = require('mustache')
import { ulid } from 'ulid'

import { ClientCookies, DEFAULT_LANGUAGE_SYMBOL } from '../client'

let TRANSLATIONS_DIR = './translations'

export type Translations = { [key: string]: { [key: string]: string } }

type TranslationErrorType =
  | { type: 'NotInitialized'; message: string }
  | { type: 'MissingParams'; message: string }
  | { type: 'KeyNotFound'; message: string; key: string }
  | { type: 'RenderError'; message: string }

class TranslationError extends Error {
  constructor(public error: TranslationErrorType) {
    super(error.message)
    Object.setPrototypeOf(this, TranslationError.prototype)
  }
}

class TemplatePool {
  private available: Array<{
    render: (view: any, partials?: any) => string
    templateId: string
  }> = []

  private templateStr: string
  private readonly maxSize: number
  public readonly hasVars: boolean

  constructor(template: string, maxSize: number) {
    this.templateStr = template
    this.hasVars = template.includes('{{') && template.includes('}}')
    this.maxSize = maxSize

    // Pre-parse the template once
    Mustache.parse(this.templateStr)
  }

  get(): { render: (view: any) => string; templateId: string } {
    if (this.available.length > 0) {
      return this.available.pop()!
    }

    return {
      render: (view: any) => Mustache.render(this.templateStr, view),
      templateId: `tpl_${ulid()}`,
    }
  }

  returnInstance(instance: { render: (view: any) => string; templateId: string }): void {
    if (this.available.length < this.maxSize) {
      this.available.push(instance)
    }
  }

  public get getTemplateStr(): string {
    return this.templateStr
  }
}

class TranslationStore {
  private static _instance: TranslationStore
  private store: Map<string, Map<string, TemplatePool>> = new Map()

  public static instance(): TranslationStore {
    if (!TranslationStore._instance) {
      TranslationStore._instance = new TranslationStore()
    }
    return TranslationStore._instance
  }

  public init(translations: Translations, maxPoolSize: number): void {
    for (const [lang, elements] of Object.entries(translations)) {
      const langMap = new Map<string, TemplatePool>()
      for (const [id, tr] of Object.entries(elements)) {
        langMap.set(id, new TemplatePool(tr, maxPoolSize))
      }
      this.store.set(lang, langMap)
    }
    console.log(this.store)
  }

  public translate<P extends Record<string, any>>(lang: string, id: string, params?: P): string {
    const langPools = this.store.get(lang)
    if (!langPools) {
      throw new TranslationError({
        type: 'KeyNotFound',
        message: `Language not found: ${lang}`,
        key: lang,
      })
    }

    const pool = langPools.get(id)
    if (!pool) {
      throw new TranslationError({
        type: 'KeyNotFound',
        message: `Translation key not found: ${id}`,
        key: id,
      })
    }

    const template = pool.get()
    try {
      if (pool.hasVars && !params) {
        throw new TranslationError({
          type: 'MissingParams',
          message: 'Missing required template parameters',
        })
      }

      const result = params ? template.render(params) : pool.getTemplateStr
      pool.returnInstance(template)
      return result
    } catch (error) {
      throw new TranslationError({
        type: 'RenderError',
        message: error instanceof Error ? error.message : 'Unknown template error',
      })
    }
  }
}

async function loadTranslations() {
  const res: Translations = {}

  const files = await readdir(TRANSLATIONS_DIR)
  for (const file of files) {
    if (file.endsWith('.json')) {
      const lang = file.replace('.json', '')
      const content = await readFile(path.join(TRANSLATIONS_DIR, file), 'utf-8')
      res[lang] = JSON.parse(content)
    }
  }

  console.log(`loaded trans from cache, number of langs: ${Object.keys(res).length}`)
  return res
}

export const Trans = {
  init: async (translationsDir?: string) => {
    if (translationsDir) TRANSLATIONS_DIR = translationsDir
    const trans = await loadTranslations()
    TranslationStore.instance().init(trans, 10)
  },

  tr: <P extends Record<string, any>>(lang: string, id: string, params?: P): string => {
    return TranslationStore.instance().translate(lang, id, params)
  },

  getUserLang: async (): Promise<string> => {
    const c = await cookies()
    return c.get(ClientCookies.acceptLanguage)?.value || DEFAULT_LANGUAGE_SYMBOL
  },
}
