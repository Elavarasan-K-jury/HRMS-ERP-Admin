<template>
    <section
        class="h-full rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-4 md:p-5 flex flex-col">
        <header class="mb-4">
            <p class="text-[11px] uppercase tracking-[0.28em] text-white/40 font-semibold">
                Timings
            </p>
        </header>

        <!-- Weekday selector — today always highlighted -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-5" role="list" aria-label="Week days">
            <button v-for="day in weekDays" :key="day.key" type="button" role="listitem"
                :aria-label="day.fullName" :aria-pressed="day.isToday"
                class="weekday-dot" :class="day.isToday ? 'weekday-dot--active' : 'weekday-dot--muted'"
                @click="selectedDayKey = day.key">
                <span class="weekday-dot__letter">{{ day.letter }}</span>
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" data-testid="timings-loading" class="space-y-3 animate-pulse" aria-bus="true">
            <div class="h-5 w-2/3 rounded bg-white/10" />
            <div class="h-2.5 w-full rounded-full bg-white/10" />
            <div class="h-4 w-1/2 rounded bg-white/10" />
        </div>

        <!-- Empty: no shift covering today -->
        <div v-else-if="!hasShift" data-testid="timings-empty"
            class="flex flex-col items-center justify-center min-h-[160px] text-center py-6">
            <Icon name="lucide:calendar-x" class="h-9 w-9 text-white/30 mb-2" />
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">No shift assigned</p>
            <p class="text-xs text-white/45 mt-1.5">No shift covers today for this employee.</p>
        </div>

        <!-- Current day shift -->
        <div v-else class="space-y-3" data-testid="timings-shift">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-sm text-white/85">
                    Today
                    <span class="text-white/50">({{ timingLabel }})</span>
                </p>
                <span class="text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 bg-white/15 text-white/80 border border-white/15"
                    data-testid="timings-today-tag">
                    Today
                </span>
            </div>

            <p class="text-base font-semibold text-white" data-testid="timings-shift-name">
                {{ shift.name }}
            </p>

            <!-- Timeline -->
            <div class="relative pt-1 pb-2" aria-hidden="true">
                <div class="timeline-track">
                    <div class="timeline-track__work"></div>
                    <div v-if="!shift.flexible" class="timeline-track__break" :style="breakStyle"></div>
                </div>
                <div v-if="!shift.flexible" class="flex justify-between mt-1.5 text-[11px] text-white/45 font-mono">
                    <span data-testid="timings-start">{{ shift.startTime }}</span>
                    <span data-testid="timings-end">{{ shift.endTime }}</span>
                </div>
            </div>

            <!-- Duration + break -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p class="text-xs text-white/55">
                    Duration:
                    <span class="text-white/90 font-medium" data-testid="timings-duration">{{ shift.duration }}</span>
                </p>
                <p v-if="!shift.flexible" class="inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                    <Icon name="lucide:coffee" class="h-3.5 w-3.5 text-amber-300/80" />
                    <span data-testid="timings-break">{{ shift.breakMinutes }} min</span>
                </p>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    shift: {
        type: Object,
        default: null,
    },
    loading: {
        type: Boolean,
        default: false,
    },
})

const hasShift = computed(() => {
    const s = props.shift
    return !!(s && (s.flexible || (s.startTime && s.endTime)))
})

const timingLabel = computed(() => {
    const s = props.shift
    if (!s) return ''
    if (s.flexible) return 'Flexible'
    return `${s.startTime} - ${s.endTime}`
})

const WEEK_DEFS = [
    { key: 'monday', letter: 'M', fullName: 'Monday', jsDay: 1 },
    { key: 'tuesday', letter: 'T', fullName: 'Tuesday', jsDay: 2 },
    { key: 'wednesday', letter: 'W', fullName: 'Wednesday', jsDay: 3 },
    { key: 'thursday', letter: 'T', fullName: 'Thursday', jsDay: 4 },
    { key: 'friday', letter: 'F', fullName: 'Friday', jsDay: 5 },
    { key: 'saturday', letter: 'S', fullName: 'Saturday', jsDay: 6 },
    { key: 'sunday', letter: 'S', fullName: 'Sunday', jsDay: 0 },
]

const now = new Date()
const todayJsDay = now.getDay()
const weekDays = computed(() =>
    WEEK_DEFS.map(d => ({
        ...d,
        isToday: d.jsDay === todayJsDay
    }))
)

const todayKey = (WEEK_DEFS.find(d => d.jsDay === todayJsDay) || WEEK_DEFS[0]).key
const selectedDayKey = ref(todayKey)

// Break sits mid-shift as a simple visual (UI only — not calculated)
const breakStyle = computed(() => {
    const mins = Number(props.shift?.breakMinutes) || 0
    const width = Math.min(18, Math.max(8, (mins / 60) * 12))
    return {
        width: `${width}%`,
        left: '42%'
    }
})
</script>

<style scoped>
.weekday-dot {
    @apply relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40;
}

.weekday-dot--active {
    @apply bg-white text-slate-900 shadow-[0_0_0_3px_rgba(255,255,255,0.12)];
}

.weekday-dot--muted {
    @apply bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80;
}

.weekday-dot__letter {
    @apply leading-none;
}

.timeline-track {
    @apply relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden border border-white/10;
}

.timeline-track__work {
    @apply absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-indigo-500/70 via-sky-500/60 to-indigo-400/70;
}

.timeline-track__break {
    @apply absolute inset-y-0 rounded-full bg-amber-400/70 border border-amber-200/40;
}
</style>
