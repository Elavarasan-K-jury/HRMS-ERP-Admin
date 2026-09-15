<template>
    <div class="grid grid-cols-3">
        <!-- Current Time -->
        <div class="flex flex-col items-center col-span-1">
            <p class="text-xs font-medium text-white/50">CURRENT TIME</p>
            <p class="mt-1 font-mono text-lg">{{ time }}</p>
        </div>

        <!-- Total Time -->
        <div class="flex flex-col items-center col-span-1">
            <p class="text-xs font-medium text-white/50">Total Time</p>
            <p class="mt-1 font-mono text-lg">{{ displayGrossTime }}</p>
        </div>

        <!-- Effective Time -->
        <div class="flex flex-col items-center col-span-1">
            <p class="text-xs font-medium text-white/50">Effective Time</p>
            <p class="mt-1 font-mono text-lg">{{ displayEffectiveTime }}</p>
        </div>
    </div>

    <div class="mt-4 flex justify-end">
        <!-- Clock Button -->
        <UiButton @click="clockInClockout" size="lg" rounded="full" :disabled="buttonLoading"
            :color="buttonLoading ? '#ddd' : (isClockedOut ? '#4aff7a' : '#fff')"
            class="flex items-center justify-center gap-2">
            <!-- Loading State -->
            <template v-if="buttonLoading">
                <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span class="font-mono text-sm font-semibold text-white">Loading…</span>
            </template>

            <!-- Normal State -->
            <template v-else>
                {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
            </template>
        </UiButton>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useEmployeeAttendanceStore as useAttendanceStore } from '../../stores/organization/attendance.store'

const attendanceStore = useAttendanceStore()

/* ----------------------------------------------------------
   1. Core state
---------------------------------------------------------- */
const time = ref('00:00:00')
const workTimer = ref(null)
const currentTimeTimer = ref(null)

// Store the timestamp when we fetched data from backend
const lastFetchTime = ref(null)

const pad = (n) => n.toString().padStart(2, '0')


const buttonLoading = computed(() => attendanceStore.buttonLoading);

/* ----------------------------------------------------------
   2. Null-safe derived state from store
---------------------------------------------------------- */

const att = computed(() => attendanceStore.todayAttendance ?? {})

const isClockedOut = computed(() => {
    if (!att.value.check_in) return true
    if (att.value.check_in && !att.value.check_out) return false
    return true
})

/* ----------------------------------------------------------
   3. Working time calculations (LIVE, with seconds)
---------------------------------------------------------- */

// Backend values at the time of fetch (already include current session if clocked in)
const backendGrossSeconds = ref(0)
const backendEffectiveSeconds = ref(0)

// Additional elapsed seconds since we fetched from backend
const additionalElapsedSeconds = ref(0)

// Total displayed values
const grossSecondsLive = computed(() => backendGrossSeconds.value + additionalElapsedSeconds.value)
const effectiveSecondsLive = computed(() => backendEffectiveSeconds.value + additionalElapsedSeconds.value)

const startWorkTimer = () => {
    stopWorkTimer()

    // Convert backend hours to seconds
    backendGrossSeconds.value = Math.floor((attendanceStore.grossTime ?? 0) * 3600)
    backendEffectiveSeconds.value = Math.floor((attendanceStore.effectiveTime ?? 0) * 3600)

    // Record when we got this data
    lastFetchTime.value = Date.now()

    // If user is NOT clocked in, just show backend values (no live increment)
    if (!att.value.check_in || att.value.check_out) {
        additionalElapsedSeconds.value = 0
        return
    }

    // User IS clocked in - start incrementing from the moment we fetched
    workTimer.value = setInterval(() => {
        const now = Date.now()
        additionalElapsedSeconds.value = Math.floor((now - lastFetchTime.value) / 1000)
    }, 1000)
}

const stopWorkTimer = () => {
    if (workTimer.value) {
        clearInterval(workTimer.value)
        workTimer.value = null
    }
}

/* ----------------------------------------------------------
   4. Display formatted times (HH:MM:SS)
---------------------------------------------------------- */

const formatSeconds = (secs) => {
    const safe = Math.max(0, secs || 0)
    const hr = Math.floor(safe / 3600)
    const rem = safe % 3600
    const mm = Math.floor(rem / 60)
    const ss = rem % 60
    return `${pad(hr)}:${pad(mm)}:${pad(ss)}`
}

const displayGrossTime = computed(() => {
    if (!att.value.check_in) return '00:00:00'
    return formatSeconds(grossSecondsLive.value)
})

const displayEffectiveTime = computed(() => {
    if (!att.value.check_in) return '00:00:00'
    return formatSeconds(effectiveSecondsLive.value)
})

/* ----------------------------------------------------------
   5. Clock In / Clock Out
---------------------------------------------------------- */

const clockInClockout = async () => {
    if (isClockedOut.value) {
        await attendanceStore.clockIn()
    } else {
        await attendanceStore.clockOut()
    }

    await attendanceStore.getTodayAttendance()
    startWorkTimer()
}

/* ----------------------------------------------------------
   6. Lifecycle
---------------------------------------------------------- */

onMounted(async () => {
    // Live current time
    currentTimeTimer.value = setInterval(() => {
        const now = new Date()
        time.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    }, 1000)

    await attendanceStore.getTodayAttendance()
    startWorkTimer()
})

watch(
    () => attendanceStore.todayAttendance,
    () => {
        stopWorkTimer()
        startWorkTimer()
    },
    { deep: true }
)

onBeforeUnmount(() => {
    if (currentTimeTimer.value) clearInterval(currentTimeTimer.value)
    stopWorkTimer()
});
</script>