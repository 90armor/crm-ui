type Variant = 'primary' | 'secondary' | 'danger' | 'dark'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600',
  dark: 'bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900',
  secondary: 'text-gray-500 hover:text-gray-800',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const shape = variant === 'secondary' ? 'px-4 py-2' : 'px-5 py-2 rounded-xl font-semibold'
  return <button className={`text-[13px] transition-colors ${shape} ${VARIANT[variant]} ${className}`} {...props} />
}
