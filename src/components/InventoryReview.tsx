import { sectionOrder } from '../data/inventory'
import type { InventoryEntries, InventoryItem } from '../types/inventory'

interface InventoryReviewProps {
  countedBy: string
  completedAt: Date
  items: InventoryItem[]
  entries: InventoryEntries
  onBack: () => void
  onDownload: () => void
  onShare: () => void
  onEmail: () => void
  onCopy: () => void
  shareSupported: boolean
}

export function InventoryReview({
  countedBy,
  completedAt,
  items,
  entries,
  onBack,
  onDownload,
  onShare,
  onEmail,
  onCopy,
  shareSupported,
}: InventoryReviewProps) {
  const missingItems = items.filter((item) => !entries[item.id]?.count.trim())
  const completed = items.length - missingItems.length
  const completedItems = items.filter((item) => entries[item.id]?.count.trim())

  return (
    <main className="app-shell review-shell">
      <button className="text-button" type="button" onClick={onBack}>← Back to inventory</button>
      <section className="review-card">
        <p className="review-kicker">Inventory Review</p>
        <h1>{completed === items.length ? 'Inventory complete' : 'Ready to export'}</h1>
        <dl className="review-meta">
          <div><dt>Counted by</dt><dd>{countedBy.trim() || 'Not provided'}</dd></div>
          <div><dt>Date</dt><dd>{completedAt.toLocaleDateString()}</dd></div>
          <div><dt>Progress</dt><dd>{completed} of {items.length} items</dd></div>
        </dl>

        {missingItems.length > 0 && (
          <div className="missing-box" role="status">
            <strong>{missingItems.length} item{missingItems.length === 1 ? '' : 's'} still blank.</strong>
            <p>You can still export this summary, or go back and finish the missing counts.</p>
            <details>
              <summary>Show missing items</summary>
              <ul>{missingItems.map((item) => <li key={item.id}>{item.name} — {item.section}</li>)}</ul>
            </details>
          </div>
        )}

        <details className="completed-review">
          <summary>Review summary ({completedItems.length})</summary>
          <div className="completed-review__content">
            {sectionOrder.map((section) => {
              const sectionItems = completedItems.filter((item) => item.section === section)
              if (sectionItems.length === 0) return null
              return (
                <div className="review-section" key={section}>
                  <h2>{section}</h2>
                  <div className="review-section__headers" aria-hidden="true">
                    <span>Item</span><span>Count</span><span>Note</span>
                  </div>
                  <ul>
                    {sectionItems.map((item) => {
                      const entry = entries[item.id]
                      return (
                        <li key={item.id}>
                          <span className="review-item-name">{item.name}</span>
                          <strong className="review-count">{entry.count}</strong>
                          <span className="review-note">{entry.note.trim() || '—'}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </details>

        <div className="review-actions">
          <button className="primary-button" type="button" onClick={onDownload}>Download summary</button>
          {shareSupported && <button className="secondary-button" type="button" onClick={onShare}>Share summary</button>}
          <button className="secondary-button" type="button" onClick={onEmail}>Email summary</button>
          <button className="secondary-button" type="button" onClick={onCopy}>Copy summary</button>
        </div>
        {!shareSupported && <p className="support-note">Excel file sharing is not supported by this browser. Use Download summary for the Excel file, or Copy summary for text.</p>}
      </section>
    </main>
  )
}
