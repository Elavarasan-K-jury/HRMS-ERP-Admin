# `app/pages/index.vue` — Super Admin Dashboard Page

## Purpose

The main super admin dashboard showing platform-wide analytics, KPIs, charts, and service health monitoring.

## Template

```vue
<template>
  <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll grid grid-cols-12 gap-2">
    <div class="col-span-12 xl:col-span-8">
      <ChartsPlatformSummaryKpis />
      <ChartsPlatformOrgGrowth />
      <ChartsPlatformRevenueTrends />
      <ChartsPlatformUsageByModule />
      <ChartsPlatformTopOrgs />
      <ChartsPlatformSubscriptionRisk />
    </div>
    <div class="col-span-12 xl:col-span-4">
      <ChartsPlatformServiceHealth />
    </div>
  </div>
</template>
```

## Layout

```js
definePageMeta({ layout: 'auth' })
```

## Explanation

- Uses the `auth` layout (super admin authenticated layout).
- Dashboard is composed of reusable chart components:
  - **PlatformSummaryKpis** — Key metrics (total orgs, active users, revenue, etc.)
  - **PlatformOrgGrowth** — Organization growth over time
  - **PlatformRevenueTrends** — Revenue trends chart
  - **PlatformUsageByModule** — Module usage distribution
  - **PlatformTopOrgs** — Top organizations by usage
  - **PlatformSubscriptionRisk** — Subscriptions at risk chart
  - **PlatformServiceHealth** — Real-time service health monitoring
- 12-column grid layout, main content takes 8 columns, service health takes 4 columns on xl screens.
