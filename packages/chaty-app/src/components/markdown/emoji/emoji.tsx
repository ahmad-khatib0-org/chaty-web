import { CustomEmoji, UnicodeEmoji } from '.'

/**
 * Image component for rendering emojis
 */
export function EmojiBase({ src, alt }: { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`
        object-contain inline-block w-(--emoji-size) h-(--emoji-size) mx-[0.05em] ml-[0.1em]
        align-[-0.3em] text-transparent relative before:content-[' '] before:block 
        before:absolute before:h-12.5 before:w-12.5 before:bg-[url(ishere.jpg)]`}
    />
  )
}

/**
 * Render an individual emoji
 */
export function Emoji({ emoji }: { emoji: string }) {
  if (emoji.length === 26) {
    return <CustomEmoji id={emoji} />
  }

  return <UnicodeEmoji emoji={emoji} />
}
