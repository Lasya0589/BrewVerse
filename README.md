# BrewVerse

A multi-page coffee ordering website (Home, Menu, Cart, Contact) built with plain HTML, CSS, and JavaScript.

## Run Locally

### Option 1: Open directly
Open `index.html` in your browser.

### Option 2: Use a local server (recommended)

```bash
cd "/Users/aluri.sailasya/Downloads/BrewVerse"
python3 -m http.server 5500
```

Then open:

- `http://localhost:5500/index.html`
- `http://localhost:5500/menu.html`
- `http://localhost:5500/cart.html`
- `http://localhost:5500/contact.html`

## Notes

- Cart data is stored in browser `localStorage`.
- Coffee images are local files inside `assets/coffee`.
- Prices are displayed in INR.
