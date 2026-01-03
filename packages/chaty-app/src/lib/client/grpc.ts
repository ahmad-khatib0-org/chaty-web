import 'client-only'
import { ConnectError, Code } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'
import { createClient, Interceptor } from '@connectrpc/connect'

import { ChatyService } from '@chaty-app/proto/web/service/v1/main_pb'

import { ClientInformation } from '@/types/client'
import { tr } from './translation'
import { trackClient } from './client-info'

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

export const handleGrpcErr = (err: unknown, lang: string): string => {
  const connectErr = ConnectError.from(err)

  // Handle specific Network/Connection issues
  // Connect maps transport failures (like 403 Forbidden or Network Down) to specific codes
  if (connectErr.code === Code.Unavailable || connectErr.message.includes('Failed to fetch')) {
    return tr(lang, 'error.network_unavailable')
  }

  // Map Connect Codes to your translation keys
  switch (connectErr.code) {
    case Code.Canceled:
      return tr(lang, 'error.canceled')
    case Code.Unknown:
      return tr(lang, 'error.unknown')
    case Code.InvalidArgument:
      return tr(lang, 'error.invalid_argument')
    case Code.DeadlineExceeded:
      return tr(lang, 'error.deadline_exceeded')
    case Code.NotFound:
      return tr(lang, 'error.not_found')
    case Code.AlreadyExists:
      return tr(lang, 'error.already_exists')
    case Code.PermissionDenied:
      return tr(lang, 'error.permission_denied')
    case Code.ResourceExhausted:
      return tr(lang, 'error.resource_exhausted')
    case Code.FailedPrecondition:
      return tr(lang, 'error.failed_precondition')
    case Code.Aborted:
      return tr(lang, 'error.aborted')
    case Code.OutOfRange:
      return tr(lang, 'error.out_of_range')
    case Code.Unimplemented:
      return tr(lang, 'error.unimplemented')
    case Code.Internal:
      return tr(lang, 'error.internal')
    // case Code.Unavailable:
    //   return tr(lang, 'error.unavailable')
    case Code.DataLoss:
      return tr(lang, 'error.data_loss')
    case Code.Unauthenticated:
      return tr(lang, 'error.unauthenticated')
    default:
      // If the server provided a specific raw message, use it, else fallback to internal
      return connectErr.rawMessage || tr(lang, 'error.internal')
  }
}
