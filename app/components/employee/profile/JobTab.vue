<template>
    <div class="grid gap-4 md:grid-cols-2">
        <section class="card">
            <h2 class="hdr"><Icon name="lucide:briefcase" class="ic" /> Employment Information</h2>
            <div class="grid2">
                <div><span class="label">Employee ID</span>{{ employee.employee_code || '—' }}</div>
                <div><span class="label">Date of Joining</span>{{ employee.joining_date || '—' }}</div>
                <div><span class="label">Employment Type</span>{{ employmentTypeLabel }}</div>
                <div><span class="label">Worker Type</span>{{ workerTypeLabel }}</div>
                <div><span class="label">Employment Status</span>
                    <span class="chip" :class="statusMeta.cls">
                        <Icon :name="statusMeta.icon" class="chip-ic" /> {{ statusMeta.label }}
                    </span>
                </div>
                <div><span class="label">Probation</span>{{ probationInfo }}</div>
                <div><span class="label">Designation</span>{{ employee.designation?.name || '—' }}</div>
                <div><span class="label">Department</span>{{ departmentName || '—' }}</div>
                <div><span class="label">Pay Grade</span>{{ employee.pay_grade_name || '—' }}</div>
                <div><span class="label">Business Unit</span>{{ employee.organization?.name || '—' }}</div>
                <div><span class="label">Location</span>{{ employee.location_name || '—' }}</div>
            </div>
        </section>

        <section class="card">
            <h2 class="hdr"><Icon name="lucide:git-branch" class="ic" /> Reporting Structure</h2>
            <div class="grid2">
                <div><span class="label">Reporting Manager</span>{{ reportingManager || '—' }}</div>
                <div><span class="label">Secondary Manager</span>—</div>
                <div><span class="label">Job Role</span>{{ employee.designation?.name || '—' }}</div>
                <div><span class="label">Designation Level</span>{{ employee.designation?.level || '—' }}</div>
            </div>
        </section>

        <section class="card md:col-span-2">
            <h2 class="hdr"><Icon name="lucide:clock" class="ic" /> Employee Time</h2>
            <div class="grid2">
                <div class="shift-field">
                    <span class="label">Shift</span>
                    <div class="flex items-center gap-2">
                        <span>{{ shiftDisplayName }}</span>
                        <button v-if="canEdit && currentAssignment" class="edit-link" @click="openShiftDrawer" title="Update Shift">
                            <Icon name="lucide:pencil" class="h-3 w-3" />
                        </button>
                        <button v-else-if="canEdit" class="add-link" @click="openShiftDrawer">
                            <Icon name="lucide:plus" class="h-3 w-3" /> Add Shift
                        </button>
                    </div>
                </div>
                <div><span class="label">Shift Timings</span>{{ shiftTimings || '—' }}</div>
                <div><span class="label">Break</span>{{ breakLabel || '—' }}</div>
                <div class="weekly-off-field">
                    <span class="label">Weekly Off</span>
                    <div class="flex items-center gap-2">
                        <span>{{ weeklyOffPolicyName || 'Not assigned' }}</span>
                        <button v-if="canEdit && weeklyOffAssignment" class="edit-link" @click="openWeeklyOffDrawer" title="Update Weekly Off">
                            <Icon name="lucide:pencil" class="h-3 w-3" />
                        </button>
                        <button v-else-if="canEdit" class="add-link" @click="openWeeklyOffDrawer">
                            <Icon name="lucide:plus" class="h-3 w-3" /> Add Weekly Off
                        </button>
                    </div>
                </div>
                <div><span class="label">Probation Policy</span>{{ probation?.policy_name || '—' }}</div>
                <div><span class="label">Probation Duration</span>{{ probationDuration || '—' }}</div>
                <div class="holiday-policy-field">
                    <span class="label">Holiday Policy</span>
                    <div class="flex items-center gap-2">
                        <span>{{ holidayPolicyName || 'Not assigned' }}</span>
                        <button v-if="canEdit && holidayPolicyName" class="edit-link" @click="openHolidayDrawer">
                            <Icon name="lucide:pencil" class="h-3 w-3" />
                        </button>
                        <button v-else-if="canEdit" class="add-link" @click="openHolidayDrawer">
                            <Icon name="lucide:plus" class="h-3 w-3" /> Add Holiday Policy
                        </button>
                    </div>
                </div>
            </div>
            <p v-if="loadingShift" class="empty">Loading shift details…</p>
            <p v-else-if="shiftLoadError" class="empty">Failed to load shift details.</p>
            <p v-else-if="!currentAssignment" class="empty">{{ emptyShiftHint }}</p>
            <p v-if="weeklyOffLoadError" class="empty">Failed to load weekly off details.</p>
        </section>

        <section class="card md:col-span-2">
            <h2 class="hdr"><Icon name="lucide:history" class="ic" /> Employment Timeline</h2>
            <div v-if="timeline.length" class="timeline">
                <div v-for="(ev, i) in timeline" :key="i" class="tl-item">
                    <div class="tl-dot" :class="ev.type === 'confirm' ? 'tl-dot-green' : ev.type === 'probation' ? 'tl-dot-amber' : 'tl-dot-soft'" />
                    <div class="tl-body">
                        <p class="tl-title">{{ ev.title }}</p>
                        <p class="tl-date">{{ ev.date }}</p>
                    </div>
                </div>
            </div>
            <p v-else class="empty">No employment timeline available.</p>
        </section>
    </div>

    <!-- Write drawers: Org Admin only — never mounted on Employee Portal Job tab -->
    <EmployeeHolidayPolicyDrawer
        v-if="canEdit"
        v-model="holidayDrawerOpen"
        :employee-id="props.employeeId"
        :organization-id="props.organizationId"
        :current-policy-id="holidayPolicyId"
        :current-policy-name="holidayPolicyName"
        @saved="onHolidayPolicySaved"
    />

    <EmployeeShiftDrawer
        v-if="canEdit"
        v-model="shiftDrawerOpen"
        :employee-id="empId"
        :organization-id="orgId"
        :current-shift-id="currentShift?.id || currentAssignment?.shift_id || ''"
        :current-shift-name="shiftDisplayName"
        :current-assignment="currentAssignment"
        @saved="onShiftSaved"
    />

    <EmployeeWeeklyOffDrawer
        v-if="canEdit"
        v-model="weeklyOffDrawerOpen"
        :employee-id="empId"
        :organization-id="orgId"
        :current-policy-id="weeklyOffAssignment?.weekly_off_policy_id || ''"
        :current-policy-name="weeklyOffAssignment?.policy_name || ''"
        :current-assignment="weeklyOffAssignment"
        @saved="onWeeklyOffSaved"
    />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import EmployeeHolidayPolicyDrawer from './EmployeeHolidayPolicyDrawer.vue'
