'use client'
import { Button, LoadingOverlay, PasswordInput, TextInput } from '@mantine/core'
import { IconLock, IconMail } from '@tabler/icons-react'

import LoginHooks from './login-hooks'
import { ObjString } from '@/types/shared'
import { USERS_PASSWORD_MAX_LENGTH, USERS_PASSWORD_MIN_LENGTH } from '@/lib/shared'
import Image from 'next/image'

type Props = {
  tr: ObjString
}

function LoginWrapper({ tr }: Props) {
  const { loading, form, onSubmit } = LoginHooks({ tr })

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      {loading && <LoadingOverlay />}
      <div className='relative w-96'>
        <div className='relative h-52 w-72'>
          <Image
            src='/chaty-logo.png'
            alt={tr.chatyDesc}
            fill
            sizes='100%'
            priority
            className='object-fill'
          />
        </div>
        <form
          onSubmit={form.onSubmit(async (values) => await onSubmit(values))}
          className='w-full h-full flex flex-col justify-center gap-y-6'>
          <h1 className='font-bold text-4xl text-blue-950'>{tr.wel}</h1>
          <TextInput
            label={tr.email}
            placeholder={tr.email}
            withAsterisk
            type='email'
            size='sm'
            className='w-96'
            leftSection={<IconMail size={20} />}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label={tr.password}
            placeholder={tr.password}
            withAsterisk
            size='sm'
            className='w-96'
            maxLength={USERS_PASSWORD_MAX_LENGTH}
            minLength={USERS_PASSWORD_MIN_LENGTH}
            leftSection={<IconLock size={20} />}
            {...form.getInputProps('password')}
          />
          <div className='flex justify-between items-center mt-8'>
            <Button
              type='submit'
              disabled={loading}
              className='bg-blue-950 hover:bg-blue-900 px-12 text-white font-bold text-xl'
              title={tr.send}>
              {tr.login}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginWrapper
