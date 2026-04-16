import { type Message } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import { MessageSystem, MessageWebhook, File, MessageEmbed } from '../models'
import type { Hydrate } from '.'

export type HydratedMessage = Omit<Message, 'webhook' | 'system' | 'attachments' | 'embeds'> & {
  webhook?: MessageWebhook
  system?: MessageSystem
  attachments: File[]
  embeds: MessageEmbed[]
}

export const messageHydration: Hydrate<Message, HydratedMessage> = {
  keyMapping: {},
  functions: {
    id: (message) => message.id,
    nonce: (message) => message.nonce,
    channelId: (message) => message.channelId,
    authorId: (message) => message.authorId,
    webhook: (message, ctx) => (message.webhook ? new MessageWebhook(message.webhook) : undefined),
    content: (message) => message.content!,
    system: (message: Message) => (message.system ? new MessageSystem(message.system) : undefined),
    attachments: (message) => message.attachments!.map((file) => new File(file)),
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
