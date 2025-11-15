export function stringifyJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

export function downloadJson(data: unknown, filename: string): void {
  const payload = stringifyJson(data)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
