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
                <div><span class="label">Band</span>{{ employee.band?.name || employee.band_name || '—' }}</div>
                <div><span class="label">Department</span>{{ departmentName || '—' }}</div>
                <div><span class="label">Cost Center</span>{{ employee.cost_center_name || '—' }}</div>
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
                <div><span class="label">Shift</span>{{ currentShift?.name || '—' }}</div>
                <div><span class="label">Shift Timings</span>{{ shiftTimings || '—' }}</div>
                <div><span class="label">Break</span>{{ breakLabel || '—' }}</div>
                <div><span class="label">Weekly Off</span>{{ weeklyOffLabel || '—' }}</div>
                <div><span class="label">Probation Policy</span>{{ probation?.policy_name || '—' }}</div>
                <div><span class="label">Probation Duration</span>{{ probationDuration || '—' }}</div>
            </div>
            <p v-if="loadingShift" class="empty">Loading shift details…</p>
            <p v-else-if="!currentShift" class="empty">No shift assigned yet.</p>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

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

const loadShiftData = async () => {
    if (!props.employee?.id) return
    loadingShift.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/shift-assignments', {
            params: { employee_id: props.employee.id, active_only: true },
        })
        const assigns = data?.assignments || []
        const withShift = await Promise.all(assigns.map(async (a) => {
            try {
                const { data: s } = await $api.get(`/shifts/${a.shift_id}`)
                return { ...a, shift: s }
            } catch {
                return a
            }
        }))
        assignments.value = withShift
    } catch (err) {
        console.error('[JobTab] Shift load failed:', err)
        assignments.value = []
    } finally {
        loadingShift.value = false
    }
}

onMounted(loadShiftData)

const currentShift = computed(() => assignments.value[0]?.shift || null)

const shiftTimings = computed(() => {
    const s = currentShift.value
    if (!s) return ''
    const st = formatTime(s.start_time)
    const et = formatTime(s.end_time)
    return st && et ? `${st} → ${et}` : (st || et)
})

const breakLabel = computed(() => {
    const mins = currentShift.value?.break_minutes
    return mins ? `${mins} min` : ''
})

const weeklyOffLabel = computed(() => {
    const wo = currentShift.value?.weekly_off
    if (!Array.isArray(wo) || !wo.length) return ''
    return wo.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
})

function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
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

@media (max-width: 640px) {
    .grid2 { grid-template-columns: 1fr; }
}
</style>