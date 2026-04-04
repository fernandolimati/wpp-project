import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  primary: "bg-[#00a884] text-white hover:bg-[#008069]",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-300",
  ghost: "text-gray-600 hover:bg-gray-100",
}

const sizeStyles = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
