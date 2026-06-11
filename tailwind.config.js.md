# `tailwind.config.js` — Tailwind CSS Configuration

## Purpose

Extends Tailwind CSS with a custom color palette (brand, plum, rust, clay, neutral) and utility classes for the HRMS glassmorphic theme.

## Custom Color Palette

```js
colors: {
  brand: { /* 50→900, primary blue #1b6594 */ },
  plum: { /* 50→900, purple #392651 */ },
  clay: { /* 50→900, warm brown #a27a65 */ },
  rust: { /* 50→900, orange-red #9c3c1b */ },
  neutral: { /* 50→900, dark #111827 */ },
}
```

## Key Features

- **Dark Mode**: Class-based (`class` strategy, toggled via `<html>` or `<body>`).
- **Safelist**: Dynamically generated classes like `bg-brand-500`, `text-plum-300`, `border-rust-700` are preserved from purging using regex pattern matching.
- **Content Paths**: Scans `app/components/`, `app/layouts/`, `app/pages/`, `app/composables/`, `app/stores/`, and `app/app.vue`.
- **Chart/Grid/Tooltip**: Custom chart background, grid border color, and tooltip theme for dark-themed charts.
- **Border Radius**: `xl: 1rem`, `2xl: 1.25rem`.
