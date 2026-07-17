const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Use a JPEG, PNG, WebP, or GIF image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 2 MB or smaller.'
  }
  return null
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  const error = validateImageFile(file)
  if (error) return Promise.reject(new Error(error))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Could not read image file.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })
}
