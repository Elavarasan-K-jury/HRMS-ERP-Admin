<template>
    <div data-testid="calendar"
        class="rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] p-4 md:p-6 mt-4">
        <!-- Month nav: < Sep 2026 > -->
        <div class="flex items-center justify-between gap-3 mb-4" data-testid="calendar-nav">
            <button type="button" data-testid="calendar-prev" aria-label="Previous month"
                :disabled="prevDisabled"
                :title="prevDisabled ? 'Limited to the last 3 months' : undefined"
                class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-white/70"
                @click="prevMonth">
                <Icon name="lucide:chevron-left" class="h-5 w-5" />
            </button>
            <div class="text-center">
                <p class="text-[11px] uppercase tracking-[0.28em] text-white/40 font-semibold mb-0.5">
                    Calendar
                </p>
                <h2 class="text-lg md:text-xl font-semibold text-white" data-testid="calendar-title">
                    {{ title }}
                </h2>
            </div>
            <button type="button" data-testid="calendar-next" aria-label="Next month"
                :disabled="nextDisabled"
                :title="nextDisabled ? nextDisabledReason : undefined"
                class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-white/70"
                @click="nextMonth">
                <Icon name="lucide:chevron-right" class="h-5 w-5" />
            </button>
        </div>

        <!-- Loading skeleton — wait for shift + weekly-off + holidays before statuses -->
        <div v-if="loading" data-testid="calendar-loading" class="space-y-3" aria-busy="true">
            <div class="grid grid-cols-7 gap-2">
                <div v-for="i in 7" :key="'wh' + i" class="h-6 rounded bg-white/5 animate-pulse" />
            </div>
            <div class="grid grid-cols-7 gap-2">
                <div v-for="i in 35" :key="'sk' + i" class="h-28 rounded-lg bg-white/5 animate-pulse" />
            </div>
        </div>

        <!-- Empty: no shift assignment at all -->
        <div v-else-if="!hasAnyData" data-testid="calendar-empty"
            class="flex flex-col items-center justify-center min-h-[220px] text-center py-8">
            <Icon name="lucide:calendar-x" class="h-10 w-10 text-white/30 mb-3" />
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">No shift assigned</p>
            <p class="text-xs text-white/45 mt-2">Contact your administrator to get a shift assigned.</p>
        </div>

        <!-- Month grid (horizontally scrollable on small screens) -->
        <div v-else class="overflow-x-auto -mx-1 px-1" data-testid="calendar-scroll">
            <div class="min-w-[640px]">
                <!-- Monday-first headers -->
                <div class="grid grid-cols-7 gap-1.5 mb-1.5" role="row" data-testid="calendar-weekdays">
                    <div v-for="h in WEEKDAY_HEADERS" :key="h" role="columnheader"
                        class="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 py-1"
                        data-testid="calendar-weekday">
                        {{ h }}
                    </div>
                </div>

                <div class="grid grid-cols-7 gap-1.5" data-testid="calendar-grid">
                    <div v-for="cell in cells" :key="cell.dateKey" data-testid="calendar-day"
                        :data-date="cell.dateKey"
                        :data-in-month="cell.inMonth ? '1' : '0'"
                        :data-today="cell.isToday ? '1' : '0'"
                        :data-weekoff="cell.weekOff ? '1' : '0'"
                        :data-holiday="cell.holiday ? '1' : '0'"
                        :data-shift="cell.shiftText ? '1' : '0'"
                        :data-status="cell.inMonth ? cell.status : 'blank'"
                        class="relative flex flex-col min-h-[88px] sm:min-h-[104px] rounded-xl border p-1.5 sm:p-2 transition"
                        :class="cellClasses(cell)">
                        <div class="flex items-start justify-between gap-1">
                            <span class="text-xs sm:text-sm font-semibold leading-none"
                                :class="cell.isToday && cell.inMonth ? 'text-slate-900' : cell.inMonth ? 'text-white/90' : 'text-white/30'"
                                data-testid="calendar-day-num">
                                {{ cell.day }}
                            </span>
                            <span v-if="cell.isToday && cell.inMonth"
                                class="text-[9px] font-bold uppercase tracking-wider rounded px-1 py-0.5"
                                :class="todayTagClass(cell)"
                                data-testid="calendar-today-tag">
                                Today
                            </span>
                        </div>

                        <!-- Mandatory Holiday -->
                        <div v-if="cell.inMonth && cell.holiday" class="mt-auto flex flex-col gap-0.5 min-w-0"
                            data-testid="calendar-holiday">
                            <span
                                class="inline-flex items-center justify-center rounded-md border border-amber-400/40 bg-amber-400/15 text-amber-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 text-center leading-tight">
                                Holiday
                            </span>
                            <span class="text-[9px] sm:text-[10px] text-amber-100/85 leading-tight truncate text-center"
                                :title="cell.holiday.name" data-testid="calendar-holiday-name">
                                {{ cell.holiday.name }}
                            </span>
                        </div>

                        <!-- Weekly Off (full or half) -->
                        <span v-else-if="cell.inMonth && cell.weekOff" data-testid="calendar-weekoff-badge"
                            class="mt-auto inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/75 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 text-center leading-tight">
                            {{ cell.weekOff.badge || 'W-OFF' }}
                        </span>

                        <!-- Working-day shift timing (past / today / future) -->
                        <span v-else-if="cell.inMonth && cell.shiftText" data-testid="calendar-shift-time"
                            class="mt-auto text-[9px] sm:text-[10px] font-mono leading-tight"
                            :class="cell.isToday ? 'text-slate-800/90' : 'text-indigo-200/80'">
                            {{ cell.shiftText }}
                        </span>

                        <!-- Non-applicable weekday inside assignment only -->
                        <span v-else-if="cell.inMonth && cell.showOffLabel" data-testid="calendar-nonworking"
                            class="mt-auto text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wide">
                            Off
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div v-if="!loading && hasAnyData"
            class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/50"
            data-testid="calendar-legend">
            <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#4aff7a]" />
                Today
            </span>
            <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-white/30 border border-white/20" />
                Weekly Off
            </span>
            <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-amber-400/70" />
                Holiday
            </span>
            <span v-if="shiftSummary" class="inline-flex items-center gap-1.5">
                <Icon name="lucide:clock" class="h-3 w-3 text-indigo-300/80" />
                Shift · {{ shiftSummary }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
    WEEKDAY_HEADERS,
    getMonthCells,
    monthLabel,
    matchWeekOff,
    buildHolidayIndex,
    assignmentForDate,
    classifyCalendarDay,
    isFlexibleShift,
    shiftRangeLabel,
    toDateKey,
    isPrevNavDisabled,
    isNextNavDisabled,
} from '../../data/attendanceCalendar'
import { loadAttendanceCalendarData, ensureHolidayYearAvailability, getAttendanceCalendarCache } from '../../data/attendanceCalendarData'
import { useAuthStore } from '../../stores/shared/auth.store'

