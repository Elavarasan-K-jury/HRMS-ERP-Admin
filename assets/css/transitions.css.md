# `assets/css/transitions.css` — Page & Layout Transitions

## Purpose

Defines Vue transition animations for page navigation and layout changes.

## Key Styles

```css
/* Page transition: fade + slide up */
.page-enter-active, .page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

/* Layout transition: fade + scale */
.layout-enter-active, .layout-leave-active {
  transition: all 0.5s ease-in-out;
}
.layout-enter-from, .layout-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
```

## Explanation

- **Page transitions**: 0.4s with fade + 15px upward slide.
- **Layout transitions**: 0.5s with fade + scale from 1.2 to 1.
- Both are `out-in` mode (leave completes before enter starts).
- Referenced in `nuxt.config.js` under `app.pageTransition` and `app.layoutTransition`.
