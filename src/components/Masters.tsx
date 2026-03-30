import { useEffect, useState } from 'react'
import { fetchMasters } from '../api/masters'
import {
  FEATURED_MASTER_ORDER,
  getFeaturedStory,
} from '../data/featuredMasterStories'
import type { MasterFromApi } from '../types/master'
import MasterAvatar from './MasterAvatar'
import './Masters.css'

function formatDirections(m: MasterFromApi): string {
  const cats = m.categories
  if (!cats || cats.length === 0) {
    return ''
  }
  const sorted = [...cats].sort((a, b) => a.id - b.id)
  const parts: string[] = []
  for (let i = 0; i < sorted.length; i++) {
    parts.push(sorted[i].name)
  }
  return parts.join(' · ')
}

function pickFeatured(all: MasterFromApi[]): MasterFromApi[] {
  const map = new Map<number, MasterFromApi>()
  for (let i = 0; i < all.length; i++) {
    map.set(all[i].id, all[i])
  }
  const out: MasterFromApi[] = []
  for (let k = 0; k < FEATURED_MASTER_ORDER.length; k++) {
    const id = FEATURED_MASTER_ORDER[k]
    const row = map.get(id)
    if (row) {
      out.push(row)
    }
  }
  return out
}

function pickOthers(all: MasterFromApi[]): MasterFromApi[] {
  const featuredSet = new Set<number>([...FEATURED_MASTER_ORDER])
  return all.filter((m) => !featuredSet.has(m.id))
}

export default function Masters() {
  const [masters, setMasters] = useState<MasterFromApi[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchMasters()
        if (!cancelled) {
          setMasters(list)
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

  const featured = pickFeatured(masters)
  const others = pickOthers(masters)

  return (
    <section id="masters" className="masters" aria-labelledby="masters-heading">
      <h2 id="masters-heading" className="masters-title">
        Наши мастера
      </h2>

      {loading && <p className="masters-status">Загрузка…</p>}
      {error && (
        <p className="masters-status masters-status--error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {featured.length > 0 && (
            <div className="masters-featured-block">
              <h3 className="masters-subtitle">Ведущие специалисты</h3>
              <div className="masters-spotlight-list">
                {featured.map((m) => {
                  const story = getFeaturedStory(m.id)
                  const directions = formatDirections(m)
                  if (!story) {
                    return null
                  }
                  return (
                    <article key={m.id} className="masters-spotlight">
                      <div className="masters-spotlight-photo">
                        <div className="masters-avatar-wrap masters-avatar-wrap--large">
                          <MasterAvatar
                            photoId={m.photoId}
                            name={m.fullName}
                            className="masters-avatar"
                          />
                        </div>
                      </div>
                      <div className="masters-spotlight-body">
                        <h4 className="masters-spotlight-name">{m.fullName}</h4>
                        <div className="masters-spotlight-section">
                          <p className="masters-spotlight-label">Направления</p>
                          {directions ? (
                            <p className="masters-spotlight-directions">{directions}</p>
                          ) : (
                            <p className="masters-spotlight-directions masters-spotlight-directions--muted">
                              Категории уточняются в салоне
                            </p>
                          )}
                        </div>
                        <div className="masters-spotlight-section">
                          <p className="masters-spotlight-label">Чем занимается</p>
                          <p className="masters-spotlight-text">{story.about}</p>
                        </div>
                        <div className="masters-spotlight-section">
                          <p className="masters-spotlight-label">Опыт</p>
                          <p className="masters-spotlight-text">{story.experience}</p>
                        </div>
                        <div className="masters-spotlight-section">
                          <p className="masters-spotlight-label">Награды и обучение</p>
                          <p className="masters-spotlight-text">{story.awards}</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="masters-others-block">
              {featured.length > 0 && (
                <h3 className="masters-subtitle">Команда</h3>
              )}
              <ul className="masters-grid">
                {others.map((m) => (
                  <li key={m.id} className="masters-card">
                    <div className="masters-avatar-wrap">
                      <MasterAvatar
                        photoId={m.photoId}
                        name={m.fullName}
                        className="masters-avatar"
                      />
                    </div>
                    <p className="masters-name">{m.fullName}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