import EmployeeShiftDrawer from './EmployeeShiftDrawer.vue'
import EmployeeWeeklyOffDrawer from './EmployeeWeeklyOffDrawer.vue'
import { todayStr } from '~/data/shiftRotation'

const props = defineProps({
    employee: { type: Object, required: true },
    employeeId: { type: String, default: '' },
    organizationId: { type: String, default: '' },
    // Explicit context: Org Admin Job tab is read+write; Employee Portal Job tab is read-only.
    // Pattern matches PayGradeTable canEdit prop.
    canEdit: { type: Boolean, default: true },
})

const emptyShiftHint = computed(() =>
    props.canEdit
        ? 'No shift assigned yet — use Add Shift to assign one.'
        : 'No shift assigned yet.'
)

const departmentName = computed(() => {
    const e = props.employee
    if (e.department_name) return e.department_name
    return e.departments?.map(d => d.department?.name).filter(Boolean).join(', ') || ''
})

const reportingManager = computed(() => props.employee.reporting_manager?.full_name || '')

const workerTypeLabels = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERN: 'Intern',
    PERMANENT: 'Permanent',
}

const workerTypeLabel = computed(() => {
    const wt = props.employee.worker_type
    if (wt && workerTypeLabels[wt]) return workerTypeLabels[wt]
    if (wt) return wt.charAt(0) + wt.slice(1).toLowerCase()
    return props.employee.is_permanent ? 'Permanent' : '—'
})

const employmentTypeLabel = computed(() => {
    const t = props.employee.category?.employment_type
    if (!t) return '—'
    return t.charAt(0) + t.slice(1).toLowerCase()
})

const statusMeta = computed(() => {
    const s = (props.employee.employment_status || '').toUpperCase()
    const map = {
        PERMANENT: { label: 'Permanent', cls: 'chip-green', icon: 'lucide:shield-check' },
        PROBATION: { label: 'Probation', cls: 'chip-amber', icon: 'lucide:hourglass' },
        INTERNSHIP: { label: 'Internship', cls: 'chip-sky', icon: 'lucide:graduation-cap' },
        TRAINEE: { label: 'Trainee', cls: 'chip-violet', icon: 'lucide:book-open' },
        CONTRACT: { label: 'Contract', cls: 'chip-rose', icon: 'lucide:file-text' },
    }
    return map[s] || { label: s || 'Active', cls: 'chip-soft', icon: 'lucide:badge-check' }
})

