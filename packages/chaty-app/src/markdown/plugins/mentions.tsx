import { Avatar, ColouredText } from '@/components/ui'
import { useUser } from '@/context'
import { useState } from 'react'

export function UserMention({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const user = useUser(userId)
  const [showMenu, setShowMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  if (!user.user) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-lg bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) opacity-50 cursor-not-allowed font-semibold'>
        {' '}
        Unknown User{' '}
      </span>
    )
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className='inline-flex items-center gap-1 px-1 py-0.5 rounded-lg bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) font-semibold cursor-pointer hover:opacity-80 transition-opacity'></div>
      <Avatar size={16} fallback={user.username} />
      <ColouredText colour={user.colour || undefined}>{user.username}</ColouredText>

      {showMenu && !disabled && (
        <div
          style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}
          onMouseLeave={() => setShowMenu(false)}>
          {/* <UserContextMenu user={user.user} member={user.member} /> TODO: add it */}
        </div>
      )}
    </>
  )
}
