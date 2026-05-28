import type { InventoryPart } from '../Database/InventoryData'
import { getPartImageUrl } from '../Database/InventoryData'
import {
  CompareCell,
  CompareImageCell,
  InventoryTable,
  TableSection,
} from '../Shared/Table'

export type PartChange = {
  before: InventoryPart
  after: InventoryPart
}

type PartCompareTableProps = {
  changes: PartChange[]
}

export default function PartCompareTable({ changes }: PartCompareTableProps) {
  if (changes.length === 0) return null

  return (
    <TableSection
      variant="amber"
      title="Review changes before confirming"
      description="Compare original values with your updates. Strikethrough shows the previous value."
    >
      <InventoryTable minWidth="min-w-[840px]" borderClassName="border-amber-200">
        {changes.map(({ before, after }) => (
          <tr key={after.id}>
            <td className="px-4 py-3">
              <CompareImageCell
                beforeSrc={getPartImageUrl(before)}
                afterSrc={getPartImageUrl(after)}
                alt={after.carPart}
              />
            </td>
            <td className="px-4 py-3 font-medium text-slate-900">
              <CompareCell before={before.carPart} after={after.carPart} />
            </td>
            <td className="px-4 py-3">
              <CompareCell before={before.brand} after={after.brand} />
            </td>
            <td className="px-4 py-3">
              <CompareCell before={before.category} after={after.category} />
            </td>
            <td className="px-4 py-3">
              <CompareCell
                before={before.price}
                after={after.price}
                format={(v) => `$${Number(v).toFixed(2)}`}
              />
            </td>
            <td className="px-4 py-3">
              <CompareCell before={before.quantity} after={after.quantity} />
            </td>
            <td className="px-4 py-3">
              <CompareCell
                before={before.availabilityStatus}
                after={after.availabilityStatus}
              />
            </td>
          </tr>
        ))}
      </InventoryTable>
    </TableSection>
  )
}

export function getPartChanges(
  originals: InventoryPart[],
  updated: InventoryPart[],
): PartChange[] {
  const originalMap = new Map(originals.map((p) => [p.id, p]))

  return updated
    .map((after) => {
      const before = originalMap.get(after.id)
      if (!before) return null
      const changed =
        before.carPart !== after.carPart ||
        before.brand !== after.brand ||
        before.category !== after.category ||
        before.price !== after.price ||
        before.quantity !== after.quantity ||
        before.availabilityStatus !== after.availabilityStatus ||
        before.imageUrl !== after.imageUrl
      return changed ? { before, after } : null
    })
    .filter((c): c is PartChange => c !== null)
}
