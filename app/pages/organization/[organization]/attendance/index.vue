<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-full w-full">
            <UiLoader />
        </div>

        <template v-else>
            <!-- Header + Stats -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                    <p class="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">
                        Organization Attendance
                    </p>
                    <h1 class="text-2xl md:text-3xl font-bold">
                        Monthly Attendance Overview
                    </h1>
                    <p class="text-sm text-white/50 mt-1">
                        Day-wise breakdown with employee details and check-in/out logs.
                    </p>
                    <div class="py-2 flex items-center gap-2">
                        <FormSelect v-model="year" :options="years" color="#fff" placeholder="Select Year" />
                        <FormSelect v-model="month" :options="months" color="#fff" placeholder="Select Month" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2 min-w-[260px]">
                    <div class="rounded-lg col-span-4 bg-white/5 border border-white/10 p-3">
                        <div class="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">
                            Avg Check-In
                        </div>
                        <div class="text-lg font-semibold">{{ stats?.avg_check_in || '--' }}</div>
                        <div class="text-[11px] text-white/50 mt-1">Organization-wide</div>
                    </div>
                    <div class="rounded-lg col-span-4 bg-white/5 border border-white/10 p-3">
                        <div class="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">
                            Avg Check-Out
                        </div>
                        <div class="text-lg font-semibold">{{ stats?.avg_check_out || '--' }}</div>
                        <div class="text-[11px] text-white/50 mt-1">Organization-wide</div>
                    </div>
                    <div class="rounded-lg col-span-4 bg-emerald-500/20 border border-emerald-500/30 p-4">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">Avg Gross
                                Hours</span>
                        </div>
                        <div class="mt-2 text-xl font-semibold">
                            {{ formatHours(stats?.avg_gross_hours) }}
                        </div>
                        <p class="text-[11px] text-emerald-100/70 mt-1">Per working day</p>
                    </div>

                    <div class="rounded-lg col-span-4 bg-sky-500/20 border border-sky-500/30 p-4">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] uppercase tracking-[0.2em] text-sky-200/80">Avg Effective
                                Hours</span>
                        </div>
                        <div class="mt-2 text-xl font-semibold">
                            {{ formatHours(stats?.avg_effective_hours) }}
                        </div>
                        <p class="text-[11px] text-sky-100/70 mt-1">Active working time</p>
                    </div>

                    <div class="rounded-lg col-span-4 bg-amber-500/20 border border-amber-500/30 p-4">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">Attendance
                                Rate</span>
                        </div>
                        <div class="mt-2 text-xl font-semibold">
                            {{ attendanceRate }}%
                        </div>
                        <p class="text-[11px] text-amber-100/70 mt-1">Present / total days</p>
                    </div>

                    <div class="rounded-lg col-span-4 bg-white/5 border border-white/15 p-4">
                        <div class="text-[11px] uppercase tracking-[0.2em] text-white/60">Best Attendance</div>
                        <div class="mt-2 text-base font-semibold">
                            {{ bestEmployeeName || '—' }}
                        </div>
                        <p class="text-[11px] text-white/50 mt-1">
                            Based on presence & effective hours
                        </p>
                    </div>
                </div>
            </div>
            <!-- Day-wise Accordion -->
            <div class="flex flex-col gap-2">
                <div v-for="day in sortedDays" :key="day.date"
                    class="rounded-lg bg-white/5 border border-white/10 overflow-y-scroll">
                    <!-- Day Header -->
                    <button type="button"
                        class="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/5 transition-colors"
                        @click="toggleDay(day.date)">
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div
                                class="flex w-16 flex-col items-center justify-center rounded-lg bg-white/10 px-3 py-2">
                                <div class="text-xs text-white/60">{{ formatDayWeek(day.date).weekday }}</div>
                                <div class="text-lg font-bold leading-tight">
                                    {{ formatDayWeek(day.date).day }}
                                </div>
                                <div class="text-[11px] text-white/60">
                                    {{ formatDayWeek(day.date).monthShort }}
                                </div>
                            </div>
                            <div class="text-left">
                                <div class="text-xl sm:text-base font-semibold">
                                    {{ formatFullDate(day.date) }}
                                </div>
                                <div class="text-[14px] capitalize text-white/60 mt-0.5">
                                    {{ day.attendance.length }} employee{{ day.attendance.length !== 1 ? 's' : '' }}
                                    recorded
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <!-- Small aggregates -->
                            <div class="hidden sm:flex flex-col items-end text-xs text-white/60">
                                <span>
                                    Present:
                                    <span class="text-emerald-300 font-semibold">{{ dayPresentCount(day) }}</span>
                                </span>
                                <span>
                                    Absent:
                                    <span class="text-rose-300 font-semibold">{{ dayAbsentCount(day) }}</span>
                                </span>
                            </div>
                            <div
                                class="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                                <svg class="w-4 h-4 transition-transform duration-200"
                                    :class="expandedDays[day.date] ? 'rotate-90' : ''" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <!-- Day Content: Employees -->
                    <div v-if="expandedDays[day.date]" class="border-t border-white/10 bg-black/20">
                        <!-- Header row -->
                        <div
                            class="hidden md:grid grid-cols-12 gap-3 px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
                            <div class="col-span-4">Employee</div>
                            <div class="col-span-2">Check-In</div>
                            <div class="col-span-2">Check-Out</div>
                            <div class="col-span-2">Hours (Gross / Effective)</div>
                            <div class="col-span-2 text-right">Status</div>
                        </div>

                        <div class="divide-y divide-white/5">
                            <div v-for="att in day.attendance" :key="att.id" class="group">
                                <!-- Employee row -->
                                <button type="button"
                                    class="w-full px-4 sm:px-6 py-3 sm:py-3.5 flex grid grid-cols-12 gap-2 md:gap-3 text-left hover:bg-white/5 transition-colors"
                                    @click="toggleEmployee(day.date, att.employee_id)">
                                    <!-- Employee name & email -->
                                    <div class="col-span-4 flex items-start gap-3">
                                        <div
                                            class="hidden sm:flex h-9 w-9 rounded-full items-center justify-center text-sm font-semibold bg-gradient-to-br from-sky-500/80 to-emerald-500/80">
                                            {{ employeeInitials(att.employee) }}
                                        </div>
                                        <div>
                                            <div class="text-sm font-semibold">
                                                {{ att.employee?.first_name }} {{ att.employee?.last_name }}
                                            </div>
                                            <div class="text-xs text-white/50">
                                                {{ att.employee?.email }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Check-in -->
                                    <div class="col-span-2 text-xs sm:text-sm">
                                        <div class="text-white/60 md:hidden mb-0.5">Check-In</div>
                                        <div class="font-mono">
                                            {{ formatTime(att.check_in) || '—' }}
                                        </div>
                                    </div>

                                    <!-- Check-out -->
                                    <div class="col-span-2 text-xs sm:text-sm">
                                        <div class="text-white/60 md:hidden mb-0.5">Check-Out</div>
                                        <div class="font-mono">
                                            {{ formatTime(att.check_out) || '—' }}
                                        </div>
                                    </div>

                                    <!-- Hours -->
                                    <div class="col-span-2 text-xs sm:text-sm">
                                        <div class="text-white/60 md:hidden mb-0.5">Hours</div>
                                        <div class="font-mono">
                                            {{ formatHours(att.gross_hours) }}
                                        </div>
                                        <div class="text-[11px] text-white/50">
                                            Effective: {{ formatHours(att.effective_hours) }}
                                        </div>
                                    </div>

                                    <!-- Status + expand indicator -->
                                    <div class="col-span-2 flex items-center justify-between md:justify-end gap-2">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border"
                                            :class="statusChipClass(att.status)">
                                            <span class="h-1.5 w-1.5 rounded-full mr-1.5"
                                                :class="statusDotClass(att.status)"></span>
                                            {{ att.status }}
                                        </span>

                                        <svg class="w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-transform duration-150"
                                            :class="expandedEmployees[employeeKey(day.date, att.employee_id)] ? 'rotate-90' : ''"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>

                                <!-- Employee extended panel -->
                                <div v-if="expandedEmployees[employeeKey(day.date, att.employee_id)]"
                                    class="px-4 sm:px-6 pb-4 sm:pb-5 bg-black/40">
                                    <div class="grid md:grid-cols-3 gap-3 text-xs sm:text-sm">
                                        <div class="p-3 mt-2 rounded-lg bg-white/5 border border-white/10">
                                            <div class="text-[11px] text-white/60 uppercase tracking-[0.16em]">
                                                Summary
                                            </div>
                                            <ul class="space-y-0.5 flex justify-between">
                                                <li>Gross: <span class="font-mono">{{ formatHours(att.gross_hours)
                                                        }}</span></li>
                                                <li>Effective: <span class="font-mono">{{
                                                    formatHours(att.effective_hours) }}</span></li>
                                                <li>Late Minutes: <span class="font-mono">{{ att.late_arrival_minutes ||
                                                    0 }}</span></li>
                                            </ul>
                                        </div>

                                        <div class="p-3 rounded-lg bg-white/5 border border-white/10 md:col-span-2">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="text-[11px] text-white/60 uppercase tracking-[0.16em]">
                                                    Activity Log
                                                </div>
                                                <div class="text-[11px] text-white/40">
                                                    {{ (att.logs || []).length }} entries
                                                </div>
                                            </div>

                                            <div class="max-h-48 overflow-y-auto pr-1 custom-scroll">
                                                <div class="grid grid-cols-2 gap-1.5 text-xs">

                                                    <!-- Build paired rows -->
                                                    <template v-for="(pair, index) in buildPairs(att.logs)"
                                                        :key="index">

                                                        <!-- LEFT (IN) -->
                                                        <div v-if="pair.in"
                                                            class="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded">
                                                            <span
                                                                class="px-2 py-0.5 rounded-md bg-emerald-600 text-emerald-200 font-semibold">IN</span>
                                                            <span class="font-mono">{{ pair.in.createdAt }}</span>
                                                        </div>
                                                        <div v-else class="h-9"></div>

                                                        <!-- RIGHT (OUT) -->
                                                        <div v-if="pair.out"
                                                            class="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded">
                                                            <span
                                                                class="px-2 py-0.5 rounded-md bg-amber-600 text-amber-200 font-semibold">OUT</span>
                                                            <span class="font-mono">{{ pair.out.createdAt }}</span>
                                                        </div>
                                                        <div v-else class="h-9"></div>

                                                    </template>

                                                    <!-- No logs -->
                                                    <div v-if="!att.logs?.length"
                                                        class="col-span-2 text-white/50 text-[11px] text-center py-3">
                                                        No logs recorded.
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div> <!-- end each attendance -->
                        </div>
                    </div>
                </div>

                <div v-if="!sortedDays.length" class="text-sm text-white/60 text-center py-12">
                    No attendance data found for this month.
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, reactive, onMounted, watch } from 'vue'
import { useAttendanceStore } from '../../../../stores/orgAttendance.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath
})

