import { useId, useRef, useState } from 'react'
import { getPartImageUrl } from '../Database/InventoryData'
import { readImageFileAsDataUrl } from '../Utils/ImageUpload'
import { PartImage } from './Table'
import Button, { UploadIcon } from './Button'

type PictureDropzoneProps = {
  imageUrl: string
  onImageUrlChange: (url: string) => void
  previewAlt?: string
  previewId?: string
  compact?: boolean
  className?: string
  validationError?: string | null
}

export default function PictureDropzone({
  imageUrl,
  onImageUrlChange,
  previewAlt = 'Part picture',
  previewId = 'preview',
  compact = false,
  className = '',
  validationError = null,
}: PictureDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const previewSrc = imageUrl.trim()
    ? getPartImageUrl({ id: previewId, imageUrl: imageUrl.trim() })
    : null

  const processFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setIsLoading(true)
    try {
      const dataUrl = await readImageFileAsDataUrl(file)
      onImageUrlChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    void processFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    void processFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const openFilePicker = () => inputRef.current?.click()

  const dropzoneClass = compact
    ? 'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-3 py-3'
    : 'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8'

  const dragStateClass = validationError
    ? 'border-red-500 bg-red-50'
    : isDragging
      ? 'border-amber-500 bg-amber-50'
      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'

  return (
    <div className={className}>
      <div
        role="presentation"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`${dropzoneClass} ${dragStateClass} transition-colors`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={onInputChange}
          disabled={isLoading}
        />

        {previewSrc && (
          <PartImage
            src={previewSrc}
            alt={previewAlt}
            size={compact ? 'sm' : 'md'}
          />
        )}

        {!compact && (
          <div className="text-center">
            <svg
              className="mx-auto h-10 w-10 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-slate-700">
              Drag and drop a picture here
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPEG, PNG, WebP, or GIF · max 2 MB
            </p>
          </div>
        )}

        <Button
          variant="primary"
          onClick={openFilePicker}
          disabled={isLoading}
          icon={<UploadIcon />}
          className="disabled:opacity-50"
        >
          {isLoading ? 'Uploading…' : 'Upload picture'}
        </Button>

        {compact && (
          <p className="text-center text-xs text-slate-500">
            or drag and drop
          </p>
        )}
      </div>

      {(validationError || error) && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {validationError ?? error}
        </p>
      )}

      {imageUrl.trim() && (
        <Button
          variant="link-muted"
          onClick={() => {
            setError(null)
            onImageUrlChange('')
          }}
          className={
            compact ? 'text-xs' : 'mt-2'
          }
        >
          Remove picture
        </Button>
      )}
    </div>
  )
}
