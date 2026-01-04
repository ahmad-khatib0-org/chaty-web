'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { yupResolver } from 'mantine-form-yup-resolver'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import { ObjString } from '@/types/shared'
import { grpcClient, handleGrpcErr, ResetPasswordHelpers } from '@/lib/client'
import { useAppStore } from '@/state'

type Props = { tr: ObjString }

function ResetPasswordHooks({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: ResetPasswordHelpers.formValues(),
    validate: yupResolver(ResetPasswordHelpers.form(tr)),
  })

  const onSubmit = async (values: { password: string; passwordConfirmation: string }) => {
    if (loading) return
    setLoading(true)
    setSubmitError('')
    try {
      const token = searchParams.get('token')
      if (!token) {
        setSubmitError(tr.tokenInvalid)
        return
      }

      const res = await grpcClient().usersResetPassword({
        token,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })

      if (res.response.case === 'error') handleError(res.response.value)
      if (res.response.case === 'data') setSubmitted(true)
    } catch (err) {
      const message = handleGrpcErr(err, info.languageSymbol)
      setSubmitError(message)
      notifications.show({ message, color: 'red', position: 'top-right' })
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error: AppError) => {
    const message = error.message
    setSubmitError(message)
    notifications.show({ message, color: 'red', position: 'top-right' })
  }

  return { router, loading, form, onSubmit, submitted, setSubmitted, submitError }
}

export default ResetPasswordHooks
