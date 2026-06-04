import { useState } from 'react'
import Button from '../Shared/Button'
import { copyToClipboard } from '../Utils/Clipboard'

type VehicleVinCellProps = {
  vin: string
}

export default function VehicleVinCell({ vin }: VehicleVinCellProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const displayVin = vin.trim()

  const handleCopy = async () => {
    if (!displayVin) return

    setCopyError(false)
    try {
      await copyToClipboard(displayVin)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setCopyError(true)
      window.setTimeout(() => setCopyError(false), 2000)
    }
  }

  if (!displayVin) {
    return <span className="vehicle-vin-cell__empty">—</span>
  }

  return (
    <div className="vehicle-vin-cell">
      <code className="vehicle-vin-cell__value" title={displayVin}>
        {displayVin}
      </code>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="vehicle-vin-cell__copy"
        onClick={() => void handleCopy()}
        aria-label={`Copy VIN ${displayVin}`}
      >
        {copied ? 'Copied' : copyError ? 'Copy failed' : 'Copy'}
      </Button>
    </div>
  )
}
