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

function buildButtonClass(
  variant: ButtonVariant,
  active: boolean,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
): string {
  const classes = ['btn', `btn--${size}`]

  if (fullWidth) classes.push('btn--full')

  switch (variant) {
    case 'primary':
      classes.push('btn--primary')
      break
    case 'accent':
      classes.push('btn--accent')
      break
    case 'secondary':
      classes.push('btn--secondary')
      break
    case 'outline-accent':
      classes.push('btn--outline-accent', 'btn--lg')
      break
    case 'link':
      classes.push('btn--link')
      break
    case 'link-muted':
      classes.push('btn--link-muted')
      break
    case 'danger':
      classes.push('btn--danger')
      break
    case 'nav':
      classes.push('btn--nav')
      if (active) classes.push('btn--nav-active')
      break
    case 'nav-dropdown':
      classes.push('btn--nav-dropdown')
      if (active) classes.push('btn--nav-dropdown-active')
      break
    case 'pagination':
      classes.push(active ? 'btn--pagination-active' : 'btn--pagination')
      break
    case 'quick-action':
      classes.push('btn--quick-action')
      break
    case 'brand':
      classes.push('btn--brand')
      break
    default:
      break
  }

  if (className) classes.push(className)

  return classes.join(' ')
}

export function PlusIcon({ className = 'btn-icon' }: { className?: string }) {
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

export function EditIcon({ className = 'btn-icon' }: { className?: string }) {
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

export function UploadIcon({ className = 'btn-icon btn-icon--sm' }: { className?: string }) {
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
  return (
    <button
      type={type}
      className={buildButtonClass(variant, active, size, fullWidth, className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
