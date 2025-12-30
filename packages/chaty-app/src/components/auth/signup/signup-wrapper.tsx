'use client'
import { TextInput, PasswordInput as PassInput, LoadingOverlay, Button, Text } from '@mantine/core'

import SignupHooks from './signup-hooks'
import PasswordInput, { PasswordRequirements } from '@/components/ui/input/password-input'
import {
  USERS_PASSWORD_MAX_LENGTH,
  USERS_PASSWORD_MIN_LENGTH,
  USERS_USERNAME_MAX_LENGHT,
  USERS_USERNAME_MIN_LENGHT,
} from '@/lib/shared'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  tr: { [key: string]: string }
  passwordRequirements: PasswordRequirements
}

function SignupWrapper({ tr, passwordRequirements }: Props) {
  const { form, loading, onSubmit } = SignupHooks({ tr })

  return (
    <main className='w-full flex justify-center min-h-screen'>
      {loading && <LoadingOverlay />}
      <section className='w-full flex flex-col items-center'>
        <div className='relative w-80 h-60'>
          <Image
            src='/chaty-logo.png'
            alt={tr.chatyDesc}
            fill
            sizes='100%'
            priority
            className='object-fill'
          />
        </div>
        <h1 className='font-bold text-2xl'>{tr.chatyDesc}</h1>
        <form className='flex flex-col w-150 max-w-162.5 mt-10'>
          <div className='grid grid-cols-2 gap-y-10 gap-x-6 max-w-full wrap-break-word'>
            <TextInput
              type='email'
              label={tr.email}
              placeholder={tr.email}
              withAsterisk
              maxLength={240}
              size='sm'
              {...form.getInputProps('email')}
            />
            <TextInput
              type='text'
              label={tr.username}
              placeholder={tr.username}
              withAsterisk
              maxLength={USERS_USERNAME_MAX_LENGHT}
              minLength={USERS_USERNAME_MIN_LENGHT}
              size='sm'
              {...form.getInputProps('username')}
            />
            <PasswordInput
              fieldName='password'
              requirements={passwordRequirements}
              minLength={USERS_PASSWORD_MIN_LENGTH}
              maxLength={USERS_PASSWORD_MAX_LENGTH}
              label={tr.password}
              placeholder={tr.password}
              passAtLeast={tr.passMinErr}
              form={form}
            />
            <PassInput
              label={tr.passwordConf}
              placeholder={tr.passwordConf}
              withAsterisk
              {...form.getInputProps('passwordConfirmation')}
            />
          </div>
          <div className='mt-6 flex items-center justify-center gap-x-2 '>
            <p className='font-medium'>{tr.haveAccount}</p>
            <Link href='/auth/login' className='underline text-blue-700'>
              {tr.login}{' '}
            </Link>
          </div>
          <div className='flex justify-center mt-10'>
            <Button onClick={() => onSubmit()} disabled={loading} className=''>
              {tr.createChaty}
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default SignupWrapper
