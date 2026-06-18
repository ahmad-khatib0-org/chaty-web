interface Props {
  /**
   * User we are dealing with
   * @default Invisible
   */
  status?: string
}

/**
 * Overlays user status in current SVG
 */
const UserStatusGraphics = ({ status }: Props) => {
  /**
   * Convert status to lower case
   */
  const statusLowercase = status?.toLowerCase() ?? 'invisible'

  return (
    <circle
      cx='27'
      cy='27'
      r='5'
      fill={`var(--brand-presence-${statusLowercase})`}
      mask={`url(#accessible-status-${statusLowercase})`}
    />
  )
}

/**
 * Stand-alone user status element
 */
export function UserStatus(props: Props & { size: string }) {
  return (
    <svg viewBox='22 22 10 10' height={props.size}>
      <UserStatusGraphics {...props} />
    </svg>
  )
}

UserStatus.Graphic = UserStatusGraphics
