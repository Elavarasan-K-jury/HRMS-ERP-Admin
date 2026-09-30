<template>
    <div class="h-[calc(100vh-4rem)] overflow-y-auto text-white">
        <div class="max-w-full grid grid-cols- mx-auto p-2 space-y-2">

            <!-- Header -->
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="w-full md:w-1/2">
                    <p class="text-xs uppercase tracking-[0.3em] text-white/40 font-semibold">
                        HRMS
                    </p>
                    <h1 class="text-2xl md:text-3xl font-semibold">
                        Attendance
                    </h1>
                    <p class="text-xs text-white/60 mt-1">
                        View all check-ins, check-outs, work durations and audit logs.
                    </p>
                </div>
            </div>

            <!-- Persistent parent: Timings + Actions (stay mounted across tabs) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
                <AttendanceTimings :shift="timingShift" :loading="timingLoading" class="h-full" />
                <AttendanceActions :mock="attendanceUiMock" class="h-full" />
            </div>

            <!-- Tab navigation (ProfileTabs pattern) -->
            <AttendanceTabs :active="activeTab" @change="setTab" />

            <!-- Tab content — parent cards above stay mounted -->
            <div class="tab-content">
                <template v-if="activeTab === 'logs'">
                    <!-- Period bar: selected month+year (left) | filters (right) -->
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4"
                        data-testid="log-period-bar">
                        <div class="shrink-0">
                            <p class="text-[11px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-0.5">
                                Selected period
                            </p>
                            <p class="text-lg md:text-xl font-semibold text-white" data-testid="selected-period-label">
                                {{ selectedPeriodLabel }}
                            </p>
                        </div>
                        <div class="flex flex-wrap items-center justify-start md:justify-end gap-2.5"
                            data-testid="log-period-filters">
                            <button v-for="p in periodFilters" :key="p.id" type="button" data-testid="log-period"
                                :data-period="p.id" @click="selectedPeriod = p.id"
                                class="px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-xl border transition"
                                :class="selectedPeriod === p.id
                                    ? 'text-white bg-white/10 border-[#4aff7a]'
                                    : 'text-white/55 bg-white/5 border-white/10 hover:text-white/85 hover:bg-white/10'">
                                {{ p.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Attendance List (UI mock only) -->
                    <div class="rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] overflow-hidden mt-2">
                        <div class="overflow-x-auto">
                            <table v-if="logRows.length" class="w-full text-left border-collapse min-w-[720px]"
                                data-testid="attendance-logs-table">
                                <thead class="uppercase text-[11px] text-white/50 tracking-[0.18em] border-b border-white/10">
                                    <tr>
                                        <th class="px-4 py-3 w-40">Date</th>
                                        <th class="px-4 py-3">Effective Hours</th>
                                        <th class="px-4 py-3">Break Taken</th>
                                        <th class="px-4 py-3">Gross Hours</th>
                                        <th class="px-4 py-3">Arrival</th>
                                        <th class="px-4 py-3 w-16 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    <tr v-for="row in logRows" :key="row.id"
                                        class="hover:bg-white/5 transition">
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <span class="text-sm text-white/90">{{ row.date }}</span>
                                            <span v-if="row.isWeekOff"
                                                class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60 border border-white/10">
                                                W-OFF
                                            </span>
                                            <span v-else-if="row.isLeave"
                                                class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                                LEAVE
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-white/85 font-medium">{{ row.effective }}</td>
                                        <td class="px-4 py-3 text-sm text-white/70">{{ row.breakTaken }}</td>
                                        <td class="px-4 py-3 text-sm text-white/85 font-medium">{{ row.gross }}</td>
                                        <td class="px-4 py-3 text-sm">
                                            <span v-if="row.arrival.kind === 'late'"
                                                class="text-amber-400/90 font-medium">{{ row.arrival.label }}</span>
                                            <span v-else-if="row.arrival.kind === 'ontime'"
                                                class="inline-flex items-center gap-1 text-emerald-400/90 font-medium">
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                {{ row.arrival.label }}
                                            </span>
                                            <span v-else class="text-white/45">{{ row.arrival.label }}</span>
                                        </td>
                                        <td class="px-4 py-3 text-right relative">
                                            <button type="button" data-testid="row-actions" :data-row="row.id"
                                                :aria-label="'Actions for ' + row.date"
                                                class="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition"
                                                @click.stop="toggleRowMenu(row.id)">
                                                <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                                            </button>
                                            <div v-if="openMenuId === row.id"
                                                class="absolute right-2 top-full z-30 mt-1 w-[300px] rounded-xl border border-white/15 bg-[#14161c] shadow-[0_16px_40px_rgba(0,0,0,0.55)] overflow-hidden text-left"
                                                data-testid="row-actions-menu" @click.stop>
                                                <div class="px-4 pt-3 pb-2 border-b border-white/10">
                                                    <p class="text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">
                                                        Clock In / Clock Out History
                                                    </p>
                                                    <p class="text-sm font-medium text-white/90 mt-0.5"
                                                        data-testid="history-date">{{ row.date }}</p>
                                                </div>
                                                <ul class="px-3 py-3 space-y-2 max-h-[220px] overflow-y-auto"
                                                    data-testid="history-timeline">
                                                    <li v-for="entry in row.history" :key="entry.id"
                                                        class="flex items-center justify-between gap-2 text-sm">
                                                        <span class="flex items-center gap-2">
                                                            <span class="w-1.5 h-1.5 rounded-full shrink-0"
                                                                :class="entry.type === 'CLOCK_IN' ? 'bg-emerald-400' : 'bg-rose-400'" />
                                                            <span
                                                                :class="entry.type === 'CLOCK_IN' ? 'text-emerald-300/90' : 'text-rose-300/90'"
                                                                class="font-medium">
                                                                {{ entry.type === 'CLOCK_IN' ? 'Clock In' : 'Clock Out' }}
                                                            </span>
                                                        </span>
                                                        <span class="font-mono text-xs text-white/70">{{ entry.time }}</span>
                                                    </li>
                                                    <li v-if="!row.history?.length" class="text-white/40 text-sm">
                                                        No clock entries for this day.
                                                    </li>
                                                </ul>
                                                <div v-if="row.history?.length"
                                                    class="border-t border-white/10 px-4 py-3 grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p class="text-white/40 text-[10px] uppercase tracking-wide">Total Gross</p>
                                                        <p class="font-medium" data-testid="history-total-gross">
                                                            {{ row.historyTotalGross || row.gross }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-white/40 text-[10px] uppercase tracking-wide">Total Break</p>
                                                        <p class="font-medium" data-testid="history-total-break">
                                                            {{ row.historyTotalBreak || row.breakTaken }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="!logRows.length" class="px-4 py-6 text-center text-sm text-white/60">
                            No attendance records for this period.
                        </div>
                    </div>
                </template>

                <div v-else-if="activeTab === 'calendar'">
                    <AttendanceCalendar />
                </div>

                <div v-else-if="activeTab === 'requests'"
                    class="rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                    <Icon name="lucide:inbox" class="h-10 w-10 text-white/30 mb-3" />
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Attendance Requests</p>
                    <p class="text-xs text-white/45 mt-2">Attendance Requests UI will be implemented in the next phase.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { attendanceUiMock } from '../../../data/attendanceUiMock'
import { getAttendancePeriodFilters, getAttendanceLogRows } from '../../../data/attendanceLogMock'
import {
    assignmentForDate,
    formatShiftTime,
    isFlexibleShift,
} from '../../../data/attendanceCalendar'
import { loadAttendanceCalendarData } from '../../../data/attendanceCalendarData'
import { useAuthStore } from '../../../stores/shared/auth.store'
import AttendanceTimings from '../../../components/attendance/AttendanceTimings.vue'
import AttendanceActions from '../../../components/attendance/AttendanceActions.vue'
import AttendanceTabs from '../../../components/attendance/AttendanceTabs.vue'
import AttendanceCalendar from '../../../components/attendance/AttendanceCalendar.vue'

definePageMeta({
    layout: 'auth',
    key: () => 'employee-attendance',
    keepAliveKey: 'employee-attendance',
})

// Mount counter for persistence verification (parent must not remount on tab param change)
if (import.meta.client) {
    window.__attMountCount = (window.__attMountCount || 0) + 1
}

const route = useRoute()
const router = useRouter()

const VALID_TABS = ['logs', 'calendar', 'requests']
const pathToTab = (path) => {
    const p = (path || '').replace(/\/+$/, '')
    if (p === '/employee/attendance/calendar') return 'calendar'
    if (p === '/employee/attendance/requests') return 'requests'
    return 'logs'
}
const tabToPath = {
    logs: '/employee/attendance',
    calendar: '/employee/attendance/calendar',
    requests: '/employee/attendance/requests',
}

const activeTab = ref(pathToTab(route.path))

const setTab = (tab) => {
    if (!VALID_TABS.includes(tab)) return
    if (activeTab.value === tab) return
    activeTab.value = tab
    router.push(tabToPath[tab])
}

watch(() => route.path, (path) => {
    const tab = pathToTab(path)
    if (VALID_TABS.includes(tab)) activeTab.value = tab
})

/* ---- Attendance Logs (UI mock only) ---- */
const now = ref(new Date())
const periodFilters = computed(() => getAttendancePeriodFilters(now.value))
const selectedPeriod = ref('30d')
const logRows = computed(() => getAttendanceLogRows(selectedPeriod.value, now.value))

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

const selectedPeriodLabel = computed(() => {
    if (selectedPeriod.value === '30d') {
        return `Last 30 Days · ${MONTH_FULL[now.value.getMonth()]} ${now.value.getFullYear()}`
    }
    const [y, m] = selectedPeriod.value.split('-').map(Number)
    return `${MONTH_FULL[m - 1]} ${y}`
})

const openMenuId = ref(null)

const toggleRowMenu = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id
}

/* ---- Timing card: today's employee shift (same loader/resolution as Calendar) ---- */
const auth = useAuthStore()
const timingShift = ref(null)
const timingLoading = ref(true)

const timingEmployeeId = computed(() => {
    const e = auth.employee
    if (!e) return ''
    if (typeof e === 'string') return e
    return e.id || e.employee_id || ''
})
const timingOrganizationId = computed(() => auth.organization || auth.user?.organization_id || '')

function hmToMinutes(hm) {
    const m = String(hm || '').match(/^(\d{1,2}):(\d{2})/)
    if (!m) return null
    return Number(m[1]) * 60 + Number(m[2])
}

function durationLabel(startHm, endHm) {
    const a = hmToMinutes(startHm)
    let b = hmToMinutes(endHm)
    if (a === null || b === null) return ''
    if (b < a) b += 24 * 60
    const total = b - a
    const h = Math.floor(total / 60)
    const min = total % 60
    return min ? `${h}h ${min}m` : `${h}h 0m`
}

function buildTimingShift(assignment) {
    const s = assignment?.shift || null
    if (!s) return null
    const flexible = isFlexibleShift(s)
    return {
        name: s.name || 'Assigned shift',
        startTime: flexible ? 'Flexible' : formatShiftTime(s.start_time),
        endTime: flexible ? '' : formatShiftTime(s.end_time),
        duration: flexible ? 'Flexible' : durationLabel(s.start_time, s.end_time),
        breakMinutes: Number(s.break_minutes) || 0,
        flexible,
    }
}

async function loadTodayTimingShift() {
    if (!timingEmployeeId.value) {
        timingShift.value = null
        timingLoading.value = false
        return
    }
    timingLoading.value = true
    try {
        const data = await loadAttendanceCalendarData({
            employeeId: timingEmployeeId.value,
            organizationId: timingOrganizationId.value,
        })
        const assignment = assignmentForDate(new Date(), data.shiftAssignments || [])
        timingShift.value = buildTimingShift(assignment)
    } catch (err) {
        console.error('[AttendanceTimings] load failed:', err)
        timingShift.value = null
    } finally {
        timingLoading.value = false
    }
}

onMounted(() => {
    loadTodayTimingShift()
})

watch([timingEmployeeId, timingOrganizationId], ([emp], [prevEmp]) => {
    if (emp && emp !== prevEmp) loadTodayTimingShift()
})

const onDocClick = () => {
    openMenuId.value = null
}

onMounted(() => {
    document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.tab-content {
    animation: fade-in .2s ease;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
