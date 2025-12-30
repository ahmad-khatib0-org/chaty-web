import 'server-only'

import Image from 'next/image'

type Props = {
  msg?: string
  description?: string
}

const ServerError = ({ msg, description }: Props) => {
  const defaultMsg = 'Sorry we encountered some technical issues during you last operation'
  const defaultDesc =
    'Please try to refresh you browser tab, or contact the support team if the problem persists.'

  return (
    <section className='grid grid-cols-[1fr_55%] w-full px-4'>
      <div className='flex flex-col items-start justify-center mt-12'>
        <h1 style={{ color: '#0d0c22' }} className='text-4xl font-bold'>
          Internal Server Error
        </h1>
        <p className='mt-12 text-xl'>{msg ?? defaultMsg}</p>
        <p className='mt-10 text-xl'> {description ?? defaultDesc} </p>
      </div>
      <div className='relative w-full h-[400px]'>
        <Image
          src={'/internal-error.png'}
          alt='describe an internal error'
          sizes='100%'
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>
    </section>
  )
}

export default ServerError
