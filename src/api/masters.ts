import type { MasterFromApi, ServiceCategoryBrief } from '../types/master'

function getMastersUrl(ids?: number[]): string {
  const base = import.meta.env.VITE_API_BASE_URL
  const path = ids && ids.length > 0 ? `/api/masters?ids=${ids.join(',')}` : '/api/masters'
  if (base && typeof base === 'string' && base.length > 0) {
    const trimmed = base.replace(/\/$/, '')
    return `${trimmed}${path}`
  }
  return path
}

function isCategoryBrief(value: unknown): value is ServiceCategoryBrief {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const row = value as Record<string, unknown>
  return typeof row.id === 'number' && typeof row.name === 'string'
}

function parseCategories(raw: unknown): ServiceCategoryBrief[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined
  }
  const out: ServiceCategoryBrief[] = []
  for (let i = 0; i < raw.length; i++) {
    if (isCategoryBrief(raw[i])) {
      out.push(raw[i])
    }
  }
  return out.length > 0 ? out : undefined
}

function isMasterRow(value: unknown): value is MasterFromApi {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const row = value as Record<string, unknown>
  if (
    typeof row.id !== 'number' ||
    typeof row.fullName !== 'string' ||
    (row.photoId !== null && typeof row.photoId !== 'string')
  ) {
    return false
  }
  return true
}

export async function fetchMasters(ids?: number[]): Promise<MasterFromApi[]> {
  const url = getMastersUrl(ids)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Не удалось загрузить список мастеров.')
  }
  const data: unknown = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Некорректный ответ сервера (мастера).')
  }
  const out: MasterFromApi[] = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (!isMasterRow(item)) {
      continue
    }
    const categories = parseCategories(
      (item as Record<string, unknown>).categories,
    )
    out.push({
      id: item.id,
      fullName: item.fullName,
      photoId: item.photoId,
      categories,
    })
  }
  return out
}
