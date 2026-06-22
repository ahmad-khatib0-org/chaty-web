import { useState } from 'react'
import { Plugin } from 'unified'
import { Handler } from 'mdast-util-to-hast'
import { visit } from 'unist-util-visit'

import { Avatar, ColouredText } from '@/components/ui'
import { useUser } from '@/context'

export function UserMention({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const user = useUser(userId)
  const [showMenu, setShowMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  if (!user.user) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-lg bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) opacity-50 cursor-not-allowed font-semibold'>
        {' '}
        Unknown User{' '}
      </span>
    )
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`align-bottom items-center gap-1 ps-0.5 pe-1.5 rounded-lg bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) font-semibold  hover:opacity-80 transition-opacity`}>
        <Avatar size={16} fallback={user.username} />
        <ColouredText colour={user.colour || undefined}>{user.username}</ColouredText>
      </div>

      {showMenu && !disabled && (
        <div
          style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}
          onMouseLeave={() => setShowMenu(false)}>
          {/* <UserContextMenu user={user.user} member={user.member} /> TODO: add it */}
        </div>
      )}
    </>
  )
}

const RE_MENTION = /(<@[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}>|@everyone|@online|<%[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}>)/

export const remarkMentions: Plugin = () => (tree) => {
  visit(
    tree,
    'text',
    (node: { type: 'text'; value: string }, idx: number, parent: { children: unknown[] }) => {
      const elements = node.value.split(RE_MENTION)
      if (elements.length === 1) return

      const newNodes = elements.map((value, index) => {
        if (index % 2 === 0) return { type: 'text', value }

        if (value.startsWith('<@')) {
          return {
            type: 'mention',
            mentions: 'user:' + value.substring(2, value.length - 1),
          }
        }

        if (value === '@everyone') return { type: 'mention', mentions: 'everyone' }

        if (value === '@online') return { type: 'mention', mentions: 'online' }

        return {
          type: 'mention',
          mentions: 'role:' + value.substring(2, value.length - 1),
        }
      })

      parent.children.splice(idx, 1, ...newNodes)
      return idx + newNodes.length
    }
  )
}

export const mentionHandler: Handler = (_h, node) => {
  return {
    type: 'element' as const,
    tagName: 'mention',
    children: [],
    properties: {
      mentions: node.mentions,
    },
  }
}
