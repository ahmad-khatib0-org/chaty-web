export function encodeQueryParams(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryString
}
