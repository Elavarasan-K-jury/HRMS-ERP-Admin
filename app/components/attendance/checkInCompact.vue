<template>
    <div
        class="grid grid-cols-2 xl:grid-cols-12 shadow-[0_18px_60px_rgba(0,0,0,0.85)] border border-white/20 bg-indigo-600/50 rounded-lg gap-2 p-2 w-full max-w-4xl">
        <!-- Current Time -->
        <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
            <p class="text-xs font-medium text-white/60">Current Time</p>
            <p class="font-mono text-lg">{{ time }}</p>
        </div>

        <!-- Total Time Today -->
        <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
            <p class="text-xs font-medium text-white/60">Total Time</p>
            <p class="font-mono text-lg">{{ displayGrossTime }}</p>
        </div>

        <!-- Effective Time Today -->
        <div class="flex xl:col-span-3 justify-between items-center bg-white/10 p-3 rounded-lg">
            <p class="text-xs font-medium text-white/60">Effective Time</p>
            <p class="font-mono text-lg">{{ displayEffectiveTime }}</p>
        </div>

        <!-- Clock Button -->
        <UiButton @click="clockInClockout" size="lg" rounded="lg" :disabled="buttonLoading"
            :color="buttonLoading ? '#ddd' : (isClockedOut ? '#4aff7a' : '#fff')"
            class="flex xl:col-span-3 items-center justify-center gap-2">
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

const time = ref('00:00:00')
const workTimer = ref(null)
const currentTimeTimer = ref(null)
const lastFetchTime = ref(null)

const pad = (n) => n.toString().padStart(2, '0')

const buttonLoading = computed(() => attendanceStore.buttonLoading);
const att = computed(() => attendanceStore.todayAttendance ?? {})

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

const clockInClockout = async () => {
    if (isClockedOut.value) {
        await attendanceStore.clockIn()
    } else {
        await attendanceStore.clockOut()
    }

    await attendanceStore.getTodayAttendance()
    startWorkTimer()
}

onMounted(async () => {
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