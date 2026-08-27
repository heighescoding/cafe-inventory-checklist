export function canShareFile(file: File): boolean {
  return typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
}

export async function shareInventoryFile(file: File): Promise<void> {
  await navigator.share({
    title: 'Cafe Inventory Summary',
    text: 'Completed cafe inventory summary.',
    files: [file],
  })
}

export async function copyInventorySummary(summary: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = summary
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) throw new Error('Clipboard copy was not available.')
}

export function openInventoryEmail(summary: string): void {
  const subject = encodeURIComponent('Cafe Inventory Summary')
  const body = encodeURIComponent(summary)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}
