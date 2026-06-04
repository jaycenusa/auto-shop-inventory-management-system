import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

export type ImageZoomTarget = {
  src: string
  alt: string
}

type ImageZoomContextValue = {
  openImageZoom: (src: string, alt: string) => void
}

const ImageZoomContext = createContext<ImageZoomContextValue | null>(null)

/** Larger URL for the zoom overlay. */
export function getZoomedImageUrl(src: string): string {
  const picsumSize = src.match(/picsum\.photos\/seed\/[^/]+\/(\d+)\/(\d+)/)
  if (picsumSize) {
    return src.replace(/\/\d+\/\d+(\?.*)?$/, '/800/600$1')
  }

  return src
}

/** Props to spread onto a clickable thumbnail that opens the zoom overlay. */
export function getZoomableImageProps(
  openImageZoom: (src: string, alt: string) => void,
  src: string,
  alt: string,
) {
  const open = () => openImageZoom(src, alt)

  return {
    onClick: open,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        open()
      }
    },
    role: 'button' as const,
    tabIndex: 0,
    title: 'Click to zoom',
    'aria-label': `Zoom ${alt}`,
  }
}

export function useImageZoom() {
  const [target, setTarget] = useState<ImageZoomTarget | null>(null)

  const openImageZoom = useCallback((src: string, alt: string) => {
    setTarget({ src, alt })
  }, [])

  const closeImageZoom = useCallback(() => {
    setTarget(null)
  }, [])

  return { target, openImageZoom, closeImageZoom }
}

type ImageZoomOverlayProps = {
  target: ImageZoomTarget | null
  onClose: () => void
}

export function ImageZoomOverlay({ target, onClose }: ImageZoomOverlayProps) {
  const titleId = useId()

  useEffect(() => {
    if (!target) return

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [target, onClose])

  if (!target) return null

  const zoomSrc = getZoomedImageUrl(target.src)

  return (
    <div
      className="image-zoom__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="image-zoom__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="image-zoom__header">
          <p id={titleId} className="image-zoom__title">
            {target.alt}
          </p>
          <button
            type="button"
            className="image-zoom__close"
            onClick={onClose}
            aria-label="Close zoomed image"
          >
            <svg
              className="image-zoom__close-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <img
          src={zoomSrc}
          alt={target.alt}
          className="image-zoom__image"
        />
      </div>
    </div>
  )
}

export function ImageZoomProvider({ children }: { children: ReactNode }) {
  const { target, openImageZoom, closeImageZoom } = useImageZoom()

  return (
    <ImageZoomContext.Provider value={{ openImageZoom }}>
      {children}
      <ImageZoomOverlay target={target} onClose={closeImageZoom} />
    </ImageZoomContext.Provider>
  )
}

export function useImageZoomContext(): ImageZoomContextValue | null {
  return useContext(ImageZoomContext)
}
