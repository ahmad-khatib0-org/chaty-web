import { Avatar } from '@/components/ui'
import { useClient } from '@/context/client'
import { paramsFromPathname } from '@/lib/client'
import { useLinkSafetyStore } from '@/state'
import { IconChevronRight, IconHash, IconUsers } from '@tabler/icons-react'
import { ReactNode } from 'react'

const linkClass = 'cursor-pointer text-[var(--md-sys-color-primary)] !important'

const internalLinkClass =
  'align-bottom gap-1 ps-0.5 pe-1.5 items-center inline-flex no-underline cursor-pointer font-semibold rounded-lg fill-[var(--md-sys-color-on-primary)] text-[var(--md-sys-color-on-primary)] bg-[var(--md-sys-color-primary)]'

interface LinkComponentProps {
  disabled?: boolean
  href?: string
  target?: string
  rel?: string
  className?: string
  children?: ReactNode
  onClick?: (e: React.MouseEvent) => void
  onAuxClick?: (e: React.MouseEvent) => void
}

function LinkComponent({
  disabled,
  href,
  target,
  rel,
  className,
  children,
  onClick,
  onAuxClick,
}: LinkComponentProps) {
  if (disabled) {
    return <span className={className}>{children}</span>
  }
  return (
    <a href={href} target={target} rel={rel} className={className} onClick={onClick} onAuxClick={onAuxClick}>
      {children}
    </a>
  )
}

interface RenderAnchorProps {
  href?: string
  target?: string
  disabled?: boolean
  children?: ReactNode
  className?: string
}

export function RenderAnchor({ href, target, disabled, children, className = '' }: RenderAnchorProps) {
  // Handle case where there is no link
  if (!href) return <span className={className}>{children}</span>

  // Handle links that navigate internally
  try {
    let url = new URL(href, window.location.origin)

    // Remap discover links to native links
    //
    // Input: https://rvlt.gg/abc123
    // Regex test: /^\/[\w\d]+$/ on "/abc123" → true
    // Result: https://yourapp.com/invite/abc123
    //
    // Input: https://rvlt.gg/discover/awesome
    // Regex test: "/discover/awesome" → false(has extra slash)
    // Checks else if: pathname.startsWith("/discover") → true
    // Result: https://yourapp.com/discover/awesome
    //
    // Input: https://rvlt.gg/invite/xyz
    // Regex test: "/invite/xyz" → false(has slash)
    // No match → leaves unchanged
    // So purpose is: Makes external invite links (rvlt.gg/abc123) work as internal
    // navigation in the app.
    if (url.origin === 'https://rvlt.gg' || url.origin === 'https://stt.gg') {
      if (/^\/[\w\d]+$/.test(url.pathname)) {
        url = new URL(`/invite${url.pathname}`, window.location.origin)
      } else if (url.pathname.startsWith('/discover')) {
        url = new URL(url.pathname, window.location.origin)
      }
    }

    // Determine whether it's in our scope
    if (location.origin === (process.env.HOST ?? '')) {
      const params = paramsFromPathname(url.pathname)
      const client = useClient()

      if (params.exactChannel) {
        const channel = client.channels.get(params.channelId ?? '')

        if (!channel) {
          return (
            <span className={internalLinkClass}>
              <IconHash size={16} />
              Private Channel
            </span>
          )
        }

        const internalUrl = new URL(
          channel?.serverId ? `/server/${channel.serverId}/channel/${channel.id}` : `/channel/${channel.id}`,
          location.origin
        ).toString()

        return (
          <LinkComponent className={internalLinkClass} disabled={disabled} href={internalUrl}>
            <IconHash size={16} />
            {channel.text?.name}
            {params.exactMessage && (
              <>
                <IconChevronRight size={16} />
                <IconHash size={16} />
              </>
            )}
          </LinkComponent>
        )
      }

      // Exact server link
      if (params.exactServer) {
        const server = client?.servers.get(params.serverId!)

        if (!server) {
          return (
            <span className={internalLinkClass}>
              <IconUsers size={16} />
              Unknown Server
            </span>
          )
        }

        const internalUrl = `/server/${server.id}`

        return (
          <LinkComponent className={internalLinkClass} disabled={disabled} href={internalUrl}>
            <Avatar size={16} src={server.iconURL} fallback={server.name} />
            {server.name}
          </LinkComponent>
        )
      }

      if (params.inviteId && Array.isArray(children) && children[0] === href && !disabled) {
        // TODO: add the component
        // return <Invite code={params.inviteId} />
      }

      // Regular internal link
      return (
        <LinkComponent className={linkClass} disabled={disabled} href={url.pathname}>
          {children}
        </LinkComponent>
      )
    }

    const handleWarning = (event: React.MouseEvent) => {
      if (event.button === 0 || event.button === 1) {
        event.preventDefault()
        event.stopPropagation()
        // get the text -> (event.currentTarget as HTMLAnchorElement).innerText,
        // TODO: open a model
      }
    }

    const isTrusted = useLinkSafetyStore((state) => state.isTrusted)
    if (isTrusted(url))
      return (
        <LinkComponent className={linkClass} disabled={disabled} href={href} target='_blank' rel='noreferrer'>
          {children}
        </LinkComponent>
      )

    return (
      <LinkComponent
        className={linkClass}
        disabled={disabled}
        onClick={handleWarning}
        onAuxClick={handleWarning}>
        {children}
      </LinkComponent>
    )
  } catch (err) {
    return <span className={className}>{children}</span>
  }
}
