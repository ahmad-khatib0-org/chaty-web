import { createElement, useEffect, useState, ReactNode } from 'react'
import { VFile } from 'vfile'
import { unified } from 'unified'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeReact from 'rehype-react'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import * as elements from './elements'
import { injectEmojiSize, CustomEmoji, UnicodeEmoji, UnicodeEmojiPacks } from './emoji'
import { remarkInsertBreaks, sanitise } from './sanitise'
import { mentionHandler, remarkMentions, UserMention } from './plugins/mentions'
import { remarkUnicodeEmoji, unicodeEmojiHandler } from './plugins/unicode-emoji'
import { customEmojiHandler, remarkCustomEmoji } from './plugins/custom-emoji'
import { remarkSpoiler, spoilerHandler } from './plugins/spoiler'
import { remarkLinkify } from './plugins/remark-linify'
import { remarkTimestamps, timestampHandler } from './plugins/timestamps'
import { remarkChannels } from './plugins/channels'
import { remarkHtmlToText } from './plugins/html-to-text'
import { RenderAnchor } from './plugins/anchors'
import { RenderCodeblock } from './plugins/codeblock'

// Empty component for blocked elements
const Null = () => null

function RenderOrderedList(props: any) {
  return (
    <elements.orderedList
      {...props}
      style={{
        ...(props.start ? { '--start-number': (parseInt(props.start, 10) - 1).toString() } : {}),
        ...props.style,
      }}
    />
  )
}

/**
 * React components for rendering HAST nodes
 * These map tagNames from your handlers to React components
 */
const reactComponents = {
  // Custom nodes from your handlers
  unicodeEmoji: ({ str, pack }: { str: string; pack?: UnicodeEmojiPacks }) => (
    <UnicodeEmoji emoji={str} pack={pack} />
  ),
  customEmoji: ({ id }: { id: string }) => <CustomEmoji id={id} />,
  mention: ({ mentions }: { mentions: string }) => {
    if (mentions.startsWith('user:')) {
      return <UserMention userId={mentions.substring(5)} />
    }
    if (mentions === 'everyone') return <span className='mention'>@everyone</span>
    if (mentions === 'online') return <span className='mention'>@online</span>
    if (mentions.startsWith('role:')) {
      return <span className='mention'>@{mentions.substring(5)}</span>
    }
    return <span>Invalid mention</span>
  },
  timestamp: ({ date, format }: { date: string; format: string }) => (
    <span className='timestamp' data-format={format}>
      {new Date(date).toLocaleString()}
    </span>
  ),
  spoiler: ({ children }: { children: ReactNode }) => <span className='spoiler'>{children}</span>,

  // Standard HTML elements (overridden for styling)
  a: RenderAnchor,
  p: elements.paragraph,
  em: elements.emphasis,
  strong: elements.strong,
  del: elements.strikethrough,
  h1: elements.heading1,
  h2: elements.heading2,
  h3: elements.heading3,
  h4: elements.heading4,
  h5: elements.heading5,
  h6: elements.heading6,
  pre: RenderCodeblock,
  li: elements.listItem,
  ul: elements.unorderedList,
  ol: RenderOrderedList,
  blockquote: elements.blockquote,
  table: elements.table,
  th: elements.tableHeader,
  td: elements.tableElement,
  code: elements.code,
  time: elements.time,
  img: Null,
  video: Null,
  figure: Null,
  picture: Null,
  source: Null,
  audio: Null,
  script: Null,
  style: Null,
}

