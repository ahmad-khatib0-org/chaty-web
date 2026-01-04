'use client'
import Image from 'next/image'
import { LoadingOverlay } from '@mantine/core'
import { IconMail, IconArrowLeft, IconCheck } from '@tabler/icons-react'

import { ObjString } from '@/types/shared'
import ForgotPasswordHooks from './forgot-password-hooks'

type Props = {
  tr: ObjString
}

function ForgotPasswordWrapper({ tr }: Props) {
  const { loading, form, onSubmit, submitted, submitError, router } = ForgotPasswordHooks({ tr })

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      {loading && <LoadingOverlay />}
      <div className='w-96 flex flex-col items-center justify-center'>
        <div className='relative h-52 w-72'>
          <Image src='/chaty-logo.png' alt={tr.title} fill sizes='100%' priority className='object-fill' />
        </div>

        {!submitted ? (
          <form
            onSubmit={form.onSubmit(async (values) => await onSubmit(values))}
            className='w-full h-full flex flex-col justify-center gap-y-6'>
            <h1 className='font-bold text-4xl text-blue-950'>{tr.title}</h1>
            <p className='text-gray-600 text-sm'>{tr.description}</p>

            <div className='flex flex-col gap-2'>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                {tr.email}
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <IconMail size={20} />
                </div>
                <input
                  id='email'
                  type='email'
                  placeholder={tr.email}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none'
                  {...form.getInputProps('email')}
                />
              </div>
              {form.errors.email && <p className='text-red-500 text-sm'>{form.errors.email}</p>}
            </div>

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
        ) : (
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

export default ForgotPasswordWrapper
