'use client'

import { useState } from 'react'
import { Box, Popover, Progress, rem } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { PasswordInput as PassInput } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'

export type PasswordRequirements = { re: string; label: string }[]

const PassRequirement = ({ label, meets }: { label: string; meets: boolean }) => {
  return (
    <Box c={meets ? 'teal' : 'red'} className='flex items-center gap-x-2' mt={7} size='sm'>
      {meets && <IconCheck style={{ width: rem(14), height: rem(14) }} />}
      {!meets && <IconX style={{ width: rem(14), height: rem(14) }} />}
      <p>{label}</p>
    </Box>
  )
}

type Props<T> = {
  requirements: PasswordRequirements
  minLength: number
  maxLength: number
  form: UseFormReturnType<T, (v: T) => T>
  fieldName: string
  label: string
  placeholder: string
  passAtLeast: string
}

export const PasswordInput = <T,>({
  requirements,
  minLength,
  maxLength,
  form,
  fieldName,
  label,
  placeholder,
  passAtLeast,
}: Props<T>) => {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')

  form.watch(fieldName, ({ value }) => setVal(value as string))

  const getStrength = (p: string) => {
    let multiplier = p.length > minLength ? 0 : 1
    // eslint-disable-next-line array-callback-return
    requirements.map((r) => {
      if (!RegExp(r.re).test(p)) multiplier += 1
    })
    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10)
  }

  const strength = getStrength(val)
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red'

  return (
    <Popover opened={open} position='bottom' width='target' transitionProps={{ transition: 'pop' }}>
      <Popover.Target>
        <div onFocusCapture={() => setOpen(true)} onBlurCapture={() => setOpen(false)}>
          <PassInput
            label={label}
            withAsterisk
            placeholder={placeholder}
            minLength={minLength}
            maxLength={maxLength}
            {...form.getInputProps(fieldName)}
          />
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} mb='xs' />
        <PassRequirement meets={val.length >= minLength} label={passAtLeast} />
        {requirements.map((r) => {
          return <PassRequirement key={r.label} meets={RegExp(r.re).test(val)} label={r.label} />
        })}
      </Popover.Dropdown>
    </Popover>
  )
}

export default PasswordInput
