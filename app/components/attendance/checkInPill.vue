<template>
    <div v-if="loading"
        class="w-[200px] px-3 py-1.5 rounded-full bg-white/5 backdrop-blur flex items-center justify-center gap-2 border border-white/10 animate-pulse">
        <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span class="font-mono text-[12px] tracking-wide text-white/80">Loading…</span>
    </div>
    <button v-else @click="clockInClockout" :class="{
        'bg-white': !isClockedOut,
        'bg-gradient-to-br text-white from-green-500/40 to-green-600/50 border border-white': isClockedOut,
    }"
        class="px-3 py-1.5 w-[200px] rounded-full flex items-center justify-between gap-2 shadow-sm backdrop-blur-md transition border border-white/10">
        <span :class="{
            'text-red-700 font-bold': !isClockedOut,
            'text-white font-bold ': isClockedOut,
        }" class="font-mono text-[18px] leading-none tracking-tight opacity-60">
            {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
        </span>
        <div class="flex flex-col items-end">
            <span class="font-mono text-[10px] leading-none tracking-tight opacity-90">
                {{ displayGrossTime }}
            </span>
            <span class="font-mono text-[13px] leading-none tracking-tight opacity-60">
                {{ displayEffectiveTime }}
            </span>
        </div>
    </button>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useEmployeeAttendanceStore as useAttendanceStore } from '../../stores/organization/attendance.store'

const attendanceStore = useAttendanceStore()

/* --------------------------------------------- */
/* State & helpers                                */
/* --------------------------------------------- */

const workTimer = ref(null)
const lastFetchTime = ref(null)

const pad = (n) => n.toString().padStart(2, '0')

const att = computed(() => attendanceStore.todayAttendance ?? {})

const loading = computed(() => attendanceStore.buttonLoading)

const isClockedOut = computed(() => {
    if (!att.value.check_in) return true
    if (att.value.check_in && !att.value.check_out) return false
    return true
})

const backendGrossSeconds = ref(0)
const backendEffectiveSeconds = ref(0)
const additionalElapsedSeconds = ref(0)

const grossSecondsLive = computed(() => backendGrossSeconds.value + additionalElapsedSeconds.value)
const effectiveSecondsLive = computed(() => backendEffectiveSeconds.value + additionalElapsedSeconds.value)

/* --------------------------------------------- */
/* Timers                                         */
/* --------------------------------------------- */
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

const stopWorkTimer = () => {
    if (workTimer.value) {
        clearInterval(workTimer.value)
        workTimer.value = null
    }
}

/* --------------------------------------------- */
/* Formatting                                     */
/* --------------------------------------------- */
const formatSeconds = (secs) => {
    const safe = Math.max(0, secs || 0)
    const hr = Math.floor(safe / 3600)
    const rem = safe % 3600
    const mm = Math.floor(rem / 60)
    const ss = rem % 60
    return `${pad(hr)}:${pad(mm)}:${pad(ss)}`
}

const displayGrossTime = computed(() => !att.value.check_in ? '00:00:00' : formatSeconds(grossSecondsLive.value))
const displayEffectiveTime = computed(() => !att.value.check_in ? '00:00:00' : formatSeconds(effectiveSecondsLive.value))

/* --------------------------------------------- */
/* Actions                                        */
/* --------------------------------------------- */
const clockInClockout = async () => {
    if (isClockedOut.value) {
        await attendanceStore.clockIn()
    } else {
        await attendanceStore.clockOut()
    }

    await attendanceStore.getTodayAttendance()
    startWorkTimer()
}

/* --------------------------------------------- */
/* Lifecycle                                      */
/* --------------------------------------------- */

onMounted(async () => {
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
    stopWorkTimer()
});
</script>