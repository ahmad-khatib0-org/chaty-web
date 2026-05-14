import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

import { RE_CUSTOM_EMOJI } from '../emoji'
import { Handler } from 'mdast-util-to-hast'

export const remarkCustomEmoji: Plugin = () => (tree) => {
  visit(tree, 'text', (node: { type: 'text'; value: string }, idx, parent: { children: unknown[] }) => {
    const elements = node.value.split(RE_CUSTOM_EMOJI)
    if (elements.length === 1) return // no matches

    // Generate initial node
    const newNodes: ({ type: 'text'; value: string } | { type: 'customEmoji'; id: string })[] = [
      { type: 'text', value: elements.shift()! },
    ]

    // Process all timestamps
    for (let i = 0; i < elements.length / 2; i++) {
      newNodes.push({ type: 'customEmoji', id: elements[i * 2] })

      newNodes.push({ type: 'text', value: elements[i * 2 + 1] })
    }

    parent.children.splice(idx, 1, ...newNodes)
    return idx + newNodes.length
  })
}

export const customEmojiHandler: Handler = (h, node) => {
  return {
    type: 'element' as const,
    tagName: 'customEmoji',
    children: [],
    properties: {
      id: node.id,
    },
  }
}
