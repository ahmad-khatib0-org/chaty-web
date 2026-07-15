import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { Anchor, Button, Dialog, Group, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { yupResolver } from 'mantine-form-yup-resolver'
import { bool, object, string } from 'yup'

import { grpcClient } from '@/lib/client'
import { ObjString } from '@/types/shared'

export function ServersCreate({ tr }: { tr: ObjString }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [opened, setOpened] = useState(true)

  type ServersCreateFormData = { name: string; description: string; nsfw: boolean }

  const form = useForm<ServersCreateFormData>({
    validateInputOnBlur: true,
    initialValues: { name: '', description: '', nsfw: false },
    validate: yupResolver(
      object().shape({
        name: string().min(1).max(32).required(tr.nameErr),
        description: string().min(1).max(1024).notRequired(),
        nsfw: bool().notRequired(),
      })
    ),
  })

  async function onSubmit({ name, nsfw, description }: ServersCreateFormData) {
    if (isPending) return

    setIsPending(true)
    const { response } = await grpcClient().serversCreate({ name, description, nsfw })
    if (response.case === 'error') {
      notifications.show({ color: 'red', message: response.value.message })
    } else {
      const { response } = await grpcClient().serversCreate({ description, name, nsfw })
      if (response.case === 'error') {
        const message = response.value.message
        notifications.show({ message, color: 'red' })
      } else {
        // TODO: navigate to the created server
      }
    }
  }

  return (
    <Dialog opened={opened} title={tr.createServer} size='md' p='lg'>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap='md'>
          <Text size='sm'>
            {tr.byCreatingThisServer}
            {/* TODO: add the link */}
            <Anchor href={''}>{tr.accepableUsePolicy}</Anchor>
          </Text>

          <TextInput
            label={tr.serverName}
            placeholder={tr.serverName}
            required
            {...form.getInputProps('name')}
            withAsterisk
            disabled={isPending}
          />

          <Textarea
            label={tr.serverDescription}
            placeholder={tr.serverDescription}
            {...form.getInputProps('description')}
            rows={5}
            disabled={isPending}
          />
          <Group justify='end' mt='md'>
            <Button variant='subtle' onClick={() => setOpened(false)} disabled={isPending}>
              {tr.close}
            </Button>
            <Button type='submit' disabled={!form.isValid() || isPending} loading={isPending}>
              {tr.createServer}
            </Button>
          </Group>
        </Stack>
      </form>
    </Dialog>
  )
}
