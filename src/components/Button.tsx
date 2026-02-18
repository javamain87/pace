import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4C8BF5] text-[#E6EAF0] hover:bg-[#4C8BF5]/90',
  secondary:
    'bg-[#161A21] text-[#E6EAF0] border border-[#161A21] hover:bg-[#1e232c]',
  ghost:
    'bg-transparent text-[#AAB2C0] hover:bg-[#161A21] hover:text-[#E6EAF0]',
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        rounded-lg px-4 py-2 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  )
}
