# `package.json` — Project Dependencies

## Purpose

Defines the project metadata, scripts, and all npm dependencies for the Jury HRMS Admin panel.

## Key Scripts

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "PORT=3030 HOST=0.0.0.0 nuxt dev",
    "generate": "nuxt generate",
    "preview": "PORT=3030 HOST=0.0.0.0 nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `nuxt` ^4.2.0 | Core framework |
| `vue` ^3.5.22 | UI framework |
| `pinia` ^3.0.3 | State management |
| `@pinia/nuxt` | Nuxt Pinia integration |
| `@nuxtjs/tailwindcss` | Tailwind CSS module |
| `@nuxt/icon` | Icon component |
| `axios` ^1.13.1 | HTTP client |
| `apexcharts` ^5.3.5 | Charting library |
| `vue3-apexcharts` | Vue 3 ApexCharts wrapper |
| `crypto-js` ^4.2.0 | AES encryption/decryption |
| `@vueup/vue-quill` ^1.2.0 | Rich text editor |
| `quill` ^2.0.3 | Text editor engine |
| `quill-delta` ^5.1.0 | Quill document model |
| `jspdf` ^3.0.4 | PDF generation |
| `jspdf-autotable` | PDF table plugin |
| `socket.io-client` ^4.8.3 | WebSocket client |
| `izitoast` ^1.4.0 | Toast notifications |
| `nuxt-toast` | Nuxt toast integration |
| `vue-router` ^4.6.3 | Client-side routing |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `@iconify-json/heroicons-outline` | Heroicons outline icons |
| `@iconify-json/heroicons-solid` | Heroicons solid icons |
| `@iconify-json/lucide` | Lucide icons |
