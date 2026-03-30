import { useEffect, useMemo, useState } from 'react'
import { fetchMasters } from '../api/masters'
import { fetchBookingCatalog } from '../api/bookingCatalog'
import {
  siteCancelAppointment,
  siteCreateAppointment,
  siteListAppointments,
  siteMasterBookedHours,
  type SiteAppointment,
} from '../api/site'
import { useAuth } from '../context/AuthContext'
import type { MasterFromApi } from '../types/master'
import type { BookingCategory } from '../types/booking'
import {
  SALON_HOUR_FIRST,
  SALON_HOUR_LAST,
  dateHourToIsoLocal,
  salonHourOptions,
  todayDateInputValue,
} from '../utils/salonCalendar'
import './ProfilePage.css'

type ProfileTab = 'book' | 'records'

function formatPriceRub(value: unknown): string {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : 0
  if (Number.isNaN(n)) {
    return '—'
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatSlot(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string): string {
  if (status === 'ACTIVE') {
    return 'Активна'
  }
  if (status === 'COMPLETED') {
    return 'Завершена'
  }
  if (status === 'CANCELLED') {
    return 'Отменена'
  }
  return status
}

export default function ProfilePage() {
  const { token, client, sessionLoading, openLogin, openRegister, refreshClient } =
    useAuth()

  const [tab, setTab] = useState<ProfileTab>('book')

  const [categories, setCategories] = useState<BookingCategory[]>([])
  const [masters, setMasters] = useState<MasterFromApi[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)

  const [categoryId, setCategoryId] = useState('')
  const [picked, setPicked] = useState<Record<number, boolean>>({})
  const [masterId, setMasterId] = useState('')
  const [dateStr, setDateStr] = useState(todayDateInputValue)
  const [hour, setHour] = useState('')
  const [bookedHours, setBookedHours] = useState<Set<number>>(new Set())

  const [appointments, setAppointments] = useState<SiteAppointment[]>([])
  const [apptLoading, setApptLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelId, setCancelId] = useState<number | null>(null)

  useEffect(() => {
    setFormError(null)
  }, [tab])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setCatalogLoading(true)
      setCatalogError(null)
      try {
        const [cats, ms] = await Promise.all([fetchBookingCatalog(), fetchMasters()])
        if (!cancelled) {
          setCategories(cats)
          setMasters(ms)
        }
      } catch (e) {
        if (!cancelled) {
          setCatalogError(e instanceof Error ? e.message : 'Ошибка загрузки')
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setAppointments([])
      return
    }
    let cancelled = false
    setApptLoading(true)
    siteListAppointments(token)
      .then((rows) => {
        if (!cancelled) {
          setAppointments(rows)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAppointments([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setApptLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, client?.id])

  const servicesInCategory = useMemo(() => {
    const id = Number(categoryId)
    if (Number.isNaN(id)) {
      return []
    }
    const cat = categories.find((c) => c.id === id)
    return cat ? cat.services : []
  }, [categories, categoryId])

  const mastersInCategory = useMemo(() => {
    const id = Number(categoryId)
    if (Number.isNaN(id)) {
      return []
    }
    return masters.filter((m) =>
      (m.categories || []).some((c) => c.id === id),
    )
  }, [masters, categoryId])

  useEffect(() => {
    if (!token || !masterId || !dateStr) {
      setBookedHours(new Set())
      return
    }
    let cancelled = false
    siteMasterBookedHours(token, Number(masterId), dateStr)
      .then((hours) => {
        if (!cancelled) {
          setBookedHours(new Set(hours))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBookedHours(new Set())
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, masterId, dateStr])

  useEffect(() => {
    if (hour !== '' && bookedHours.has(Number(hour))) {
      setHour('')
    }
  }, [bookedHours, hour])

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoryId(e.target.value)
    setPicked({})
    setMasterId('')
    setHour('')
    setFormError(null)
  }

  function toggleService(id: number) {
    setPicked((prev) => ({ ...prev, [id]: !prev[id] }))
    setFormError(null)
  }

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormOk(null)
    if (!token) {
      return
    }
    if (!categoryId) {
      setFormError('Выберите категорию')
      return
    }
    const ids = Object.keys(picked)
      .filter((k) => picked[Number(k)])
      .map(Number)
    if (ids.length === 0) {
      setFormError('Выберите хотя бы одну услугу')
      return
    }
    if (!masterId) {
      setFormError('Выберите мастера')
      return
    }
    if (!dateStr || hour === '') {
      setFormError('Выберите дату и свободный час')
      return
    }
    setSubmitting(true)
    try {
      await siteCreateAppointment(token, {
        masterId: Number(masterId),
        scheduledAt: dateHourToIsoLocal(dateStr, Number(hour)),
        serviceIds: ids,
      })
      setFormOk('Запись создана')
      setHour('')
      const rows = await siteListAppointments(token)
      setAppointments(rows)
      await refreshClient()
      const h = await siteMasterBookedHours(token, Number(masterId), dateStr)
      setBookedHours(new Set(h))
      setTab('records')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось записаться')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(apptId: number) {
    if (!token) {
      return
    }
    setCancelId(apptId)
    setFormError(null)
    try {
      await siteCancelAppointment(token, apptId)
      const rows = await siteListAppointments(token)
      setAppointments(rows)
      if (masterId && dateStr) {
        const h = await siteMasterBookedHours(token, Number(masterId), dateStr)
        setBookedHours(new Set(h))
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось отменить')
    } finally {
      setCancelId(null)
    }
  }

  return (
    <div className="profile-page" aria-label="Личный кабинет">
      <div className="profile-shell">
        <aside className="profile-sidebar" aria-label="Разделы кабинета">
          <div className="profile-sidebar-brand">Личный кабинет</div>
          <nav className="profile-sidebar-nav">
            <button
              type="button"
              className={
                tab === 'book' ? 'profile-sidebar-link profile-sidebar-link--active' : 'profile-sidebar-link'
              }
              onClick={() => setTab('book')}
            >
              Записаться
            </button>
            <button
              type="button"
              className={
                tab === 'records'
                  ? 'profile-sidebar-link profile-sidebar-link--active'
                  : 'profile-sidebar-link'
              }
              onClick={() => setTab('records')}
            >
              Ваши записи
            </button>
          </nav>
          <a className="profile-sidebar-home" href="#hero">
            ← На главную
          </a>
        </aside>

        <main className="profile-main">
          {sessionLoading && <p className="booking-hint">Проверка входа…</p>}

          {!sessionLoading && !token && (
            <div className="booking-guest">
              <h1 className="profile-main-title">Добро пожаловать</h1>
              <p className="booking-guest-text">
                Войдите или зарегистрируйтесь по номеру телефона, чтобы записаться к мастеру и
                просматривать свои визиты.
              </p>
              <div className="booking-guest-actions">
                <button type="button" className="booking-pill" onClick={openLogin}>
                  Войти
                </button>
                <button type="button" className="booking-pill" onClick={openRegister}>
                  Регистрация
                </button>
              </div>
            </div>
          )}

          {!sessionLoading && token && client && (
            <>
              {tab === 'book' && (
                <>
                  <h1 className="profile-main-title">Новая запись</h1>
                  <p className="booking-welcome">
                    {client.fullName}
                  </p>

                  {catalogLoading && <p className="booking-hint">Загрузка услуг…</p>}
                  {catalogError && (
                    <p className="booking-error" role="alert">
                      {catalogError}
                    </p>
                  )}

                  {!catalogLoading && !catalogError && (
                    <form className="booking-form" onSubmit={handleBookSubmit}>
                      <label className="booking-field">
                        Категория
                        <select value={categoryId} onChange={handleCategoryChange} required>
                          <option value="">— Выберите —</option>
                          {categories.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      {servicesInCategory.length > 0 && (
                        <div className="booking-services">
                          <span className="booking-field-label">Услуги</span>
                          <ul className="booking-service-checks">
                            {servicesInCategory.map((s) => (
                              <li key={s.id}>
                                <label className="booking-check">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(picked[s.id])}
                                    onChange={() => toggleService(s.id)}
                                  />
                                  <span>
                                    {s.name} — {formatPriceRub(s.price)}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <label className="booking-field">
                        Мастер
                        <select
                          value={masterId}
                          onChange={(e) => {
                            setMasterId(e.target.value)
                            setHour('')
                            setFormError(null)
                          }}
                          required
                          disabled={!categoryId || mastersInCategory.length === 0}
                        >
                          <option value="">— Выберите мастера —</option>
                          {mastersInCategory.map((m) => (
                            <option key={m.id} value={String(m.id)}>
                              {m.fullName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="booking-row">
                        <label className="booking-field">
                          Дата
                          <input
                            type="date"
                            value={dateStr}
                            onChange={(e) => {
                              setDateStr(e.target.value)
                              setHour('')
                            }}
                            required
                            disabled={!masterId}
                          />
                        </label>
                        <label className="booking-field">
                          Час ({SALON_HOUR_FIRST}:00–{SALON_HOUR_LAST}:00)
                          <select
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            required
                            disabled={!masterId || !dateStr}
                          >
                            <option value="">— Час —</option>
                            {salonHourOptions().map((h) => (
                              <option key={h} value={String(h)} disabled={bookedHours.has(h)}>
                                {h}:00{bookedHours.has(h) ? ' — занято' : ''}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {formError && (
                        <p className="booking-error" role="alert">
                          {formError}
                        </p>
                      )}
                      {formOk && <p className="booking-ok">{formOk}</p>}

                      <button type="submit" className="booking-submit" disabled={submitting}>
                        {submitting ? 'Отправка…' : 'Записаться'}
                      </button>
                    </form>
                  )}
                </>
              )}

              {tab === 'records' && (
                <>
                  <h1 className="profile-main-title">Ваши записи</h1>
                  <p className="booking-welcome">{client.fullName}</p>

                  {apptLoading && <p className="booking-hint">Загрузка…</p>}
                  {!apptLoading && appointments.length === 0 && (
                    <p className="booking-hint">Пока нет записей.</p>
                  )}
                  {!apptLoading && appointments.length > 0 && (
                    <ul className="booking-appt-list">
                      {appointments.map((a) => (
                        <li key={a.id} className="booking-appt-item">
                          <div className="booking-appt-main">
                            <span className="booking-appt-time">{formatSlot(a.scheduledAt)}</span>
                            <span className="booking-appt-master">{a.master.fullName}</span>
                            <span className="booking-appt-status">{statusLabel(a.status)}</span>
                            <span className="booking-appt-price">{formatPriceRub(a.priceToPay)}</span>
                          </div>
                          <div className="booking-appt-services">
                            {a.services.map((s) => s.name).join(', ')}
                          </div>
                          {a.status === 'ACTIVE' && (
                            <button
                              type="button"
                              className="booking-cancel"
                              disabled={cancelId === a.id}
                              onClick={() => handleCancel(a.id)}
                            >
                              {cancelId === a.id ? 'Отмена…' : 'Отменить запись'}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {formError && (
                    <p className="booking-error profile-records-error" role="alert">
                      {formError}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
