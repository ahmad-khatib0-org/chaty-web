import { useState } from 'react'
import { useForm } from '@mantine/form'
import { yupResolver } from 'mantine-form-yup-resolver'
import { notifications } from '@mantine/notifications'

import { useAppStore } from '@/state'
import { grpcClient, SignupHelpers, tr as translator } from '@/lib/client'

type Props = {
  tr: { [key: string]: string }
}

function SignupHooks({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: SignupHelpers.formValues(),
    validate: yupResolver(SignupHelpers.form(tr)),
  })

  const onSubmit = async () => {
    if (loading) return

    setLoading(true)

    if (form.validate().hasErrors) {
      const title = translator(info.languageSymbol, 'forms.fields.invalid.title')
      const message = translator(info.languageSymbol, 'forms.fields.invalid.title')
      notifications.show({ title, message, color: 'red', position: 'top-right' })
      setLoading(false)
      return
    }

    try {
      const result = await grpcClient().usersCreate({ ...form.getValues() })
      if (result.response.case === 'error') {
        let err = result.response.value
        notifications.show({ message: err.message, color: 'red', position: 'top-right' })
      } else {
        const response = result.response.value
        console.log(response)
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  return { loading, onSubmit, form }
}

export default SignupHooks
