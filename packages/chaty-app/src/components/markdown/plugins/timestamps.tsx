import { Handler } from 'mdast-util-to-hast'
import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Regex for matching timestamps
 */
export const RE_TIMESTAMP = /<t:([0-9]+)(?::(\w))?>/g

export const remarkTimestamps: Plugin = () => (tree) => {
  visit(tree, 'text', (node: { type: 'text'; value: string }, idx, parent: { children: unknown[] }) => {
    const elements = node.value.split(RE_TIMESTAMP)
    if (elements.length === 1) return // no matches

    // Generate initial node
    const newNodes: (
      | { type: 'text'; value: string }
      | { type: 'timestamp'; format: string; date: string }
    )[] = [{ type: 'text', value: elements.shift()! }]

    // Process all timestamps , TODO: format the time
    for (let i = 0; i < elements.length / 3; i++) {
      newNodes.push({
        type: 'timestamp',
        format: elements[i * 3 + 1],
        date: new Date(parseInt(elements[i * 3])).toString(),
      })

      newNodes.push({ type: 'text', value: elements[i * 3 + 2] })
    }

    parent.children.splice(idx, 1, ...newNodes)
    return idx + newNodes.length
  })
}

export const timestampHandler: Handler = (h, node) => {
  return {
    type: 'element' as const,
    tagName: 'timestamp',
    children: [],
    properties: {
      format: node.format,
      date: node.date,
    },
  }
}
