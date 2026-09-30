/**
 * Attendance Calendar helpers — pure date / week-off / holiday logic (no UI, no fetch).
 * Monday-first grid; occurrence-based weekly off; date-safe holiday matching.
 */

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_TYPE_TO_KEY = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday',
}
const FREQUENCY_COUNT = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    FOURTH: 4,
    FIFTH: 5,
}

export function pad2(n) {
    return String(n).padStart(2, '0')
}

export function toDateKey(d) {
    if (!d || Number.isNaN(d.getTime?.() ?? NaN)) return ''
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Date-only YYYY-MM-DD from ISO / Date / string — never UTC-shift a calendar day. */
export function dayOnlyKey(val) {
    if (!val) return ''
    if (val instanceof Date) return toDateKey(val)
    const s = String(val)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ''
    return toDateKey(d)
}

export function parseDateKey(key) {
    if (!key) return null
    const m = String(key).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!m) return null
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return Number.isNaN(d.getTime()) ? null : d
}

export function monthLabel(year, monthIndex) {
    return `${MONTH_SHORT[monthIndex]} ${year}`
}

/** Canonical Shift HH:mm (or legacy epoch / ISO) → `09:30 AM`. */
export function formatShiftTime(hm) {
    if (!hm) return ''
    const m = String(hm).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
    if (m) {
        const h = Number(m[1])
        if (h > 23) return ''
        const period = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 === 0 ? 12 : h % 12
        return `${String(h12).padStart(2, '0')}:${m[2]} ${period}`
    }
    const epoch = String(hm).match(/^1970-\d{2}-\d{2}T(\d{2}):(\d{2})/)
    if (epoch) {
        const h = Number(epoch[1])
        if (h > 23) return ''
        const period = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 === 0 ? 12 : h % 12
        return `${String(h12).padStart(2, '0')}:${epoch[2]} ${period}`
    }
    const d = new Date(hm)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function shiftRangeLabel(shift) {
    if (!shift) return ''
    const st = formatShiftTime(shift.start_time)
    const et = formatShiftTime(shift.end_time)
    if (st && et) return `${st} – ${et}`
    return st || et
}

/** 1-based nth occurrence of this weekday within the month. */
export function occurrenceInMonth(date) {
    return Math.floor((date.getDate() - 1) / 7) + 1
}

export function isLastOccurrenceInMonth(date) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
    return next.getMonth() !== date.getMonth()
}

function frequencyMatches(freq, date) {
    const f = String(freq || 'ALL').toUpperCase()
    if (f === 'ALL') return true
    if (f === 'LAST') return isLastOccurrenceInMonth(date)
    const n = FREQUENCY_COUNT[f]
    if (!n) return true
    return occurrenceInMonth(date) === n
}

export function halfDayBadge(dayType) {
    const t = String(dayType || '').toUpperCase()
    if (t === 'FIRST_HALF') return '1st Half W-OFF'
    if (t === 'SECOND_HALF') return '2nd Half W-OFF'
    return 'W-OFF'
}

/**
 * Find weekly-off config for a calendar date.
 * @returns {null|{ dayType:string, fullDay:boolean, badge:string, dayOfWeek:string }}
 */
export function matchWeekOff(date, weekOffs) {
    if (!date || !Array.isArray(weekOffs) || !weekOffs.length) return null
    const jsDay = date.getDay()
    for (const entry of weekOffs) {
        const rawDay = entry?.day_of_week || entry?.day || ''
        const key = DAY_TYPE_TO_KEY[String(rawDay).toUpperCase()] || String(rawDay).toLowerCase()
        if (WEEKDAY_KEYS[jsDay] !== key) continue
        const dayOffs = Array.isArray(entry.day_offs) ? entry.day_offs : []
        if (!dayOffs.length) {
            return { dayType: 'FULL_DAY', fullDay: true, badge: 'W-OFF', dayOfWeek: rawDay }
        }
        for (const off of dayOffs) {
            if (!frequencyMatches(off?.frequency, date)) continue
            const dayType = String(off?.day_type || 'FULL_DAY').toUpperCase()
            const fullDay = dayType === 'FULL_DAY'
            return {
                dayType,
                fullDay,
                badge: halfDayBadge(dayType),
                dayOfWeek: rawDay,
                frequency: off?.frequency || 'ALL',
            }
        }
    }
    return null
}

