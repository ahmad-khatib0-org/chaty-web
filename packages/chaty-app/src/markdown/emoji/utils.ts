import emojiRegex from 'emoji-regex'

/**
 * Regex for custom emoji
 */
export const RE_CUSTOM_EMOJI = /:([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}):/g

/**
 * Regex for any emoji
 */
export const RE_ANY_EMOJI = new RegExp(
  RE_CUSTOM_EMOJI.source + '|[\uE0E0-\uE0E6]?(?:' + emojiRegex().source + ')',
  'g'
)

/**
 * Gets the codepoint of a string
 */
export function toCodepoint(input: string) {
  if (input.length === 1) {
    return input.charCodeAt(0).toString(16)
  } else if (input.length > 1) {
    const pairs = []
    for (let i = 0; i < input.length; i++) {
      if (
        // high surrogate
        input.charCodeAt(i) >= 0xd800 &&
        input.charCodeAt(i) <= 0xdbff
      ) {
        if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
          // low surrogate
          pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000)
        }
      } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
        // modifiers and joiners
        pairs.push(input.charCodeAt(i))
      }
    }

    return pairs.map((char) => char.toString(16)).join('-')
  }

  return ''
}