// Simple components for reply mode (disabled interactions)
const replyReactComponents = {
  ...reactComponents,
  mention: ({ mentions }: { mentions: string }) => {
    if (mentions.startsWith('user:')) {
      return <UserMention userId={mentions.substring(5)} disabled />
    }
    if (mentions === 'everyone') return <span className='mention'>@everyone</span>
    if (mentions === 'online') return <span className='mention'>@online</span>
    return <span>Invalid mention</span>
  },
  a: (props: any) => <RenderAnchor {...props} disabled />,
  p: ({ children }: { children: ReactNode }) => <>{children}</>,
  h1: ({ children }: { children: ReactNode }) => <>{children}</>,
  h2: ({ children }: { children: ReactNode }) => <>{children}</>,
  h3: ({ children }: { children: ReactNode }) => <>{children}</>,
  h4: ({ children }: { children: ReactNode }) => <>{children}</>,
  h5: ({ children }: { children: ReactNode }) => <>{children}</>,
  h6: ({ children }: { children: ReactNode }) => <>{children}</>,
  li: ({ children }: { children: ReactNode }) => <>{children}</>,
  ul: ({ children }: { children: ReactNode }) => <>{children}</>,
  ol: ({ children }: { children: ReactNode }) => <>{children}</>,
  blockquote: ({ children }: { children: ReactNode }) => <>{children}</>,
  td: ({ children }: { children: ReactNode }) => <>{children}</>,
  th: ({ children }: { children: ReactNode }) => <>{children}</>,
  time: reactComponents.timestamp,
  timestamp: reactComponents.timestamp,
  pre: Null,
  table: Null,
  img: Null,
}

// Full pipeline with React output
const htmlPipeline = unified()
  .use(remarkParse)
  .use(remarkBreaks)
  .use(remarkGfm)
  .use(remarkMath, { singleDollarTextMath: false })
  .use(remarkMentions)
  .use(remarkTimestamps)
  .use(remarkChannels)
  .use(remarkUnicodeEmoji)
  .use(remarkCustomEmoji)
  .use(remarkSpoiler)
  .use(remarkLinkify)
  .use(remarkHtmlToText)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    handlers: {
      unicodeEmoji: unicodeEmojiHandler,
      customEmoji: customEmojiHandler,
      mention: mentionHandler,
      timestamp: timestampHandler,
      spoiler: spoilerHandler,
    },
  })
  .use(remarkInsertBreaks)
  .use(rehypeKatex, {
    maxSize: 10,
    maxExpand: 2,
    trust: false,
    strict: false,
    output: 'html',
    errorColor: 'var(--md-sys-color-error)',
  })
  .use(rehypeHighlight)
  .use(rehypeReact, {
    createElement,
    components: reactComponents,
  })

// Reply pipeline (simpler, for things like message replies)
const replyPipeline = unified()
  .use(remarkParse)
  .use(remarkBreaks)
  .use(remarkGfm)
  .use(remarkMentions)
  .use(remarkUnicodeEmoji)
  .use(remarkCustomEmoji)
  .use(remarkSpoiler)
  .use(remarkLinkify)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    handlers: {
      unicodeEmoji: unicodeEmojiHandler,
      customEmoji: customEmojiHandler,
      mention: mentionHandler,
      spoiler: spoilerHandler,
    },
  })
  .use(remarkInsertBreaks)
  .use(rehypeReact, {
    createElement,
    components: replyReactComponents,
  })

export interface MarkdownProps {
  content?: string
  disallowBigEmoji?: boolean
}

/**
 * Render simple markdown (synchronous, for replies/previews)
 */
export function renderSimpleMarkdown(content: string): ReactNode {
  const file = new VFile()
  file.value = sanitise(content)
  const result = replyPipeline.processSync(file)
  return result.result
}

/**
 * Main Markdown component
 */
export function Markdown({ content, disallowBigEmoji }: MarkdownProps) {
  const [rendered, setRendered] = useState<ReactNode>(null)

  useEffect(() => {
    const file = new VFile()
    file.value = sanitise(content || '')

    const hastNode = htmlPipeline.runSync(htmlPipeline.parse(file), file)
    if (hastNode.type !== 'root') {
      throw new TypeError('Expected a `root` node')
    }

    injectEmojiSize({ content, disallowBigEmoji }, hastNode as never)

    const result = htmlPipeline.runSync(hastNode, file)
    setRendered(result.result)
  }, [content, disallowBigEmoji])

  return <>{rendered}</>
}
