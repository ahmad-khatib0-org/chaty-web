import { humanFileSize } from '@/lib/client'
import { File } from 'chaty-client/models'
import { useEffect, useState } from 'react'

interface Props {
  file?: File
  loadFile: string
}

/**
 * Maximum permissible size in bytes for auto loading text files
 */
const AUTO_LOAD_MAX_SIZE_BYTES = 50_000

/**
 * Render contents of a text file
 */
export function TextFile({ file, loadFile }: Props) {
  const [loading, setLoading] = useState(false)
  const [contents, setContents] = useState<string | undefined>(undefined)

  async function load() {
    setLoading(true)
    // TODO: make the rpc call to endpoint of
  }

  useEffect(() => {
    if (file?.size && file.size <= AUTO_LOAD_MAX_SIZE_BYTES) load()
  }, [file?.size, file?.originalUrl])

  if (loading) {
    return (
      <pre className='flex overflow-auto flex-col'>
        <div className='flex items-center justify-center'>
          <div className='w-6 h-6 border-2 border-(--md-sys-color-primary) border-t-transparent rounded-full animate-spin' />
        </div>
      </pre>
    )
  }

  if (!contents && (!file?.size || file.size > AUTO_LOAD_MAX_SIZE_BYTES)) {
    return (
      <pre className='flex overflow-auto flex-col'>
        <div className='flex items-center justify-center'>
          <button
            className='px-4 py-2 rounded-full bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary) hover:opacity-80 transition-opacity'
            onClick={load}>
            {loadFile} ({humanFileSize(file?.size ?? 0)})
          </button>
        </div>
      </pre>
    )
  }

  // Show file contents
  if (contents !== undefined) {
    return (
      <pre className='flex overflow-auto flex-col'>
        <code className='font-mono text-sm whitespace-pre-wrap wrap-break-word'>{contents}</code>
      </pre>
    )
  }

  return null
}
