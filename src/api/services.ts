import type { ServicesPayload } from '../types/services'

function getCategoriesUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base && typeof base === 'string' && base.length > 0) {
    const trimmed = base.replace(/\/$/, '')
    return `${trimmed}/api/categories`
  }
  return '/api/categories'
}

type ApiServiceRow = {
  id: number
  name: string
  price: unknown
}

type ApiCategoryRow = {
  id: number
  name: string
  services?: ApiServiceRow[]
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

function normalizeCategories(data: unknown): ServicesPayload {
  if (!Array.isArray(data)) {
    throw new Error('Некорректный ответ сервера: ожидался массив категорий.')
  }

  const categories = data.map((raw) => {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('Некорректный ответ сервера.')
    }
    const row = raw as ApiCategoryRow
    const id = Number(row.id)
    const name = row.name
    if (Number.isNaN(id) || typeof name !== 'string') {
      throw new Error('Некорректный ответ сервера: категория без id или name.')
    }
    const services = Array.isArray(row.services) ? row.services : []
    return {
      id,
      title: name,
      items: services.map((s) => ({
        name: typeof s.name === 'string' ? s.name : '',
        price: parsePrice(s.price),
      })),
    }
  })

  return { categories }
}

export async function fetchServices(): Promise<ServicesPayload> {
  const url = getCategoriesUrl()
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      'Попробуйте позже.',
    )
  }
  const data: unknown = await response.json()
  return normalizeCategories(data)
}
