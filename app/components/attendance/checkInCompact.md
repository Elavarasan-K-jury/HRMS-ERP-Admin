# checkInCompact.vue — Compact Attendance Clock In/Out

## Purpose

A more compact version of the attendance widget, using a 2-column (xl:12-column) grid layout. Shows current time, total time, and effective time in separate panels, with a clock-in/out button.

## Props/State

| Name                  | Type      | Description                                        |
|-----------------------|-----------|----------------------------------------------------|
| `time`                | `ref`     | Live current time (HH:MM:SS)                       |
| `workTimer`           | `ref`     | Interval ID for work time increment                |
| `currentTimeTimer`    | `ref`     | Interval ID for clock display                      |
| `lastFetchTime`       | `ref`     | Timestamp of last backend fetch                    |
| `backendGrossSeconds` | `ref`     | Gross seconds from backend                         |
| `backendEffectiveSeconds` | `ref`  | Effective seconds from backend                     |
| `additionalElapsedSeconds` | `ref` | Seconds elapsed since last fetch                   |
| `buttonLoading`       | `computed`| Derived from `attendanceStore.buttonLoading`        |
| `isClockedOut`        | `computed`| True if user is clocked out                         |
| `displayGrossTime`    | `computed`| Formatted HH:MM:SS gross time                      |
| `displayEffectiveTime`| `computed`| Formatted HH:MM:SS effective time                  |

## Template

### Grid Layout (2 cols → 12 cols on xl)

```vue
<div class="grid grid-cols-2 xl:grid-cols-12 shadow-[0_18px_60px_rgba(0,0,0,0.85)] border border-white/20 bg-indigo-600/50 rounded-lg gap-2 p-2 w-full max-w-4xl">
  <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
    <p class="text-xs font-medium text-white/60">Current Time</p>
    <p class="font-mono text-lg">{{ time }}</p>
  </div>
  <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
    <p class="text-xs font-medium text-white/60">Total Time</p>
    <p class="font-mono text-lg">{{ displayGrossTime }}</p>
  </div>
  <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
    <p class="text-xs font-medium text-white/60">Effective Time</p>
    <p class="font-mono text-lg">{{ displayEffectiveTime }}</p>
  </div>
  <UiButton @click="clockInClockout" size="lg" rounded="lg" :disabled="buttonLoading"
      :color="buttonLoading ? '#ddd' : (isClockedOut ? '#4aff7a' : '#fff')"
      class="flex xl:col-span-3 items-center justify-center gap-2">
    {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
  </UiButton>
</div>
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

### Live Timer & Formatting

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

### Clock In/Out

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

- `attendanceStore.clockIn()` — Clock in request
- `attendanceStore.clockOut()` — Clock out request
- `attendanceStore.getTodayAttendance()` — Fetch today's attendance
- `attendanceStore.todayAttendance` — Reactive store data
- `attendanceStore.grossTime` / `attendanceStore.effectiveTime` — Time values

## Usage

Used on dashboard pages where a horizontally compact attendance widget is needed. The responsive grid adapts from 2 to 12 columns.
