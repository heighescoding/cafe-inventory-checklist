import type { InventoryEntries, InventoryEntry, InventoryItem } from '../types/inventory'
import { InventoryItem as InventoryItemRow } from './InventoryItem'

interface InventorySectionProps {
  title: string
  items: InventoryItem[]
  entries: InventoryEntries
  onEntryChange: (id: string, field: keyof InventoryEntry, value: string) => void
}

export function InventorySection({ title, items, entries, onEntryChange }: InventorySectionProps) {
  return (
    <section className="inventory-section" aria-labelledby={`section-${title.replaceAll(' ', '-').toLowerCase()}`}>
      <div className="section-heading">
        <h2 id={`section-${title.replaceAll(' ', '-').toLowerCase()}`}>{title}</h2>
        <span>{items.length} items</span>
      </div>
      <div className="inventory-list">
        {items.map((item) => (
          <InventoryItemRow
            key={item.id}
            item={item}
            entry={entries[item.id] ?? { count: '', note: '' }}
            onChange={onEntryChange}
          />
        ))}
      </div>
    </section>
  )
}