/**
 * Assignment window inclusive on both ends; empty side = open.
 * Returns null when assignment is missing (caller treats as unknown / unavailable).
 */
export function isDateInAssignmentWindow(date, assignment) {
    if (!date) return false
    if (!assignment) return false
    const key = toDateKey(date)
    const from = dayOnlyKey(assignment.valid_from)
    const to = dayOnlyKey(assignment.valid_to)
    if (from && key < from) return false
    if (to && key > to) return false
    return true
}

/**
 * Pick the assignment that covers a specific calendar date from a list.
 * Preference: covering window with latest valid_from; else null (date outside all windows).
 */
export function assignmentForDate(date, assignments) {
    if (!date || !Array.isArray(assignments) || !assignments.length) return null
    const key = toDateKey(date)
    let best = null
    let bestFrom = ''
    for (const a of assignments) {
        const from = dayOnlyKey(a?.valid_from)
        const to = dayOnlyKey(a?.valid_to)
        if (from && key < from) continue
        if (to && key > to) continue
        if (!best || from >= bestFrom) {
            best = a
            bestFrom = from
        }
    }
    return best
}

/** Shift `applicable_days` map (keys = monday..sunday). Missing map → assume applicable. */
export function isApplicableWeekday(shift, date) {
    if (!date) return false
    const ad = shift?.applicable_days
    if (!ad || typeof ad !== 'object') return true
    const key = WEEKDAY_KEYS[date.getDay()]
    if (!(key in ad)) return true
    return ad[key] !== false
}

export function isFlexibleShift(shift) {
    const t = String(shift?.shift_type || '').toUpperCase()
    return t && t !== 'FIXED'
}

/**
 * Mandatory holiday for a date.
 * leaveOptional === false (or missing falsy) → mandatory → show.
 * leaveOptional === true → optional/restricted → ignore (return null).
 * Match strictly on YYYY-MM-DD date keys.
 */
export function matchMandatoryHoliday(dateKey, holidays) {
    if (!dateKey || !Array.isArray(holidays) || !holidays.length) return null
    for (const h of holidays) {
        if (h?.leaveOptional === true || h?.leave_optional === true) continue
        const hk = dayOnlyKey(h?.date || h?.dateKey)
        if (hk && hk === dateKey) {
            return {
                name: h.name || 'Holiday',
                dateKey: hk,
                leaveOptional: false,
            }
        }
    }
    return null
}

/** Build dateKey → mandatory holiday map for O(1) cell lookups. */
export function buildHolidayIndex(holidays) {
    const map = new Map()
    if (!Array.isArray(holidays)) return map
    for (const h of holidays) {
        if (h?.leaveOptional === true || h?.leave_optional === true) continue
        const hk = dayOnlyKey(h?.date || h?.dateKey)
        if (!hk) continue
        if (!map.has(hk)) map.set(hk, { name: h.name || 'Holiday', dateKey: hk })
    }
    return map
}

/**
 * Classify one in-month calendar date.
 * Priority: Mandatory Holiday > Full-Day W-OFF > Shift (working day).
 * Optional holidays are ignored (never returned).
 *
 * status: 'holiday' | 'weekoff' | 'shift' | 'nonworking' | 'unavailable'
 *  - holiday    → mandatory holiday badge
 *  - weekoff    → full-day W-OFF (or half-day badge when fullDay=false, still under weekoff)
 *  - shift      → working day with shift timing (or Flexible)
 *  - nonworking → inside assignment but applicable_days[weekday] === false
 *  - unavailable→ date outside every assignment window (no shift known)
 */
