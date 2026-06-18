import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Group, Loader } from '@mantine/core'

import { MessagesGetRequest, MessageSort } from '@chaty-app/proto/web-plain/service/v1/messages'
import { AppError } from '@chaty-app/proto/web-plain/shared/v1/error'
import { Channel, Message as MessageType } from 'chaty-client/models'
import { Message } from '../common/message'
import { ObjString } from '@/types/shared'

interface Props {
  channel: Channel
  query: MessagesGetRequest
  tr: ObjString
}

export function MessageSearchSidebar({ channel, query, tr }: Props) {
  const [sort, setSort] = useState(MessageSort.MESSAGE_SORT_LATEST)

  const queryResult = useQuery({
    queryKey: ['search', channel.id, query, sort],
    queryFn: async (): Promise<{ data?: { messages: MessageType[] }; error?: AppError }> => {
      // TODO: add the rpc call
      const messages: MessageType[] = []
      return { data: { messages } }
    },
  })

  return (
    <div className='flex flex-col gap-4'>
      {!query.sort && (
        <Group grow>
          <Button
            variant={sort === MessageSort.MESSAGE_SORT_RELEVANCE ? 'filled' : 'light'}
            onClick={() => setSort(MessageSort.MESSAGE_SORT_RELEVANCE)}
            className='rounded-l-md rounded-r-none'>
            {tr.relevance}
          </Button>
          <Button
            variant={sort === MessageSort.MESSAGE_SORT_LATEST ? 'filled' : 'light'}
            onClick={() => setSort(MessageSort.MESSAGE_SORT_LATEST)}
            className='rounded-none'>
            {tr.latest}
          </Button>
          <Button
            variant={sort === MessageSort.MESSAGE_SORT_OLDEST ? 'filled' : 'light'}
            onClick={() => setSort(MessageSort.MESSAGE_SORT_OLDEST)}
            className='rounded-r-md rounded-l-none'>
            {tr.oldest}
          </Button>
        </Group>
      )}

      {queryResult.isLoading ? (
        <div className='flex justify-center p-4'>
          <Loader />
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {queryResult.data?.data?.messages.map((message) => {
            {
              /* TODO: add the path  */
            }
            return (
              <a key={message.id} href={``} className='no-underline'>
                <Message message={message} isLink tr={tr} />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
