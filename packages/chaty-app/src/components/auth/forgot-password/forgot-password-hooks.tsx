import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { yupResolver } from 'mantine-form-yup-resolver'
import { notifications } from '@mantine/notifications'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import { ObjString } from '@/types/shared'
import { ForgotPasswordHelpers, grpcClient, handleGrpcErr } from '@/lib/client'
import { useAppStore } from '@/state'

type Props = {
  tr: ObjString
}

function ForgotPasswordHooks({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: ForgotPasswordHelpers.formValues(),
    validate: yupResolver(ForgotPasswordHelpers.form(tr)),
  })

  const onSubmit = async ({ email }: { email: string }) => {
    if (loading) return
    setLoading(true)
    setSubmitError('')
    try {
      const res = await grpcClient().usersForgotPassword({ email })
      if (res.response.case === 'error') {
        handleError(res.response.value)
        return
      }
      if (res.response.case === 'data') {
        setSubmitted(true)
      }
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

  return { router, loading, form, onSubmit, submitted, submitError, setSubmitted }
}

export default ForgotPasswordHooks
