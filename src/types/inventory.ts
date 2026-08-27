export interface InventoryItem {
  id: string
  section: string
  name: string
  par: string | null
}

export interface InventoryEntry {
  count: string
  note: string
}

export type InventoryEntries = Record<string, InventoryEntry>
