import type {
  Embed,
  EmbedImage,
  EmbedText,
  EmbedVideo,
  EmbedWebsiteMetadata,
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
}
