interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeStyles = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
}

export function Spinner({ size = "md", className = "" }: SpinnerProps): JSX.Element {
  return (
    <div
      className={`${sizeStyles[size]} border-[#00a884] border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}
