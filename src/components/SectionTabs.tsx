interface SectionTabsProps {
  sections: readonly string[]
  activeSection: string
  onChange: (section: string) => void
}

export function SectionTabs({ sections, activeSection, onChange }: SectionTabsProps) {
  return (
    <nav className="section-tabs" aria-label="Inventory sections">
      {[...sections, 'All'].map((section) => (
        <button
          key={section}
          type="button"
          className={`section-tab ${activeSection === section ? 'section-tab--active' : ''}`}
          aria-pressed={activeSection === section}
          onClick={() => onChange(section)}
        >
          {section}
        </button>
      ))}
    </nav>
  )
}