const store = useAttendanceStore()

const loading = computed(() => store.loading)
const stats = computed(() => store.stats)
const days = computed(() => store.days)
const year = ref({
    value: new Date().getFullYear(),
    label: new Date().getFullYear()
})
const years = computed(() => {
    const baseYear = 2025
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= baseYear; i--) {
        years.push({
            value: i,
            label: i.toString()
        })
    }
    return years
})
const month = ref({
    value: new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : (new Date().getMonth() + 1).toString(),
    label: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ][new Date().getMonth()]
})
const months = computed(() => {
    const selectedYear = year.value.value
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthIndex = now.getMonth() // 0 = Jan

    const allMonths = [
        { value: '01', label: "Jan" },
        { value: '02', label: "Feb" },
        { value: '03', label: "Mar" },
        { value: '04', label: "Apr" },
        { value: '05', label: "May" },
        { value: '06', label: "Jun" },
        { value: '07', label: "Jul" },
        { value: '08', label: "Aug" },
        { value: '09', label: "Sep" },
        { value: '10', label: "Oct" },
        { value: '11', label: "Nov" },
        { value: '12', label: "Dec" },
    ]

    // If selected year is current year -> only months up to current month (inclusive)
    if (selectedYear === currentYear) {
        return allMonths.slice(0, currentMonthIndex + 1)
    }

    // If selected year is less than current year -> all months
    if (selectedYear < currentYear) {
        return allMonths
    }

    // If selected year is in the future -> no months (or return allMonths if you want)
    return []
})

