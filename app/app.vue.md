# `app/app.vue` — Root Vue Component

## Purpose

The root component of the application that wraps all pages with a layout and sets up the document head metadata.

## Template

```vue
<template>
  <NuxtLayout>
    <NuxtPage :key="route.fullPath" />
  </NuxtLayout>
</template>
```

## Script Logic

```js
import { useHeadStore } from './stores/shared/head.store'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'

const route = useRoute()
const headStore = useHeadStore()
const headData = computed(() => headStore.getHead)
useHead(headData)
```

## Explanation

- Uses `NuxtLayout` to render the current layout (auth, default, employee, or organization).
- `NuxtPage` renders the current route page, keyed by `route.fullPath` to force re-render on navigation.
- `useHead` dynamically sets the document title and meta description from the `headStore`.
- Imports global CSS files: `transitions.css` and `main.css`.
