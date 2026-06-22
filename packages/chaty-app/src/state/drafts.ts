import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { ReplyIntent } from '@chaty-app/proto/web-plain/service/v1/messages'
import { Channel, Message } from 'chaty-client/models'
import { Client } from 'chaty-client'
import { LAYOUT_SECTIONS, useLayoutStore } from './layout'
import { insecureUniqueId } from '@/lib/client'

/**
 * List of image content types
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export interface DraftData {
  /**
   * Message content
   */
  content?: string

  /**
   * Message IDs being replied to
   */
  replies?: ReplyIntent[]

  /**
   * IDs of cached files
   */
  files?: string[]
}

export type UnsentMessage = {
  idempotencyKey: string
  /**
   * Status
   */
  status: 'sending' | 'unsent' | 'failed'
} & DraftData

export interface TextSelection {
  /**
   * Draft we should update
   */
  channelId: string

  /**
   * Start index of text selection
   */
  start: number

  /**
   * End index of text selection
   */
  end: number
}

export interface FileCacheEntry {
  file: File
  dataUri?: string
  dimensions?: [number, number]
  autumnId?: string
  uploadProgress: [() => number, (value: number) => void]
}

export interface TypeDraft {
  /**
   * All active message drafts
   */
  drafts: Record<string, DraftData>

  /**
   * Unsent messages
   */
  outbox: Record<string, UnsentMessage[]>

  /**
   * Current message being edited
   * or used as a marker to load newest message as editor
   */
  editingMessageId?: string | true

  /**
   * Value of message currently being edited
   */
  editingMessageContent?: string
}

export interface DraftsState extends TypeDraft {
  /**
   * Get draft for a channel.
   * @param channelId Channel ID
   * @returns Draft data for the channel
   */
  getDraft: (channelId: string) => DraftData

  /**
   * Check whether a channel has a draft.
   * @param channelId Channel ID
   * @returns Whether the channel has a draft
   */
  hasDraft: (channelId: string) => boolean

  /**
   * Set draft for a channel.
   * @param channelId Channel ID
   * @param data Draft content or update function
   */
  setDraft: (channelId: string, data?: DraftData | ((data: DraftData) => DraftData)) => void

  /**
   * Clear draft from a channel.
   * @param channelId Channel ID
   */
  clearDraft: (channelId: string) => void

  /**
   * Get the draft for a channel and send it
   * @param client Client
   * @param channel Channel
   * @param existingDraft The existing draft to send
   */
  sendDraft: (client: Client, channel: Channel, existingDraft?: DraftData) => Promise<void>

  /**
   * Remove required objects for sending a new message
   * @param channelId Channel ID
   * @returns Object with all required data
   */
  popDraft: (channelId: string) => DraftData

  /**
   * Retry sending a message in a channel
   * @param client Client
   * @param channel Channel
   * @param idempotencyKey Idempotency key
   */
  retrySend: (client: Client, channel: Channel, idempotencyKey: string) => void

  /**
   * Cancel sending a message in a channel
   * @param channel Channel
   * @param idempotencyKey Idempotency key
   */
  cancelSend: (channel: Channel, idempotencyKey: string) => void

  /**
   * Get all pending messages
   * @param channelId Channel Id
   * @returns Pending messages
   */
  getPendingMessages: (channelId: string) => UnsentMessage[]

  /**
   * Set the current text selection
   * @param channelId Channel Id
   * @param start Start index
   * @param end End index
   */
  setSelection: (channelId: string, start: number, end: number) => void

  /**
   * Insert text into the current selection
   * @param text Text to insert
   */
  insertText: (text: string) => void

  /**
   * Reset and clear all drafts.
   */
  reset: () => void

  /**
   * Add a reply to the given message
   * @param message Message
   * @param selfId Own user ID
   */
  addReply: (message: Message, selfId: string) => void

  /**
   * Toggle reply mention
   *
   * This has a side-effect of updating the MENTION_REPLY section state!
   * @param channelId Channel ID
   * @param messageId Message ID
   */
  toggleReplyMention: (channelId: string, messageId: string) => void

  /**
   * Remove a reply by message ID from a channel draft
   * @param channelId Channel ID
   * @param messageId Message ID
   */
  removeReply: (channelId: string, messageId: string) => void

  /**
   * Add a file to a draft
   * @param channelId Channel ID
   * @param file File to add
   */
  addFile: (channelId: string, file: File) => Promise<void>

  /**
   * Remove a file from a draft
   * @param channelId Channel ID
   * @param fileId File ID
   */
  removeFile: (channelId: string, fileId: string) => void

  /**
   * Get cache File by its ID
   * @param fileId File ID
   * @returns Cached File
   */
  getFile: (fileId: string) => any

  /**
   * Whether additional elements (attachment/reply) are present
   * @param channelId Channel ID
   * @returns Whether information is present
   */
  hasAdditionalElements: (channelId: string) => boolean

  /**
   * Remove additional information from a draft (file or reply)
   * @param channelId Channel ID
   * @returns Whether information was removed
   */
  popFromDraft: (channelId: string) => boolean

