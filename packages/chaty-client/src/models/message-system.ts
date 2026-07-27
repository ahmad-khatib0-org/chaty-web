import type {
  MessageSystem as APIMessageSystem,
  MessageSystemText,
  MessageSystemUserAdded,
  MessageSystemUserRemove,
  MessageSystemUserJoined,
  MessageSystemUserLeft,
  MessageSystemUserKicked,
  MessageSystemUserBanned,
  MessageSystemChannelRenamed,
  MessageSystemChannelDescriptionChanged,
  MessageSystemChannelIconChanged,
  MessageSystemChannelOwnershipChanged,
  MessageSystemMessagePinned,
  MessageSystemMessageUnpinned,
  MessageSystemCallStarted,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

export class MessageSystem {
  #message: APIMessageSystem

  constructor(message: APIMessageSystem) {
    this.#message = message
  }

  get text(): MessageSystemText | undefined {
    return this.#message.text
  }

  get userAdded(): MessageSystemUserAdded | undefined {
    return this.#message.userAdded
  }

  get userRemove(): MessageSystemUserRemove | undefined {
    return this.#message.userRemove
  }

  get userJoined(): MessageSystemUserJoined | undefined {
    return this.#message.userJoined
  }

  get userLeft(): MessageSystemUserLeft | undefined {
    return this.#message.userLeft
  }

  get userKicked(): MessageSystemUserKicked | undefined {
    return this.#message.userKicked
  }

  get userBanned(): MessageSystemUserBanned | undefined {
    return this.#message.userBanned
  }

  get channelRenamed(): MessageSystemChannelRenamed | undefined {
    return this.#message.channelRenamed
  }

  get channelDescriptionChanged(): MessageSystemChannelDescriptionChanged | undefined {
    return this.#message.channelDescriptionChanged
  }

  get channelIconChanged(): MessageSystemChannelIconChanged | undefined {
    return this.#message.channelIconChanged
  }

  get channelOwnershipChanged(): MessageSystemChannelOwnershipChanged | undefined {
    return this.#message.channelOwnershipChanged
  }

  get messagePinned(): MessageSystemMessagePinned | undefined {
    return this.#message.messagePinned
  }

  get messageUnpinned(): MessageSystemMessageUnpinned | undefined {
    return this.#message.messageUnpinned
  }

  get callStarted(): MessageSystemCallStarted | undefined {
    return this.#message.callStarted
  }

  // Helper getter to determine which type this system message is
  get type(): string {
    if (this.#message.text) return 'text'
    if (this.#message.userAdded) return 'user_added'
    if (this.#message.userRemove) return 'user_remove'
    if (this.#message.userJoined) return 'user_joined'
    if (this.#message.userLeft) return 'user_left'
    if (this.#message.userKicked) return 'user_kicked'
    if (this.#message.userBanned) return 'user_banned'
    if (this.#message.channelRenamed) return 'channel_renamed'
    if (this.#message.channelDescriptionChanged) return 'channel_description_changed'
    if (this.#message.channelIconChanged) return 'channel_icon_changed'
    if (this.#message.channelOwnershipChanged) return 'channel_ownership_changed'
    if (this.#message.messagePinned) return 'message_pinned'
    if (this.#message.messageUnpinned) return 'message_unpinned'
    if (this.#message.callStarted) return 'call_started'
    return 'unknown'
  }

  // Check if this is a specific type
  get isText(): boolean {
    return !!this.#message.text
  }

  get isUserAdded(): boolean {
    return !!this.#message.userAdded
  }

  get isUserRemove(): boolean {
    return !!this.#message.userRemove
  }

  get isUserJoined(): boolean {
    return !!this.#message.userJoined
  }

  get isUserLeft(): boolean {
    return !!this.#message.userLeft
  }

  get isUserKicked(): boolean {
    return !!this.#message.userKicked
  }

  get isUserBanned(): boolean {
    return !!this.#message.userBanned
  }

  get isChannelRenamed(): boolean {
    return !!this.#message.channelRenamed
  }

  get isChannelDescriptionChanged(): boolean {
    return !!this.#message.channelDescriptionChanged
  }

  get isChannelIconChanged(): boolean {
    return !!this.#message.channelIconChanged
  }

  get isChannelOwnershipChanged(): boolean {
    return !!this.#message.channelOwnershipChanged
  }

  get isMessagePinned(): boolean {
    return !!this.#message.messagePinned
  }

  get isMessageUnpinned(): boolean {
    return !!this.#message.messageUnpinned
  }

  get isCallStarted(): boolean {
    return !!this.#message.callStarted
  }
}
