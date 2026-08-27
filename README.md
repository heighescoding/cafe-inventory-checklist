# cafe-inventory-checklist

A simple, responsive web app for counting cafe inventory from any device. Users can search by inventory area, enter numeric counts with optional notes, review their progress, and export or share a polished Excel summary without needing an account or backend.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```

## Architecture

- React + TypeScript + Vite
- Static inventory data stored in the client
- No backend, database, authentication, or paid hosting required
- Styled `.xlsx` summary generated entirely in the browser with ExcelJS
- Human-readable text summary available for email and clipboard sharing
- GitHub Pages deployment after changes reach `main`


## Revision 3.3

- App palette is guided by burgundy, pale blue, slate, indigo, and midnight navy.
- Excel count cells show whole numbers without decimal punctuation and preserve decimal places only when the user entered them.
