# `app/stores/theme.store.js` — Theme & UI State Store

## Purpose

Pinia store managing UI theme settings: sidebar state, background color, preloader, and color picker options.

## State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `preloader` | Boolean | `true` | Show/hide loading screen |
| `sidebar` | Boolean | `true` | Sidebar expanded/collapsed |
| `bgColor` | String | `'#0b283b'` | Current background color (HEX) |
| `bgColors` | Array | `[...]` | Available color themes with shades |

## Color Palette

```js
bgColors: [
  { label: 'Brand', key: 'brand', color: '#0b283b', shades: [700, 800, 900] },
  { label: 'Rust', key: 'rust', color: '#3e180b', shades: [700, 800, 900] },
  { label: 'Plum', key: 'plum', color: '#170f20', shades: [700, 800, 900] },
  { label: 'Clay', key: 'clay', color: '#413128', shades: [700, 800, 900] },
  { label: 'Neutral', key: 'neutral', color: '#070a10', shades: [700, 800, 900] },
  // Tailwind defaults: Red, Blue, Green, Yellow, Orange, Purple, Pink, Lime, Teal, Cyan
]
```

## Key Actions

```js
toggleSidebar()        // Toggle sidebar expanded/collapsed
loadColor()            // Load saved color from localStorage
updateColor(color, shade) // Update bg color and persist to localStorage
```

## Explanation

- Background color is persisted in `localStorage` under key `bgColor`.
- The `UiColorSidebar` component uses this store to let users pick theme colors.
- Preloader is shown on initial load and during auth transitions.
