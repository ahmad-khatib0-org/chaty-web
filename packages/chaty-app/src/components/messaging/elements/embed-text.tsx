import Image from 'next/image'

import { ImageSize } from '@chaty-app/proto/web-plain/service/v1/messages_db'
import { TextEmbed, WebsiteEmbed } from 'chaty-client/models'

import { OverflowingText, SizedContent } from '@/components/ui'
import { RenderAnchor } from '@/components/markdown/plugins/anchors'
import { Markdown } from '@/components/markdown'
import { ObjString } from '@/types/shared'
import { Attachment } from './attachment'
import { SpecialEmbed } from './embed-special'

interface Props {
  embed: TextEmbed | WebsiteEmbed
  tr: ObjString
}

export function EmbedText({ embed, tr }: Props) {
  const isWebsite = embed instanceof WebsiteEmbed

  return (
    <div
      className='w-fit flex max-w-[min(100%,420px)] flex-row gap-4 p-4 rounded-md text-(--md-sys-color-on-primary-container) bg-(--md-sys-color-primary-container) border-l-4 border-solid'
      style={{ borderLeftColor: embed.colour || 'var(--md-sys-color-primary)' }}>
      <div className='min-w-0 flex-1 flex flex-col gap-4'>
        {isWebsite && embed.siteName && (
          <div className='flex flex-row gap-4 items-center'>
            {embed.iconUrl && (
              <Image
                loading='lazy'
                draggable={false}
                src={embed.proxiedIconURL!}
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className='w-3.5 h-3.5 shrink-0'
                alt=''
              />
            )}
            <OverflowingText>
              <span className='text-xs font-medium text-(--md-sys-color-outline)'>{embed.siteName}</span>
            </OverflowingText>
          </div>
        )}

        {embed.title && (
          <RenderAnchor href={embed.url}>
            <span className='min-w-0 flex-1 text-base text-(--md-sys-color-primary) !important'>
              <OverflowingText>{embed.title}</OverflowingText>
            </span>
          </RenderAnchor>
        )}

        {embed.description && (
          <div className='text-xs overflow-hidden wrap-break-word'>
            {embed instanceof TextEmbed ? <Markdown content={embed.description} /> : embed.description}
          </div>
        )}

        {embed instanceof TextEmbed && embed.media && <Attachment file={embed.media} tr={tr} />}

        {isWebsite && (
          <>
            {embed.special && !embed.special?.none && <SpecialEmbed embed={embed} />}
            {embed.video && (
              <SizedContent width={embed.video.width} height={embed.video.height}>
                <video
                  controls
                  preload='metadata'
                  src={embed.video.proxiedURL}
                  className='rounded-md object-contain w-full h-full'
                />
              </SizedContent>
            )}
            {embed.image?.size === ImageSize.LARGE && (
              <SizedContent width={embed.image.width} height={embed.image.height}>
                <Image
                  src={embed.image.proxiedURL}
                  sizes='100%'
                  fill
                  loading='lazy'
                  className='cursor-pointer rounded-md object-contain w-full h-full'
                  onClick={() => {
                    /* TODO: open a model */
                  }}
                  alt=''
                />
              </SizedContent>
            )}
          </>
        )}
      </div>

      {isWebsite && embed.image?.size === ImageSize.PREVIEW && !embed.video && (
        <Image
          src={embed.image.proxiedURL}
          sizes='100%'
          fill
          loading='lazy'
          className='max-w-30 max-h-30 rounded-md object-contain shrink-0'
          alt=''
        />
      )}
    </div>
  )
}
