<template>
    <section
        class="h-full rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-4 md:p-5 flex flex-col gap-4">
        <header>
            <p class="text-[11px] uppercase tracking-[0.28em] text-white/40 font-semibold">
                Actions
            </p>
        </header>

        <!-- Single card: left | right -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <!-- LEFT: clock + total hours -->
            <div class="space-y-4">
                <div class="rounded-lg bg-white/5 border border-white/10 p-4 space-y-1">
                    <p class="text-[11px] uppercase tracking-widest text-white/45">Current Time</p>
                    <p class="font-mono text-3xl sm:text-4xl font-semibold text-white tabular-nums"
                        data-testid="current-time">
                        {{ timeLabel }}
                    </p>
                    <p class="text-xs text-white/55" data-testid="current-date">{{ dateLabel }}</p>
                </div>

                <div class="rounded-lg bg-white/5 border border-white/10 p-3 space-y-2">
                    <p class="text-[11px] uppercase tracking-[0.22em] text-white/40 font-semibold">Total Hours</p>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center sm:text-left">
                            <p class="text-[11px] text-white/45 mb-0.5">Effective</p>
                            <p class="font-mono text-lg text-white/90" data-testid="effective-hours">{{ effectiveLabel
                                }}</p>
                        </div>
                        <div class="text-center sm:text-left border-l border-white/10 pl-3">
                            <p class="text-[11px] text-white/45 mb-0.5">Gross</p>
                            <p class="font-mono text-lg text-white/90" data-testid="gross-hours">{{ grossLabel }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: single clock action + since last login + action links -->
            <div class="space-y-3 md:border-l md:border-white/10 md:pl-4">
                <UiButton data-testid="clock-toggle" size="lg" rounded="lg"
                    :color="buttonLoading ? '#ddd' : (isClockedOut ? '#fff' : '#4aff7a')"
                    :disabled="buttonLoading" class="w-full" @click="onClockToggle">
                    <template v-if="buttonLoading">
                        <span class="font-mono text-sm font-semibold text-white">Loading…</span>
                    </template>
                    <template v-else>
                        {{ isClockedOut ? 'Clock In' : 'Clock Out' }}
                    </template>
                </UiButton>

                <div class="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
                    <span class="text-xs text-white/55">Since Last Login</span>
                    <span class="font-mono text-sm text-white/85" data-testid="since-last-login">{{ sinceLastLoginLabel
                        }}</span>
                </div>

                <nav class="flex flex-col divide-y divide-white/5 rounded-lg border border-white/10 overflow-hidden bg-white/5"
                    aria-label="Attendance quick actions">
                    <button v-for="action in quickActions" :key="action.id" type="button"
                        class="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/10 focus:outline-none focus-visible:bg-white/10"
                        :data-testid="action.testId" @click="onQuickAction(action)">
                        <span
                            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-white/60 group-hover:text-white transition">
                            <Icon :name="action.icon" class="h-4 w-4" />
                        </span>
                        <span class="text-sm text-white/75 group-hover:text-white transition">{{ action.label }}</span>
                        <Icon name="lucide:chevron-right"
                            class="ml-auto h-4 w-4 text-white/25 group-hover:text-white/50 transition" />
                    </button>
                </nav>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEmployeeAttendanceStore as useClockAttendanceStore } from '../../stores/organization/attendance.store'

const props = defineProps({
    mock: {
        type: Object,
        default: () => ({
            sinceLastLogin: '0h 17m',
            effectiveHours: '4h 14m',
            grossHours: '5h 08m'
        })
    }
})

const emit = defineEmits(['quick-action', 'clock-out', 'clock-in'])

const clockStore = useClockAttendanceStore()

const pad = (n) => String(n).padStart(2, '0')

const now = ref(new Date())
let timer = null

const timeLabel = computed(() => {
    const d = now.value
    let h = d.getHours()
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`
})

const dateLabel = computed(() =>
    now.value.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
)

const formatHoursDuration = (hours) => {
    const totalMin = Math.max(0, Math.round((Number(hours) || 0) * 60))
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}h ${String(m).padStart(2, '0')}m`
}

const effectiveLabel = computed(() => {
    const live = clockStore.effectiveTime
    if (live != null && !Number.isNaN(Number(live)) && Number(live) > 0) {
        return formatHoursDuration(live)
    }
    return props.mock?.effectiveHours || '0h 00m'
})

const grossLabel = computed(() => {
    const live = clockStore.grossTime
    if (live != null && !Number.isNaN(Number(live)) && Number(live) > 0) {
        return formatHoursDuration(live)
    }
    return props.mock?.grossHours || '0h 00m'
})

const isClockedOut = computed(() => {
    const att = clockStore.todayAttendance
    if (!att || !att.check_in) return true
    if (att.check_in && !att.check_out) return false
    return true
})

const buttonLoading = computed(() => clockStore.buttonLoading)

const sinceLastLoginLabel = computed(() => {
    // Before clock-in: no attendance duration yet — show placeholder, not mock time
    if (isClockedOut.value && !clockStore.todayAttendance?.check_in) {
        return '—'
    }
    return props.mock?.sinceLastLogin || '—'
})

const quickActions = [
    { id: 'wfh', label: 'Work From Home', icon: 'lucide:house', testId: 'action-wfh' },
    { id: 'policy', label: 'Attendance Policy', icon: 'lucide:book-open', testId: 'action-policy' },
]

const onClockToggle = async () => {
    if (buttonLoading.value) return
    if (isClockedOut.value) {
        await clockStore.clockIn()
        emit('clock-in')
    } else {
        await clockStore.clockOut()
        emit('clock-out')
    }
}

const onQuickAction = (action) => {
    emit('quick-action', action.id)
}

onMounted(async () => {
    timer = setInterval(() => {
        now.value = new Date()
    }, 1000)
    await clockStore.getTodayAttendance()
})

onBeforeUnmount(() => {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
})
</script>
