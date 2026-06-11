# `assets/css/main.css` — Global Styles (Glassmorphic Scrollbars)

## Purpose

Defines custom glassmorphic scrollbar styles for the application using CSS custom properties.

## Key Styles

```css
:root {
  --sb-track: rgba(255,255,255,.06);
  --sb-thumb: linear-gradient(180deg, #8db2caAA, #392651AA, #9c3c1bAA);
}

/* Firefox */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.35) var(--sb-track); }

/* WebKit */
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-track { background: var(--sb-track); border-radius: 9999px; backdrop-filter: blur(8px); }
::-webkit-scrollbar-thumb { background: var(--sb-thumb); border-radius: 9999px; border: 3px solid transparent; background-clip: padding-box; }
```

## Utility Classes

- `.glass-scroll-thin` — 8px scrollbars for tight panels
- `.glass-scroll-hidden` — Hide scrollbar but keep scroll functionality