watch(
    [year, month],
    async () => {
        const param = `${year.value.value}-${month.value.value}`
        await store.fetchMonthlyAttendance(param)
    }
)

/**
 * Expansion state
 * - expandedDays: per day (date string)
 * - expandedEmployees: per day+employee combination
 */
const expandedDays = reactive({})
const expandedEmployees = reactive({})

const toggleDay = (date) => {
    expandedDays[date] = !expandedDays[date]
}

const employeeKey = (date, employeeId) => `${date}::${employeeId}`

const toggleEmployee = (date, employeeId) => {
    const key = employeeKey(date, employeeId)
    expandedEmployees[key] = !expandedEmployees[key]
}

/**
 * Helpers
 */
const formatHours = (h) => {
    if (!h || Number.isNaN(h)) return '0h 0m'
    const hours = Math.floor(h)
    const mins = Math.round((h - hours) * 60)
    return `${hours}h ${mins}m`
}

const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    // "25/11/2025, 04:26 pm" → "04:26 pm"
    const parts = dateTimeStr.split(', ')
    return parts[1] || dateTimeStr
}

const formatDayWeek = (isoDate) => {
    if (!isoDate) return { weekday: '', day: '', monthShort: '' }
    const d = new Date(isoDate)
    return {
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
        monthShort: d.toLocaleDateString('en-IN', { month: 'short' })
    }
}