export function classifyCalendarDay({
    date,
    dateKey,
    assignment,
    shift,
    weekOff,
    holiday,
}) {
    const flexible = isFlexibleShift(shift)
    const rangeLabel = shiftRangeLabel(shift)

    // 1. Mandatory holiday wins over shift + week-off
    if (holiday) {
        return {
            status: 'holiday',
            holiday,
            weekOff: null,
            shiftText: '',
            isWorkingDay: false,
            showOffLabel: false,
        }
    }

    // Full-day weekly off
    if (weekOff?.fullDay) {
        return {
            status: 'weekoff',
            holiday: null,
            weekOff,
            shiftText: '',
            isWorkingDay: false,
            showOffLabel: false,
        }
    }

    // Outside assignment validity → unavailable (no OFF label on ordinary days)
    if (!assignment) {
        return {
            status: 'unavailable',
            holiday: null,
            weekOff: weekOff || null,
            shiftText: '',
            isWorkingDay: false,
            showOffLabel: false,
        }
    }

    // Inside assignment: applicable weekday?
    const applicable = isApplicableWeekday(shift || assignment.shift, date)
    if (!applicable) {
        return {
            status: 'nonworking',
            holiday: null,
            weekOff: weekOff || null,
            shiftText: '',
            isWorkingDay: false,
            showOffLabel: true,
        }
    }

    // Half-day week-off still shows its badge (handled by caller via weekOff), plus optional shift on remainder is not required
    if (weekOff && !weekOff.fullDay) {
        return {
            status: 'weekoff',
            holiday: null,
            weekOff,
            shiftText: '',
            isWorkingDay: false,
            showOffLabel: false,
        }
    }

    // Working day → shift timing from assigned shift (past / today / future)
    let shiftText = ''
    if (flexible) {
        shiftText = 'Flexible'
    } else if (rangeLabel) {
        shiftText = rangeLabel
    }

    return {
        status: 'shift',
        holiday: null,
        weekOff: null,
        shiftText,
        isWorkingDay: true,
        showOffLabel: false,
    }
}

/**
 * Monday-first month grid (leading + trailing days from adjacent months).
 * @returns {Array<{ date: Date, dateKey: string, day: number, inMonth: boolean }>}
 */
export function getMonthCells(year, monthIndex) {
    const first = new Date(year, monthIndex, 1)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    // JS: 0=Sun … 6=Sat → Monday-first offset
    const lead = (first.getDay() + 6) % 7
    const cells = []
    for (let i = 0; i < lead; i++) {
        const d = new Date(year, monthIndex, i - lead + 1)
        cells.push({ date: d, dateKey: toDateKey(d), day: d.getDate(), inMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthIndex, day)
        cells.push({ date: d, dateKey: toDateKey(d), day, inMonth: true })
    }
    while (cells.length % 7 !== 0) {
        const d = new Date(year, monthIndex, daysInMonth + (cells.length - lead - daysInMonth) + 1)
        cells.push({ date: d, dateKey: toDateKey(d), day: d.getDate(), inMonth: false })
    }
    return cells
}

export const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Absolute month index (year*12 + month) for comparable navigation keys. */
export function monthKey(year, monthIndex) {
    return year * 12 + monthIndex
}

/**
 * Oldest allowed view month = current month − 3 (dynamic; not hardcoded).
 * Sep 2026 → Jun 2026. Disabled when viewing that oldest month (cannot go further back).
 */
export function isPrevNavDisabled(viewYear, viewMonth, now = new Date()) {
    const currentKey = monthKey(now.getFullYear(), now.getMonth())
    const viewKey = monthKey(viewYear, viewMonth)
    const oldestKey = currentKey - 3
    return viewKey <= oldestKey
}

/**
 * Next is disabled only when the click would cross into a new calendar year
 * whose holiday calendar is not prepared for the employee's assigned policy.
 * Same-year navigation (current year fully) is never blocked by this rule.
 */
export function isNextNavDisabled(viewYear, viewMonth, availableHolidayYears = []) {
    // Crossing year boundary only from December → January of viewYear+1
    if (viewMonth !== 11) return false
    const nextYear = viewYear + 1
    const years = Array.isArray(availableHolidayYears) ? availableHolidayYears : []
    return !years.includes(nextYear)
}

export default {
    getMonthCells,
    matchWeekOff,
    matchMandatoryHoliday,
    buildHolidayIndex,
    assignmentForDate,
    classifyCalendarDay,
    monthLabel,
    shiftRangeLabel,
    formatShiftTime,
    dayOnlyKey,
    isPrevNavDisabled,
    isNextNavDisabled,
    monthKey,
    WEEKDAY_HEADERS,
}
