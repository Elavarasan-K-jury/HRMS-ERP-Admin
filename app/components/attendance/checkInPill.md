# checkInPill.vue — Pill-Shaped Attendance Widget

## Purpose

A minimal pill-shaped attendance widget showing gross and effective time in a compact badge. Designed for header/navbar placement with a small footprint.

## Props/State

| Name                  | Type      | Description                                        |
|-----------------------|-----------|----------------------------------------------------|
| `workTimer`           | `ref`     | Interval ID for live work timer                    |
| `lastFetchTime`       | `ref`     | Timestamp of last backend data fetch               |
| `backendGrossSeconds` | `ref`     | Gross seconds from backend                         |
| `backendEffectiveSeconds` | `ref`  | Effective seconds from backend                     |
| `additionalElapsedSeconds` | `ref` | Seconds elapsed since last backend fetch           |
| `loading`             | `computed`| Derived from `attendanceStore.buttonLoading`        |
| `isClockedOut`        | `computed`| Derived from `todayAttendance.check_in/check_out`  |
| `displayGrossTime`    | `computed`| Formatted HH:MM:SS gross time                      |
| `displayEffectiveTime`| `computed`| Formatted HH:MM:SS effective time                  |

## Template

### Loading Skeleton

```vue
<div v-if="loading"
    class="w-[200px] px-3 py-1.5 rounded-full bg-white/5 backdrop-blur flex items-center justify-center gap-2 border border-white/10 animate-pulse">
  <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">...</svg>
  <span class="font-mono text-[12px] tracking-wide text-white/80">Loading…</span>
</div>
```

### Button State

```vue
<button v-else @click="clockInClockout" :class="{
    'bg-white': !isClockedOut,
    'bg-gradient-to-br text-white from-green-500/40 to-green-600/50 border border-white': isClockedOut,
}"
    class="px-3 py-1.5 w-[200px] rounded-full flex items-center justify-between gap-2 ...">
  <span :class="{ 'text-red-700 font-bold': !isClockedOut, 'text-white font-bold': isClockedOut }">
    {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
  </span>
  <div class="flex flex-col items-end">
    <span class="font-mono text-[10px]">{{ displayGrossTime }}</span>
    <span class="font-mono text-[13px]">{{ displayEffectiveTime }}</span>
  </div>
</button>
```

## Script Logic

### Clock State

```vue
const isClockedOut = computed(() => {
    if (!att.value.check_in) return true
    if (att.value.check_in && !att.value.check_out) return false
    return true
})
```

### Live Timer

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

## API Integration

Same as other check-in components — uses `useAttendanceStore`:
- `attendanceStore.clockIn()`
- `attendanceStore.clockOut()`
- `attendanceStore.getTodayAttendance()`
- `attendanceStore.grossTime` / `attendanceStore.effectiveTime`

## Usage

Placed in the app header or navbar as a persistent attendance badge. Does not display a live clock, only work times. The 200px pill fits neatly in a toolbar.
