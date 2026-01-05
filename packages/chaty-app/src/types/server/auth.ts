export interface ConsentRequest {
  subject: string
  requested_scope: string[]
  requested_access_token_audience: string[]
  context: Record<string, any>
}

export interface ConsentAcceptResult {
  redirect_to: string
}

export interface AuthCheckResponse {
  email: string
  success: boolean
  isInternalError: boolean
}
