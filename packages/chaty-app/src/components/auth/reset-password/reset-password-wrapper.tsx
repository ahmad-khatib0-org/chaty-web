'use client'
import Image from 'next/image'
import { LoadingOverlay, PasswordInput as PassInput } from '@mantine/core'
import { IconArrowLeft, IconCheck } from '@tabler/icons-react'

import PasswordInput, { PasswordRequirements } from '@/components/ui/input/password-input'
import { ObjString } from '@/types/shared'
import { USERS_PASSWORD_MAX_LENGTH, USERS_PASSWORD_MIN_LENGTH } from '@/lib/shared'
import ResetPasswordHooks from './reset-password-hooks'

type Props = {
  tr: ObjString
  passwordRequirements: PasswordRequirements
}

function ResetPasswordWrapper({ tr, passwordRequirements }: Props) {
  const { loading, form, onSubmit, submitted, submitError, router } = ResetPasswordHooks({ tr })

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      {loading && <LoadingOverlay />}
      <div className='w-96 flex flex-col items-center justify-center'>
        <div className='relative h-52 w-72'>
          <Image src='/chaty-logo.png' alt={tr.title} fill sizes='100%' priority className='object-fill' />
        </div>

        {!submitted && (
          <form
            onSubmit={form.onSubmit(async (values) => await onSubmit(values))}
            className='w-full flex flex-col gap-y-6'>
            <h1 className='font-bold text-4xl text-blue-950'>{tr.title}</h1>
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
              label={tr.passwordConfirmation}
              placeholder={tr.passwordConfirmation}
              withAsterisk
              {...form.getInputProps('passwordConfirmation')}
            />

            {submitError && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm'>
                {submitError}
              </div>
            )}

            <div className='flex justify-between items-center mt-8'>
              <button
                type='button'
                onClick={() => router.push('/auth/login')}
                className='flex items-center gap-2 text-blue-950 hover:text-blue-900 font-semibold text-sm'>
                <IconArrowLeft size={16} />
                {tr.backToLogin}
              </button>
              <button
                type='submit'
                disabled={loading}
                className='bg-blue-950 hover:bg-blue-900 disabled:bg-gray-400 px-12 text-white font-bold text-sm py-2 rounded transition'>
                {tr.submit}
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <div className='w-full flex flex-col items-center gap-6'>
            <div className='flex justify-center'>
              <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center'>
                <IconCheck size={32} className='text-green-600' />
              </div>
            </div>
            <h2 className='font-bold text-2xl text-blue-950 text-center'>{tr.successTitle}</h2>
            <p className='text-gray-600 text-sm text-center leading-relaxed'>{tr.successMessage}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className='bg-blue-950 hover:bg-blue-900 text-white font-bold px-8 py-2 rounded transition'>
              {tr.backToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordWrapper
