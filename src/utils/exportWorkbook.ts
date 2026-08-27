import ExcelJS from 'exceljs'
import type { InventoryEntries, InventoryItem } from '../types/inventory'

const workbookMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const palette = {
  deepGreen: 'FF355A4A',
  sage: 'FFDDE9E2',
  cream: 'FFFAF7F0',
  warmGold: 'FFE8C77A',
  softGold: 'FFFFF5DA',
  white: 'FFFFFFFF',
  text: 'FF2F352F',
  muted: 'FF6D756E',
  border: 'FFD9DDD8',
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: 'thin', color: { argb: palette.border } },
    left: { style: 'thin', color: { argb: palette.border } },
    bottom: { style: 'thin', color: { argb: palette.border } },
    right: { style: 'thin', color: { argb: palette.border } },
  }
}

function fill(color: string): ExcelJS.Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: color },
  }
}

function countNumberFormat(rawCount: string): string {
  const decimalMatch = rawCount.match(/^\d+\.(\d+)$/)
  if (!decimalMatch) return '0'
  return `0.${'0'.repeat(decimalMatch[1].length)}`
}

export async function buildInventoryWorkbook(
  items: InventoryItem[],
  entries: InventoryEntries,
  countedBy: string,
  completedAt: Date,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Cafe Inventory Checklist'
  workbook.created = completedAt

  const worksheet = workbook.addWorksheet('Inventory Summary', {
    views: [{ showGridLines: false }],
    properties: { defaultRowHeight: 20 },
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
  })

  worksheet.columns = [
    { key: 'item', width: 32 },
    { key: 'count', width: 14 },
    { key: 'note', width: 44 },
  ]

  const countedByRow = worksheet.addRow(['Counted By', countedBy.trim() || 'Not provided'])
  const dateRow = worksheet.addRow(['Date', completedAt.toLocaleDateString()])
  worksheet.addRow([])

  ;[countedByRow, dateRow].forEach((row) => {
    worksheet.mergeCells(row.number, 2, row.number, 3)
    const label = row.getCell(1)
    label.font = { bold: true, color: { argb: palette.deepGreen } }
    label.fill = fill(palette.sage)
    label.alignment = { vertical: 'middle' }
    label.border = thinBorder()

    const value = row.getCell(2)
    value.font = { color: { argb: palette.text } }
    value.fill = fill(palette.cream)
    value.alignment = { vertical: 'middle', wrapText: true }
    value.border = thinBorder()
    row.height = 24
  })

  const sections = [...new Set(items.map((item) => item.section))]

  sections.forEach((section, sectionIndex) => {
    const sectionRow = worksheet.addRow([section])
    worksheet.mergeCells(sectionRow.number, 1, sectionRow.number, 3)
    const sectionCell = sectionRow.getCell(1)
    sectionCell.font = { bold: true, size: 13, color: { argb: palette.white } }
    sectionCell.fill = fill(palette.deepGreen)
    sectionCell.alignment = { vertical: 'middle', horizontal: 'left' }
    sectionCell.border = thinBorder()
    sectionRow.height = 28

    const headerRow = worksheet.addRow(['Item', 'Count', 'Note'])
    headerRow.eachCell((cell, columnNumber) => {
      cell.font = { bold: true, color: { argb: palette.deepGreen } }
      cell.fill = fill(palette.sage)
      cell.alignment = { vertical: 'middle', horizontal: columnNumber === 2 ? 'center' : 'left' }
      cell.border = thinBorder()
    })
    headerRow.height = 24

    items
      .filter((item) => item.section === section)
      .forEach((item, itemIndex) => {
        const entry = entries[item.id] ?? { count: '', note: '' }
        const count = entry.count.trim()
        const note = entry.note.trim()
        const parsedCount = Number(count)
        const countValue = count === '' || !Number.isFinite(parsedCount) ? '' : parsedCount
        const itemRow = worksheet.addRow([item.name, countValue, note])
        const isBlank = count === ''
        const rowFill = isBlank ? palette.softGold : itemIndex % 2 === 0 ? palette.white : palette.cream

        itemRow.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
          cell.fill = fill(rowFill)
          cell.font = { color: { argb: isBlank ? palette.muted : palette.text } }
          cell.border = thinBorder()
          cell.alignment = {
            vertical: 'top',
            horizontal: columnNumber === 2 ? 'center' : 'left',
            wrapText: true,
          }
        })

        itemRow.getCell(1).font = { bold: true, color: { argb: isBlank ? palette.muted : palette.text } }
        if (count !== '') itemRow.getCell(2).numFmt = countNumberFormat(count)
        const estimatedLines = Math.max(1, Math.ceil(item.name.length / 28), Math.ceil(note.length / 42))
        itemRow.height = Math.min(72, 24 + (estimatedLines - 1) * 16)
      })

    if (sectionIndex < sections.length - 1) {
      const spacer = worksheet.addRow([])
      spacer.height = 9
    }
  })

  const rawBuffer = await workbook.xlsx.writeBuffer()
  return rawBuffer as unknown as ArrayBuffer
}

export function makeWorkbookFile(workbook: ArrayBuffer, filename: string): File {
  return new File([workbook], filename, { type: workbookMime })
}

export function makeWorkbookSupportProbe(filename: string): File {
  return new File([new ArrayBuffer(0)], filename, { type: workbookMime })
}

export function downloadInventoryWorkbook(workbook: ArrayBuffer, filename: string): void {
  const blob = new Blob([workbook], { type: workbookMime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
