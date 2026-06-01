import {
  BandcampType,
  TwitchType,
  type Embed,
  type EmbedAppleMusic,
  type EmbedBandcamp,
  type EmbedImage,
  type EmbedLightspeed,
  type EmbedSpotify,
  type EmbedStreamable,
  type EmbedText,
  type EmbedTwitch,
  type EmbedVideo,
  type EmbedWebsiteMetadata,
  type EmbedYouTube,
  type LightspeedType,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

import type { Client } from '../client'
import { File } from './file'

export abstract class MessageEmbed {
  constructor() { }

  /**
   * Create an Embed from an API Embed
   * @param client Client
   * @param embed Data
   * @returns Embed
   */
  static from(embed: Embed, client: Client): MessageEmbed {
    if (embed.text) {
      return new TextEmbed(embed.text, client)
    } else if (embed.image) {
      return new ImageEmbed(embed.image, client)
    } else if (embed.video) {
      return new VideoEmbed(embed.video, client)
    } else if (embed.website) {
      return new WebsiteEmbed(embed.website, client)
    } else {
      return new UnknownEmbed()
    }
  }
}

/*
 * Embed of unknown type
 */
export class UnknownEmbed extends MessageEmbed { }

/**
 * Image Embed
 */
export class ImageEmbed extends MessageEmbed {
  readonly embed: EmbedImage
  readonly client: Client

  constructor(embed: EmbedImage, client: Client) {
    super()
    this.embed = embed
    this.client = client
  }

  get url(): string {
    return this.embed.url
  }

  get width(): number {
    return this.embed.width
  }

  get height(): number {
    return this.embed.height
  }

  get size(): string {
    return this.embed.size
  }

  get aspectRatio(): number {
    return this.width / this.height
  }

  /**
   * Proxied image URL
   */
  get proxiedURL(): string {
    return this.client.proxyFile(this.url)
  }
}

/**
 * Video Embed
 */
export class VideoEmbed extends MessageEmbed {
  readonly embed: EmbedVideo
  readonly client: Client

  /**
   * Construct Video Embed
   * @param embed Embed
   */
  constructor(embed: EmbedVideo, client: Client) {
    super()
    this.embed = embed
    this.client = client
  }

  get url(): string {
    return this.embed.url
  }

  get width(): number {
    return this.embed.width
  }

  get height(): number {
    return this.embed.height
  }

  get aspectRatio(): number {
    return this.width / this.height
  }

  /**
   * Proxied image URL
   */
  get proxiedURL(): string {
    return this.client.proxyFile(this.url)
  }
}

/**
 * Website Embed
 */
export class WebsiteEmbed extends MessageEmbed {
  readonly embed: EmbedWebsiteMetadata
  readonly client: Client

  /**
   * Construct WebsiteEmbed Embed
   * @param embed Embed
   */
  constructor(embed: EmbedWebsiteMetadata, client: Client) {
    super()
    this.embed = embed
    this.client = client
  }

  get special() {
    return this.embed.special
  }

  // None type
  get isNone(): boolean {
    return !!this.embed.special?.none
  }

  // GIF type
  get isGif(): boolean {
    return !!this.embed.special?.gif
  }

  // YouTube
  get isYouTube(): boolean {
    return !!this.embed.special?.youtube
  }

  get youTube(): EmbedYouTube | undefined {
    return this.embed.special?.youtube
  }

  get youTubeId(): string | undefined {
    return this.embed.special?.youtube?.id
  }

  get youTubeTimestamp(): string | undefined {
    return this.embed.special?.youtube?.timestamp
  }

  // Lightspeed.tv
  get isLightspeed(): boolean {
    return !!this.embed.special?.lightspeed
  }

  get lightspeed(): EmbedLightspeed | undefined {
    return this.embed.special?.lightspeed
  }

  get lightspeedId(): string | undefined {
    return this.embed.special?.lightspeed?.id
  }

  get lightspeedType(): LightspeedType | undefined {
    return this.embed.special?.lightspeed?.contentType
  }

  // Twitch
  get isTwitch(): boolean {
    return !!this.embed.special?.twitch
  }

  get twitch(): EmbedTwitch | undefined {
    return this.embed.special?.twitch
  }

  get twitchId(): string | undefined {
    return this.embed.special?.twitch?.id
  }

  get twitchType(): TwitchType | undefined {
    return this.embed.special?.twitch?.contentType
  }

  // Spotify
  get isSpotify(): boolean {
    return !!this.embed.special?.spotify
  }

  get spotify(): EmbedSpotify | undefined {
    return this.embed.special?.spotify
  }

  get spotifyId(): string | undefined {
    return this.embed.special?.spotify?.id
  }

  get spotifyContentType(): string | undefined {
    return this.embed.special?.spotify?.contentType
  }

  // Soundcloud
  get isSoundcloud(): boolean {
    return !!this.embed.special?.soundcloud
  }

  // Bandcamp
  get isBandcamp(): boolean {
    return !!this.embed.special?.bandcamp
  }

  get bandcamp(): EmbedBandcamp | undefined {
    return this.embed.special?.bandcamp
  }

  get bandcampId(): string | undefined {
    return this.embed.special?.bandcamp?.id
  }

  get bandcampType(): BandcampType | undefined {
    return this.embed.special?.bandcamp?.contentType
  }

  // Apple Music
  get isAppleMusic(): boolean {
    return !!this.embed.special?.appleMusic
  }

  get appleMusic(): EmbedAppleMusic | undefined {
    return this.embed.special?.appleMusic
  }

  get appleMusicAlbumId(): string | undefined {
    return this.embed.special?.appleMusic?.albumId
  }

  get appleMusicTrackId(): string | undefined {
    return this.embed.special?.appleMusic?.trackId
  }

  // Streamable
  get isStreamable(): boolean {
    return !!this.embed.special?.streamable
  }

  get streamable(): EmbedStreamable | undefined {
    return this.embed.special?.streamable
  }

  get streamableId(): string | undefined {
    return this.embed.special?.streamable?.id
  }

  // Common website metadata getters
  get url(): string | undefined {
    return this.embed.url
  }

  get originalUrl(): string | undefined {
    return this.embed.originalUrl
  }

  get title(): string | undefined {
    return this.embed.title
  }

  get description(): string | undefined {
    return this.embed.description
  }

  get image(): ImageEmbed | undefined {
    return this.embed.image ? new ImageEmbed(this.embed.image, this.client) : undefined
  }

  get video(): VideoEmbed | undefined {
    return this.embed.video ? new VideoEmbed(this.embed.video, this.client) : undefined
  }

  get siteName(): string | undefined {
    return this.embed.siteName
  }

  get iconUrl(): string | undefined {
    return this.embed.iconUrl
  }

  get colour(): string | undefined {
    return this.embed.colour
  }

  /**
   * Proxied icon URL
   */
  get proxiedIconURL(): string | undefined {
    return this.iconUrl ? this.client.proxyFile(this.iconUrl) : undefined
  }

  /**
   * If special content is present, generate the embed URL
   */
  get embedURL(): string | undefined {
    const special = this.special

    if (!special) return undefined

    if (special.youtube) {
      let timestamp = ''
      if (special.youtube.timestamp) {
        timestamp = `&start=${special.youtube.timestamp}`
      }
      return `https://www.youtube-nocookie.com/embed/${special.youtube.id}?modestbranding=1${timestamp}`
    }

    if (special.twitch) {
      return `https://player.twitch.tv/?${twitchTypeToString(special.twitch.contentType)}=${special.twitch.id
        }&parent=${(window ?? {})?.location?.hostname}&autoplay=false`
    }

    if (special.lightspeed) {
      return `https://new.lightspeed.tv/embed/${special.lightspeed.id}/stream`
    }

    if (special.spotify) {
      return `https://open.spotify.com/embed/${special.spotify.contentType}/${special.spotify.id}`
    }

    if (special.soundcloud) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        this.url!
      )}&color=%23FF7F50&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
    }

    if (special.bandcamp) {
      return `https://bandcamp.com/EmbeddedPlayer/${bandcampTypeToString(special.bandcamp.contentType)}=${special.bandcamp.id
        }/size=large/bgcol=181a1b/linkcol=056cc4/tracklist=false/transparent=true/`
    }

    if (special.streamable) {
      return `https://streamable.com/e/${special.streamable.id}?loop=0`
    }

    return undefined
  }
}

