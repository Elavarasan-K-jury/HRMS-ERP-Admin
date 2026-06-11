# `app/stores/trafficReports.store.js` — Traffic Reports Store

## Purpose

Pinia store for super admin traffic analytics dashboard with service health, latency, error breakdown, and alerts.

## State

| Field | Type | Description |
|-------|------|-------------|
| `days` | Number | Time range (1 = hourly, >1 = daily aggregation) |
| `overview` | Object | { totals: { requests, errors, errorRate }, trend: [] } |
| `services` | Array | Per-service metrics |
| `routes` | Array | Route-level metrics |
| `errors` | Array | Error breakdown by status class |
| `latency` | Object | { avgLatencyMs, minLatencyMs, maxLatencyMs } |
| `alerts` | Array | Traffic alerts |

## Key Actions

```js
async fetchAll() {
  const [overview, services, routes, errors, latency, alerts] = await Promise.all([
    $api.get(`${apiBase}/superadmin/traffic/overview`, { params: { days } }),
    $api.get(`${apiBase}/superadmin/traffic/services`, { params: { days } }),
    $api.get(`${apiBase}/superadmin/traffic/routes`),
    $api.get(`${apiBase}/superadmin/traffic/errors`),
    $api.get(`${apiBase}/superadmin/traffic/latency`),
    $api.get(`${apiBase}/superadmin/traffic/alerts`),
  ])
  // Assign all data to state
}
```

## Getters

```js
totalRequests       // Total request count
totalErrors          // Total error count
errorRate           // Error rate as percentage (2 decimal places)
avgLatency          // Average latency in ms (rounded)
serviceHealth       // Array of { name, uptime, status } computed from service errors
topRoutes           // Top 5 routes by request count
errorBreakdown      // [5xx, 4xx, 2xx] for donut chart
```

## Service Health Status

```js
status: rate > 5  ? 'unhealthy'
       : rate > 1  ? 'degraded'
                   : 'healthy'
```

## Explanation

- Fetches all analytics data in parallel for performance.
- Supports configurable time range via `days` property.
- Service health is computed from error rate (errors/requests × 100).
- Error breakdown splits into 2xx, 4xx, 5xx status classes.
- Uses separate API base URL from runtime config (`apiTrafficBase`).
