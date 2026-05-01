interface Props {
  newString: string
  /**
   * Display the date
   */
  date?: string

  /**
   * Show unread indicator
   */
  unread?: boolean
}

export function MessageDivider({ date, unread, newString }: Props) {
  return (
    <div
      className={`
        h-0 flex select-none items-center
        mx-3 my-4.25 ms-2
        ${unread ? '' : ''}
      `}>
      {unread && (
        <div className={` text-[0.625rem] font-semibold px-1.5 -mt-px rounded-[60px] `}>{newString}</div>
      )}

      {date && (
        <time
          className={`
            -mt-0.5 text-[0.6875rem] leading-2.75 font-semibold
            px-1.25 mx-1.25
            rounded-md
          `}>
          {date}
        </time>
      )}
    </div>
  )
}
