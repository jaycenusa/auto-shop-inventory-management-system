import type { InventoryPart } from '../Database/InventoryData'
import { getPartImageUrl } from '../Database/InventoryData'
import {
  InventoryTable,
  PartImage,
  StatusBadge,
  TableSection,
  tdClass,
} from '../Shared/Table'
import Button from '../Shared/Button'

type PartPreviewTableProps = {
  title: string
  description?: string
  parts: InventoryPart[]
  badge?: string
  onRemove?: (id: string) => void
}

export default function PartPreviewTable({
  title,
  description,
  parts,
  badge = 'New',
  onRemove,
}: PartPreviewTableProps) {
  if (parts.length === 0) return null

  return (
    <TableSection title={title} description={description}>
      <InventoryTable extraHeaderCell={Boolean(onRemove)}>
        {parts.map((part) => (
          <tr key={part.id}>
            <td className="table-cell">
              <PartImage
                src={getPartImageUrl(part)}
                alt={part.carPart}
              />
            </td>
            <td className="table-cell--emphasis">
              {part.carPart}
              <span className="preview-badge">{badge}</span>
            </td>
            <td className={tdClass}>{part.brand}</td>
            <td className={tdClass}>{part.category}</td>
            <td className={tdClass}>${part.price.toFixed(2)}</td>
            <td className={tdClass}>{part.quantity}</td>
            <td className="table-cell">
              <StatusBadge status={part.availabilityStatus} />
            </td>
            {onRemove && (
              <td className="table-cell">
                <Button
                  variant="danger"
                  onClick={() => onRemove(part.id)}
                >
                  Remove
                </Button>
              </td>
            )}
          </tr>
        ))}
      </InventoryTable>
    </TableSection>
  )
}
