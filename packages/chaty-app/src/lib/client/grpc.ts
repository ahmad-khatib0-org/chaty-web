import 'client-only'
import { createConnectTransport } from '@connectrpc/connect-web'
import { createClient, Interceptor } from '@connectrpc/connect'

import { ClientInformation } from '@/types/client'
import { trackClient } from './client-info'
import { ChatyService } from '@chaty-app/proto/web/service/v1/main_pb'

let clientInformation: ClientInformation | null = null

/**
 * The Interceptor replaces your old 'createTransportWithMetadata' logic.
 * It injects headers into every request automatically.
 */
const metadataInterceptor: Interceptor = (next) => async (req) => {
  if (!clientInformation) {
    try {
      clientInformation = await trackClient({}, { enableFingerprinting: true, timeout: 3000 })
    } catch (err) {
      console.error('Tracking failed', err)
    }
  }

  // Set headers
  req.header.set('x-request-id', crypto.randomUUID())
  req.header.set('accept-language', clientInformation?.languageSymbol ?? '')
  req.header.set('x-ip-address', clientInformation?.geoData.ip ?? '')
  req.header.set('user-agent', clientInformation?.userAgent ?? '')
  req.header.set('x-timezone', clientInformation?.timezone ?? '')

  return await next(req)
}

// Singleton instances
let _grpcClient: ReturnType<typeof createClient<typeof ChatyService>> | null = null

export function grpcClient() {
  if (_grpcClient) return _grpcClient

  const baseUrl = process.env['NEXT_PUBLIC_GRPC_ENDPOINT']
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_GRPC_ENDPOINT')

  const transport = createConnectTransport({
    baseUrl,
    interceptors: [metadataInterceptor],
    useBinaryFormat: true,
  })

  _grpcClient = createClient(ChatyService, transport)
  return _grpcClient
}
