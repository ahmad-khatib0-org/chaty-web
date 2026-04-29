import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { ReplyIntent } from '@chaty-app/proto/web-plain/service/v1/messages'
import { Message } from 'chaty-client/models'

export interface DraftData {
  content: string
  replies: ReplyIntent[]
  files?: string[]
}

export type UnsentMessage = {
  idempotencyKey: string
  /**
   * Status
   */
  status: 'sending' | 'unsent' | 'failed'
}

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
  uploadProgress: number
}

interface DraftsState {
  drafts: Record<string, DraftData>
  outbox: Record<string, UnsentMessage[]>
  editingMessageId?: string | true
  editingMessageContent?: string

  fileCache: Record<string, FileCacheEntry>
  textSelection?: TextSelection
  setNodeReplacement?: (value: readonly [string | '_focus'] | undefined) => void

  getDraft: (channelId: string) => DraftData
  hasDraft: (channelId: string) => boolean
  setDraft: (channelId: string, data?: DraftData | ((data: DraftData) => DraftData)) => void
  clearDraft: (channelId: string) => void
  popDraft: (channelId: string) => DraftData
  reset: () => void

  setEditingMessage: (message: true | Message | undefined) => void
  setEditingMessageContent: (content: string) => void
}

const storeFn: StateCreator<DraftsState> = (set) => ({
  editingMessageId: undefined,
})

export const useDraftsStore =
  process.env.NODE_ENV === 'development'
    ? create<DraftsState>()(devtools(storeFn, { name: 'App Store' }))
    : create<DraftsState>()(storeFn)
