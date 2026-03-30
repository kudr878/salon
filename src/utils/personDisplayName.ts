/** Для ФИО в формате «Фамилия Имя Отчество» — возвращает имя (второе слово). */
export function givenNameFromFullNameRu(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter((p) => p.length > 0)
  if (parts.length >= 2) {
    return parts[1]
  }
  return parts[0] ?? ''
}
