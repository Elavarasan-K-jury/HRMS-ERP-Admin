# `app/pages/reports/usage.vue` — Real-time Usage Monitoring Page

## Purpose

Super admin page for real-time API usage monitoring via Socket.IO WebSocket connection with live KPIs and time-series charts.

## Features

- **Real-time KPIs**: RPS (requests per second), Errors, Avg Latency, P95 Latency.
- **Live Charts**: Traffic flow area chart and latency movement line chart, updating every 60ms.
- **Organization Scoping**: Filter by specific organization or view all.
- **Connection Status**: LIVE/OFFLINE indicator.
- **Time-series Buffer**: Capped at 180 data points (sliding window).

## Script Logic

```js
// Socket.IO connection with auth token
async function connectSocket(orgId = null) {
  const io = await loadSocketIO()
  socket.value = io(runtimeConfig.public.apiUsageUrl, {
    transports: ["websocket"],
    auth: { token: authStore.accessToken, organizationId: orgId },
  })

  // Initial snapshot
  socket.value.on("usage:timeseries", (payload) => {
    timeseries.value = payload.map(p => ({
      ts: Number(p.ts), rps: p.requests ?? p.rps ?? 0,
      errors: p.errors ?? 0, latency: p.avgLatency ?? 0,
    })).slice(-MAX_POINTS)
  })

  // Real-time updates
  socket.value.on("usage:metrics", (p) => {
    metrics.value = { rps: p.rps, errors: p.errors, avgLatency: p.avgLatency, p95Latency: p.p95Latency }
    timeseries.value.push({ ts: p.ts || Date.now(), rps: p.rps ?? 0, ... })
  })
}

// Socket.IO loader (CDN fallback)
function loadSocketIO() {
  if (window.io) return Promise.resolve(window.io)
  const s = document.createElement("script")
  s.src = "https://cdn.socket.io/4.7.2/socket.io.min.js"
  s.onload = () => resolve(window.io)
  document.head.appendChild(s)
}
```

## Chart Features

- **Traffic Flow**: Stacked area chart, cyan requests + pink errors, smooth curves, gradient fill.
- **Latency Movement**: Line chart, purple, smooth curve, 4px stroke.
- **Time Format**: All timestamps displayed in IST (Indian Standard Time).
- **Dynamic Animation**: 60ms animation speed for smooth real-time updates.

## Lifecycle

- On mount: loads organizations dropdown, connects socket (global view).
- On org change: disconnects old socket, resets UI, connects new socket.
- On unmount: disconnects socket, clears interval.

## Explanation

- Uses WebSocket protocol for lowest-latency real-time data.
- Socket.IO loaded dynamically from CDN (not bundled).
- Initial snapshot loads historical data, then real-time events stream updates.
- 180 data point buffer prevents memory issues during long sessions.
