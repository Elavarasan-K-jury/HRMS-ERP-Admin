# `app/layouts/default.vue` — Default Minimal Layout

## Purpose

Minimal layout used for the login page. Renders a conic-gradient background with a centered slot.

## Template

```vue
<template>
  <div class="flex bg-[conic-gradient(at_50%_50%,theme(colors.brand.500),theme(colors.plum.500),theme(colors.rust.500),theme(colors.brand.500))] w-screen h-screen">
    <main class="flex-1"><slot /></main>
  </div>
</template>
```

## Explanation

- Conic gradient background cycling through brand (blue), plum (purple), rust (orange-red), and back to brand.
- Full viewport coverage (`w-screen h-screen`).
- Simple flex layout — minimal overhead for unauthenticated pages.
