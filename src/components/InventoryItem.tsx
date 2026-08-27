import type { InventoryEntry, InventoryItem as InventoryItemType } from '../types/inventory'

interface InventoryItemProps {
  item: InventoryItemType
  entry: InventoryEntry
  onChange: (id: string, field: keyof InventoryEntry, value: string) => void
}

export function InventoryItem({ item, entry, onChange }: InventoryItemProps) {
  return (
    <article className={`inventory-item ${entry.count.trim() ? 'inventory-item--counted' : ''}`}>
      <div className="inventory-item__details">
        <span className="inventory-item__name">{item.name}</span>
        <span className="inventory-item__par">Par: {item.par ?? 'Not listed'}</span>
      </div>

      <div className="entry-field entry-field--count">
        <label htmlFor={`count-${item.id}`}>Count</label>
        <input
          id={`count-${item.id}`}
          className="count-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={entry.count}
          onChange={(event) => onChange(item.id, 'count', event.target.value)}
          placeholder="0"
          autoComplete="off"
          aria-label={`${item.name} count`}
        />
      </div>

      <div className="entry-field entry-field--note">
        <label htmlFor={`note-${item.id}`}>Note <span>(optional)</span></label>
        <input
          id={`note-${item.id}`}
          className="note-input"
          type="text"
          value={entry.note}
          onChange={(event) => onChange(item.id, 'note', event.target.value)}
          placeholder="e.g. 1 case open"
          autoComplete="off"
          aria-label={`${item.name} note (optional)`}
        />
      </div>
    </article>
  )
}
