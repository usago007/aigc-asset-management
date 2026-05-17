export function normalizeSearchText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSearchText(item)).join(' ').trim()
  }
  return String(value).toLowerCase().trim()
}

export function matchesKeyword(keyword: string, values: unknown[]): boolean {
  const normalizedKeyword = normalizeSearchText(keyword)
  if (!normalizedKeyword) return true

  return values.some((value) => normalizeSearchText(value).includes(normalizedKeyword))
}
