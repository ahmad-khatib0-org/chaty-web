import { useState } from 'react'

export function Spoiler({
  contentType,
  clickToShow,
}: {
  contentType?: 'Image' | 'Video'
  clickToShow: string
}) {
  const [show, setShow] = useState(false)

  if (!show) return null

  return (
    <div
      className={`Spoiler ${contentType || ''} z-1 cursor-pointer backdrop-brightness-[0.2] backdrop-contrast-[0.8] backdrop-blur-3xl grid place-items-center`}
      onClick={() => setShow(false)}>
      <span className='py-3 px-4 font-semibold select-none shadow-lg rounded-lg text-(--md-sys-color-inverse-on-surface) bg-(--md-sys-color-inverse-surface)'>
        {clickToShow}
      </span>
    </div>
  )
}
