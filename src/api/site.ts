function apiPath(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base && typeof base === 'string' && base.length > 0) {
    return `${base.replace(/\/$/, '')}${path}`
  }
  return path
}

export type SiteClient = {
  id: number
  fullName: string
  birthDate: string
  gender: string
  phone: string
  email: string
  bonusCard: string
}

async function parseError(response: Response): Promise<string> {
  if (response.status === 404) {
    return 'Попробуйте позже.'
  }
  try {
    const data = (await response.json()) as { error?: string; message?: string }
    if (data && typeof data.error === 'string') {
      return data.error
    }
    if (data && typeof data.message === 'string') {
      return data.message
    }
  } catch {
    /* ignore */
  }
  return `Ошибка ${String(response.status)}`
}

export async function siteRegister(body: {
  fullName: string
  birthDate: string
  gender: 'M' | 'F'
  phone: string
  email: string
  password: string
}): Promise<{ token: string; client: SiteClient }> {
  const response = await fetch(apiPath('/api/site/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<{ token: string; client: SiteClient }>
}

export async function siteLogin(
  phone: string,
  password: string,
): Promise<{ token: string; client: SiteClient }> {
  const response = await fetch(apiPath('/api/site/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<{ token: string; client: SiteClient }>
}

export async function siteMe(token: string): Promise<{ ok: boolean; client: SiteClient }> {
  const response = await fetch(apiPath('/api/site/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<{ ok: boolean; client: SiteClient }>
}

export type SiteAppointment = {
  id: number
  masterId: number
  clientId: number
  scheduledAt: string
  status: string
  priceToPay: unknown
  master: { id: number; fullName: string }
  services: { id: number; name: string; price: unknown }[]
}

export async function siteListAppointments(token: string): Promise<SiteAppointment[]> {
  const response = await fetch(apiPath('/api/site/appointments'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<SiteAppointment[]>
}

export async function siteCreateAppointment(
  token: string,
  body: { masterId: number; scheduledAt: string; serviceIds: number[] },
): Promise<SiteAppointment> {
  const response = await fetch(apiPath('/api/site/appointments'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<SiteAppointment>
}

export async function siteCancelAppointment(
  token: string,
  appointmentId: number,
): Promise<unknown> {
  const response = await fetch(
    apiPath(`/api/site/appointments/${String(appointmentId)}/cancel`),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json()
}

export async function siteMasterBookedHours(
  token: string,
  masterId: number,
  date: string,
): Promise<number[]> {
  const q = new URLSearchParams({
    masterId: String(masterId),
    date,
  })
  const response = await fetch(apiPath(`/api/site/master-booked-hours?${q.toString()}`), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  const data = (await response.json()) as { bookedHours?: number[] }
  return Array.isArray(data.bookedHours) ? data.bookedHours : []
}
