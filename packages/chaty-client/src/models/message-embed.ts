import type { File } from '@chaty-app/proto/web-plain/shared/v1/files'
import type {
  BandcampType,
  Embed,
  EmbedAppleMusic,
  EmbedBandcamp,
  EmbedImage,
  EmbedLightspeed,
  EmbedSpotify,
  EmbedStreamable,
  EmbedText,
  EmbedTwitch,
  EmbedVideo,
  EmbedWebsiteMetadata,
  EmbedYouTube,
  ImageSize,
  LightspeedType,
  TwitchType,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

export abstract class MessageEmbed {
  constructor() { }

  /**
   * Create an Embed from an API Embed
   * @param client Client
   * @param embed Data
   * @returns Embed
   */
  static from(embed: Embed): MessageEmbed {
    if (embed.text) {
      return new TextEmbed(embed.text)
    } else if (embed.image) {
      return new ImageEmbed(embed.image)
    } else if (embed.video) {
      return new VideoEmbed(embed.video)
    } else if (embed.website) {
      return new WebsiteEmbed(embed.website)
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

  constructor(embed: EmbedImage) {
    super()
    this.embed = embed
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

  get size(): ImageSize {
    return this.embed.size
  }

  get aspectRatio(): number {
    return this.width / this.height
  }
}

/**
 * Video Embed
 */
export class VideoEmbed extends MessageEmbed {
  readonly embed: EmbedVideo

  /**
   * Construct Video Embed
   * @param embed Embed
   */
  constructor(embed: EmbedVideo) {
    super()
    this.embed = embed
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
}

/**
 * Website Embed
 */
export class WebsiteEmbed extends MessageEmbed {
  readonly embed: EmbedWebsiteMetadata

  /**
   * Construct WebsiteEmbed Embed
   * @param embed Embed
   */
  constructor(embed: EmbedWebsiteMetadata) {
    super()
    this.embed = embed
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

  get youTubeData(): EmbedYouTube | undefined {
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

  get lightspeedData(): EmbedLightspeed | undefined {
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

  get twitchData(): EmbedTwitch | undefined {
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

  get spotifyData(): EmbedSpotify | undefined {
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

  get bandcampData(): EmbedBandcamp | undefined {
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

  get appleMusicData(): EmbedAppleMusic | undefined {
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

  get streamableData(): EmbedStreamable | undefined {
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

  get image(): EmbedImage | undefined {
    return this.embed.image
  }

  get video(): EmbedVideo | undefined {
    return this.embed.video
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

  // Utility getters
  get hasSpecialContent(): boolean {
    return (
      !!this.embed.special &&
      (this.isGif ||
        this.isYouTube ||
        this.isLightspeed ||
        this.isTwitch ||
        this.isSpotify ||
        this.isSoundcloud ||
        this.isBandcamp ||
        this.isAppleMusic ||
        this.isStreamable)
    )
  }

  get specialType():
    | 'none'
    | 'gif'
    | 'youtube'
    | 'lightspeed'
    | 'twitch'
    | 'spotify'
    | 'soundcloud'
    | 'bandcamp'
    | 'appleMusic'
    | 'streamable'
    | null {
    if (this.isNone) return 'none'
    if (this.isGif) return 'gif'
    if (this.isYouTube) return 'youtube'
    if (this.isLightspeed) return 'lightspeed'
    if (this.isTwitch) return 'twitch'
    if (this.isSpotify) return 'spotify'
    if (this.isSoundcloud) return 'soundcloud'
    if (this.isBandcamp) return 'bandcamp'
    if (this.isAppleMusic) return 'appleMusic'
    if (this.isStreamable) return 'streamable'
    return null
  }
}

/**
 * Text Embed
 */
export class TextEmbed extends MessageEmbed {
  readonly embed: EmbedText

  /**
   * Construct Video Embed
   * @param client Client
   * @param embed Embed
   */
  constructor(embed: EmbedText) {
    super()
    this.embed = embed
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
    return this.embed.media
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
