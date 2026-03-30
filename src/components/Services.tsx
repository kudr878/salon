import { useEffect, useState } from 'react'
import { fetchServices } from '../api/services'
import type { ServiceCategory } from '../types/services'
import './Services.css'

function formatPriceRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Services() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchServices()
        if (!cancelled) {
          setCategories(data.categories)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="services" className="services" aria-labelledby="services-heading">
      <h2 id="services-heading" className="services-main-title">
        Услуги и цены
      </h2>

      {loading && <p className="services-status">Загрузка прайса…</p>}
      {error && (
        <p className="services-status services-status--error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="services-body">
          {categories.map((category) => (
            <div
              key={category.id}
              id={`services-${String(category.id)}`}
              className="services-block"
            >
              <h3 className="services-block-title">{category.title}</h3>
              <ul className="services-list">
                {category.items.map((item, index) => (
                  <li key={`${category.id}-${index}`} className="services-row">
                    <span className="services-name">{item.name}</span>
                    <span className="services-dots" aria-hidden="true" />
                    <span className="services-price">{formatPriceRub(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
