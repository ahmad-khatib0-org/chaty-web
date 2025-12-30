import { Trans } from './translation'

export function getPasswordRequirements(lang: string) {
  const tr = Trans.tr
  return [
    { re: '[0-9]', label: tr(lang, 'password.numbers') },
    { re: '[a-z]', label: tr(lang, 'password.lowercase') },
    { re: '[A-Z]', label: tr(lang, 'password.uppercase') },
    { re: "[$&+,:;=?@#|'<>.^*()%!-]", label: tr(lang, 'password.symbols') },
  ]
}
