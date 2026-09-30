/**
 * UI-only deterministic Attendance Logs mock (Phase: Attendance Logs UI).
 * Same date always yields the same values. No backend / no randomness per render.
 */

const FILTER_MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DATE_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EFFECTIVE_POOL = ['3h 57m', '8h 35m', '8h 07m', '8h 08m', '8h 12m', '7h 48m', '8h 21m', '8h 02m', '8h 44m', '7h 55m', '8h 16m', '8h 29m']
const BREAK_POOL = ['0h 55m', '0h 53m', '0h 58m', '0h 57m', '0h 45m', '0h 50m', '0h 60m', '0h 48m', '0h 52m', '0h 47m']
const GROSS_POOL = ['4h 52m', '9h 28m', '9h 04m', '9h 05m', '9h 10m', '8h 43m', '9h 21m', '9h 00m', '9h 32m', '8h 50m', '9h 14m', '9h 25m']
const LATE_POOL = ['04:23 late', '02:22 late', '04:34 late', '03:38 late', '01:15 late', '05:02 late', '00:47 late', '02:58 late']

const HISTORY_TEMPLATES = [
    [
        { type: 'CLOCK_IN', time: '09:30 AM' },
        { type: 'CLOCK_OUT', time: '01:15 PM' },
        { type: 'CLOCK_IN', time: '02:00 PM' },
        { type: 'CLOCK_OUT', time: '06:30 PM' },
    ],
    [
        { type: 'CLOCK_IN', time: '09:27 AM' },
        { type: 'CLOCK_OUT', time: '01:20 PM' },
        { type: 'CLOCK_IN', time: '02:05 PM' },
        { type: 'CLOCK_OUT', time: '06:45 PM' },
    ],
    [
        { type: 'CLOCK_IN', time: '09:52 AM' },
        { type: 'CLOCK_OUT', time: '01:10 PM' },
        { type: 'CLOCK_IN', time: '01:55 PM' },
        { type: 'CLOCK_OUT', time: '06:40 PM' },
    ],
    [
        { type: 'CLOCK_IN', time: '09:34 AM' },
        { type: 'CLOCK_OUT', time: '02:00 PM' },
        { type: 'CLOCK_IN', time: '02:50 PM' },
        { type: 'CLOCK_OUT', time: '07:05 PM' },
    ],
    [
        { type: 'CLOCK_IN', time: '08:55 AM' },
        { type: 'CLOCK_OUT', time: '01:05 PM' },
        { type: 'CLOCK_IN', time: '01:50 PM' },
        { type: 'CLOCK_OUT', time: '05:40 PM' },
    ],
]

function hashSeed(str) {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return Math.abs(h)
}

function pick(pool, seed, salt) {
    return pool[(seed + salt) % pool.length]
}

function pad2(n) {
    return String(n).padStart(2, '0')
}

function toDateKey(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatRowDate(d) {
    return `${DAY_LABELS[d.getDay()]}, ${pad2(d.getDate())} ${DATE_MONTH_LABELS[d.getMonth()]}`
}

function buildDayRow(d, now) {
    const key = toDateKey(d)
    const seed = hashSeed(key)
    const isSunday = d.getDay() === 0
    const isFuture = d.getTime() > now.getTime() && toDateKey(now) !== key
    const isLeave = !isSunday && !isFuture && seed % 17 === 3

    const dateLabel = formatRowDate(d)
    const base = {
        id: key,
        dateKey: key,
        date: dateLabel,
        dayName: DAY_LABELS[d.getDay()],
        isWeekOff: false,
        isLeave: false,
        isFuture,
    }

    if (isFuture) {
        return {
            ...base,
            effective: '—',
            breakTaken: '—',
            gross: '—',
            arrival: { kind: 'none', label: '—' },
            history: [],
        }
    }

    if (isSunday) {
        return {
            ...base,
            isWeekOff: true,
            effective: '—',
            breakTaken: '—',
            gross: '—',
            arrival: { kind: 'week_off', label: 'W-OFF' },
            history: [],
        }
    }

    if (isLeave) {
        return {
            ...base,
            isLeave: true,
            effective: '—',
            breakTaken: '—',
            gross: '—',
            arrival: { kind: 'leave', label: 'LEAVE' },
            history: [],
        }
    }

    const effective = pick(EFFECTIVE_POOL, seed, 1)
    const breakTaken = pick(BREAK_POOL, seed, 2)
    const gross = pick(GROSS_POOL, seed, 3)
    const lateLabel = pick(LATE_POOL, seed, 4)
    const onTime = seed % 5 === 0
    const history = HISTORY_TEMPLATES[seed % HISTORY_TEMPLATES.length].map((h, i) => ({
        ...h,
        id: `${key}-${i}`,
    }))

    return {
        ...base,
        effective,
        breakTaken,
        gross,
        arrival: onTime
            ? { kind: 'ontime', label: 'On time' }
            : { kind: 'late', label: lateLabel },
        history,
        historyTotalGross: gross,
        historyTotalBreak: breakTaken,
    }
}

/** Exactly 7 period options: 30 DAYS + previous 6 months (no current month — overlaps 30 DAYS). */
export function getAttendancePeriodFilters(now = new Date()) {
    const filters = [{ id: '30d', label: '30 DAYS', kind: 'range' }]
    for (let i = 1; i <= 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const id = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
        filters.push({
            id,
            label: FILTER_MONTH_LABELS[d.getMonth()],
            kind: 'month',
            year: d.getFullYear(),
            month: d.getMonth(),
        })
    }
    return filters
}

function eachDay(start, end) {
    const out = []
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    while (cur <= last) {
        out.push(new Date(cur))
        cur.setDate(cur.getDate() + 1)
    }
    return out
}

/** Deterministic rows for a period id from getAttendancePeriodFilters. */
export function getAttendanceLogRows(periodId, now = new Date()) {
    if (periodId === '30d') {
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const start = new Date(end)
        start.setDate(start.getDate() - 29)
        return eachDay(start, end)
            .map(d => buildDayRow(d, now))
            .reverse()
    }

    const [y, m] = periodId.split('-').map(Number)
    if (!y || !m) return []
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    const cappedEnd = end > now ? now : end
    return eachDay(start, cappedEnd)
        .map(d => buildDayRow(d, now))
        .reverse()
}

export default {
    getAttendancePeriodFilters,
    getAttendanceLogRows,
}
