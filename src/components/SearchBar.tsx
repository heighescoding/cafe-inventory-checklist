interface SearchBarProps {
  query: string
  onChange: (query: string) => void
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="search-wrap">
      <label className="sr-only" htmlFor="inventory-search">Search inventory</label>
      <input
        id="inventory-search"
        className="search-input"
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search inventory..."
        autoComplete="off"
      />
    </div>
  )
}
