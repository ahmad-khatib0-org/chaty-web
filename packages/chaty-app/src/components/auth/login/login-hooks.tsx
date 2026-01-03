import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { object, string } from 'yup'
import { yupResolver } from 'mantine-form-yup-resolver'
import { notifications } from '@mantine/notifications'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'

import { useAppStore } from '@/state'
import { ObjString } from '@/types/shared'
import { USERS_PASSWORD_MAX_LENGTH, USERS_PASSWORD_MIN_LENGTH } from '@/lib/shared'
import { grpcClient, handleGrpcErr, LoginHelpers } from '@/lib/client'

type Props = {
  tr: ObjString
}

function LoginHooks({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [challenge, setChallenge] = useState('')

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: { email: '', password: '' },
    validate: yupResolver(
      object().shape({
        email: string().email().required(tr.emailErr),
        password: string()
          .min(USERS_PASSWORD_MIN_LENGTH, tr.passMinErr)
          .max(USERS_PASSWORD_MAX_LENGTH, tr.passMaxErr)
          .required(tr.r),
      })
    ),
  })

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await grpcClient().usersLogin({ email, password, loginChallenge: challenge })
      if (res.response.case === 'error') handleError(res.response.value)
      if (res.response.case === 'data') {
        if (res.response.value.redirectTo) window.location.href = res.response.value.redirectTo
      }
    } catch (err) {
      let message = handleGrpcErr(err, info.languageSymbol)
      notifications.show({ message, color: 'red', position: 'top-right' })
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error: AppError) => {
    const e = error.errors
    if (e['error']) {
      const url = `/auth/login/error?error=${e['error']}&error_description=${e['error_description']}`
      router.replace(url)
      return
    }
    if (e['email']) form.setFieldError('email', e['email'])
    if (e['password']) form.setFieldError('password', e['password'])
    if (error.message) {
      notifications.show({ message: error.message, color: 'red', position: 'top-right' })
    }
  }

  // TODO: handle no challenge and display an error popup
  const init = () => {
    const location = window.location.href
    const url = LoginHelpers.checkLoginUrl(location)
    if (url) {
      router.push(url.toString())
      return
    }
    setChallenge(() => LoginHelpers.getLoginChallengeParam(location))
  }

  useEffect(() => {
    init()
  }, [])

  return { router, loading, form, setLoading, onSubmit }
}

export default LoginHooks
