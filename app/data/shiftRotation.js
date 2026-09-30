export function todayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatShortDate(iso) {
    if (!iso) return '—'
    const s = String(iso).slice(0, 10)
    const d = new Date(`${s}T00:00:00`)
    if (Number.isNaN(d.getTime())) return s
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function shiftStartTime(shift) {
    if (!shift) return ''
    return String(shift.startTime || shift.start_time || '99:99')
}

export function byStartTime(a, b) {
    const cmp = shiftStartTime(a).localeCompare(shiftStartTime(b))
    if (cmp !== 0) return cmp
    return String(a?.name || '').localeCompare(String(b?.name || ''))
}

/**
 * Date-only, inclusive coverage check on YYYY-MM-DD business dates.
 * Compares ISO date prefixes as strings — never parses through local time,
 * so a browser timezone can never shift the day.
 */
export function coversBusinessDate(row, dateStr) {
    if (!row || !dateStr) return false
    const from = String(row.validFrom || row.valid_from || '').slice(0, 10)
    const to = String(row.validTo || row.valid_to || '').slice(0, 10)
    if (!from || from > dateStr) return false
    if (to && to < dateStr) return false
    return true
}

/**
 * Assignment-as-of-date resolution from EmployeeShiftAssignment rows
 * (source of truth, fetched from the server). Rows arrive ordered by
 * validFrom desc — first covering row wins.
 */
export function shiftIdAsOf(assignmentsByEmp, empId, dateStr) {
    if (!assignmentsByEmp || !empId || !dateStr) return null
    const rows = typeof assignmentsByEmp.get === 'function'
        ? assignmentsByEmp.get(empId)
        : assignmentsByEmp[empId]
    if (!rows || !rows.length) return null
    const hit = rows.find(r => coversBusinessDate(r, dateStr))
    if (!hit) return null
    return hit.shiftId || hit.shift_id || null
}

export function effectiveShiftIdFor(emp, overrides, assignmentsByEmp, dateStr) {
    const ov = overrides && emp ? overrides[emp.id] : null
    if (ov && ov.shiftId) return ov.shiftId
    if (assignmentsByEmp && dateStr) return shiftIdAsOf(assignmentsByEmp, emp?.id, dateStr)
    return emp?.current_shift?.id || null
}

export function resolveShiftFor(emp, shiftsById, overrides) {
    const id = effectiveShiftIdFor(emp, overrides)
    if (!id) return null
    if (emp?.current_shift && emp.current_shift.id === id && !overrides?.[emp.id]) return emp.current_shift
    return shiftsById.get(id) || emp?.current_shift || { id, name: 'Shift', startTime: '' }
}

export function buildShiftIndex(shifts) {
    return new Map((shifts || []).map(s => [s.id, s]))
}

function makeGroup(shiftId, shift, employees) {
    return {
        key: shiftId || 'none',
        shiftId: shiftId || '',
        shift: shift || null,
        label: shift ? shift.name : 'No Shift Assigned',
        employees,
    }
}

export function buildRosterGroups({ employees = [], shifts = [], overrides = {}, search = '', shiftFilter = '', assignmentsByEmp = null, dateStr = '' }) {
    const q = String(search || '').trim().toLowerCase()
    const filtered = (employees || []).filter(emp => {
        if (!q) return true
        return (emp.full_name || '').toLowerCase().includes(q) ||
            (emp.employee_code || '').toLowerCase().includes(q)
    })

    const rowsByKey = new Map()
    for (const emp of filtered) {
        const sid = effectiveShiftIdFor(emp, overrides, assignmentsByEmp, dateStr) || 'none'
        if (!rowsByKey.has(sid)) rowsByKey.set(sid, [])
        rowsByKey.get(sid).push(emp)
    }

    const groups = []
    if (shiftFilter === 'none') {
        groups.push(makeGroup('', null, rowsByKey.get('none') || []))
    } else {
        const target = shiftFilter
            ? (shifts || []).filter(s => s.id === shiftFilter)
            : [...(shifts || [])].sort(byStartTime)
        for (const shift of target) {
            const rows = rowsByKey.get(shift.id) || []
            if (rows.length || !q || shiftFilter) {
                groups.push(makeGroup(shift.id, shift, rows))
            }
        }
        const unassigned = rowsByKey.get('none') || []
        if (unassigned.length && !shiftFilter) {
            groups.push(makeGroup('', null, unassigned))
        }
    }

    return { groups, filteredEmployees: filtered, isEmpty: filtered.length === 0 }
}

export function buildRotationContext({ employees = [], shifts = [] }) {
    const byId = buildShiftIndex(shifts)
    const distinct = new Map()
    const excluded = []
    for (const emp of employees) {
        if (!emp.shiftId) {
            excluded.push(emp)
            continue
        }
        if (!distinct.has(emp.shiftId)) {
            distinct.set(emp.shiftId, byId.get(emp.shiftId) || { id: emp.shiftId, name: emp.shiftName || 'Shift', startTime: '' })
        }
    }
    const ordered = [...distinct.values()].sort(byStartTime)
    const chain = ordered.length === 3
        ? ordered.map((s, i) => ({ from: s, to: ordered[(i + 1) % 3] }))
        : null
    return { ordered, chain, excluded }
}

/* ------------------------------------------------------------------ */
/* 📤 XLSX export builders (pure — SheetJS lives in the component)     */
/* ------------------------------------------------------------------ */

export const ROSTER_EXPORT_COLUMNS = [
    'Shift',
    'Shift Code',
    'Shift Timing',
    'Employee Code',
    'Employee Name',
    'Department',
    'Designation',
    'Location',
    'Weekly Off',
    'Assignment From',
    'Assignment To',
    'Status',
]

export const ROSTER_EXPORT_COL_WIDTHS = [22, 11, 20, 14, 26, 22, 28, 32, 16, 16, 16, 15]

/** Sheet names: Excel forbids []:*?/\ and caps at 31 chars. */
export function sheetNameFor(label) {
    const cleaned = String(label || 'Shift').replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim()
    return (cleaned || 'Shift').slice(0, 31)
}

/** The EmployeeShiftAssignment row covering dateStr, or null. */
export function coveringAssignment(assignmentsByEmp, empId, dateStr) {
    if (!assignmentsByEmp || !empId || !dateStr) return null
    const rows = typeof assignmentsByEmp.get === 'function'
        ? assignmentsByEmp.get(empId)
        : assignmentsByEmp[empId]
    if (!rows || !rows.length) return null
    return rows.find(r => coversBusinessDate(r, dateStr)) || null
}

/**
 * Status relative to *today* — a future assignment is never labeled "Current".
 * (The From/To columns carry the as-of window.)
 */
function exportStatus(row, dateStr) {
    if (!row) return 'No assignment'
    const today = todayStr()
    const from = String(row.validFrom || row.valid_from || '').slice(0, 10)
    const to = String(row.validTo || row.valid_to || '').slice(0, 10)
    const coversToday = (!from || from <= today) && (!to || to >= today)
    if (coversToday) return 'Current'
    if (from && from > today) return 'Upcoming'
    return 'Ended'
}

function designationLabel(emp) {
    const d = emp?.designation
    if (!d) return ''
    return typeof d === 'string' ? d : (d.name || '')
}

/**
 * Data rows for one roster group (already grouped for dateStr by
 * buildRosterGroups). Returns arrays matching ROSTER_EXPORT_COLUMNS.
 */
export function buildRosterExportRows({ group = {}, assignmentsByEmp = null, dateStr = '' }) {
    const shift = group.shift || null
    const base = [
        group.label || shift?.name || 'No Shift Assigned',
        shift?.code || '—',
        shift?.timings || '—',
    ]
    return (group.employees || []).map(emp => {
        const row = coveringAssignment(assignmentsByEmp, emp?.id, dateStr)
        return [
            ...base,
            emp.employee_code || '—',
            emp.full_name || '—',
            emp.department_name || '—',
            designationLabel(emp) || '—',
            emp.location_name || '—',
            emp.current_weekly_off?.name || 'Not assigned',
            row ? String(row.validFrom || row.valid_from || '').slice(0, 10) : '—',
            row ? (String(row.validTo || row.valid_to || '').slice(0, 10) || 'Open') : '—',
            exportStatus(row, dateStr),
        ]
    })
}

/** First worksheet: file header + per-shift counts. */
export function buildRosterExportSummaryAoa({ groups = [], dateStr = '' }) {
    return [
        ['Shift Roster Export'],
        ['Effective date', dateStr || ''],
        [],
        ['Shift', 'Shift Code', 'Shift Timing', 'Employees'],
        ...groups.map(g => [
            g.label || '—',
            g.shift?.code || '—',
            g.shift?.timings || '—',
            (g.employees || []).length,
        ]),
    ]
}
