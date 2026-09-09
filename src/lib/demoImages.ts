/** Images de démo locales — fiables hors-ligne */
export const profileAvatars: Record<string, string> = {
  p1: '/demo/avatars/p1.svg',
  p2: '/demo/avatars/p2.svg',
  p3: '/demo/avatars/p3.svg',
  p4: '/demo/avatars/p4.svg',
  p5: '/demo/avatars/p5.svg',
  p6: '/demo/avatars/p6.svg',
  p7: '/demo/avatars/p7.svg',
  p8: '/demo/avatars/p8.svg',
}

export const propertyPhotos: Record<string, string> = {
  b1: '/demo/properties/b1.svg',
  b2: '/demo/properties/b2.svg',
  b3: '/demo/properties/b3.svg',
  b4: '/demo/properties/b4.svg',
  b5: '/demo/properties/b5.svg',
  b6: '/demo/properties/b6.svg',
  b7: '/demo/properties/b7.svg',
  b8: '/demo/properties/b8.svg',
  b9: '/demo/properties/b9.svg',
  b10: '/demo/properties/b10.svg',
}

export function getProfileAvatar(profileId: string, firstName: string, lastName: string): string {
  return profileAvatars[profileId] ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=3d3d42&color=f5f5f0&size=200`
}

export function getPropertyPhoto(propertyId: string, photos: string[]): string {
  if (photos[0]?.startsWith('/')) return photos[0]
  return propertyPhotos[propertyId] ?? '/demo/properties/b1.svg'
}
