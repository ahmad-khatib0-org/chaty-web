import { useMemo } from 'react'
import { Tooltip } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

import { Interactions } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import { useUsers } from '@/context'
import { Ripple } from '@/components/ui'
import { Emoji } from '@/components/markdown/emoji'
import { CompositionMediaPicker } from '../composition'

interface Props {
  reactions?: Map<string, Set<string>>
  interactions: Interactions | undefined

  /**
   * ID of current user
   */
  userId?: string

  /**
   * Add a reaction
   * @param reaction ID
   */
  addReaction(reaction: string): void

  /**
   * Send a GIF reaction
   * @param text Message
   */
  sendGIF(text: string): void

  /**
   * Remove a reaction
   * @param reaction ID
   */
  removeReaction(reaction: string): void
}

export function Reactions({ removeReaction, addReaction, sendGIF, interactions, userId, reactions }: Props) {
  const lists = useMemo(() => {
    const required = new Set<string>()
    const optional = new Set<string>()

    if (interactions?.reactions.length) {
      for (const reaction of interactions.reactions) required.add(reaction)
    }

    if (reactions) {
      for (const key of reactions.keys()) if (!required.has(key)) optional.add(key)
    }

    return {
      required: Array.from(required),
      optional: Array.from(optional),
    }
  }, [interactions, reactions])

  const hasReactions = (both?: boolean) => {
    const { required, optional } = lists
    return both ? required.length && optional.length : required.length || optional.length
  }

  if (!hasReactions()) return null

  return (
    <div className='w-full flex flex-wrap items-center gap-1 group hover:[&_.add]:opacity-100'>
      {lists.required.map((entry) => (
        <Reaction
          key={entry}
          reaction={entry}
          active={reactions?.get(entry)?.has(userId ?? '')}
          users={reactions?.get(entry)}
          addReaction={addReaction}
          removeReaction={removeReaction}
        />
      ))}
      {hasReactions(true) && <div className='w-px h-3.5 bg-(--md-sys-color-outline-variant)' />}
      {lists.optional.map((entry) => (
        <Reaction
          key={entry}
          reaction={entry}
          active={reactions?.get(entry)?.has(userId ?? '')}
          users={reactions?.get(entry)}
          addReaction={addReaction}
          removeReaction={removeReaction}
        />
      ))}
      <CompositionMediaPicker
        onMessage={sendGIF}
        onTextReplacement={(emoji) =>
          addReaction(emoji.startsWith(':') ? emoji.slice(1, emoji.length - 1) : emoji)
        }>
        {(triggerProps) => (
          <div ref={triggerProps.ref} onClick={triggerProps.onClickEmoji}>
            <AddReaction onClick={() => { }} />
          </div>
        )}
      </CompositionMediaPicker>
    </div>
  )
}

function Reaction({
  reaction,
  active,
  users,
  addReaction,
  removeReaction,
}: {
  reaction: string
  active?: boolean
  users?: Set<string>
  addReaction(id: string): void
  removeReaction(id: string): void
}) {
  const _users = useUsers([...(users?.values() ?? [])])

  const handleClick = () => {
    if (active) removeReaction(reaction)
    else addReaction(reaction)
  }

  const peopleList = () => {
    const all = _users
    const list = all.filter((user) => user)
    const unknown = all.filter((user) => !user).length + Math.max(0, list.length - 3)
    const usernames = list
      .slice(0, 2)
      .map((user) => user?.username)
      .join(', ')

    if (unknown) {
      if (usernames) {
        return `${usernames} and ${unknown} others reacted`
      } else if (unknown === 1) return `1 person reacted`
      else return `${unknown} reacted`
    } else return `${usernames} reacted`
  }

  return (
    <Tooltip
      label={
        <div className='flex items-center gap-4'>
          <span style={{ '--emoji-size': '3em' } as React.CSSProperties}>
            <Emoji emoji={reaction} />
          </span>
          <span className='max-w-50 overflow-hidden whitespace-pre-wrap text-ellipsis line-clamp-2'>
            {peopleList()}
          </span>
        </div>
      }>
      <div
        className={`
          relative flex overflow-hidden flex-row gap-2 cursor-pointer select-none align-middle
          px-2 py-1 rounded-md transition-all duration-fast font-semibold tabular-nums
          [&_img]:w-[1.2em] [&_img]:h-[1.2em] [&_img]:object-contain
          ${active
            ? 'text-(--md-sys-color-on-secondary-container) bg-(--md-sys-color-secondary-container)'
            : 'text-(--md-sys-color-on-surface) bg-(--md-sys-color-surface-container-low)'
          }
        `}
        onClick={handleClick}>
        <Ripple />
        <Emoji emoji={reaction} /> {users?.size || 0}
      </div>
    </Tooltip>
  )
}

function AddReaction({ onClick }: { onClick: () => void }) {
  return (
    <div
      className='relative flex overflow-hidden justify-center cursor-pointer select-none align-middle
                 bg-(--md-sys-color-surface-bright) h-8.25 aspect-square p-1 rounded-md
                 text-(--emoji-size) opacity-0 group-hover:opacity-100 transition-opacity'
      onClick={onClick}>
      <Ripple />
      <IconPlus size={16} />
    </div>
  )
}
