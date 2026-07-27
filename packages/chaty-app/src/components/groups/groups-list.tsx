'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Tooltip, Loader } from '@mantine/core'
import { useInView } from 'react-intersection-observer'

import { GroupsListItem as GroupsListItemType } from '@chaty-app/proto/web/service/v1/groups_pb'
import GroupsCreate from '@/components/groups/groups-create'
import GroupsListItem from '@/components/groups/groups-list-item'
import { ObjString } from '@/types/shared'
import { grpcClient, handleGrpcErr } from '@/lib/client'
import { useAppStore } from '@/state'

type Props = {
  tr: ObjString
}

const FETCH_LIMIT = 10

function GroupsList({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)

  const [groups, setGroups] = useState<GroupsListItemType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { inView, ref } = useInView({ threshold: 0 })

  // Use a ref to track the last ID to avoid stale closure issues
  const lastIdRef = useRef('')

  // Keep the ref in sync with the groups array
  useEffect(() => {
    if (groups.length > 0) {
      lastIdRef.current = groups[groups.length - 1].id
    }
  }, [groups])

  const fetchGroups = async (pageNum: number) => {
    await new Promise((res) => setTimeout(() => res(''), 50))

    try {
      const res = await grpcClient().groupsList({ pagination: { page: pageNum, lastId: lastIdRef.current } })
      if (res.response.case === 'error') {
        return { error: res.response.value.message }
      }
      if (res.response.case === 'data') {
        return { groups: res.response.value.groups }
      }
    } catch (err) {
      return { error: handleGrpcErr(err, info.languageSymbol) }
    }
  }

  const loadGroups = useCallback(async () => {
    if (loading || !hasMore) return

    if (error) setError('')
    setLoading(true)

    const result = await fetchGroups(page)
    if (result?.error) {
      setError(result.error)
    } else {
      const newGroups = result?.groups ?? []
      const more = newGroups.length >= FETCH_LIMIT
      setHasMore(more)
      setPage((prevPage) => prevPage + 1)
      // Deduplicate by ID to prevent any duplicate keys
      setGroups((prevGroups) => {
        const existingIds = new Set(prevGroups.map((g) => g.id))
        const uniqueNewGroups = newGroups.filter((g) => !existingIds.has(g.id))
        return [...prevGroups, ...uniqueNewGroups]
      })
    }

    setLoading(false)
    setInitialLoadAttempted(true)
  }, [loading, hasMore, page, error])

  useEffect(() => {
    if (!initialLoadAttempted) loadGroups()
  }, [loadGroups, initialLoadAttempted])

  useEffect(() => {
    if (inView && !error && hasMore) loadGroups()
  }, [inView, loadGroups, error, hasMore])

  return (
    <div className='flex flex-col h-full'>
      <div
        className='h-12 flex justify-between items-center px-4 shrink-0'
        style={{ backgroundColor: 'var(--primary-color)' }}>
        <p className='text-white font-medium text-xl'>{tr.myGroups}</p>
        <Tooltip label={tr.create} position='bottom'>
          <GroupsCreate tr={tr} />
        </Tooltip>
      </div>

      <div className='h-full border-r border-black/15'>
        {groups.length === 0 && !loading && !error && initialLoadAttempted && (
          <div className='flex-1 h-full my-auto flex flex-col items-center justify-center px-4 py-8'>
            <div className='relative w-49 h-48 mb-6'>
              <Image
                src='/groups-illustration.webp'
                alt='no groups'
                sizes='100%'
                fill
                className='w-full h-full object-cover'
              />
            </div>
            <p className='text-gray-500 text-center text-sm'>{tr.noGroups}</p>
          </div>
        )}

        {error && (
          <div className='flex flex-col items-center justify-center border border-dashed border-red-300 mx-4 my-4 px-4 py-6 rounded'>
            <p className='text-red-500 font-medium text-sm mb-3'>{error}</p>
            <button
              onClick={() => loadGroups()}
              className='bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-4 py-2 rounded transition'>
              {tr.tryAgain}
            </button>
          </div>
        )}

        {groups.length > 0 && (
          <div className='flex-1 overflow-y-auto'>
            <div className='divide-y divide-gray-100'>
              {groups.map((group) => (
                <GroupsListItem key={group.id} item={group} tr={tr} />
              ))}
            </div>

            {!error && (
              <div ref={ref} className='flex justify-center items-center py-6'>
                {loading && <Loader size='sm' />}
                {!hasMore && <p className='text-gray-500 text-xs font-medium'>{tr.noMore}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupsList
