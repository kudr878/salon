export const SALON_HOUR_FIRST = 9
export const SALON_HOUR_LAST = 19

export function salonHourOptions(): number[] {
  const out: number[] = []
  for (let h = SALON_HOUR_FIRST; h <= SALON_HOUR_LAST; h += 1) {
    out.push(h)
  }
  return out
}

export function todayDateInputValue(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateHourToIsoLocal(dateStr: string, hour: number): string {
  const parts = dateStr.split('-').map(Number)
  const y = parts[0]
  const mon = parts[1]
  const day = parts[2]
  const d = new Date(y, mon - 1, day, hour, 0, 0, 0)
  return d.toISOString()
}
