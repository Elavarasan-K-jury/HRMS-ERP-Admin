# checkin.vue — Attendance Clock In/Out Widget

## Purpose

Provides a full-size clock-in/out interface with live current time, gross (total) time, and effective time displays. Allows the user to clock in and out with a single button.

## Props/State

| Name                  | Type      | Description                                        |
|-----------------------|-----------|----------------------------------------------------|
| `time`                | `ref`     | Live current time (HH:MM:SS)                       |
| `workTimer`           | `ref`     | Interval ID for the work timer                     |
| `currentTimeTimer`    | `ref`     | Interval ID for the clock display                  |
| `lastFetchTime`       | `ref`     | Timestamp when backend data was last fetched        |
| `backendGrossSeconds` | `ref`     | Gross seconds from backend at fetch time            |
| `backendEffectiveSeconds` | `ref`  | Effective seconds from backend at fetch time        |
| `additionalElapsedSeconds` | `ref` | Seconds elapsed since last fetch                    |
| `buttonLoading`       | `computed`| Derived from `attendanceStore.buttonLoading`        |
| `isClockedOut`        | `computed`| True if user is clocked out                         |
| `displayGrossTime`    | `computed`| Formatted HH:MM:SS of gross time                    |
| `displayEffectiveTime`| `computed`| Formatted HH:MM:SS of effective time                |

## Template

### Time Display Header

```vue
<div class="grid grid-cols-3">
  <div class="flex flex-col items-center col-span-1">
    <p class="text-xs font-medium text-white/50">CURRENT TIME</p>
    <p class="mt-1 font-mono text-lg">{{ time }}</p>
  </div>
  <div class="flex flex-col items-center col-span-1">
    <p class="text-xs font-medium text-white/50">Total Time</p>
    <p class="mt-1 font-mono text-lg">{{ displayGrossTime }}</p>
  </div>
  <div class="flex flex-col items-center col-span-1">
    <p class="text-xs font-medium text-white/50">Effective Time</p>
    <p class="mt-1 font-mono text-lg">{{ displayEffectiveTime }}</p>
  </div>
</div>
```

### Clock Button with Loading State

```vue
<UiButton @click="clockInClockout" size="lg" rounded="full" :disabled="buttonLoading"
    :color="buttonLoading ? '#ddd' : (isClockedOut ? '#4aff7a' : '#fff')">
  <template v-if="buttonLoading">
    <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span class="font-mono text-sm font-semibold text-white">Loading…</span>
  </template>
  <template v-else>
    {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
  </template>
</UiButton>
```

## Script Logic

### Clock State Detection

```vue
const isClockedOut = computed(() => {
    if (!att.value.check_in) return true
    if (att.value.check_in && !att.value.check_out) return false
    return true
})
```

### Live Work Timer

The timer starts from the values received from the backend and increments every second while the user is clocked in:

```vue
const startWorkTimer = () => {
    stopWorkTimer()
    backendGrossSeconds.value = Math.floor((attendanceStore.grossTime ?? 0) * 3600)
    backendEffectiveSeconds.value = Math.floor((attendanceStore.effectiveTime ?? 0) * 3600)
    lastFetchTime.value = Date.now()
    if (!att.value.check_in || att.value.check_out) {
        additionalElapsedSeconds.value = 0
        return
    }
    workTimer.value = setInterval(() => {
        const now = Date.now()
        additionalElapsedSeconds.value = Math.floor((now - lastFetchTime.value) / 1000)
    }, 1000)
}
```

### Clock In/Out Action

```vue
const clockInClockout = async () => {
    if (isClockedOut.value) {
        await attendanceStore.clockIn()
    } else {
        await attendanceStore.clockOut()
    }
    await attendanceStore.getTodayAttendance()
    startWorkTimer()
}
```

### Lifecycle

On mount, a `setInterval` updates the live clock every second and attendance data is fetched. A deep watcher on `todayAttendance` restarts the work timer whenever the data changes.

## API Integration

- `attendanceStore.clockIn()` — POSTs clock-in event to backend
- `attendanceStore.clockOut()` — POSTs clock-out event to backend
- `attendanceStore.getTodayAttendance()` — GET today's attendance record

All endpoints are abstracted through `useAttendanceStore` from `../../stores/organization/attendance.store`.

## Usage

Used on the main attendance dashboard page for full-size display. Provides live tracking and clock-in/out controls.
