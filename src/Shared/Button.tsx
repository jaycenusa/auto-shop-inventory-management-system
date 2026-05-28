import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline-accent'
  | 'link'
  | 'link-muted'
  | 'danger'
  | 'nav'
  | 'nav-dropdown'
  | 'pagination'
  | 'quick-action'
  | 'brand'

export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  active?: boolean
  fullWidth?: boolean
  icon?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',
}

function getVariantClasses(
  variant: ButtonVariant,
  active: boolean,
  size: ButtonSize,
): string {
  switch (variant) {
    case 'primary':
      return `inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses[size]}`
    case 'accent':
      return `inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 font-semibold text-slate-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses[size]}`
    case 'secondary':
      return `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses[size]}`
    case 'outline-accent':
      return `inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses.lg}`
    case 'link':
      return 'text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 disabled:opacity-40'
    case 'link-muted':
      return 'text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-40'
    case 'danger':
      return 'text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-40'
    case 'nav':
      return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-slate-800 text-amber-400'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`
    case 'nav-dropdown':
      return `block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-700 ${
        active ? 'bg-slate-700 text-amber-400' : 'text-slate-200'
      }`
    case 'pagination':
      return active
        ? `min-w-9 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors`
        : `min-w-9 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`
    case 'quick-action':
      return 'w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 disabled:opacity-40'
    case 'brand':
      return 'flex items-center gap-3 transition-opacity hover:opacity-90'
    default:
      return sizeClasses[size]
  }
}

export function PlusIcon({ className = 'h-5 w-5 shrink-0' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  )
}

export function EditIcon({ className = 'h-5 w-5 shrink-0' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L4 13.172V16h2.828l7.38-7.379a1 1 0 00-1.414-1.414l-1.415 1.415-5.172-5.172 1.415-1.415a1 1 0 001.414 0z" />
    </svg>
  )
}

export function UploadIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const variantClass = getVariantClasses(variant, active, size)
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      className={`${variantClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
