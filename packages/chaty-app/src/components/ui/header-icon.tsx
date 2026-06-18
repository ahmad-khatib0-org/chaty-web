import { Tooltip } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import { LAYOUT_SECTIONS, useLayoutStore } from '@/state'

/**
 * Wrapper for header icons which adds the chevron on the
 * correct side for toggling sidebar (if on desktop) and
 * the hamburger icon to open sidebar (if on mobile).
 */
export function HeaderIcon({ children }: { children: React.ReactNode }) {
  const { getSectionState, toggleSectionState } = useLayoutStore()
  const isSidebarOpen = getSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true)

  return (
    <Tooltip label='Toggle main sidebar' position='bottom'>
      <div
        className='flex cursor-pointer items-center'
        onClick={() => toggleSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true)}>
        {isSidebarOpen && <IconChevronLeft size={20} />}
        {!isSidebarOpen && <IconChevronRight size={20} />}
        {children}
      </div>
    </Tooltip>
  )
}
