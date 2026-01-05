'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Modal, Button, Tooltip } from '@mantine/core'
import {
  IconHome,
  IconServer,
  IconMessage,
  IconUsers,
  IconBookmark,
  IconSettings,
  IconLogout,
  IconMenu2,
  IconX,
} from '@tabler/icons-react'

import { useAppStore } from '@/state'
import { ObjString } from '@/types/shared'

type Props = {
  tr: ObjString
  email?: string
}

function AppSidebar({ tr, email }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const updateClientInfo = useAppStore((state) => state.updateClientInfo)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (email) updateClientInfo({ email })
  }, [email, updateClientInfo])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/auth/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggingOut(false)
      setIsLogoutModalOpen(false)
    }
  }

  const navItems = [
    { href: '/home', icon: IconHome, label: tr.home },
    { href: '/servers', icon: IconServer, label: tr.servers },
    { href: '/chats', icon: IconMessage, label: tr.chats },
    { href: '/groups', icon: IconUsers, label: tr.groups },
    { href: '/saved', icon: IconBookmark, label: tr.savedMessages },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <div
        style={{ backgroundColor: 'var(--primary-color)' }}
        className={`h-full max-h-screen transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-20'
        } flex flex-col`}>
        <div className='flex items-center justify-between px-4 py-3 border-b border-white/20'>
          {isExpanded && <span className='font-bold text-lg text-white'>Chaty</span>}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-1 hover:bg-white/20 rounded transition-colors'
            style={{ color: 'white' }}>
            {isExpanded ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </div>

        <nav className='flex-1 p-0 space-y-0'>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Tooltip key={item.href} label={item.label} disabled={isExpanded} position='right'>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors font-medium ${
                    active
                      ? 'bg-white text-gray-900'
                      : 'text-white hover:bg-white hover:text-gray-900'
                  }`}
                  style={{ width: '100%' }}>
                  <Icon size={20} className='flex-shrink-0' />
                  {isExpanded && <span>{item.label}</span>}
                </Link>
              </Tooltip>
            )
          })}
        </nav>

        {/* Settings and Logout */}
        <div className='space-y-0 p-0 border-t border-white/20'>
          <Tooltip label={tr.settings} disabled={isExpanded} position='right'>
            <Link
              href='/settings'
              className={`flex items-center gap-3 px-4 py-3 transition-colors font-medium ${
                isActive('/settings')
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white hover:text-gray-900'
              }`}
              style={{ width: '100%', display: 'flex' }}>
              <IconSettings size={20} className='flex-shrink-0' />
              {isExpanded && <span>{tr.settings}</span>}
            </Link>
          </Tooltip>

          <Tooltip label={tr.logout} disabled={isExpanded} position='right'>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className='w-full flex items-center gap-3 px-4 py-3 transition-colors text-white font-medium hover:bg-white hover:text-gray-900'
              style={{ display: 'flex' }}>
              <IconLogout size={20} className='flex-shrink-0' />
              {isExpanded && <span>{tr.logout}</span>}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title={tr.logoutConfirmationTitle}
        centered>
        <div className='space-y-4'>
          <p>{tr.logoutConfirmationMessage}</p>
          <div className='flex gap-3 justify-end'>
            <Button variant='outline' onClick={() => setIsLogoutModalOpen(false)}>
              {tr.cancel}
            </Button>
            <Button
              onClick={handleLogout}
              loading={isLoggingOut}
              style={{ background: 'var(--primary-color)' }}>
              {tr.logout}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AppSidebar
