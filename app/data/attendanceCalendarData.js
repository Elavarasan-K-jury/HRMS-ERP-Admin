/**
 * Employee attendance calendar data loader.
 * Reuses existing shift-assignment + weekly-off + holiday APIs.
 * Module-level cache: no refetch when Calendar remounts on tab switches.
 *
 * Loads ALL shift assignments (not active_only-only) so past/future months
 * resolve the assignment that covered each date.
 */

let cache = null
let inflight = null

function todayKey() {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

function dayOnly(iso) {
    return iso ? String(iso).slice(0, 10) : ''
}

/** Prefer assignment covering today; else earliest by valid_from; else first. */
function pickShiftAssignment(assignments) {
    if (!Array.isArray(assignments) || !assignments.length) return null
    const tk = todayKey()
    const covering = assignments.filter((a) => {
        const from = dayOnly(a?.valid_from)
        const to = dayOnly(a?.valid_to)
        if (from && tk < from) return false
        if (to && tk > to) return false
        return true
    })
    return covering[0] || assignments[0] || null
}

function pickWeeklyOffAssignment(assignments) {
    if (!Array.isArray(assignments) || !assignments.length) return null
    const tk = todayKey()
    const covering = assignments.filter((a) => {
        const from = dayOnly(a?.effective_from)
        const to = dayOnly(a?.effective_to)
        // inverted / empty windows still usable when active_only would drop them
        if (from && to && from > to) return true
        if (from && tk < from) return false
        if (to && to >= from && tk > to) return false
        return true
    })
    return covering[0] || assignments[0] || null
}

/**
 * Resolve each assignment's shift from Shift Master (`GET /shifts/:id`).
 * Shift Master is the sole source of shift timing: when the shift no longer
 * exists there (404 = soft-deleted / removed), drop the embedded copy — the
 * assignment API embeds shift rows without filtering deletedAt.
 * Non-404 failures keep the embedded shift (transient outage resilience).
 */
async function hydrateShifts($api, assignments) {
    const byId = new Map()
    const missing = new Set()
    const ids = [...new Set(assignments.map((a) => a?.shift_id).filter(Boolean))]
    await Promise.all(ids.map(async (id) => {
        try {
            const { data } = await $api.get(`/shifts/${id}`)
            if (data && !data.error) byId.set(id, data)
            else missing.add(id)
        } catch (err) {
            if (err?.response?.status === 404) missing.add(id)
            /* else transient failure: keep embedded shift only */
        }
    }))
    return assignments.map((a) => {
        if (a?.shift_id && missing.has(a.shift_id)) {
            return { ...a, shift: null }
        }
        const detail = a?.shift_id ? byId.get(a.shift_id) : null
        return {
            ...a,
            shift: detail ? { ...(a.shift || {}), ...detail } : (a.shift || null),
        }
    })
}

/**
 * Normalize holiday API rows → { dateKey, name, leaveOptional } for calendar matching.
 * leave_optional / leaveOptional === true → optional (excluded by matchMandatoryHoliday).
 */
function normalizeHolidays(rawList) {
    if (!Array.isArray(rawList)) return []
    return rawList.map((h) => ({
        id: h?.id,
        date: h?.date,
        dateKey: dayOnly(h?.date),
        name: h?.name || 'Holiday',
        leaveOptional: h?.leave_optional === true || h?.leaveOptional === true,
        leave_optional: h?.leave_optional === true || h?.leaveOptional === true,
        policy_id: h?.policy_id || '',
        type: h?.type || '',
    }))
}

/** Distinct calendar years present on a normalized holiday list. */
function yearsFromHolidays(holidays) {
    const years = new Set()
    for (const h of holidays) {
        const y = Number(String(h?.dateKey || '').slice(0, 4))
        if (Number.isFinite(y) && y > 1970) years.add(y)
    }
    return [...years].sort((a, b) => a - b)
}

/** Current employee → holiday policy assignment (existing endpoint). */
async function loadEmployeeHolidayPolicy($api, employeeId, organizationId) {
    try {
        const { data } = await $api.get(`/employees/${employeeId}/holiday-policy`, {
            params: { organization_id: organizationId },
        })
        return data?.assignment || null
    } catch {
        return null
    }
}

/**
 * Holidays for the employee's assigned policy only.
 * No policy → [] (never fall back to org-wide holidays).
 */
async function loadPolicyHolidays($api, organizationId, policyId) {
    if (!organizationId || !policyId) return []
    try {
        const { data } = await $api.get('/holidays', {
            params: { organization_id: organizationId, policy_id: policyId },
        })
        const list = normalizeHolidays(data?.holidays || [])
        // Defense in depth: drop rows from any other policy
        return list.filter((h) => !h.policy_id || h.policy_id === policyId)
    } catch {
        return []
    }
}

/**
 * @returns {Promise<{
 *   shiftAssignment, shift, shiftAssignments, weekOffAssignment, weekOffs,
 *   holidays, holidayPolicyId, holidayPolicyName, availableHolidayYears, loaded:boolean
 * }>}
 */
export async function loadAttendanceCalendarData({ employeeId, organizationId, force = false } = {}) {
    if (cache && !force) return cache
    if (inflight && !force) return inflight

    if (!employeeId) {
        cache = {
            shiftAssignment: null,
            shift: null,
            shiftAssignments: [],
            weekOffAssignment: null,
            weekOffs: [],
            holidays: [],
            holidayPolicyId: '',
            holidayPolicyName: '',
            availableHolidayYears: [],
            loaded: true,
        }
        return cache
    }

    const { $api } = useNuxtApp()
    inflight = (async () => {
        try {
            // ALL assignments so historical/future dates can resolve coverage
            const { data: saData } = await $api.get('/shift-assignments', {
                params: { employee_id: employeeId },
            })
            let assignments = saData?.assignments || []
            // Fallback: active_only if bare call returned empty
            if (!assignments.length) {
                try {
                    const { data: activeData } = await $api.get('/shift-assignments', {
                        params: { employee_id: employeeId, active_only: true },
                    })
                    assignments = activeData?.assignments || []
                } catch { /* empty */ }
            }
            assignments = await hydrateShifts($api, assignments)
            const shiftAssignment = pickShiftAssignment(assignments)
            const shift = shiftAssignment?.shift || null

            let weekOffAssignment = null
            try {
                const woParams = { employee_id: employeeId }
                if (organizationId) woParams.organization_id = organizationId
                const { data: woData } = await $api.get('/weekly-off/assignments', { params: woParams })
                weekOffAssignment = pickWeeklyOffAssignment(woData?.assignments || [])
            } catch {
                weekOffAssignment = null
            }

            // Employee-scoped holidays: assignment → policy → policy holidays only
            const holidayPolicy = await loadEmployeeHolidayPolicy($api, employeeId, organizationId)
            const holidayPolicyId = holidayPolicy?.policy_id || ''
            const holidayPolicyName = holidayPolicy?.policy_name || ''
            const holidays = await loadPolicyHolidays($api, organizationId, holidayPolicyId)
            const availableHolidayYears = yearsFromHolidays(holidays)

            const result = {
                shiftAssignment,
                shift,
                shiftAssignments: assignments,
                weekOffAssignment,
                weekOffs: Array.isArray(weekOffAssignment?.week_offs) ? weekOffAssignment.week_offs : [],
                holidays,
                holidayPolicyId,
                holidayPolicyName,
                availableHolidayYears,
                loaded: true,
            }
            cache = result
            return result
        } finally {
            inflight = null
        }
    })()

    return inflight
}

/**
 * Detect (without full app refresh) whether the assigned policy has holidays
 * prepared for `year`. Merges into module cache when found.
 * @returns {Promise<number[]>} updated availableHolidayYears (cache-backed)
 */
export async function ensureHolidayYearAvailability({ employeeId, organizationId, year } = {}) {
    const y = Number(year)
    if (!cache || !employeeId || !organizationId || !Number.isFinite(y)) {
        return cache?.availableHolidayYears || []
    }
    if (Array.isArray(cache.availableHolidayYears) && cache.availableHolidayYears.includes(y)) {
        return cache.availableHolidayYears
    }
    if (!cache.holidayPolicyId) return cache.availableHolidayYears || []

    const { $api } = useNuxtApp()
    try {
        const { data } = await $api.get('/holidays', {
            params: {
                organization_id: organizationId,
                policy_id: cache.holidayPolicyId,
                year: String(y),
            },
        })
        const list = normalizeHolidays(data?.holidays || [])
            .filter((h) => !h.policy_id || h.policy_id === cache.holidayPolicyId)
        if (!list.length) return cache.availableHolidayYears || []

        const seen = new Set(cache.holidays.map((h) => `${h.dateKey}|${h.name}|${h.id || ''}`))
        for (const h of list) {
            const key = `${h.dateKey}|${h.name}|${h.id || ''}`
            if (!seen.has(key)) {
                cache.holidays.push(h)
                seen.add(key)
            }
        }
        cache.availableHolidayYears = yearsFromHolidays(cache.holidays)
        return cache.availableHolidayYears
    } catch {
        return cache.availableHolidayYears || []
    }
}

export function clearAttendanceCalendarCache() {
    cache = null
    inflight = null
}

/** Snapshot of current module cache (holidays + available years) without refetch. */
export function getAttendanceCalendarCache() {
    return cache
        ? {
            holidays: cache.holidays || [],
            availableHolidayYears: cache.availableHolidayYears || [],
            holidayPolicyId: cache.holidayPolicyId || '',
            holidayPolicyName: cache.holidayPolicyName || '',
        }
        : { holidays: [], availableHolidayYears: [], holidayPolicyId: '', holidayPolicyName: '' }
}

export default {
    loadAttendanceCalendarData,
    clearAttendanceCalendarCache,
    ensureHolidayYearAvailability,
    getAttendanceCalendarCache,
}