const probation = computed(() => props.employee.probation || {})

const probationDuration = computed(() => {
    const p = probation.value
    if (!p.duration_value) return ''
    const unit = p.duration_unit === 'MONTHS' ? (p.duration_value === 1 ? 'month' : 'months')
        : p.duration_unit === 'DAYS' ? (p.duration_value === 1 ? 'day' : 'days')
        : p.duration_unit === 'WEEKS' ? (p.duration_value === 1 ? 'week' : 'weeks')
        : (p.duration_unit || '').toLowerCase()
    return `${p.duration_value} ${unit}`.trim()
})

const probationInfo = computed(() => {
    const e = props.employee
    const p = probation.value
    if (p?.in_progress) {
        const start = formatDate(p.start_date)
        const end = formatDate(p.end_date)
        return end ? `Yes (${start} → ${end})` : (start ? `Yes (${start})` : 'Yes')
    }
    if (p?.status === 'Completed') return 'Completed'
    if (e.is_permanent) return 'Completed'
    const startRaw = e.probation_start_date || ''
    const endRaw = e.probation_end_date || ''
    const done = endRaw && new Date(endRaw).getTime() < Date.now()
    const start = formatDate(startRaw)
    const end = formatDate(endRaw)
    if (done) return 'Completed'
    if (!start && !end) return '—'
    return end ? `Yes (${start} → ${end})` : (start ? `Yes (${start})` : '—')
})

const timeline = computed(() => {
    const e = props.employee
    const events = []
    if (e.joining_date) events.push({ title: 'Joined', date: e.joining_date, type: 'join' })
    if (e.probation_start_date || e.probation_end_date) {
        const start = formatDate(e.probation_start_date)
        const end = formatDate(e.probation_end_date)
        events.push({ title: 'Probation Period', date: start && end ? `${start} → ${end}` : (start || end), type: 'probation' })
    }
    if (e.is_permanent && !e.probation?.in_progress) events.push({ title: 'Confirmed / Permanent', date: '', type: 'confirm' })
    return events
})

/* ------------------------------------------------------------
 * Employee Time — shift timings + policy details
 * ---------------------------------------------------------- */
const assignments = ref([])
const loadingShift = ref(false)
const shiftLoadError = ref(false)
const shiftDrawerOpen = ref(false)

const empId = computed(() => props.employeeId || props.employee?.id || '')
const orgId = computed(() => props.organizationId || props.employee?.organization_id || props.employee?.organization?.id || '')

const dayOnly = (iso) => (iso ? String(iso).slice(0, 10) : '')

const loadShiftData = async () => {
    if (!empId.value) return
    loadingShift.value = true
    shiftLoadError.value = false
    try {
        const { $api } = useNuxtApp()
        // canEdit=false (Employee Portal): legacy active_only behavior, unchanged.
        // canEdit=true (Org Admin): load ALL assignments so future/upcoming rows are visible.
        const { data } = await $api.get('/shift-assignments', {
            params: props.canEdit
                ? { employee_id: empId.value }
                : { employee_id: empId.value, active_only: true },
        })
        const assigns = data?.assignments || []
        const withShift = await Promise.all(assigns.map(async (a) => {
            try {
                const { data: s } = await $api.get(`/shifts/${a.shift_id}`)
                return { ...a, shift: { ...a.shift, ...s, name: s?.name || a.shift?.name || '' } }
            } catch {
                return a
            }
        }))
        assignments.value = withShift
    } catch (err) {
        console.error('[JobTab] Shift load failed:', err)
        if (props.canEdit) {
            // Org Admin: never mask a failed load as "no assignment"
            shiftLoadError.value = true
        } else {
            assignments.value = [] // legacy Employee Portal behavior, unchanged
        }
    } finally {
        loadingShift.value = false
    }
}

onMounted(loadShiftData)

// canEdit=false (Employee Portal): first active row — exactly the previous behavior.
// canEdit=true (Org Admin): resolve with date-only inclusive bounds:
//   covering today -> today's assignment; else earliest future row (upcoming);
//   past-only / none -> null (Add Shift).
const resolvedAssignment = computed(() => {
    const rows = assignments.value
    if (!props.canEdit) return rows[0] || null
    const today = todayStr()
    const covering = rows.find((r) => {
        const from = dayOnly(r.valid_from)
        const to = dayOnly(r.valid_to)
        return from <= today && (!to || to >= today)
    })
    if (covering) return covering
    let earliest = null
    for (const r of rows) {
        const from = dayOnly(r.valid_from)
        if (from > today && (!earliest || from < dayOnly(earliest.valid_from))) earliest = r
    }
    return earliest
})

