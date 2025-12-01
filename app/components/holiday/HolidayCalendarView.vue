<template>
    <div
        class="p-6 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-2xl">
        <!-- HEADER -->
        <div class="flex justify-between items-center mb-6">
            <UiButton icon="ion:chevron-back" @click="prevMonth" color="#fff"
                class="hover:scale-110 active:scale-95 transition-transform duration-200" />
            <div class="text-center">
                <h2 class="text-2xl font-bold text-white tracking-tight">{{ formattedMonth }}</h2>
                <p class="text-xs text-white/50 mt-1">{{ holidayCount }} holidays this month</p>
            </div>
            <UiButton icon="ion:chevron-forward" @click="nextMonth" color="#fff"
                class="hover:scale-110 active:scale-95 transition-transform duration-200" />
        </div>

        <!-- WEEK ROW -->
        <div
            class="grid grid-cols-7 gap-3 text-center text-xs font-semibold text-white/70 mb-3 uppercase tracking-wider">
            <span v-for="d in daysShort" :key="d">{{ d }}</span>
        </div>

        <!-- CALENDAR GRID -->
        <div class="grid grid-cols-7 gap-3">
            <div v-for="(cell, i) in calendarGrid" :key="i"
                class="relative h-24 rounded-lg p-3 border flex flex-col items-center justify-start transition-all duration-300 cursor-pointer group"
                :class="[
                    cell.empty
                        ? 'opacity-0 pointer-events-none'
                        : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30 hover:scale-105 hover:shadow-lg',
                    cell.is_holiday
                        ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-emerald-400/50 hover:from-emerald-500/40 hover:to-emerald-600/30'
                        : '',
                    cell.isToday
                        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent bg-blue-500/20 border-blue-400/60'
                        : ''
                ]" @click="!cell.empty && onDateClick(cell)">
                <!-- Day Number -->
                <span v-if="!cell.empty"
                    class="text-base font-bold text-white transition-transform duration-200 group-hover:scale-110"
                    :class="cell.isToday ? 'text-blue-200' : ''">
                    {{ cell.day }}
                </span>

                <!-- Today Badge -->
                <div v-if="cell.isToday"
                    class="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>

                <!-- Holiday Name -->
                <span v-if="cell.is_holiday"
                    class="text-[10px] mt-auto text-emerald-100 text-center leading-tight font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                    {{ cell.name }}
                </span>

                <!-- Holiday Type Badge -->
                <span v-if="cell.is_holiday && cell.type"
                    class="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 bg-emerald-500/40 rounded-full text-emerald-100 uppercase tracking-wide">
                    {{ cell.type }}
                </span>

                <!-- Hover Overlay Effect -->
                <div
                    class="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                </div>
            </div>
        </div>

        <!-- FOOTER STATS -->
        <div class="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/60">
            <span>Total Days: {{ totalDaysInMonth }}</span>
            <span>Weekends: {{ weekendCount }}</span>
            <span>Working Days: {{ workingDays }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    calendar: Array,
    month: String
})

const emit = defineEmits(['month-change', 'date-click'])

const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ---------------------------------------------
   FORMAT MONTH HEADING
---------------------------------------------- */
const formattedMonth = computed(() => {
    if (!props.month) return ''
    const d = new Date(props.month + '-01')
    return d.toLocaleDateString('en-IN', { month: "long", year: "numeric" })
})

/* ---------------------------------------------
   GET TODAY'S DATE FOR HIGHLIGHTING
---------------------------------------------- */
const today = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

/* ---------------------------------------------
   BUILD FINAL CALENDAR GRID
---------------------------------------------- */
const calendarGrid = computed(() => {
    if (!props.calendar || !props.calendar.length) return []

    const [year, month] = props.month.split('-').map(Number)
    const firstDate = new Date(year, month - 1, 1)
    const lastDate = new Date(year, month, 0)
    const totalDays = lastDate.getDate()
    const startWeekday = firstDate.getDay()

    const grid = []
    const dataMap = {}

    for (const d of props.calendar) {
        dataMap[d.date] = d
    }

    // Empty cells before first day
    for (let i = 0; i < startWeekday; i++) {
        grid.push({ empty: true })
    }

    // Real days
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        grid.push({
            empty: false,
            day,
            dateStr,
            isToday: dateStr === today.value,
            ...dataMap[dateStr]
        })
    }

    return grid
})

/* ---------------------------------------------
   STATS & COUNTS
---------------------------------------------- */
const holidayCount = computed(() => {
    return calendarGrid.value.filter(cell => !cell.empty && cell.is_holiday).length
})

const totalDaysInMonth = computed(() => {
    return calendarGrid.value.filter(cell => !cell.empty).length
})

const weekendCount = computed(() => {
    return calendarGrid.value.filter((cell, index) => {
        if (cell.empty) return false
        const dayOfWeek = index % 7
        return dayOfWeek === 0 || dayOfWeek === 6
    }).length
})

const workingDays = computed(() => {
    return totalDaysInMonth.value - weekendCount.value - holidayCount.value
})

/* ---------------------------------------------
   INTERACTIONS
---------------------------------------------- */
const prevMonth = () => {
    const d = new Date(props.month + '-01')
    d.setMonth(d.getMonth() - 1)
    emit('month-change', d.toISOString().slice(0, 7))
}

const nextMonth = () => {
    const d = new Date(props.month + '-01')
    d.setMonth(d.getMonth() + 1)
    emit('month-change', d.toISOString().slice(0, 7))
}

const onDateClick = (cell) => {
    emit('date-click', cell)
};
</script>

<style scoped>
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.1);
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>