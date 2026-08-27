import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import type { InventoryItem } from '../types/inventory'
import { buildInventoryWorkbook } from './exportWorkbook'

const items: InventoryItem[] = [
  { id: 'napkins', section: 'Bathroom Cabinet', name: 'Napkins', par: '1 case' },
  { id: 'towels', section: 'Bathroom Cabinet', name: 'Paper Towels', par: '1 case' },
  { id: 'chai', section: 'Garage', name: 'Chai', par: '8 bottles' },
  { id: 'almond', section: 'Garage', name: 'Almond Milk', par: '4 cases' },
]

async function loadWorkbook() {
  const buffer = await buildInventoryWorkbook(
    items,
    {
      napkins: { count: '2', note: '1 case open' },
      towels: { count: '0', note: '' },
      chai: { count: '2.50', note: 'decimal entered intentionally' },
      almond: { count: '', note: '' },
    },
    'Morgan',
    new Date('2026-08-26T12:00:00'),
  )

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  return workbook
}

describe('buildInventoryWorkbook', () => {
  it('keeps the grouped summary structure', async () => {
    const workbook = await loadWorkbook()
    const sheet = workbook.getWorksheet('Inventory Summary')
    expect(sheet).toBeDefined()
    expect(sheet?.getCell('A1').value).toBe('Counted By')
    expect(sheet?.getCell('B1').value).toBe('Morgan')
    expect(sheet?.getCell('A4').value).toBe('Bathroom Cabinet')
    expect(sheet?.getCell('A5').value).toBe('Item')
    expect(sheet?.getCell('B5').value).toBe('Count')
    expect(sheet?.getCell('C5').value).toBe('Note')
  })

  it('uses readable widths and wrapped notes', async () => {
    const workbook = await loadWorkbook()
    const sheet = workbook.getWorksheet('Inventory Summary')!
    expect(sheet.getColumn(1).width).toBe(32)
    expect(sheet.getColumn(2).width).toBe(14)
    expect(sheet.getColumn(3).width).toBe(44)
    expect(sheet.getCell('C6').alignment.wrapText).toBe(true)
  })

  it('keeps integer counts free of decimal punctuation and preserves entered decimal precision', async () => {
    const workbook = await loadWorkbook()
    const sheet = workbook.getWorksheet('Inventory Summary')!
    expect(sheet.getCell('B6').value).toBe(2)
    expect(sheet.getCell('B6').numFmt).toBe('0')
    expect(sheet.getCell('B7').value).toBe(0)
    expect(sheet.getCell('B7').numFmt).toBe('0')
    expect(sheet.getCell('B11').value).toBe(2.5)
    expect(sheet.getCell('B11').numFmt).toBe('0.00')
  })

  it('styles section headings and highlights genuinely blank counts', async () => {
    const workbook = await loadWorkbook()
    const sheet = workbook.getWorksheet('Inventory Summary')!
    const sectionFill = sheet.getCell('A4').fill
    expect(sectionFill.type).toBe('pattern')
    if (sectionFill.type === 'pattern') {
      expect(sectionFill.fgColor?.argb).toBe('FF355A4A')
    }
    const blankCountFill = sheet.getCell('B12').fill
    expect(blankCountFill.type).toBe('pattern')
    if (blankCountFill.type === 'pattern') {
      expect(blankCountFill.fgColor?.argb).toBe('FFFFF5DA')
    }
  })
})
