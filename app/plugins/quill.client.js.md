# `app/plugins/quill.client.js` — Quill Rich Text Editor Plugin

## Purpose

Client-side plugin that provides the Quill rich text editor instance via `$quill` for use in payslip template editing.

## Key Code

```js
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: { quill: Quill },
  }
})
```

## Explanation

- Provides the Quill editor constructor globally as `$quill`.
- Imports the Quill Snow theme CSS.
- Client-side only (`.client.js`) since Quill requires DOM access.
- Used in payslip template editor for EJS template content editing.
