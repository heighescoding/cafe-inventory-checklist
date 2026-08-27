import { describe, expect, it } from 'vitest'
import { inventoryItems, sectionOrder } from './inventory'

describe('inventory data', () => {
  it('contains all 63 named checklist items', () => {
    expect(inventoryItems).toHaveLength(63)
  })

  it('contains unique item ids', () => {
    const ids = inventoryItems.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('contains all five physical sections', () => {
    expect(new Set(inventoryItems.map((item) => item.section))).toEqual(new Set(sectionOrder))
  })

  it('does not create an unnamed garage item for the orphaned par value', () => {
    expect(inventoryItems.every((item) => item.name.trim().length > 0)).toBe(true)
    expect(inventoryItems.filter((item) => item.section === 'Garage')).toHaveLength(3)
  })
})
