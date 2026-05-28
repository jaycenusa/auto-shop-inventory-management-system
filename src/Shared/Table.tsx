import type { ReactNode } from 'react'
import type { AvailabilityStatus } from '../Database/InventoryData'

export const PART_TABLE_HEADERS = [
  'Picture',
  'Car part',
  'Brand',
  'Category',
  'Price',
  'Quantity',
  'Status',
] as const

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop'

export function PartImage({
  src,
  alt,
  size = 'md',
}: {
  src: string
  alt: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} rounded-lg border border-slate-200 bg-slate-100 object-cover`}
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
    <div className="flex items-center gap-1">
      <PartImage src={beforeSrc} alt={`${alt} before`} size="sm" />
      <span className="text-amber-600">→</span>
      <PartImage src={afterSrc} alt={`${alt} after`} size="sm" />
    </div>
  )
}

const statusStyles: Record<AvailabilityStatus, string> = {
  'In Stock': 'bg-emerald-100 text-emerald-800',
  'Low Stock': 'bg-amber-100 text-amber-800',
  'Out of Stock': 'bg-red-100 text-red-800',
}

const thClass = 'px-4 py-3 font-semibold text-slate-900'
const tdClass = 'px-4 py-3 text-slate-700'

export function StatusBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
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
    return <span className="text-slate-700">{fmt(after)}</span>
  }

  return (
    <span className="text-slate-700">
      <span className="text-slate-400 line-through">{fmt(before)}</span>
      <span className="mx-1 text-amber-600">→</span>
      <span className="font-medium text-amber-700">{fmt(after)}</span>
    </span>
  )
}

type InventoryTableProps = {
  children: ReactNode
  extraHeaderCell?: boolean
  minWidth?: string
  borderClassName?: string
}

export function InventoryTable({
  children,
  extraHeaderCell = false,
  minWidth = 'min-w-[760px]',
  borderClassName = 'border-slate-200',
}: InventoryTableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-lg border bg-white ${borderClassName}`}
    >
      <table className={`w-full ${minWidth} text-left text-sm`}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {PART_TABLE_HEADERS.map((header) => (
              <th key={header} className={thClass}>
                {header}
              </th>
            ))}
            {extraHeaderCell && <th className={thClass} />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
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
      ? 'mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4'
      : 'mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4'

  const titleClass =
    variant === 'amber'
      ? 'text-base font-semibold text-amber-900'
      : 'text-base font-semibold text-slate-900'

  const descriptionClass =
    variant === 'amber'
      ? 'mt-1 text-sm text-amber-800'
      : 'mt-1 text-sm text-slate-600'

  return (
    <section className={sectionClass}>
      <h3 className={titleClass}>{title}</h3>
      {description && <p className={descriptionClass}>{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export { tdClass }
