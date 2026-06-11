# `app/plugins/apexcharts.client.js` — ApexCharts Plugin

## Purpose

Client-side plugin that registers the `vue3-apexcharts` component globally as `<apexchart />`.

## Key Code

```js
import VueApexCharts from 'vue3-apexcharts'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('apexchart', VueApexCharts)
})
```

## Explanation

- Registers ApexCharts globally so chart components can use `<apexchart>` without manual imports.
- Uses `vue3-apexcharts` wrapper for Vue 3 compatibility.
- Client-side only (`.client.js`) since ApexCharts requires browser APIs.