const currentAssignment = computed(() => resolvedAssignment.value)
const currentShift = computed(() => {
    const a = currentAssignment.value
    if (!a) return null
    return a.shift || { id: a.shift_id, name: '' }
})

const isUpcoming = computed(() => {
    if (!props.canEdit) return false
    const a = currentAssignment.value
    return !!a && dayOnly(a.valid_from) > todayStr()
})

const shiftDisplayName = computed(() => {
    if (!currentAssignment.value) return 'Not assigned'
    const base = currentShift.value?.name || 'Assigned shift'
    if (isUpcoming.value) {
        const d = new Date(`${dayOnly(currentAssignment.value.valid_from)}T00:00:00`)
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        return `${base} (from ${label})`
    }
    return base
})

const shiftTimings = computed(() => {
    const s = currentShift.value
    if (!s) return ''
    const st = formatTime(s.start_time)
    const et = formatTime(s.end_time)
    return st && et ? `${st} → ${et}` : (st || et)
})

function openShiftDrawer() {
    if (!props.canEdit) return
    shiftDrawerOpen.value = true
}

async function onShiftSaved() {
    await loadShiftData()
}

const breakLabel = computed(() => {
    const mins = currentShift.value?.break_minutes
    return mins ? `${mins} min` : ''
})

/* ------------------------------------------------------------
 * Employee Weekly Off (policy assignment — not shift.weekly_off days)
 * ---------------------------------------------------------- */
const weeklyOffAssignments = ref([])
const weeklyOffLoading = ref(false)
const weeklyOffLoadError = ref(false)
const weeklyOffDrawerOpen = ref(false)

const loadWeeklyOffData = async () => {
    if (!empId.value) return
    weeklyOffLoading.value = true
    weeklyOffLoadError.value = false
    try {
        const { $api } = useNuxtApp()
        // organization_id: the endpoint requires org context; the Employee Portal
        // never sends an x-org-id header, so pass it explicitly when known.
        // Fetch ALL assignments (both scopes) so future/upcoming rows are visible;
        // resolution below picks covering-today vs earliest future.
        const { data } = await $api.get('/weekly-off/assignments', {
            params: { employee_id: empId.value, organization_id: orgId.value || undefined },
        })
        weeklyOffAssignments.value = data?.assignments || []
    } catch (err) {
        console.error('[JobTab] Weekly Off load failed:', err)
        // Never mask a failed load as "no assignment"
        weeklyOffLoadError.value = true
        weeklyOffAssignments.value = []
    } finally {
        weeklyOffLoading.value = false
    }
}

// Resolve with date-only inclusive bounds (both scopes):
//   covering today -> today's assignment; else earliest future row (upcoming);
//   past-only / none -> null (Not assigned / Add Weekly Off for admins).
const resolvedWeeklyOffAssignment = computed(() => {
    const rows = weeklyOffAssignments.value
    const today = todayStr()
    const covering = rows.find((r) => {
        const from = dayOnly(r.effective_from)
        const to = dayOnly(r.effective_to)
        return from <= today && (!to || to >= today)
    })
    if (covering) return covering
    let earliest = null
    for (const r of rows) {
        const from = dayOnly(r.effective_from)
        if (from > today && (!earliest || from < dayOnly(earliest.effective_from))) earliest = r
    }
    return earliest
})

const weeklyOffAssignment = computed(() => resolvedWeeklyOffAssignment.value)

const weeklyOffIsUpcoming = computed(() => {
    const a = weeklyOffAssignment.value
    return !!a && dayOnly(a.effective_from) > todayStr()
})

const weeklyOffPolicyName = computed(() => {
    const a = weeklyOffAssignment.value
    if (!a) return ''
    const base = a.policy_name || ''
    if (weeklyOffIsUpcoming.value) {
        const d = new Date(`${dayOnly(a.effective_from)}T00:00:00`)
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        return `${base} (from ${label})`
    }
    return base
})

function openWeeklyOffDrawer() {
    if (!props.canEdit) return
    weeklyOffDrawerOpen.value = true
}

async function onWeeklyOffSaved() {
    await loadWeeklyOffData()
}