const formatFullDate = (isoDate) => {
    if (!isoDate) return ''
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

const buildPairs = (logs = []) => {
    const pairs = [];
    let i = 0;

    while (i < logs.length) {
        const log = logs[i];

        // CASE: IN followed by OUT → pair them
        if (log.type === "CHECK_IN" && logs[i + 1] && logs[i + 1].type === "CHECK_OUT") {
            pairs.push({ in: log, out: logs[i + 1] });
            i += 2;
        }
        // CASE: IN but next is IN or nothing → left only
        else if (log.type === "CHECK_IN") {
            pairs.push({ in: log, out: null });
            i += 1;
        }
        // CASE: OUT without IN before → right only (rare edge case)
        else if (log.type === "CHECK_OUT") {
            pairs.push({ in: null, out: log });
            i += 1;
        }
    }

    return pairs;
};


const statusChipClass = (status) => {
    switch (status) {
        case 'PRESENT':
            return 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
        case 'HALF_DAY':
            return 'border-amber-400/60 bg-amber-500/10 text-amber-100'
        case 'LATE':
            return 'border-orange-400/60 bg-orange-500/10 text-orange-100'
        case 'ABSENT':
            return 'border-rose-400/60 bg-rose-500/10 text-rose-100'
        default:
            return 'border-white/40 bg-white/10 text-white'
    }
}

const statusDotClass = (status) => {
    switch (status) {
        case 'PRESENT':
            return 'bg-emerald-400'
        case 'HALF_DAY':
            return 'bg-amber-400'
        case 'LATE':
            return 'bg-orange-400'
        case 'ABSENT':
            return 'bg-rose-400'
        default:
            return 'bg-white'
    }
}

const dayPresentCount = (day) =>
    day.attendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY' || a.status === 'LATE').length

const dayAbsentCount = (day) =>
    day.attendance.filter(a => a.status === 'ABSENT').length

const employeeInitials = (emp) => {
    if (!emp) return '?'
    const f = emp.first_name?.[0] || ''
    const l = emp.last_name?.[0] || ''
    return (f + l || '?').toUpperCase()
}

const attendanceRate = computed(() => {
    if (!stats.value?.attendance_rate && stats.value?.attendance_rate !== 0) return 0
    return Math.round(stats.value.attendance_rate)
})

const sortedDays = computed(() => {
    if (!Array.isArray(days.value)) return []
    return days.value
})

const bestEmployeeName = computed(() => {
    const id = store.stats?.best_attendance_employee
    if (!id || !Array.isArray(store.days)) return '-'
    const day = store.days.find(d => d.attendance.some(a => a.employee_id === id))
    const emp = day?.attendance.find(a => a.employee_id === id)?.employee
    return emp ? `${emp.first_name} ${emp.last_name}` : '-'
})

onMounted(async () => {
    // You can later replace hardcoded month with a reactive month picker
    const param = `${year.value.value}-${month.value.value}`
    await store.fetchMonthlyAttendance(param)
});
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 999px;
}
</style>
