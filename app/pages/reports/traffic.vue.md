# `app/pages/reports/traffic.vue` — Traffic Analytics Page

## Purpose

Super admin page for viewing platform-wide traffic analytics with KPIs, charts, service health, and alerts.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Traffic Analytics        [Hourly] [30d]                │
├─────────────────┬─────────────────┬─────────────────────┤
│ Requests       │ Errors          │ Error Rate  │ Latency│
├─────────────────┴─────────────────┴─────────────────────┤
│ ┌─────────────────────────┐  ┌───────────────────────┐  │
│ │ Traffic Trend (Area)    │  │ Service Health        │  │
│ │                         │  │ Service A • healthy   │  │
│ ├─────────────────────────┤  │ Service B • degraded  │  │
│ │ Latency (Line)          │  ├───────────────────────┤  │
│ │                         │  │ Errors (RadialBar)    │  │
│ ├─────────────────────────┤  │  5xx/4xx/2xx          │  │
│ │ Top Routes (Bar)        │  ├───────────────────────┤  │
│ │                         │  │ Alerts List           │  │
│ └─────────────────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Script Logic

```js
// Auto-refresh every 2 seconds
onMounted(async () => {
  await setHourly()
  refreshTimer = setInterval(() => trafficStore.fetchAll(), 2000)
})
onUnmounted(() => clearInterval(refreshTimer))

// Chart data computed from store getters
const trendSeries = computed(() => [
  { name: 'Requests', data: trendXY.value.map(p => [p.x, p.req]) },
  { name: 'Errors', data: trendXY.value.map(p => [p.x, p.err]) }
])
```

## Charts

- **Area Chart**: Requests and errors over time.
- **Line Chart**: Average, P95, and P99 latency.
- **Bar Chart**: Top 5 routes by request count.
- **RadialBar**: Error breakdown by HTTP status class (5xx, 4xx, 2xx).
- **Service Health**: Health status per service (healthy/degraded/unhealthy).
- **Alerts**: Scrollable alert list.

## Explanation

- Uses `trafficReports.store` for all data.
- Hourly (last 24h) or daily (30-day) granularity.
- Auto-refreshes every 2 seconds for near-real-time monitoring.