const auth = useAuthStore()

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

const loading = ref(true)
const shiftAssignment = ref(null)
const shift = ref(null)
const shiftAssignments = ref([])
const weekOffAssignment = ref(null)
const weekOffs = ref([])
const holidays = ref([])
const availableHolidayYears = ref([])
const holidayPolicyId = ref('')
const holidayPolicyName = ref('')

const NEXT_YEAR_DISABLED_REASON = "Next year's holiday calendar is not yet available."

const employeeId = computed(() => {
    const e = auth.employee
    if (!e) return ''
    if (typeof e === 'string') return e
    return e.id || e.employee_id || ''
})

const organizationId = computed(() => auth.organization || auth.user?.organization_id || '')

const title = computed(() => monthLabel(viewYear.value, viewMonth.value))

const prevDisabled = computed(() => isPrevNavDisabled(viewYear.value, viewMonth.value, now))

const nextDisabled = computed(() =>
    isNextNavDisabled(viewYear.value, viewMonth.value, availableHolidayYears.value))

const nextDisabledReason = NEXT_YEAR_DISABLED_REASON

const hasAnyData = computed(() =>
    !!(shiftAssignment.value || shift.value || shiftAssignments.value.length || weekOffAssignment.value))

const holidayIndex = computed(() => buildHolidayIndex(holidays.value))

const shiftSummary = computed(() => {
    const s = shift.value
    if (!s) return ''
    if (isFlexibleShift(s)) return s.name ? `${s.name} · Flexible` : 'Flexible shift'
    const range = shiftRangeLabel(s)
    return s.name ? `${s.name} · ${range}` : range
})

const cells = computed(() => {
    const raw = getMonthCells(viewYear.value, viewMonth.value)
    const todayKey = toDateKey(new Date())
    const weekOffList = weekOffs.value
    const assignments = shiftAssignments.value.length
        ? shiftAssignments.value
        : (shiftAssignment.value ? [shiftAssignment.value] : [])
    const hIndex = holidayIndex.value

    return raw.map((c) => {
        // Out-of-month placeholders: day number only, no statuses
        if (!c.inMonth) {
            return {
                ...c,
                isToday: false,
                status: 'blank',
                holiday: null,
                weekOff: null,
                shiftText: '',
                isWorkingDay: null,
                showOffLabel: false,
            }
        }

        const isToday = c.dateKey === todayKey
        const assignment = assignmentForDate(c.date, assignments)
        const s = assignment?.shift || null
        const weekOff = matchWeekOff(c.date, weekOffList)
        const holiday = hIndex.get(c.dateKey) || null

        const cls = classifyCalendarDay({
            date: c.date,
            dateKey: c.dateKey,
            assignment,
            shift: s,
            weekOff,
            holiday,
        })

        return {
            ...c,
            isToday,
            status: cls.status,
            holiday: cls.holiday,
            weekOff: cls.weekOff,
            shiftText: cls.shiftText,
            isWorkingDay: cls.isWorkingDay,
            showOffLabel: cls.showOffLabel,
        }
    })
})

