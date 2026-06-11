# `app/pages/pdf-view.vue` — PDF Viewer Page

## Purpose

A simple PDF viewer page that loads a PDF from a URL query parameter and displays it in an iframe.

## Template

```vue
<template>
  <div class="w-full h-screen text-white flex items-center justify-center">
    <UiLoader v-if="loading" />
    <div v-else-if="!hasPdf">Missing ?url= query parameter</div>
    <div v-else class="w-full h-full">
      <div class="rounded-lg border border-white/20 bg-white/10 backdrop-blur-2xl">
        <div class="px-4 py-2.5 border-b border-white/20">
          <span>PDF Viewer</span>
          <span>{{ getFileName(pdfUrl) }}</span>
        </div>
        <div class="flex-1 bg-black">
          <iframe :src="pdfUrl" class="w-full h-full" frameborder="0" />
        </div>
      </div>
    </div>
  </div>
</template>
```

## Script Logic

```js
const rawUrl = computed(() => route.query.url || '')
const pdfUrl = computed(() => Array.isArray(rawUrl.value) ? rawUrl.value[0] : rawUrl.value)
const hasPdf = computed(() => !!pdfUrl.value)

const getFileName = (url) => {
  if (!url) return ''
  return decodeURIComponent(url.split('/').pop())
}
```

## Explanation

- Takes a `?url=` query parameter pointing to a PDF file.
- Handles both string and array query param formats.
- Displays the PDF filename in the header bar.
- Uses an `<iframe>` to render the PDF (browser-native PDF viewer).
