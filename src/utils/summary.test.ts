import { describe, expect, it } from 'vitest'
import type { InventoryItem } from '../types/inventory'
import { buildInventorySummary } from './summary'

const items: InventoryItem[] = [
  { id: 'napkins', section: 'Bathroom Cabinet', name: 'Napkins', par: '1 case' },
  { id: 'towels', section: 'Bathroom Cabinet', name: 'Paper Towels', par: '1 case' },
  { id: 'chai', section: 'Garage', name: 'Chai', par: '8 bottles' },
]

const summary = buildInventorySummary(
  items,
  {
    napkins: { count: '2', note: '1 case open' },
    towels: { count: '0', note: '' },
    chai: { count: '11', note: '8 + 3 bottles' },
  },
  'Morgan',
  new Date('2026-08-26T12:00:00'),
)

describe('buildInventorySummary', () => {
  it('puts counted by, date, and progress only once', () => {
    expect(summary.match(/Counted by:/g)).toHaveLength(1)
    expect(summary.match(/Date:/g)).toHaveLength(1)
    expect(summary.match(/Progress:/g)).toHaveLength(1)
  })

  it('groups completed entries under their section headings', () => {
    expect(summary.match(/Bathroom Cabinet/g)).toHaveLength(1)
    expect(summary.match(/Garage/g)).toHaveLength(1)
    expect(summary).toContain('Napkins | Count: 2 | Note: 1 case open')
    expect(summary).toContain('Paper Towels | Count: 0')
  })

  it('includes notes without exporting par configuration', () => {
    expect(summary).toContain('Chai | Count: 11 | Note: 8 + 3 bottles')
    expect(summary).not.toContain('Par:')
  })

  it('omits items that do not have a count', () => {
    const incomplete = buildInventorySummary(
      items,
      { napkins: { count: '', note: 'note only' } },
      'Morgan',
      new Date('2026-08-26T12:00:00'),
    )
    expect(incomplete).not.toContain('Napkins | Count:')
    expect(incomplete).toContain('Progress: 0 of 3 items')
  })
})
