import type { ReactNode } from 'react'
import type { AvailabilityStatus } from '../database/InventoryData'

export const PART_TABLE_HEADERS = [
  'Picture',
  'Car part',
  'Brand',
  'Category',
  'Price',
  'Quantity',
  'status',
] as const

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop'

const STATUS_BADGE_CLASS: Record<AvailabilityStatus, string> = {
  'In Stock': 'status-badge status-badge--in-stock',
  'Low Stock': 'status-badge status-badge--low-stock',
  'Out of Stock': 'status-badge status-badge--out-of-stock',
}

export function PartImage({
  src,
  alt,
  size = 'md',
}: {
  src: string
  alt: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'part-image--sm' : 'part-image--md'

  return (
    <img
      src={src}
      alt={alt}
      className={`part-image ${sizeClass}`}
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = FALLBACK_IMAGE
      }}
    />
  )
}

export function CompareImageCell({
  beforeSrc,
  afterSrc,
  alt,
}: {
  beforeSrc: string
  afterSrc: string
  alt: string
}) {
  const changed = beforeSrc !== afterSrc

  if (!changed) {
    return <PartImage src={afterSrc} alt={alt} size="sm" />
  }

  return (
    <div className="compare-images">
      <PartImage src={beforeSrc} alt={`${alt} before`} size="sm" />
      <span className="compare-images__arrow">→</span>
      <PartImage src={afterSrc} alt={`${alt} after`} size="sm" />
    </div>
  )
}

export function StatusBadge({ status }: { status: AvailabilityStatus }) {
  return <span className={STATUS_BADGE_CLASS[status]}>{status}</span>
}

export function CompareCell({
  before,
  after,
  format,
}: {
  before: string | number
  after: string | number
  format?: (v: string | number) => string
}) {
  const fmt = format ?? String
  const changed = before !== after

  if (!changed) {
    return <span className="compare-cell">{fmt(after)}</span>
  }

  return (
    <span className="compare-cell">
      <span className="compare-cell__before">{fmt(before)}</span>
      <span className="compare-cell__arrow">→</span>
      <span className="compare-cell__after">{fmt(after)}</span>
    </span>
  )
}

type InventoryTableProps = {
  children: ReactNode
  extraHeaderCell?: boolean
  minWidth?: 'default' | 'compare'
  borderVariant?: 'default' | 'amber'
}

export function InventoryTable({
  children,
  extraHeaderCell = false,
  minWidth = 'default',
  borderVariant = 'default',
}: InventoryTableProps) {
  const wrapClass =
    borderVariant === 'amber'
      ? 'inventory-table-wrap inventory-table-wrap--amber'
      : 'inventory-table-wrap'

  const tableClass =
    minWidth === 'compare'
      ? 'inventory-table inventory-table--compare'
      : 'inventory-table inventory-table--wide'

  return (
    <div className={wrapClass}>
      <table className={tableClass}>
        <thead>
          <tr className="inventory-table__head-row">
            {PART_TABLE_HEADERS.map((header) => (
              <th key={header} className="table-cell--header">
                {header}
              </th>
            ))}
            {extraHeaderCell && <th className="table-cell--header" />}
          </tr>
        </thead>
        <tbody className="inventory-table__body">{children}</tbody>
      </table>
    </div>
  )
}

type TableSectionProps = {
  title: string
  description?: string
  variant?: 'default' | 'amber'
  children: ReactNode
}

export function TableSection({
  title,
  description,
  variant = 'default',
  children,
}: TableSectionProps) {
  const sectionClass =
    variant === 'amber'
      ? 'table-section table-section--amber'
      : 'table-section table-section--default'

  const titleClass =
    variant === 'amber'
      ? 'table-section__title table-section__title--amber'
      : 'table-section__title table-section__title--default'

  const descriptionClass =
    variant === 'amber'
      ? 'table-section__description table-section__description--amber'
      : 'table-section__description table-section__description--default'

  return (
    <section className={sectionClass}>
      <h3 className={titleClass}>{title}</h3>
      {description && <p className={descriptionClass}>{description}</p>}
      <div className="table-section__content">{children}</div>
    </section>
  )
}

/** @deprecated Use table-cell */
export const tdClass = 'table-cell'

export { STATUS_BADGE_CLASS }
