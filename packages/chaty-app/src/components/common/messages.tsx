import { ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react'
import deepEqual from 'fast-deep-equal'

import { MessageSort } from '@chaty-app/proto/web/service/v1/messages_pb'
import { Channel, Message as MessageType } from 'chaty-client/models'

import { useMessageCache } from './messages-cache'
import { State, useClient, useLifecycle } from '@/context/client'
import { useDraftsStore } from '@/state'
import { ListView } from '@/components/app'
import { ConversationStart } from './conversation-start'
import { ObjString } from '@/types/shared'
import { Message } from './message'
import { JumpToBottom, MessageBlocked, MessageDivider } from '../messaging'
import { grpcClient } from '@/lib/client'

const DEFAULT_FETCH_LIMIT = 50

type ListEntry =
  | // Message
  {
    t: 0
    message: MessageType
    tail: boolean
    highlight: boolean
  }
  // Message Divider
  | {
    t: 1
    date?: string
    unread?: boolean
  }
  // Blocked messages
  | {
    t: 2
    count: number
  }

type Props = {
  tr: ObjString

  /**
   * Channel to fetch messages from
   */
  channel: Channel

  /**
   * Limit to number of messages to fetch at a time
   */
  fetchLimit?: number

  /**
   * Limit to number of messages to display at one time
   */
  limit?: number

  /**
   * Pending messages to render at the end of the list
   */
  pendingMessages?: (props: { tail: boolean; ids: string[] }) => ReactNode

  /**
   * Display typing indicator instead of padding
   */
  typingIndicator?: ReactNode

  /**
   * Highlighted message id
   */
  highlightedMessageId: string | undefined

  /**
   * Last read message id
   */
  lastReadId: string | undefined

  /**
   * Clear the highlighted message
   */
  clearHighlightedMessage: () => void

  /**
   * Bind the initial messages function to the parent component
   * @param fn Function
   */
  jumpToBottomRef?: (fn: (nearby?: string) => void) => void

  /**
   * Bind the atEnd signal to the parent component
   * @param fn Function
   */
  atEndRef?: (fn: () => boolean) => void
}

function Messages({
  tr,
  channel,
  fetchLimit,
  limit,
  pendingMessages,
  typingIndicator,
  highlightedMessageId,
  lastReadId,
  clearHighlightedMessage,
  jumpToBottomRef,
  atEndRef,
}: Props) {
  const cache = useMessageCache()
  const client = useClient()
  const { lifecycle } = useLifecycle()
  const editingMessageId = useDraftsStore((state) => state.editingMessageId)
  const setEditingMessage = useDraftsStore((state) => state.setEditingMessage)

  const [messages, setMessages] = useState<MessageType[]>([])
  const [atStart, setAtStart] = useState(false)
  const [atEnd, setAtEnd] = useState(false)
  /**
   * The current direction of fetching
   */
  const [fetching, setFetching] = useState<'initial' | 'upwards' | 'downwards' | 'jump_end' | 'jump_msg'>()

  /**
   * Whether the current fetch has failed
   */
  const [failure, setFailure] = useState(false)

  /**
   * Collect messages during fetches
   *
   * The new message handler should write into this if it
   * is defined as opposed to appending to messages[] list
   */
  let collectedMessages: MessageType[] | undefined

  /**
   * Pre-empt the current fetch (cancels any ongoing fetch)
   */
  let preemptFetch: () => void | undefined

  /**
   * Reference for the list container so we can scroll to elements
   */
  let listRef = useRef<HTMLDivElement>(null)

  // We need to cache created objects to prevent needless re-rendering
  const objectCache = new Map()

  /**
   * Whether we can fetch
   * @returns Boolean
   */
  function canFetch() {
    return !fetching || failure
  }

  function preempt() {
    setFetching(undefined)
    setFailure(false)
    preemptFetch?.()
  }

  /**
   * Helper for checking if we've been pre-empted
   * @returns Function to check if we have been pre-empted
   */
  function newPreempted() {
    let preempted = false
    preemptFetch = () => {
      preempted = true
    }

    return () => preempted
  }

  /**
   * Safely update messages by applying consistency checks
   * @param messagesArr Array of message arrays
   */
  function setMessagesSafely(...messagesArray: MessageType[][]) {
    setMessages(messagesArray.flat().toSorted((a, b) => b.id.localeCompare(a.id)))
  }

  /**
   * Initial load subroutine
   * @param nearby Message we should load around (and then scroll to)
   */
  async function caseInitialLoad(nearby?: string) {
    preempt()
    setFetching('initial')

    const preempted = newPreempted()
    setMessages([])

    setAtStart(false)
    setAtEnd(true)

    collectedMessages = []

    let messages: MessageType[] = []
    const existingState = cache?.unmanage(channel)
    const useExistingState = existingState && !nearby

    if (useExistingState) {
      messages = existingState.messages
    } else {
      const res = (
        await grpcClient().messagesGet({ limit: fetchLimit ? BigInt(fetchLimit) : undefined, nearby })
      ).response

      if (res.case === 'data') {
        messages = res.value.messages.map((msg) => client.messages.getOrCreate(msg.id, msg))
      } else if (res.case === 'error') {
        setFailure(true)
      }
    }

    // Cancel if we've been pre-empted
    if (preempted()) return

    // Assume we are not at the end if we jumped to a message
    // NB. We set this late to not display the "jump to bottom" bar
    if (typeof nearby === 'string') {
      // If the messages fetched include the latest message,
      // then we are at the end and mark the channel as such.
      setAtEnd(messages.findIndex((msg) => msg.id === channel.lastMessageId) !== -1)
    }
    // Check if we're at the start of the conversation otherwise
    else if (!useExistingState && messages.length < (fetchLimit ?? DEFAULT_FETCH_LIMIT)) {
      setAtStart(true)
    }
    // Apply existing state if present
    else if (useExistingState) {
      setAtStart(existingState.atStart)
      setAtEnd(existingState.atEnd)
    }

    // Merge list with any new ones that have come in if we are at the end
    // this is necessary to prevent Duplicate messages, Break React's key-based rendering ...
    if (atEnd) {
      const knownIDs = new Set(collectedMessages.map((msg) => msg.id))
      setMessagesSafely(
        collectedMessages,
        messages.filter((msg) => !knownIDs.has(msg.id))
      )
    }
    // Otherwise just replace the whole list
    else setMessages(messages)

    // Stop collecting messages
    collectedMessages = []

    // Mark as fetching has ended
    setFetching(undefined)

    // If we're not at the end, restore scroll position
    if (existingState && !existingState.atEnd) {
      // The setTimeout (even with 0ms delay) ensures the scroll happens after:
      // React has updated the DOM
      // The browser has rendered new messages
      // The list height has been recalculated
      setTimeout(() => listRef.current?.scrollTo({ top: existingState.scrollTop, behavior: 'instant' }))
    }
    // Or... Reset scroll to the end
    else if (atEnd) {
      setTimeout(() =>
        listRef.current?.scrollTo({
          top: 9999999,
          behavior: 'instant',
        })
      )
    }
  }

  async function caseFetchUpwards(reposition: (cb: () => void) => void) {
    // Pre-conditions:
    // - Must not already be at the start
    // - Must not already be fetching (or otherwise the fetch must have failed)
    if (atStart || !canFetch()) return

    setFetching('upwards')
    const preempted = newPreempted()

    const { response } = await grpcClient().messagesGet({
      limit: fetchLimit ? BigInt(fetchLimit) : undefined,
      before: messages.slice(-1)[0].id,
    })

    let res: MessageType[] = []
    if (response.case === 'error') {
      setFailure(true)
      return
    }

    if (response.case === 'data') {
      res = response.value.messages.map((msg) => client.messages.getOrCreate(msg.id, msg))
    }

    if (preempted()) return

    // If it's less than we expected, we are at the start
    if (res.length < (fetchLimit ?? DEFAULT_FETCH_LIMIT)) {
      setAtStart(true)
    }

    if (res.length) {
      // Calculate how much we need to cut off the other end
      const tooManyBy = Math.max(0, res.length + messages.length - (limit ?? 0))

      // If it's at least one element, we are no longer at the end
      if (tooManyBy > 0) setAtEnd(false)

      // Append messages to the top

      setMessagesSafely(messages, res)

      // If we removed any messages, guard the scroll position as we remove them
      if (tooManyBy) {
        // Example:
        // Before: [#1, #2, #3, ..., #20]  (20 messages)
        // Fetch 10 older messages: [-10, -9, ..., -1, #1, #2, ..., #20]  (30 total)
        // Too many by: 30 - 20 = 10 messages
        // Trim from bottom: keep [-10,..., #10]  (remove #11- #20)
        // Result: Still 20 messages in memory
        //
        reposition(() => setMessages((prev) => prev.slice(tooManyBy)))
        setFetching(undefined)
      } else {
        setFetching(undefined)
      }
    } else {
      setFetching(undefined)
    }
  }

  /**
   * Fetch downwards from current position
   * @param reposition Callback for ListView
   */
  async function caseFetchDownwards(reposition: (cb: () => void) => void) {
    // Pre-conditions:
    // - Must not already be at the end
    // - Must not already be fetching (or otherwise the fetch must have failed)
    if (atEnd || !canFetch()) return

    setFetching('downwards')
    const preempted = newPreempted()

    let result: MessageType[] = []
    const { response } = await grpcClient().messagesGet({
      limit: fetchLimit ? BigInt(fetchLimit) : undefined,
      after: messages[0].id,
      sort: MessageSort.OLDEST,
    })

    if (response.case === 'error') {
      setFailure(true)
      return
    }
    if (response.case === 'data') {
      result = response.value.messages.map((msg) => client.messages.getOrCreate(msg.id, msg))
    }

    if (preempted()) return

    // If it's less than we expected, we are at the end
    if (result.length < (fetchLimit ?? DEFAULT_FETCH_LIMIT)) setAtEnd(true)

    if (result.length) {
      // Calculate how much we need to cut off the other end
      const tooManyBy = Math.max(0, result.length + messages.length - (limit ?? 0))

      // If it's at least one element, we are no longer at the start
      if (tooManyBy > 0) setAtStart(false)

      // Append messages to the bottom
      setMessages((prev) => [...prev.reverse(), ...result])

      // If we removed any messages, guard the scroll position as we remove them
      if (tooManyBy) {
        // Example:
        // Before: [#1, #2, #3, ..., #20]  (20 messages)
        // Fetch 10 newer messages: [#1,..., #20, #21, #22]  (30 total)
        // Too many by: 30 - 20 = 10 messages
        // Trim from top: keep [#11,..., #22]  (remove #1 - #10)
        // Result: Still 20 messages in memory
        reposition(() => setMessages((prev) => prev.slice(0, -tooManyBy)))
      } else {
        setFetching(undefined)
      }
    } else {
      setFetching(undefined)
    }
  }

  /**
   * Jump to the present messages
   */
  async function caseJumpToBottom() {
    /**
     * Helper function to find the closest parent scroll container
     * @param el Element
     * @returns Element
     */
    function findScrollContainer(el: RefObject<HTMLDivElement | null>) {
      if (!el.current) return null
      else if (getComputedStyle(el.current).overflowY === 'scroll') return el.current
      else return el.current.parentElement?.children[0]
    }

    // Scroll to the bottom if we're already at the end
    if (atEnd) {
      const containerChild = findScrollContainer(listRef)
      containerChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      preempt()
      setFetching('jump_end')

      const preempted = newPreempted()
      collectedMessages = []

      let result: MessageType[] = []
      let { response } = await grpcClient().messagesGet({
        limit: fetchLimit ? BigInt(fetchLimit) : undefined,
      })

      if (response.case === 'error') {
        setFailure(true)
        return
      }
      if (response.case === 'data') {
        result = response.value.messages.map((msg) => client.messages.getOrCreate(msg.id, msg))
      }

      if (preempted()) return

      // Check if we're at the start of the conversation
      // NB. This may be counter-intuitive because we are in history but,
      //     this could be a very rare edge case for large moderation actions
      if (result.length < (fetchLimit ?? DEFAULT_FETCH_LIMIT)) setAtStart(true)
      else setAtStart(false)

      setAtEnd(true)
      // Merge list with any new ones that have come in
      const knownIds = new Set(collectedMessages!.map((x) => x.id))
      setMessagesSafely(
        collectedMessages!,
        messages.filter((x) => !knownIds.has(x.id))
      )

      collectedMessages = []

      setTimeout(() => {
        const containerChild = findScrollContainer(listRef!)?.children[0]
        containerChild?.scrollIntoView({ behavior: 'instant', block: 'start' })

        setTimeout(() => {
          containerChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
          setFetching(undefined)
        })
      })
    }
  }

  /**
   * Jump to a given message
   * @param messageId Message Id
   */
  async function caseJumpToMessage(messageId: string) {
    /**
     * Scroll to the nearest message (to the id) in history
     */
    const scrollToNearestMessage = () => {
      const index = messagesWithTail().findIndex((entry) => entry.t === 0 && entry.message.id === messageId)
      listRef.current?.children[index + (atStart ? 1 : 0)].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }

    if (messages.find((msg) => msg.id === messageId)) {
      scrollToNearestMessage()
      return
    }

    preempt()
    setFetching('jump_msg')

    const preempted = newPreempted()

    const { response } = (await grpcClient().messagesGet({ limit: fetchLimit ? BigInt(fetchLimit) : undefined, nearby: messageId }))
    let result: MessageType[] = []

    if (response.case === 'error') {
      setFailure(true)
      return
    }

    if (response.case === 'data') {
      result = response.value.messages.map((msg) => client.messages.getOrCreate(msg.id, msg))
    }

    if (preempted()) return

    setAtStart(false)
    setAtEnd(false)

    setMessagesSafely(result)

    setTimeout(() => {
      scrollToNearestMessage()
      setFetching(undefined)
    })

  }

  function messagesWithTail(): ListEntry[] {
    return useMemo(() => {
      const messagesWithTail: ListEntry[] = []
      const lastReadIdValue = lastReadId ?? '0'

      let blockedMessages = 0
      let insertedUnreadDiveder = false

      const createBlockedMessageCount = () => {
        if (blockedMessages) {
          messagesWithTail.push({ t: 2, count: blockedMessages })
          blockedMessages = 0
        }
      }

      const arr = messages
      arr.forEach((msg, idx) => {
        const next = arr[idx + 1]
        let tail = true

        // If there is a next message, compare it to the current message
        let date = null
        if (next) {
          const adate = new Date(Number(msg.createdAt)),
            bdate = new Date(Number(next.createdAt)),
            atime = +adate,
            btime = +bdate

          if (
            adate.getFullYear() !== bdate.getFullYear() ||
            adate.getMonth() !== bdate.getMonth() ||
            adate.getDate() !== bdate.getDate()
          ) {
            date = adate
          }

          // Compare time and properties of messages
          if (
            // split up different authors
            msg.authorId !== next.authorId ||
            // split up chains which are too far apart
            Math.abs(btime - atime) >= 420000 ||
            // treat masquerade as a change in author
            !deepEqual(msg.masquerade, next.masquerade) ||
            // ensure all system messages render independently
            msg.system ||
            next.system ||
            // replies present on current message
            msg.replyIds.length ||
            // next message in history has already been read
            // so there will be a message divider present
            // -1 = next.id is older than lastReadId (already read)
            // 1 = next.id is newer than lastReadId (unread)
            // 0 = same ID
            // !insertedUnreadDivider Ensures we only insert one unread divider (not multiple)
            // Example :
            // Message 5 (unread, newer than lastReadId)
            // Message 4 (unread)
            // --- UNREAD DIVIDER ---  <-- Inserted here
            // Message 3 (read, equals lastReadId or older)
            // Message 2 (read)
            // Message 1 (read)
            (next.id.localeCompare(lastReadIdValue) === -1 && !insertedUnreadDiveder)
          ) {
            tail = false
          }
        } else {
          tail = true
        }

        // Try to add the unread divider
        if (!insertedUnreadDiveder && msg.id.localeCompare(lastReadIdValue) === -1) {
          insertedUnreadDiveder = true
          messagesWithTail.push(objectCache.get(true) ?? { t: 1, unread: true })
        }

        if (msg.author?.relationship === 'Blocked') {
          blockedMessages++
        } else {
          createBlockedMessageCount()
          messagesWithTail.push(objectCache.get(`${msg.id}:${tail}`) ?? { t: 0, message: msg, tail })
        }

        // Add date to list, retrieve if it exists in the cache
        if (date) {
          // TODO: format the date
          messagesWithTail.push(objectCache.get(date) ?? { t: 1, date: date.toLocaleString() })
        }
      })

      // Push remainder of blocked messages
      createBlockedMessageCount()

      // Strip unread divider if it is the first item
      // (hence would show alone at the bottom of messages)
      if (messagesWithTail[0]?.t === 1) messagesWithTail.shift()

      objectCache.clear()

      // Populate cache with current objects
      for (const object of messagesWithTail) {
        if (object.t === 0) {
          objectCache.set(`${object.message.id}:${object.tail}`, object)
        } else if (object.t === 1) {
          objectCache.set(object.unread ?? object.date, object)
        }
      }

      return [...messagesWithTail].reverse()
    }, [messages, lastReadId])
  }

  /**
   * Jump to the bottom of the chat
   */
  function jumpToBottom() {
    caseJumpToBottom()
    if (highlightedMessageId) clearHighlightedMessage()
  }

  /**
   * Handle incoming messages
   * @param message Message object
   */
  function onMessage(message: MessageType) {
    if (message.channelId === channel.id && atEnd) setMessages([message, ...messages])
  }

  /**
   * Handle deleted messages
   */
  function onMessageDelete(message: { id: string; channelId: string }) {
    if (message.channelId === channel.id && messages.find((msg) => msg.id === message.id)) {
      setMessages((messages) => messages.filter((msg) => msg.id !== message.id))
    }
  }

  /**
   * Check whether to trail the currently pending messages
   * @returns Whether to trail pending message
   */
  function pendingMessageIsTrailing() {
    const messages = messagesWithTail()
    const lastMessage = messages[messages.length - 1]

    return lastMessage &&
      lastMessage.t === 0 &&
      // check if last message is authored by us
      lastMessage.message.author?.self &&
      // split up chains that are too far apart
      Math.abs(+new Date() - Number(lastMessage.message.createdAt)) < 420000
      ? true
      : false
  }

  // Ensure that we reload when lifecycle state changes
  lifecycle.state$.subscribe((state) => {
    if (state === State.Connected && atEnd && !highlightedMessageId) {
      caseInitialLoad()
    }
  })

  /**
   * Message ids
   * @returns List of message ids
   */
  function sentMessageIdempotency() {
    return messages.map((msg) => msg.nonce!)
  }

  function Entry(entry: ListEntry) {
    return (
      <>
        {entry.t === 0 && (
          <Message
            tr={tr}
            message={entry.message}
            highlight={entry.message.id === highlightedMessageId}
            editing={entry.message.id === editingMessageId}></Message>
        )}
        {entry.t === 1 && <MessageDivider unread={entry.unread} newString={tr.newString} date={entry.date} />}
        {entry.t === 2 && <MessageBlocked count={entry.count} one={tr.one} plural={tr.plural} />}
      </>
    )
  }

  useEffect(() => {
    jumpToBottomRef?.(jumpToBottom)
    atEndRef?.(() => atEnd)

    const msgCreate = client
      .on('messageCreate')
      .subscribe((messages) => messages.map((msg) => onMessage(msg)))

    const msgDelete = client
      .on('messageDelete')
      .subscribe((messages) =>
        messages.map((msg) => onMessageDelete({ id: msg.id, channelId: msg.channelId }))
      )

    return () => {
      msgCreate.unsubscribe()
      msgDelete.unsubscribe()
    }
  }, [])

  /**
   * Fetch messages on channel mount
   */
  useEffect(() => {
    caseInitialLoad(highlightedMessageId)

    return () => {
      if (fetching !== 'initial') {
        cache?.manage(channel, { messages, atStart, atEnd, scrollTop: listRef.current?.scrollTop })
      }
    }
  }, [channel])

  /**
   * Jump to highlighted message
   */
  useEffect(() => {
    // Jump only if messages are loaded
    if (highlightedMessageId && messages) caseJumpToMessage(highlightedMessageId)
  }, [highlightedMessageId])

  useEffect(() => {
    if (editingMessageId === true) {
      setEditingMessage(messages.find((msg) => msg.author?.self))
    }
  }, [editingMessageId])

  return (
    <>
      <ListView offsetTop={48} fetchTop={caseFetchUpwards} fetchBottom={caseFetchDownwards}>
        <div ref={listRef}>
          {atStart && (
            <ConversationStart
              channel={channel}
              startOfNotes={tr.startOfNotes}
              startOfConversation={tr.startOfConversation}
            />
          )}
          {messagesWithTail().map((msg) => (
            <Entry {...msg} />
          ))}
          {atEnd && (
            <>
              {pendingMessages &&
                pendingMessages({ tail: pendingMessageIsTrailing(), ids: sentMessageIdempotency() })}
              {typingIndicator ?? <div className='h-6' />}
            </>
          )}
        </div>
      </ListView>

      {!atEnd && (
        <div className='z-30 relative'>
          <JumpToBottom
            jumpToPresent={tr.jumpToPresent}
            viewOlderMessages={tr.viewOlderMessages}
            onClick={jumpToBottom}
          />
        </div>
      )}
    </>
  )
}

export default Messages