  /**
   * Set message ID
   * @param message Message ID
   */
  setEditingMessage: (message: Message | true | undefined) => void

  /**
   * Set editing message content
   * @param content Content
   */
  setEditingMessageContent: (content: string) => void

  /**
   * Hydrate external context
   */
  hydrate: () => void

  /**
   * Validate the given data to see if it is compliant and return a compliant object
   */
  clean: (input: Partial<TypeDraft>) => TypeDraft

  /**
   * Set editing message ID
   * @param id Message ID or true/undefined
   */
  setEditingMessageId: (id: string | true | undefined) => void
}

const storeFn: StateCreator<DraftsState> = (set, get) => {
  const fileCache: Record<string, FileCacheEntry> = {}
  let textSelection: TextSelection | undefined
  let setNodeReplacement: ((value: readonly [string | '_focus'] | undefined) => void) | undefined

  const validateReplies = (replies?: ReplyIntent[]) =>
    Array.isArray(replies) &&
    replies.length &&
    !replies.find((x) => typeof x !== 'object' || typeof x.id !== 'string' || typeof x.mention !== 'boolean')

  return {
    drafts: {},
    outbox: {},

    hydrate: () => { },

    reset: () => {
      set({ drafts: {} })
    },

    clean: (input: Partial<TypeDraft>): TypeDraft => {
      const drafts: TypeDraft['drafts'] = {}
      const outbox: TypeDraft['outbox'] = {}

      const messageDrafts = input.drafts
      if (typeof messageDrafts === 'object') {
        for (const channelId of Object.keys(messageDrafts)) {
          const entry = messageDrafts?.[channelId]
          const draft: DraftData = {}

          if (typeof entry.content === 'string' && entry.content) {
            draft.content = entry.content
          }

          if (validateReplies(entry?.replies)) draft.replies = entry!.replies

          if (Object.keys(draft).length) drafts[channelId] = draft
        }
      }

      const pendingMessages = input.outbox
      if (typeof pendingMessages === 'object') {
        for (const channelId of Object.keys(pendingMessages)) {
          const entry = pendingMessages[channelId]
          const messages: UnsentMessage[] = []

          if (Array.isArray(entry)) {
            for (const message of entry) {
              if (
                typeof message === 'object' &&
                ['sending', 'unsent', 'failed'].includes(message.status) &&
                typeof message.idempotencyKey === 'string' &&
                typeof message.content === 'string'
              ) {
                const msg: UnsentMessage = {
                  idempotencyKey: message.idempotencyKey,
                  content: message.content,
                  status: message.status,
                }

                if (validateReplies(message.replies)) {
                  msg.replies = message.replies
                }

                messages.push(msg)
              }
            }
          }

          outbox[channelId] = messages
        }
      }

      return { drafts, outbox }
    },

    getDraft: (channelId: string): DraftData => {
      return get().drafts[channelId] ?? {}
    },

    hasDraft: (channelId: string) => {
      const entry = get().drafts[channelId]
      return entry && entry.content!.length > 0
    },

    getPendingMessages: (channelId: string) => {
      return get().outbox[channelId] ?? []
    },

    setDraft: (channelId: string, data?: DraftData | ((data: DraftData) => DraftData)) => {
      if (typeof data === 'function') {
        data = data(get().getDraft(channelId))
      }

      if (typeof data === 'undefined') {
        console.info('[draft] cleared!')
        return get().clearDraft(channelId)
      }

      console.info('[draft] updated to ', data)
      set((state) => ({
        drafts: { ...state.drafts, [channelId]: data },
      }))
    },

    // TODO: implement
    sendDraft: async (client: Client, channel: Channel, existingDraft?: DraftData) => { },

    clearDraft: (channelId: string) => {
      const files = get().getDraft(channelId)?.files ?? []
      for (const file of files) {
        const cachedFile = fileCache[file]
        if (cachedFile?.dataUri) URL.revokeObjectURL(cachedFile.dataUri)
        delete fileCache[file]
      }

      get().setDraft(channelId, { content: '', replies: [], files: [] })
    },

    popDraft: (channelId: string) => {
      const { content, replies, files } = get().getDraft(channelId)
      const maxFiles = process.env.NEXT_PUBLIC_MAX_ATTACHMENTS
        ? parseInt(process.env.NEXT_PUBLIC_MAX_ATTACHMENTS)
        : 5

      get().setDraft(channelId, {
        content: '',
        replies: [],
        files: files?.splice(maxFiles),
      })

      return { content, replies, files: files?.slice(0, maxFiles) }
    },

    retrySend: (client: Client, channel: Channel, idempotencyKey: string) => {
      const draft = get()
        .getPendingMessages(channel.id)
        .find((entry) => entry.idempotencyKey === idempotencyKey)

      get().cancelSend(channel, idempotencyKey)
      get().sendDraft(client, channel, draft)
    },

    cancelSend: (channel: Channel, idempotencyKey: string) => {
      set((state) => ({
        outbox: {
          ...state.outbox,
          [channel.id]:
            state.outbox[channel.id]?.filter((entry) => entry.idempotencyKey !== idempotencyKey) || [],
        },
      }))
    },

    setSelection: (channelId: string, start: number, end: number) => {
      textSelection = { channelId, start, end }
    },

    insertText: (text: string) => {
      if (textSelection) {
        const content = get().getDraft(textSelection.channelId).content ?? ''
        const startStr = content.slice(0, textSelection.start)
        const endStr = content.slice(textSelection.end, content.length)

        get().setDraft(textSelection.channelId, (draft) => ({
          ...draft,
          content: startStr + text + endStr,
        }))

        const pasteEndIdx = startStr.length + text.length
        textSelection = { ...textSelection, start: pasteEndIdx, end: pasteEndIdx }
      }
    },

    addReply: (message: Message, selfId: string) => {
      if (setNodeReplacement) setNodeReplacement(['_focus'])

      if (
        get()
          .getDraft(message.channelId)
          .replies?.find((reply) => reply.id === message.id)
      ) {
        return
      }

      const maxReplies = process.env.NEXT_PUBLIC_MAX_REPLIES
        ? parseInt(process.env.NEXT_PUBLIC_MAX_REPLIES)
        : 5
      if ((get().getDraft(message.channelId).replies?.length ?? 0) >= maxReplies) {
        return
      }

      const { getSectionState } = useLayoutStore()
      const shouldMention = message.authorId !== selfId && getSectionState(LAYOUT_SECTIONS.MENTION_REPLY)

      get().setDraft(message.channelId, (data) => ({
        replies: [
          ...(data.replies ?? []),
          {
            id: message.id,
            mention: shouldMention || false,
            failIfNotExists: true,
          },
        ],
      }))
    },

    toggleReplyMention: (channelId: string, messageId: string) => {
      const { getSectionState, setOpenSection } = useLayoutStore()
      get().setDraft(channelId, (data) => ({
        replies: data.replies?.map((reply) => {
          if (reply.id === messageId) {
            if (typeof getSectionState === 'function') {
              setOpenSection(LAYOUT_SECTIONS.MENTION_REPLY, !reply.mention)
            }
            return { ...reply, mention: !reply.mention }
          }

          return reply
        }),
      }))
    },

    removeReply: (channelId: string, messageId: string) => {
      get().setDraft(channelId, (data) => ({
        replies: data.replies?.filter((reply) => reply.id !== messageId),
      }))
    },

    addFile: async (channelId: string, file: File) => {
      const id = insecureUniqueId()
      let uploadProgress = 0

      const setUploadProgress = (value: number) => {
        uploadProgress = value
      }

      fileCache[id] = {
        file,
        dataUri: ALLOWED_IMAGE_TYPES.includes(file.type) ? URL.createObjectURL(file) : undefined,
        uploadProgress: [() => uploadProgress, setUploadProgress],
      }

      if (fileCache[id]?.dataUri) {
        await new Promise((res, rej) => {
          const image = new Image()
          image.onload = () => {
            fileCache[id].dimensions = [image.width, image.height]
            res(void 0)
          }
          image.onerror = rej
          image.src = fileCache[id]?.dataUri ?? ''
        }).catch(() => { })
      }

      get().setDraft(channelId, (data) => ({
        files: [...(data.files ?? []), id],
      }))
    },

    removeFile: (channelId: string, fileId: string) => {
      const file = fileCache[fileId]
      if (file?.dataUri) URL.revokeObjectURL(file.dataUri)
      delete fileCache[fileId]

      get().setDraft(channelId, (data) => ({
        files: data.files?.filter((entry) => entry !== fileId),
      }))
    },

    getFile: (fileId: string) => {
      return fileCache[fileId]
    },

    hasAdditionalElements: (channelId: string): boolean => {
      const draft = get().getDraft(channelId)
      return !!(draft.replies?.length || draft.replies?.length)
    },

    popFromDraft: (channelId: string) => {
      const draft = get().getDraft(channelId)
      if (draft.replies?.length) {
        get().setDraft(channelId, {
          replies: draft.replies.slice(0, draft.replies.length - 1),
        })
        return true
      }

      if (draft.files?.length) {
        get().setDraft(channelId, {
          files: draft.files.slice(0, draft.files.length - 1),
        })
        return true
      }

      return false
    },

    setEditingMessage: (message) => {
      if (message instanceof Message) {
        set({ editingMessageContent: message.content })
        set({ editingMessageId: message.id })
      } else {
        set({ editingMessageContent: undefined })
        set({ editingMessageId: message })
      }
    },

    setEditingMessageContent: (content: string) => {
      set({ editingMessageContent: content })
    },

    setEditingMessageId: (id: string | true | undefined) => {
      set({ editingMessageId: id })
    },
  }
}

export const useDraftsStore =
  process.env.NODE_ENV === 'development'
    ? create<DraftsState>()(devtools(storeFn, { name: 'App Store' }))
    : create<DraftsState>()(storeFn)
