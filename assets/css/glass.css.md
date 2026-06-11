# `assets/css/glass.css` — Glassmorphic UI Component Styles

## Purpose

Provides reusable CSS classes for the glassmorphic design system used throughout the application.

## Key Classes

```css
/* Base glass card */
.glass-card {
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(18px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

/* Hover micro-interaction */
.glass-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.35);
  background: rgba(255,255,255,0.10);
}

/* Gradient ring for hero cards */
.glass-ring::before {
  background: conic-gradient(from 140deg, #8db2ca66, #39265166, #9c3c1b66, #8db2ca66);
  filter: blur(8px);
}

/* Compact scroll areas inside cards */
.glass-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
```

## Explanation

- **glass-card**: Primary card style with frosted glass effect.
- **glass-hover**: Subtle lift effect on hover for interactive cards.
- **glass-ring**: Conic gradient border ring effect for hero/prominent cards.
- **glass-scroll**: Thin custom scrollbar for scrollable card content areas.
