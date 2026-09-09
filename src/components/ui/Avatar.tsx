import { getInitials } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps) {
  const label = `${firstName} ${lastName}`

  if (src) {
    return (
      <img
        src={src}
        alt={`Photo de ${label}`}
        className={cn('rounded-full object-cover border-2 border-indigo-400/25 flex-shrink-0 bg-slate-700', sizes[size], className)}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-indigo-500/50 to-violet-500/40 border-2 border-indigo-400/25 flex items-center justify-center flex-shrink-0 font-semibold text-indigo-100',
        sizes[size],
        className,
      )}
      role="img"
      aria-label={`Avatar de ${label}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  )
}
