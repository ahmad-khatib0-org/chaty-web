import { ReactNode } from 'react'
import { Tooltip } from '@mantine/core'
import {
  IconAlignLeft,
  IconArrowLeft,
  IconArrowRight,
  IconDeviceMobile,
  IconFileDescription, // Alternative for text, good placeholder
  IconHeartHandshake, // No direct "call_started", using a good alternative
  IconMinus,
  IconPinned,
  IconPhoto,
  IconPlus,
  IconShieldX,
  IconTag,
  IconX,
  IconXboxX, // For user_remove, as a strong "remove/block" signal
} from '@tabler/icons-react'

import { MessageSystem } from 'chaty-client/models'

// Map system message types to Tabler Icons
const ICON_MAP: Record<string, ReactNode> = {
  user_added: <IconPlus size={16} />,
  user_remove: <IconXboxX size={16} />,
  user_kicked: <IconX size={16} />,
  user_banned: <IconShieldX size={16} />,
  user_joined: <IconArrowRight size={16} />,
  channel_renamed: <IconTag size={16} />,
  channel_description_changed: <IconAlignLeft size={16} />,
  channel_icon_changed: <IconPhoto size={16} />,
  channel_ownership_changed: <IconHeartHandshake size={16} />,
  message_pinned: <IconPinned size={16} />,
  message_unpinned: <IconPinned size={16} />,
  call_started: <IconDeviceMobile size={16} />, // Represents a call start
}

interface Props {
  createdAt: number
  isServer: boolean
  systemMessage: MessageSystem
}

export function SystemMessageIcon({ systemMessage, createdAt, isServer }: Props) {
  const { type } = systemMessage
  const isLeft = type === 'user_left'

  // Determine which icon to render
  let iconToRender: ReactNode | null = null
  if (isLeft) {
    iconToRender = isServer ? <IconArrowLeft size={16} /> : <IconMinus size={16} />
  } else {
    iconToRender = ICON_MAP[type] || <IconFileDescription size={16} /> // Fallback icon
  }

  return (
    <div
      className={`
        w-15.5 grid place-items-center
        ${[
          'user_added',
          'user_joined',
          'channel_ownership_changed',
          'channel_renamed',
          'channel_description_changed',
          'channel_icon_changed',
          'message_pinned',
          'message_unpinned',
          'call_started',
        ].includes(type)
          ? 'text-(--md-sys-color-primary)'
          : ''
        }
        ${['user_left', 'user_kicked', 'user_banned'].includes(type) ? 'text-(--md-sys-color-error)' : ''}
        ${
        // Fallback for text/user_remove or others
        (type === 'text' || type === 'user_remove') && 'text-(--md-sys-color-primary)'
        }
      `}>
      <Tooltip label={createdAt.toString()}>{iconToRender}</Tooltip>
    </div>
  )
}