function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(hm) {
    if (!hm) return ''
    // Canonical Shift wire format is HH:mm — pure time-of-day, never new Date("04:00")
    const m = String(hm).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
    if (m) {
        const h = Number(m[1])
        if (h > 23) return ''
        const period = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 === 0 ? 12 : h % 12
        return `${String(h12).padStart(2, '0')}:${m[2]} ${period}`
    }
    // Legacy epoch time-of-day (1970-01-01T04:00:00.000Z) — read UTC HH:mm only, no local TZ shift
    const epoch = String(hm).match(/^1970-\d{2}-\d{2}T(\d{2}):(\d{2})/)
    if (epoch) {
        const h = Number(epoch[1])
        if (h > 23) return ''
        const period = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 === 0 ? 12 : h % 12
        return `${String(h12).padStart(2, '0')}:${epoch[2]} ${period}`
    }
    // Other ISO datetimes (real events): local display fields only
    const d = new Date(hm)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/* ------------------------------------------------------------
 * Employee Holiday Policy
 * ---------------------------------------------------------- */
const holidayPolicyId = ref('')
const holidayPolicyName = ref('')
const holidayDrawerOpen = ref(false)

const loadHolidayPolicy = async () => {
    const empId = props.employeeId || props.employee?.id
    const orgId = props.organizationId || props.employee?.organization_id
    if (!empId || !orgId) return
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/employees/${empId}/holiday-policy`, {
            params: { organization_id: orgId },
        })
        const a = data?.assignment
        holidayPolicyId.value = a?.policy_id || ''
        holidayPolicyName.value = a?.policy_name || ''
    } catch (err) {
        console.error('[JobTab] Holiday policy load failed:', err)
        holidayPolicyId.value = ''
        holidayPolicyName.value = ''
    }
}

function openHolidayDrawer() {
    if (!props.canEdit) return
    holidayDrawerOpen.value = true
}

async function onHolidayPolicySaved() {
    await loadHolidayPolicy()
}

onMounted(loadHolidayPolicy)

onMounted(loadWeeklyOffData)
</script>

<style scoped>
.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    min-width: 0;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 10px;
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.label {
    display: block;
    font-size: 10.5px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(15, 23, 42, 0.7);
}

.chip-soft { background: rgba(148, 163, 184, 0.18); border-color: rgba(148, 163, 184, 0.35); }
.chip-green { border-color: rgba(34, 197, 94, 0.7); background: rgba(34, 197, 94, 0.18); color: #bbf7d0; }
.chip-amber { border-color: rgba(245, 158, 11, 0.7); background: rgba(245, 158, 11, 0.18); color: #fde68a; }
.chip-sky { border-color: rgba(14, 165, 233, 0.7); background: rgba(14, 165, 233, 0.18); color: #bae6fd; }
.chip-violet { border-color: rgba(139, 92, 246, 0.7); background: rgba(139, 92, 246, 0.18); color: #ddd6fe; }
.chip-rose { border-color: rgba(244, 63, 94, 0.7); background: rgba(244, 63, 94, 0.18); color: #fecdd3; }

.chip-ic { width: 13px; height: 13px; }

.timeline {
    position: relative;
    padding-left: 20px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: rgba(255, 255, 255, 0.12);
}

.tl-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 4px 0;
}

.tl-dot {
    position: absolute;
    left: 0;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(148, 163, 184, 0.5);
    margin-top: 4px;
}

.tl-dot-green { background: #22c55e; }
.tl-dot-amber { background: #f59e0b; }

.tl-title {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.92);
}

.tl-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.empty {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
}

.shift-field {
    grid-column: 1 / -1;
}

.holiday-policy-field {
    grid-column: 1 / -1;
}

.weekly-off-field {
    grid-column: 1 / -1;
}

.edit-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: rgba(52, 211, 153, 0.8);
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 6px;
    padding: 2px 8px;
    cursor: pointer;
    transition: all 0.15s ease;
}
.edit-link:hover {
    background: rgba(52, 211, 153, 0.2);
    color: #6ee7b7;
}

.add-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: rgba(52, 211, 153, 0.9);
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.15);
    border-radius: 6px;
    padding: 2px 8px;
    cursor: pointer;
    transition: all 0.15s ease;
}
.add-link:hover {
    background: rgba(52, 211, 153, 0.18);
    border-color: rgba(52, 211, 153, 0.3);
    color: #6ee7b7;
}

@media (max-width: 640px) {
    .grid2 { grid-template-columns: 1fr; }
}
</style>