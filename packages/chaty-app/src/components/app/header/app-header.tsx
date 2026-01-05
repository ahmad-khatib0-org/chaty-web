import 'server-only'

import { ClientInformation, Trans } from '@/lib/server'

type Props = {
  info: ClientInformation
}

function AppHeader({ info }: Props) {
  const tr = Trans.tr
  return <div className='h-14 bg-sugar flex justify-end items-center px-8 w-full border sticky'></div>
}

export default AppHeader
