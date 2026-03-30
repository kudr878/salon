function withBaseUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalizedBase = typeof base === 'string' && base.length > 0 ? base : '/'
  const baseWithSlash = normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseWithSlash}${trimmedPath}`
}

export const DEFAULT_MASTER_PHOTO = withBaseUrl('masters/photo-default.png')

export function masterPhotoSrc(photoId: string | null | undefined): string {
  if (photoId == null || String(photoId).trim() === '') {
    return DEFAULT_MASTER_PHOTO
  }
  const raw = String(photoId).trim()
  const filePart = /^\d+$/.test(raw) ? raw.padStart(3, '0') : raw
  return withBaseUrl(`masters/photo-${filePart}.png`)
}
