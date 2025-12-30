/**
 * ClientInformation represents essential information about a user, like
 *
 * language, currency, ship to location, ...
 */
export interface ClientInformation {
  fingerprint: string
  languageName: string
  languageSymbol: string
  languages: string[]
  geoData: LocationInfo
  userAgent: string
  timezone: string
  locale: string
  firstSeenAt: number
  lastSeenAt: number
  browser: {
    name: string
    version: string
    engine: string
    engineVersion: string
  }
  os: {
    name: string
    version: string
    platform: string
  }
  device: {
    type: string
    vendor: string
    model: string
    mobile: boolean
    tablet: boolean
  }
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelRatio: number
  }
}

export function createDefaultClientInformation(): ClientInformation {
  const timestamp = Date.now()

  return {
    fingerprint: '',
    geoData: getDefaultLocationInfo(),
    languageName: '',
    languageSymbol: '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    locale: typeof window !== 'undefined' ? navigator.language : 'en-US',
    languages: typeof window !== 'undefined' ? [...navigator.languages] : ['en-US'],
    firstSeenAt: timestamp,
    lastSeenAt: timestamp,
    browser: {
      name: '',
      version: '',
      engine: '',
      engineVersion: '',
    },
    os: {
      name: '',
      version: '',
      platform: typeof window !== 'undefined' ? navigator.platform : 'Unknown',
    },
    device: {
      type: '',
      vendor: '',
      model: '',
      mobile: false,
      tablet: false,
    },
    screen: {
      width: typeof window !== 'undefined' ? screen.width : 0,
      height: typeof window !== 'undefined' ? screen.height : 0,
      colorDepth: typeof window !== 'undefined' ? screen.colorDepth : 24,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    },
  }
}

export interface LocationInfo {
  ip: string
  network: string
  version: string
  city: string
  region: string
  region_code: string
  country: string
  country_name: string
  country_code: string
  country_code_iso3: string
  postal?: string
  latitude: number
  longitude: number
  timezone: string
  utc_offset: string
  country_calling_code: string
  currency: string
  currency_name: string
  country_area: number
  asn: string
  org?: string
}

export function getDefaultLocationInfo(): LocationInfo {
  return {
    ip: '',
    network: '',
    version: '',
    city: '',
    region: '',
    region_code: '',
    country: '',
    country_name: '',
    country_code: '',
    country_code_iso3: '',
    postal: undefined,
    latitude: 0,
    longitude: 0,
    timezone: '',
    utc_offset: '',
    country_calling_code: '',
    currency: '',
    currency_name: '',
    country_area: 0,
    asn: '',
    org: undefined,
  }
}
