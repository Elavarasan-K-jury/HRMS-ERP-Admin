# `app/stores/head.store.js` — Document Head Meta Store

## Purpose

Simple Pinia store for managing the document `<title>` and meta description.

## State & Getter

```js
export const useHeadStore = defineStore('Head', {
  state: () => ({
    title: 'Jury-HRMS | ADMIN',
    desciption: 'Jury-HRMS | ADMIN',
  }),
  getters: {
    getHead: (state) => ({
      title: state.title,
      desciption: state.desciption,
    }),
  },
})
```

## Explanation

- Provides a reactive `getHead` getter used by `app.vue` via `useHead()`.
- Currently static but can be extended to return dynamic titles per page.
