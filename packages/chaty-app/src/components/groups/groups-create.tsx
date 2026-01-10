'use client'
import { useState } from 'react'
import { Modal, TextInput, LoadingOverlay, Checkbox, Button, Tooltip } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { yupResolver } from 'mantine-form-yup-resolver'
import { notifications } from '@mantine/notifications'

import UsernamesSearch from '@/components/common/usernames-search'
import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import { ObjString } from '@/types/shared'
import { grpcClient, handleGrpcErr, GroupsCreateHelpers } from '@/lib/client'
import { useAppStore } from '@/state'

type Props = {
  tr: ObjString
}

function GroupsCreate({ tr }: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: GroupsCreateHelpers.formValues(),
    validate: yupResolver(GroupsCreateHelpers.form(tr)),
  })

  const onSubmit = async (values: ReturnType<typeof GroupsCreateHelpers.formValues>) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await grpcClient().groupsCreate({ ...values })

      if (res.response.case === 'error') {
        handleError(res.response.value)
      } else if (res.response.case === 'data') {
        notifications.show({ message: res.response.value.message, color: 'green', position: 'top-right' })
        form.reset()
        setIsOpen(false)
      }
    } catch (err) {
      const message = handleGrpcErr(err, info.languageSymbol)
      notifications.show({ message, color: 'red', position: 'top-right' })
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error: AppError) => {
    GroupsCreateHelpers.handleSubmitErrors(error, form)
    notifications.show({ message: error.message, color: 'red', position: 'top-right' })
  }

  return (
    <>
      <div className='cursor-pointer' onClick={() => setIsOpen(true)}>
        <Tooltip label={tr.createGroup}>
          <IconPlus size={28} color='white' />
        </Tooltip>
      </div>

      <Modal opened={isOpen} onClose={() => setIsOpen(false)} title={tr.createGroup} centered size='md'>
        {loading && <LoadingOverlay />}
        <form
          onSubmit={form.onSubmit(async (values) => await onSubmit(values))}
          className='flex flex-col gap-y-4'>
          <TextInput
            label={tr.groupName}
            placeholder={tr.groupNamePlaceholder}
            withAsterisk
            {...form.getInputProps('name')}
          />
          <TextInput
            label={tr.groupDescription}
            placeholder={tr.groupDescriptionPlaceholder}
            {...form.getInputProps('description')}
          />
          <UsernamesSearch
            label={tr.recipients}
            placeholder={tr.recipientsPlaceholder}
            nothingFoundMessage={tr.usernamesSearchNotFound}
            value={form.values.recipients}
            onChange={(value) => form.setFieldValue('recipients', value as any)}
            errorMsg={form.errors.recipients ? String(form.errors.recipients) : undefined}
          />

          <Checkbox label={tr.nsfw} {...form.getInputProps('nsfw', { type: 'checkbox' })} />

          <div className='flex justify-between gap-2 mt-4'>
            <Button onClick={() => setIsOpen(false)} disabled={loading} variant='outline'>
              {tr.cancel}
            </Button>
            <Button type='submit' disabled={loading} style={{ backgroundColor: 'var(--primary-color)' }}>
              {tr.create}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default GroupsCreate
