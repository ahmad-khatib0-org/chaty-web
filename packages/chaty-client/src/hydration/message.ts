import { type Message } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import { MessageSystem, MessageWebhook, File, MessageEmbed } from '../models'
import type { Hydrate } from '.'
import type { Client } from '../client'

/**
 * Flags attributed to messages
 */
export enum MessageFlags {
  /**
   * Message will not send push / desktop notifications
   */
  SuppressNotifications = 1,
  /**
   * Message will mention all users who can see the channel
   */
  MentionsEveryone = 2,
  /**
   * Message will mention all users who are online and can see the channel.
   * This cannot be true if MentionsEveryone is true
   */
  MentionsOnline = 3,
}

export type HydratedMessage = Omit<Message, 'webhook' | 'system' | 'attachments' | 'embeds' | 'flags'> & {
  webhook?: MessageWebhook
  system?: MessageSystem
  attachments: File[]
  embeds: MessageEmbed[]
  flags?: MessageFlags
}

export const messageHydration: Hydrate<Message, HydratedMessage> = {
  keyMapping: {},
  functions: {
    id: (message) => message.id,
    nonce: (message) => message.nonce,
    channelId: (message) => message.channelId,
    authorId: (message) => message.authorId,
    webhook: (message, ctx) =>
      message.webhook ? new MessageWebhook(ctx as Client, message.webhook, message.authorId) : undefined,
    content: (message) => message.content!,
    system: (message: Message) => (message.system ? new MessageSystem(message.system) : undefined),
    attachments: (message, ctx) => message.attachments!.map((file) => new File(ctx as Client, file)),
    editedAt: (message) => message.editedAt,
    embeds: (message, ctx) => message.embeds!.map((embed) => MessageEmbed.from(embed)),
    mentions: (message) => message.mentions,
    roleMentions: (message) => message.roleMentions,
    replies: (message) => message.replies,
    reactions: (message) => message.reactions,
    interactions: (message) => message.interactions,
    masquerade: (message) => message.masquerade!,
    pinned: (message) => message.pinned!,
    flags: (message) => message.flags!,
    createdAt: (message) => message.createdAt,
  },
  initialHydration: () => ({}),
}
