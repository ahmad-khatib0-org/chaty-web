import 'server-only'

export const SERVER_INTERNAL_ERROR =
  'Sorry, Unexpected internal server error. Our team has been notified. Please try again'

export const Headers = {
  Authorization: 'authorization',
  XRequestID: 'x-request-id',
  XCorrelationID: 'x-correlation-id',
  XIPAddress: 'x-ip-address',
  XForwardedFor: 'x-forwarded-for',
  XForwardedProto: 'x-forwarded-proto',
  XForwardedHost: 'x-forwarded-host',
  XClientVersion: 'x-client-version',
  XClientID: 'x-client-id',
  XDeviceID: 'x-device-id',
  XSessionID: 'x-session-id',
  XUserID: 'x-user-id',
  XTraceID: 'x-trace-id',
  XSpanID: 'x-span-id',
  XRoles: 'x-roles',
  XIsOAuth: 'x-is-oauth',
  XSessionCreatedAt: 'x-session-created-at',
  XSessionExpiresAt: 'x-session-expires-at',
  XLastActivityAt: 'x-last-activity-at',
  XTimezone: 'x-timezone',
  XProps: 'x-props',
  XAPIKey: 'x-api-key',
  XCSRFToken: 'x-csrf-token',
  XRateLimitLimit: 'x-rate-limit-limit',
  XRateLimitRemaining: 'x-rate-limit-remaining',
  XRateLimitReset: 'x-rate-limit-reset',
  // Standard headers
  ContentType: 'content-type',
  UserAgent: 'user-agent',
  Accept: 'accept',
  AcceptLanguage: 'accept-language',
  AcceptEncoding: 'accept-encoding',
  CacheControl: 'cache-control',
  // Next.js specific
  NextAction: 'next-action',
  NextRouterStateTree: 'next-router-state-tree',
  // gRPC specific
  GRPCWeb: 'x-grpc-web',
  GRPCEncoding: 'grpc-encoding',
  GRPCMessage: 'grpc-message',
  GRPCStatus: 'grpc-status',
} as const

export type Header = (typeof Headers)[keyof typeof Headers]

export const ServerCookies = {
  AcceptLanguage: 'accept_language',
  LanguageName: 'language_name',
  AccessToken: 'access_token',
  RefreshToken: 'refresh_token',
  IdToken: 'id_token',
  Token: 'token',
  UserID: 'user_id',
  DeviceID: 'device_id',
  Currency: 'currency',
  Country: 'country',
} as const
