# Universal Unit Converter

A fast, accessible, client-side unit converter for length, weight, temperature, area, volume, time, speed and data storage. No backend, no build step.

**Live demo:** https://markpatiga.github.io/universal-unit-converter/

## Tech stack

HTML, CSS and vanilla JavaScript (ES modules), tested with the Node.js built-in test runner and hosted on GitHub Pages.

## Run locally

ES modules don't load from `file://`, so serve the folder:

- VS Code: install the **Live Server** extension, then right-click `index.html` → **Open with Live Server**.
- Or, with Node.js installed: `npx serve`

## Run tests

```bash
npm test
```

## Documentation

- [Design document](docs/DESIGN.md)
- [AI-assisted workflow log](docs/AI-WORKFLOW.md)

## License

MIT
