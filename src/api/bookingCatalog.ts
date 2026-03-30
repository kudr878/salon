import type { BookingCategory } from '../types/booking'

function apiPath(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base && typeof base === 'string' && base.length > 0) {
    return `${base.replace(/\/$/, '')}${path}`
  }
  return path
}

function parsePrice(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const n = Number(value)
    if (!Number.isNaN(n)) {
      return n
    }
  }
  return 0
}

export async function fetchBookingCatalog(): Promise<BookingCategory[]> {
  const response = await fetch(apiPath('/api/categories'))
  if (!response.ok) {
    throw new Error('Не удалось загрузить категории услуг.')
  }
  const data: unknown = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Некорректный ответ сервера.')
  }
  const out: BookingCategory[] = []
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (typeof row !== 'object' || row === null) {
      continue
    }
    const r = row as Record<string, unknown>
    const id = Number(r.id)
    const name = r.name
    if (Number.isNaN(id) || typeof name !== 'string') {
      continue
    }
    const servicesRaw = Array.isArray(r.services) ? r.services : []
    const services = servicesRaw
      .map((s) => {
        if (typeof s !== 'object' || s === null) {
          return null
        }
        const sv = s as Record<string, unknown>
        const sid = Number(sv.id)
        const sname = sv.name
        if (Number.isNaN(sid) || typeof sname !== 'string') {
          return null
        }
        return {
          id: sid,
          name: sname,
          price: parsePrice(sv.price),
        }
      })
      .filter((x): x is { id: number; name: string; price: number } => x !== null)
    out.push({ id, name, services })
  }
  return out
}
