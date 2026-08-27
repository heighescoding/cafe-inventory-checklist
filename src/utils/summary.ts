import type { InventoryEntries, InventoryItem } from '../types/inventory'

export function buildInventorySummary(
  items: InventoryItem[],
  entries: InventoryEntries,
  countedBy: string,
  completedAt: Date,
): string {
  const completedItems = items.filter((item) => entries[item.id]?.count.trim())
  const sections = [...new Set(items.map((item) => item.section))]
  const lines = [
    'Cafe Inventory Summary',
    `Counted by: ${countedBy.trim() || 'Not provided'}`,
    `Date: ${completedAt.toLocaleDateString()}`,
    `Progress: ${completedItems.length} of ${items.length} items`,
    '',
  ]

  sections.forEach((section) => {
    const sectionItems = completedItems.filter((item) => item.section === section)
    if (sectionItems.length === 0) return

    lines.push(section)
    sectionItems.forEach((item) => {
      const entry = entries[item.id]
      const note = entry.note.trim()
      lines.push(`${item.name} | Count: ${entry.count.trim()}${note ? ` | Note: ${note}` : ''}`)
    })
    lines.push('')
  })

  return lines.join('\r\n').trimEnd()
}

export function downloadInventorySummary(summary: string, filename: string): void {
  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
