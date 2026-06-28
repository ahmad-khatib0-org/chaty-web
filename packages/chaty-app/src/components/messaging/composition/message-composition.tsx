import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { notifications } from '@mantine/notifications'

import { useClient } from '@/context/client'
import { useAppStore, useDraftsStore, useSettingsStore } from '@/state'
import { Channel } from 'chaty-client/models'
import { useSearchSpace } from '@/components/common'
import { ConnectionState } from 'chaty-client/events'
import { debounce } from '@/lib/shared'
import { humanFileSize, tr as trans } from '@/lib/client'
import { Keybind, KeybindAction } from '@/lib/client/keybinds'
import { FileCarousel } from '@/components/ui'
import { ObjString } from '@/types/shared'
import { MessageReplyPreview } from '../message-reply-preview'
import { MessageBox } from '../message-box'
import { Button } from '@mantine/core'
import { IconGif, IconMoodKid, IconPlus, IconSend } from '@tabler/icons-react'
import { CompositionMediaPicker } from './composition-media-picker'
import { FileDropAnywhereCollector, FilePasteCollector } from '@/components/common/files'

interface Props {
  tr: ObjString

  /**
   * Channel to compose for
   */
  channel: Channel

  /**
   * Notify parent component when a message is sent
   */
  onMessageSend?: () => void
}

/**
 * Message composition engine
 */
