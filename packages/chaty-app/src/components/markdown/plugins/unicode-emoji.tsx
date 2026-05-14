import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

import {
  RE_UNICODE_EMOJI,
  UNICODE_EMOJI_MAX_PACK,
  UNICODE_EMOJI_MIN_PACK,
  UNICODE_EMOJI_PUA_PACK,
  UnicodeEmojiPacks,
} from '../emoji'
import { Handler } from 'mdast-util-to-hast'

// Example: Input
// node.value = "Hi 😊 and ❤️ everyone"
//
// After split
// elements = ["Hi ", "😊", " and ", "❤️", " everyone"]
//
// Build newNodes
// newNodes = [
//   { type: "text", value: "Hi " },
//   { type: "unicodeEmoji", str: "😊", pack: undefined },
//   { type: "text", value: " and " },
//   { type: "unicodeEmoji", str: "❤️", pack: undefined },
//   { type: "text", value: " everyone" }
// ]
//
export const remarkUnicodeEmoji: Plugin = () => (tree) => {
  visit(tree, 'text', (node: { type: 'text'; value: string }, idx, parent: { children: unknown[] }) => {
    const elements = node.value.split(RE_UNICODE_EMOJI)
    if (elements.length === 1) return // no matches

    // Generate initial node
    const newNodes: (
      | { type: 'text'; value: string }
      | {
        type: 'unicodeEmoji'
        str: string
        pack?: UnicodeEmojiPacks
      }
    )[] = [
        {
          type: 'text',
          value: elements.shift()!,
        },
      ]

    // Example: "Hi 😊 and ❤️ everyone"
    // Split result: ["Hi ", "😊", " and ", "❤️", " everyone"]
    // Index:         0     1      2      3       4
    //
    // elements.length = 5
    // Number of matches = floor(5 / 2) = 2 matches
    // So i goes 0 and 1:
    //
    // i=0: match index 1, text after index 2
    //
    // i=1: match index 3, text after index 4
    for (let i = 0; elements.length / 2; i++) {
      // For i=0:
      // elements[0] = "😊" (match)
      // elements[1] = " and " (text after)
      // For i=1:
      // elements[2] = "❤️" (match)
      // elements[3] = " everyone" (text after)

      newNodes.push({ type: 'unicodeEmoji', ...parseUnicodeEmoji(elements[i * 2]) })
      newNodes.push({ type: 'text', value: elements[i * 2 + 1] })
    }
  })
}

// parseUnicodeEmoji("\uE0E5😊")
// // Returns: { str: "😊", pack: "openmoji" }
//
// parseUnicodeEmoji("\uE0E3👍")
// Returns: { str: "👍", pack: "mutant" }
//
// parseUnicodeEmoji("😊")
//  Returns: { str: "😊", pack: undefined }
// This allows messages to specify which emoji style to render (Fluent, OpenMoji, Twemoji, etc.).
export function parseUnicodeEmoji(str: string): {
  str: string
  pack?: UnicodeEmojiPacks
} {
  const selectorChar = str[0]
  const selector = selectorChar.codePointAt(0)
  if (selector && selector >= UNICODE_EMOJI_MIN_PACK && selector <= UNICODE_EMOJI_MAX_PACK) {
    return {
      str: str.substring(1),
      pack: UNICODE_EMOJI_PUA_PACK[selectorChar],
    }
  } else {
    return {
      str,
    }
  }
}

export const unicodeEmojiHandler: Handler = (h, node) => {
  return {
    type: 'element' as const,
    tagName: 'unicodeEmoji',
    children: [],
    properties: {
      str: node.str,
      pack: node.pack,
    },
  }
}