/**
 * Text Embed
 */
export class TextEmbed extends MessageEmbed {
  readonly embed: EmbedText
  readonly client: Client

  /**
   * Construct Video Embed
   * @param client Client
   * @param embed Embed
   */
  constructor(embed: EmbedText, client: Client) {
    super()
    this.embed = embed
    this.client = client
  }

  // Basic getters
  get iconUrl(): string | undefined {
    return this.embed.iconUrl
  }

  get url(): string | undefined {
    return this.embed.url
  }

  get title(): string | undefined {
    return this.embed.title
  }

  get description(): string | undefined {
    return this.embed.description
  }

  get media(): File | undefined {
    return this.embed.media ? new File(this.client, this.embed.media) : undefined
  }

  get colour(): string | undefined {
    return this.embed.colour
  }

  // Utility getters
  get hasMedia(): boolean {
    return !!this.embed.media
  }

  get hasTitle(): boolean {
    return !!this.embed.title
  }

  get hasDescription(): boolean {
    return !!this.embed.description
  }

  get hasIcon(): boolean {
    return !!this.embed.iconUrl
  }

  get hasUrl(): boolean {
    return !!this.embed.url
  }

  get hasColour(): boolean {
    return !!this.embed.colour
  }

  // Media file getters (if media exists)
  get mediaUrl(): string | undefined {
    return `${this.embed.media?.bucket}/${this.embed.media?.filename}`
  }

  get mediaMimeType(): string | undefined {
    return this.embed.media?.contentType
  }

  // Check if the embed has any content
  get isEmpty(): boolean {
    return !this.hasTitle && !this.hasDescription && !this.hasMedia && !this.hasIcon
  }

  // Get formatted content for display
  get displayTitle(): string | undefined {
    return this.title
  }

  get displayDescription(): string | undefined {
    return this.description
  }

  // For link previews
  get isLinkPreview(): boolean {
    return this.hasUrl && !this.isEmpty
  }
}

function twitchTypeToString(twitch?: TwitchType): string {
  if (!twitch) return 'channel'

  if (twitch.channel) {
    return 'channel'
  } else if (twitch.clip) {
    return 'clip'
  } else if (twitch.video) {
    return 'video'
  }

  return 'channel'
}

function bandcampTypeToString(type?: BandcampType): string {
  if (!type) return 'album'

  if (type.album) return 'album'
  else if (type.track) return 'album'

  return 'album'
}
