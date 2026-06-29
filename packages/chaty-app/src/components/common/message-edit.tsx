import { useMutation } from '@tanstack/react-query'

import { Message } from 'chaty-client/models'
import { useClient } from '@/context/client'
import { useDraftsStore } from '@/state'
import { ObjString } from '@/types/shared'
import { notifications } from '@mantine/notifications'
import { KeybindAction, useKeybind } from '@/lib/client/keybinds'
import { useSearchSpace } from './autocomplete'
import { TextEditor } from '../ui/text-editor'

export function MessageEdit({ message, tr }: { message: Message; tr: ObjString }) {
  const client = useClient()
  const { editingMessageContent, setEditingMessageContent, setEditingMessage, setNodeReplacement } =
    useDraftsStore()

  const initialValue = [editingMessageContent || ''] as const

  const change = useMutation({
    mutationFn: (content: string) => message.edit({ content }),
    onSuccess() {
      setEditingMessage(undefined)
    },
    onError(error) {
      notifications.show({ color: 'red', message: error.message })
    },
  })

  function saveMessage() {
    const content = editingMessageContent
    if (content?.length) {
      setNodeReplacement(() => ['_focus']) // focus the message box
      change.mutate(content)
    }
  }

  // CHAT_CANCEL_EDITING keybind
  useKeybind(KeybindAction.CHAT_CANCEL_EDITING, () => {
    setEditingMessage(undefined)
    setNodeReplacement?.(() => ['_focus']) // focus message box
  })

  const searchSpace = useSearchSpace(message, client)

  return (
    <div className='flex flex-col gap-2'>
      <div className='grow bg-(--md-sys-color-surface-container-highest) text-(--md-sys-color-on-surface-container) rounded-(--borderRadius-sm) p-4'>
        <TextEditor
          autoFocus
          onComplete={saveMessage}
          onChange={setEditingMessageContent}
          initialValue={initialValue}
          autoCompleteSearchSpace={() => searchSpace}
        />
      </div>

      {change.isPending && <p>{tr.saving}</p>}
      {!change.isPending && (
        <p>
          {tr.escapeCancel}{' '}
          <span
            className='font-semibold cursor-pointer text-(--md-sys-color-primary)'
            onClick={() => setEditingMessage(undefined)}>
            {tr.cancel}
          </span>{' '}
          · {tr.enterSave}{' '}
          <span className='font-semibold cursor-pointer text-(--md-sys-color-primary)' onClick={saveMessage}>
            {tr.save}
          </span>
        </p>
      )}
    </div>
  )
}