export function MessageComposition({ channel, onMessageSend, tr }: Props) {
  const {
    getDraft,
    setDraft,
    sendDraft,
    addFile,
    removeFile,
    getFile,
    hasAdditionalElements,
    popFromDraft,
    toggleReplyMention,
    removeReply,
    setEditingMessage,
    setSelection,
    setNodeReplacement: _setNodeReplacement,
  } = useDraftsStore()
  const { getValue } = useSettingsStore()
  const { clientConnState } = useAppStore()
  const { languageSymbol } = useAppStore((state) => state.clientInfo)
  const client = useClient()

  const [nodeReplacement, setNodeReplacement] = useState<readonly [string | '_focus'] | undefined>()
  const [initialValue, setInitialValue] = useState<[string]>([''])
  const searchSpace = useSearchSpace(channel, client)
  const isTypingRef = useRef<number | undefined>(undefined)
  const draft = useMemo(() => getDraft(channel.id), [channel.id, getDraft])

  const currentValue = draft?.content ?? ''

  // Whether the send button should be active/clickable
  const canSend = useMemo(() => {
    const draftContent = draft?.content ?? ''
    const draftFiles = draft?.files ?? []
    return draftContent.trim().length > 0 || draftFiles.length > 0
  }, [draft])

  useEffect(() => {
    _setNodeReplacement(setNodeReplacement)

    return () => {
      _setNodeReplacement(() => undefined)
    }
  }, [])

  useEffect(() => {
    setInitialValue([currentValue])
  }, [channel.id])

  useEffect(() => {
    if (currentValue === '') {
      setInitialValue([''])
    }
  }, [currentValue])

  const startTyping = useCallback(() => {
    if (typeof isTypingRef.current === 'number' && +new Date() < isTypingRef.current) return
    if (clientConnState === ConnectionState.Connected) {
      isTypingRef.current = +new Date() + 2500
      client.events.send({ type: 'BeginTyping', channel: channel.id })
    }
  }, [channel, channel.id])

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) return
    if (clientConnState === ConnectionState.Connected) {
      isTypingRef.current = undefined
      client.events.send({ type: 'EndTyping', channel: channel.id })
    }
  }, [channel, channel.id])

  const delayStopTyping = useCallback(debounce(stopTyping, 1000), [stopTyping])

  const sendMessage = useCallback(async (useContent?: unknown) => {
    stopTyping()
    onMessageSend?.()

    if (typeof useContent === 'string') {
      const currentDraft = getDraft(channel.id)
      if (currentDraft.replies?.length && !currentDraft.content && !currentDraft.files?.length) {
        setDraft(channel.id, { ...currentDraft, content: useContent })
        return sendDraft(client, channel)
      }
      return channel.sendMessage(useContent)
    }

    sendDraft(client, channel)
  }, [])

  const setContent = useCallback(
    (content: string) => {
      setDraft(channel.id, { content })
      startTyping()
    },
    [setDraft, channel.id, startTyping]
  )

  // Handle files being added to the draft
  const onFiles = useCallback(
    (files: File[]) => {
      const rejectedFiles: File[] = []
      const validFiles: File[] = []

      const maxFileSize = process.env.NEXT_PUBLIC_MAX_FILE_SIZE
        ? parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE)
        : 20000000

      for (const file of files) {
        if (file.size > maxFileSize) rejectedFiles.push(file)
        else validFiles.push(file)
      }

      if (rejectedFiles.length) {
        if (rejectedFiles.length === 1) {
          notifications.show({
            color: 'red',
            position: 'top-right',
            message: trans(languageSymbol, 'files.single_large_file.error', {
              FileName: rejectedFiles[0].name,
              Size: humanFileSize(rejectedFiles[0].size),
            }),
          })
        } else {
          notifications.show({
            color: 'red',
            position: 'top-right',
            message: trans(languageSymbol, 'files.multiple_large_files.error', {
              Count: rejectedFiles.length,
              Size: humanFileSize(maxFileSize),
            }),
          })
        }
      }

      for (const file of validFiles) addFile(channel.id, file)
    },
    [addFile, channel.id, notifications.show]
  )

  const addFileHandler = useCallback(() => {
    const input = document.createElement('input')
    input.accept = '*'
    input.type = 'file'
    input.multiple = true
    input.style.display = 'none'

    input.addEventListener('change', (e) => {
      const files = (e.currentTarget as HTMLInputElement)?.files
      input.remove()
      if (!files) return
      onFiles([...files])
    })

    document.body.appendChild(input)
    input.click()
  }, [onFiles])

  // Remove a file by its ID
  const removeFileHandler = useCallback(
    (fileId: string) => {
      removeFile(channel.id, fileId)
    },
    [removeFile, channel.id]
  )

  // Reply handlers
  const toggleReplyMentionHandler = useCallback(
    (replyId: string) => {
      toggleReplyMention(channel.id, replyId)
    },
    [toggleReplyMention, channel.id]
  )

  const removeReplyHandler = useCallback(
    (replyId: string) => {
      removeReply(channel.id, replyId)
    },
    [removeReply, channel.id]
  )

  const showSendButton = getValue('appearance:show_send_button')

  return (
    <>
      {hasAdditionalElements(channel.id) && (
        <Keybind
          keybind={KeybindAction.CHAT_REMOVE_COMPOSITION_ELEMENT}
          onPressed={() => popFromDraft(channel.id)}
        />
      )}
      <FileCarousel
        files={draft.files ?? []}
        getFile={getFile}
        addFile={addFileHandler}
        removeFile={removeFileHandler}
      />

      {draft?.replies?.map((reply) => {
        const msg = client.messages.get(reply.id)
        return (
          <MessageReplyPreview
            key={reply.id}
            tr={tr}
            message={msg}
            mention={reply.mention}
            toggle={() => toggleReplyMentionHandler(reply.id)}
            dismiss={() => removeReplyHandler(reply.id)}
            self={msg?.authorId === client.user?.id}
          />
        )
      })}

      <MessageBox
        tr={tr}
        initialValue={initialValue}
        nodeReplacement={nodeReplacement}
        onSendMessage={() => sendMessage()}
        onTyping={delayStopTyping}
        onEditLastMessage={() => setEditingMessage(true)}
        content={draft.content ?? ''}
        setContent={setContent}
        actionsStart={
          channel.havePermission('UploadFiles') ? (
            <MessageBox.InlineIcon size='wide'>
              <Button onClick={() => addFileHandler()}>
                <IconPlus size={20} />
              </Button>
            </MessageBox.InlineIcon>
          ) : (
            <MessageBox.InlineIcon size='short' children={<span />} />
          )
        }
        actionsEnd={
          <CompositionMediaPicker
            onMessage={sendMessage}
            onTextReplacement={(text: string) => setNodeReplacement([text])}>
            {({ ref, onClickGif, onClickEmoji }) => (
              <>
                <MessageBox.InlineIcon size='normal'>
                  <Button onClick={onClickGif}>
                    <IconGif size={20} />
                  </Button>
                </MessageBox.InlineIcon>
                <MessageBox.InlineIcon size='normal'>
                  <Button onClick={onClickEmoji}>
                    <IconMoodKid size={20} />
                  </Button>
                </MessageBox.InlineIcon>
                <div ref={ref} />
              </>
            )}
          </CompositionMediaPicker>
        }
        placeholder={
          channel.saved
            ? tr.save2Notes
            : channel.direct
              ? trans(languageSymbol, 'chat.message.username', { Username: channel.recipient?.username })
              : trans(languageSymbol, 'chat.message.username', { Username: channel.recipient?.username })
        }
        sendingAllowed={channel.havePermission('SendMessage')}
        autoCompleteSearchSpace={() => searchSpace}
        updateDraftSelection={(start, end) => setSelection(channel.id, start, end)}
        hasActionsAppend={getValue('appearance:show_send_button') || false}
        actionsAppend={
          showSendButton && (
            <Button
              size='sm'
              variant={canSend ? 'filled' : 'tonal'}
              disabled={!canSend}
              onClick={sendMessage}>
              <IconSend size={20} />
            </Button>
          )
        }
      />
      <FilePasteCollector onFiles={onFiles} />
      <FileDropAnywhereCollector allowInModal={false} onFiles={onFiles} />
    </>
  )
}