function todayTagClass(cell) {
    if (cell.holiday) return 'bg-amber-500 text-slate-900'
    if (cell.weekOff) return 'bg-white/20 text-white'
    if (cell.shiftText) return 'bg-slate-900/80 text-white'
    return 'bg-slate-900/80 text-white'
}

function cellClasses(cell) {
    if (!cell.inMonth) {
        return 'border-transparent bg-transparent opacity-40'
    }
    // Today keeps highlight regardless of holiday / week-off / shift
    if (cell.isToday) {
        if (cell.holiday) {
            return 'border-[#4aff7a]/70 bg-amber-400/25 shadow-[0_0_0_3px_rgba(74,255,122,0.3)]'
        }
        if (cell.weekOff) {
            return 'border-[#4aff7a]/60 bg-[#4aff7a]/15 shadow-[0_0_0_2px_rgba(74,255,122,0.35)]'
        }
        return 'border-[#4aff7a] bg-[#4aff7a] shadow-[0_0_0_3px_rgba(74,255,122,0.25)]'
    }
    if (cell.holiday) {
        return 'border-amber-400/40 bg-amber-400/[0.12] hover:bg-amber-400/[0.18]'
    }
    if (cell.weekOff) {
        return 'border-white/15 bg-white/[0.07]'
    }
    if (cell.shiftText) {
        return 'border-white/10 bg-white/[0.06] hover:bg-white/10'
    }
    if (cell.showOffLabel || cell.status === 'nonworking') {
        return 'border-white/5 bg-white/[0.03]'
    }
    // unavailable / blank status inside month
    return 'border-white/10 bg-white/[0.05] hover:bg-white/10'
}

function prevMonth() {
    if (prevDisabled.value) return
    const d = new Date(viewYear.value, viewMonth.value - 1, 1)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
}

function nextMonth() {
    if (nextDisabled.value) return
    const d = new Date(viewYear.value, viewMonth.value + 1, 1)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
}

/** When viewing December, detect if the next year's policy holiday calendar became available (cache-safe). */
async function syncNextYearAvailability() {
    if (viewMonth.value !== 11) return
    const targetYear = viewYear.value + 1
    if (availableHolidayYears.value.includes(targetYear)) return
    if (!employeeId.value || !organizationId.value) return
    const years = await ensureHolidayYearAvailability({
        employeeId: employeeId.value,
        organizationId: organizationId.value,
        year: targetYear,
    })
    availableHolidayYears.value = Array.isArray(years) ? years : availableHolidayYears.value
    if (availableHolidayYears.value.includes(targetYear)) {
        const snap = getAttendanceCalendarCache()
        holidays.value = snap.holidays || holidays.value
    }
}

async function fetchData() {
    loading.value = true
    try {
        const data = await loadAttendanceCalendarData({
            employeeId: employeeId.value,
            organizationId: organizationId.value,
        })
        shiftAssignment.value = data.shiftAssignment
        shift.value = data.shift
        shiftAssignments.value = data.shiftAssignments || []
        weekOffAssignment.value = data.weekOffAssignment
        weekOffs.value = data.weekOffs || []
        holidays.value = data.holidays || []
        holidayPolicyId.value = data.holidayPolicyId || ''
        holidayPolicyName.value = data.holidayPolicyName || ''
        availableHolidayYears.value = data.availableHolidayYears || []
        await syncNextYearAvailability()
    } catch (err) {
        console.error('[AttendanceCalendar] load failed:', err)
        shiftAssignment.value = null
        shift.value = null
        shiftAssignments.value = []
        weekOffAssignment.value = null
        weekOffs.value = []
        holidays.value = []
        holidayPolicyId.value = ''
        holidayPolicyName.value = ''
        availableHolidayYears.value = []
    } finally {
        loading.value = false
    }
}

watch([viewYear, viewMonth], () => {
    syncNextYearAvailability()
})

watch([employeeId, organizationId], ([emp], [prevEmp]) => {
    if (emp && emp !== prevEmp) fetchData()
})

onMounted(fetchData)
</script>
