import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getPropertyPhoto } from '../../lib/demoImages'
import type { Property } from '../../types'

interface PropertyImageProps {
  property: Property
  className?: string
  aspect?: 'card' | 'hero'
}

export function PropertyImage({ property, className, aspect = 'card' }: PropertyImageProps) {
  const [failed, setFailed] = useState(false)
  const src = getPropertyPhoto(property.id, property.photos)

  return (
    <div className={cn('property-image', aspect === 'hero' ? 'property-image--hero' : 'property-image--card', className)}>
      {!failed ? (
        <img
          src={src}
          alt=""
          role="presentation"
          className="property-image__img"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="property-image__fallback" aria-hidden>
          <Building2 size={32} strokeWidth={1.25} />
        </div>
      )}
    </div>
  )
}
