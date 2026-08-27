import { useMemo, useState } from 'react'
import './App.css'
import { InventoryReview } from './components/InventoryReview'
import { InventorySection } from './components/InventorySection'
import { SearchBar } from './components/SearchBar'
import { SectionTabs } from './components/SectionTabs'
import { inventoryItems, sectionOrder } from './data/inventory'
import type { InventoryEntries, InventoryEntry } from './types/inventory'
import {
  buildInventoryWorkbook,
  downloadInventoryWorkbook,
  makeWorkbookFile,
  makeWorkbookSupportProbe,
} from './utils/exportWorkbook'
import { buildInventorySummary } from './utils/summary'
import { canShareFile, copyInventorySummary, openInventoryEmail, shareInventoryFile } from './utils/shareInventory'

function makeWorkbookFilename(date: Date): string {
  const day = date.toISOString().slice(0, 10)
  return `cafe-inventory-summary-${day}.xlsx`
}

export default function App() {
  const [countedBy, setCountedBy] = useState('')
  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState<string>(sectionOrder[0])
  const [entries, setEntries] = useState<InventoryEntries>({})
  const [reviewing, setReviewing] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [notice, setNotice] = useState('')

  const completedCount = inventoryItems.filter((item) => entries[item.id]?.count.trim()).length

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return inventoryItems.filter((item) => {
      const inSection = activeSection === 'All' || item.section === activeSection
      const matchesSearch = !normalized || `${item.name} ${item.section} ${item.par ?? ''}`.toLowerCase().includes(normalized)
      return inSection && matchesSearch
    })
  }, [query, activeSection])

  const itemsBySection = useMemo(() => sectionOrder.map((section) => ({
    section,
    items: filteredItems.filter((item) => item.section === section),
  })).filter(({ items }) => items.length > 0), [filteredItems])

  const handleEntryChange = (id: string, field: keyof InventoryEntry, value: string) => {
    setEntries((current) => ({
      ...current,
      [id]: {
        count: current[id]?.count ?? '',
        note: current[id]?.note ?? '',
        [field]: value,
      },
    }))
  }

  const handleReview = () => {
    setCompletedAt(new Date())
    setNotice('')
    setReviewing(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const getSummary = () => {
    const date = completedAt ?? new Date()
    return buildInventorySummary(inventoryItems, entries, countedBy, date)
  }

  const getWorkbook = async () => {
    const date = completedAt ?? new Date()
    return {
      workbook: await buildInventoryWorkbook(inventoryItems, entries, countedBy, date),
      filename: makeWorkbookFilename(date),
    }
  }

  const handleDownload = async () => {
    setNotice('')
    try {
      const { workbook, filename } = await getWorkbook()
      downloadInventoryWorkbook(workbook, filename)
    } catch {
      setNotice('The Excel summary could not be created. Please try again.')
    }
  }

  const handleShare = async () => {
    setNotice('')
    try {
      const { workbook, filename } = await getWorkbook()
      await shareInventoryFile(makeWorkbookFile(workbook, filename))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setNotice('Sharing did not complete. Use Download summary for the Excel file, or Copy summary for text.')
    }
  }

  const handleCopy = async () => {
    setNotice('')
    try {
      await copyInventorySummary(getSummary())
      setNotice('Inventory summary copied.')
    } catch {
      setNotice('Copying did not complete. Use Download summary instead.')
    }
  }

  if (reviewing && completedAt) {
    const summary = getSummary()
    const filename = makeWorkbookFilename(completedAt)
    return (
      <>
        <InventoryReview
          countedBy={countedBy}
          completedAt={completedAt}
          items={inventoryItems}
          entries={entries}
          onBack={() => setReviewing(false)}
          onDownload={handleDownload}
          onShare={handleShare}
          onEmail={() => openInventoryEmail(summary)}
          onCopy={handleCopy}
          shareSupported={canShareFile(makeWorkbookSupportProbe(filename))}
        />
        {notice && <div className="toast" role="alert">{notice}</div>}
      </>
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Cafe Inventory Checklist</h1>
        <p className="intro">Work through each area, enter the count you find, then export the finished inventory.</p>
        <label className="counter-label" htmlFor="counted-by">Counted by</label>
        <input
          id="counted-by"
          className="name-input"
          type="text"
          value={countedBy}
          onChange={(event) => setCountedBy(event.target.value)}
          placeholder="Your name"
          autoComplete="name"
        />
      </header>

      <div className="sticky-tools">
        <div className="progress-row" aria-live="polite">
          <div><strong>{completedCount} of {inventoryItems.length}</strong><span> counted</span></div>
          <span>{Math.round((completedCount / inventoryItems.length) * 100)}%</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${(completedCount / inventoryItems.length) * 100}%` }} />
        </div>
        <SearchBar query={query} onChange={setQuery} />
        <SectionTabs sections={sectionOrder} activeSection={activeSection} onChange={setActiveSection} />
      </div>

      <div className="inventory-content">
        {itemsBySection.map(({ section, items }) => (
          <InventorySection
            key={section}
            title={section}
            items={items}
            entries={entries}
            onEntryChange={handleEntryChange}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="empty-state">
            <h2>No inventory items found</h2>
            <p>Try a different search or section.</p>
          </div>
        )}
      </div>

      <div className="submit-wrap">
        <button className="primary-button submit-button" type="button" onClick={handleReview}>
          Review &amp; submit summary
        </button>
      </div>
    </main>
  )
}
