'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingOverlay, Box, Text, Button, Group, Center, ThemeIcon } from '@mantine/core'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import { ObjString } from '@/types/shared'
import { grpcClient, handleGrpcErr } from '@/lib/client'
import { useAppStore } from '@/state'

type Props = {
  tr: ObjString
}

function EmailConfirmationWrapper({ tr }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const info = useAppStore((state) => state.clientInfo)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = decodeURIComponent(searchParams.get('token') || '')
        if (!token) {
          setStatus('error')
          setMessage(tr.tokenInvalid)
          return
        }

        const res = await grpcClient().usersEmailConfirmation({ token })
        if (res.response.case === 'error') {
          handleError(res.response.value)
          return
        }
        if (res.response.case === 'data') {
          setStatus('success')
          setMessage(res.response.value.message)
        }
      } catch (err) {
        const message = handleGrpcErr(err, info.languageSymbol)
        setStatus('error')
        setMessage(message)
      } finally {
        setLoading(false)
      }
    }

    const handleError = (error: AppError) => {
      setStatus('error')
      setMessage(error.message || tr.tokenInvalid)
    }

    confirmEmail()
  }, [])

  if (loading) {
    return (
      <div className='w-full flex flex-col justify-center items-center'>
        <LoadingOverlay />
      </div>
    )
  }

  return (
    <div className='w-full h-full flex flex-col justify-center items-center'>
      <Box className='w-96 p-8 rounded-lg border border-gray-200 shadow-sm'>
        <Center>
          {status === 'success' ? (
            <ThemeIcon size={64} color='green' radius='md' variant='light'>
              <IconCheck size={32} stroke={1.5} />
            </ThemeIcon>
          ) : (
            <ThemeIcon size={64} color='red' radius='md' variant='light'>
              <IconAlertCircle size={32} stroke={1.5} />
            </ThemeIcon>
          )}
        </Center>

        <Text ta='center' size='lg' mt={16} mb={8}>
          {status === 'success' ? tr.titleSuccess : tr.titleError}
        </Text>

        <Text ta='center' size='sm' color='dimmed' mb={24}>
          {message}
        </Text>

        <Group justify='center'>
          {status === 'success' ? (
            <Button
              onClick={() => router.push('/auth/login')}
              className='bg-blue-950 hover:bg-blue-900 text-white font-bold'>
              {tr.buttonGoToLogin}
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push('/auth/login')} variant='light' className='font-bold'>
                {tr.buttonBackToLogin}
              </Button>
            </>
          )}
        </Group>
      </Box>
    </div>
  )
}

export default EmailConfirmationWrapper
