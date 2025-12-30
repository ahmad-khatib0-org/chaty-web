import { Trans } from './translation'

export interface System { }

let _initPromise: Promise<System> | null = null
let _initialized = false
let _system: System

export const system = async (): Promise<Readonly<System>> => {
  const system = await init()
  return system
}

/**
 * @method init the required config, trans, ... In order to start the server
 */
async function init(): Promise<System> {
  if (_initialized) return _system
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    try {
      await Trans.init()

      _system = {}
      _initialized = true
      return _system
    } catch (err) {
      console.error(err)
      _initPromise = null
      throw Error('An Error occurred while initing server data')
    }
  })()

  return _initPromise
}
