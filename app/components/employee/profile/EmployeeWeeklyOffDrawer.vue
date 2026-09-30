<template>
    <UiSidebarModal v-model="open" :title="hasCurrent ? 'Update Weekly Off' : 'Assign Weekly Off'" width="560px" :opaque="true">
        <template #default>
            <div class="flex flex-col gap-5">
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-2">New Weekly Off Details</p>
                    <p class="text-xs text-white/50 mb-4">Update or assign the employee's weekly off policy for attendance.</p>

                    <label class="block mb-4">
                        <span class="text-sm text-white/85 block mb-2">Why is the weekly off policy being changed for the employee? <span class="text-rose-400">*</span></span>
                        <select v-model="form.reason"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                            <option value="" disabled>Select reason</option>
                            <option value="CORRECTION">Correction of Weekly Off</option>
                            <option value="UPCOMING">Assigning upcoming Weekly Off</option>
                        </select>
                        <p v-if="errors.reason" class="text-xs text-rose-400 mt-1">{{ errors.reason }}</p>
                    </label>

                    <label class="block mb-4">
                        <span class="text-sm text-white/85 block mb-2">Choose weekly off policy to assign <span class="text-rose-400">*</span></span>
                        <select v-model="form.weekly_off_policy_id"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                            <option value="" disabled>{{ loadingPolicies ? 'Loading policies…' : 'Select any weekly off policy to assign' }}</option>
                            <option v-for="p in policyOptions" :key="p.id" :value="p.id">
                                {{ p.name }}{{ p.summary ? ` — ${p.summary}` : '' }}
                            </option>
                        </select>
                        <p v-if="errors.weekly_off_policy_id" class="text-xs text-rose-400 mt-1">{{ errors.weekly_off_policy_id }}</p>
                        <p v-if="!loadingPolicies && policyOptions.length === 0" class="text-xs text-white/40 mt-1">
                            No weekly off policies found for this organization.
                        </p>
                    </label>

                    <label class="block mb-3">
                        <span class="text-sm text-white/85 block mb-2">Effective From <span class="text-rose-400">*</span></span>
                        <input v-model="form.effective_from" type="date"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                        <p v-if="errors.effective_from" class="text-xs text-rose-400 mt-1">{{ errors.effective_from }}</p>
                    </label>

                    <label class="block mb-3">
                        <span class="text-sm text-white/85 block mb-2">Effective Up To</span>
                        <input v-model="form.effective_to" type="date" :disabled="form.no_end_date"
                            :min="form.effective_from || undefined"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark] disabled:opacity-40" />
                        <p v-if="errors.effective_to" class="text-xs text-rose-400 mt-1">{{ errors.effective_to }}</p>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.no_end_date" class="w-4 h-4 accent-emerald-500" />
                        <span class="text-sm text-white/80">No end date yet</span>
                    </label>

                    <p v-if="submitError" class="mt-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        {{ submitError }}
                    </p>
                </div>

                <div v-if="showHistory" class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-3">Weekly Off Assignment History</p>
                    <div v-if="loadingHistory" class="space-y-2">
                        <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                    <div v-else-if="historyError" class="text-xs text-rose-400">{{ historyError }}</div>
                    <div v-else-if="!history.length" class="text-sm text-white/45">
                        No weekly off assignment history yet.
                    </div>
                    <ul v-else class="space-y-2">
                        <li v-for="h in history" :key="h.id"
                            class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
                            <button type="button" class="w-full text-left" @click="toggleExpand(h.id)">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <p class="text-sm text-white/90 truncate">{{ h.policy_name || 'Weekly Off Policy' }}</p>
                                        <p class="text-xs text-white/50 mt-0.5">
                                            {{ formatDateOnly(h.effective_from) }} →
                                            {{ h.effective_to ? formatDateOnly(h.effective_to) : 'No end date' }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <span class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                                            :class="statusMeta(h).cls">
                                            {{ statusMeta(h).label }}
                                        </span>
                                        <Icon :name="expandedId === h.id ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="h-3.5 w-3.5 text-white/45" />
                                    </div>
                                </div>
                            </button>
                            <div v-if="expandedId === h.id" class="mt-2 pt-2 border-t border-white/10 space-y-1">
                                <div v-for="(line, li) in weekOffLines(h)" :key="li" class="text-xs text-white/70">
                                    {{ line }}
                                </div>
                                <p v-if="!weekOffLines(h).length" class="text-xs text-white/40">No week off details available.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton
                @click="submit"
                color="#4aff7a"
                :text="saving ? 'Saving…' : (hasCurrent ? 'Update Weekly Off' : 'Assign Weekly Off')"
                prepend-icon="ion:checkmark-circle"
                :disabled="saving || loading || loadingPolicies"
                :loading="saving"
            />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useWeeklyOffStore } from '~/stores/organization/weeklyOff.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employeeId: { type: String, default: '' },
    organizationId: { type: String, default: '' },
    currentPolicyId: { type: String, default: '' },
    currentPolicyName: { type: String, default: '' },
    /** Current active assignment (for overlap close + duplicate detection) */
    currentAssignment: { type: Object, default: null },
    /** Hide history when opened from Assignments page (default keeps Employee Profile behavior) */
    showHistory: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const weeklyOffStore = useWeeklyOffStore()
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const loading = ref(false)
const loadingPolicies = ref(false)
const loadingHistory = ref(false)
const saving = ref(false)
const history = ref([])
const historyError = ref('')
const submitError = ref('')
const expandedId = ref('')
const errors = reactive({})

const hasCurrent = computed(() => !!props.currentAssignment || !!props.currentPolicyId)

const form = reactive({
    reason: '',
    weekly_off_policy_id: '',
    effective_from: '',
    effective_to: '',
    no_end_date: true,
})

const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const addDays = (dateStr, days) => {
    const d = new Date(`${dateStr}T00:00:00`)
    d.setDate(d.getDate() + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const dayOnly = (iso) => {
    if (!iso) return ''
    return String(iso).slice(0, 10)
}

const FREQUENCY_LABELS = {
    ALL: 'All',
    FIRST: '1st',
    SECOND: '2nd',
    THIRD: '3rd',
    FOURTH: '4th',
    FIFTH: '5th',
    LAST: 'Last',
}

const DAY_LABELS = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
}

const DAY_TYPE_LABELS = {
    FULL_DAY: 'Full Day Off',
    FIRST_HALF: 'First Half Off',
    SECOND_HALF: 'Second Half Off',
}

const policyOptions = computed(() => {
    return (weeklyOffStore.policies || []).map(p => ({
        id: p.id,
        name: p.name,
        summary: formatWeekOffsSummary(p.weekOffs || p.week_offs || []),
    }))
})

const formatDateOnly = (iso) => {
    if (!iso) return '—'
    const s = dayOnly(iso)
    if (!s) return '—'
    const d = new Date(`${s}T00:00:00`)
    if (Number.isNaN(d.getTime())) return s
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusMeta = (row) => {
    const today = todayStr()
    const from = dayOnly(row.effective_from)
    const to = dayOnly(row.effective_to)
    if (from && from > today) {
        return { label: 'Upcoming', cls: 'border-sky-400/40 text-sky-300 bg-sky-400/10' }
    }
    if (to && to < today) {
        return { label: 'Past', cls: 'border-white/20 text-white/50 bg-white/5' }
    }
    return { label: 'Current', cls: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' }
}

function dayLabel(day) {
    if (!day) return ''
    if (DAY_LABELS[day]) return DAY_LABELS[day]
    return String(day).charAt(0) + String(day).slice(1).toLowerCase()
}

function occurrenceLabel(freq) {
    return FREQUENCY_LABELS[freq] || freq || ''
}

function dayTypeLabel(t) {
    return DAY_TYPE_LABELS[t] || t || ''
}

function weekOffLine(dayCfg) {
    const day = dayLabel(dayCfg.day_of_week || dayCfg.day)
    const offs = dayCfg.day_offs || []
    if (!offs.length) return `${day}`
    return offs.map((o) => {
        const occ = occurrenceLabel(o.frequency || 'ALL')
        const typ = dayTypeLabel(o.day_type || 'FULL_DAY')
        if ((o.frequency || 'ALL') === 'ALL') return `${day}: ${typ}`
        return `${occ} ${day}: ${typ}`
    }).join(', ')
}

function weekOffLines(row) {
    const weekOffs = row.week_offs
        || weeklyOffStore.policies?.find(p => p.id === row.weekly_off_policy_id)?.weekOffs
        || []
    return weekOffs.map(weekOffLine).filter(Boolean)
}

function formatWeekOffsSummary(weekOffs) {
    if (!Array.isArray(weekOffs) || !weekOffs.length) return ''
    return weekOffs.map(weekOffLine).join('; ')
}

function toggleExpand(id) {
    expandedId.value = expandedId.value === id ? '' : id
}

async function loadOnOpen() {
    if (!props.modelValue) return
    submitError.value = ''
    expandedId.value = ''
    Object.keys(errors).forEach(k => delete errors[k])
    const cur = props.currentAssignment
    form.reason = cur ? 'CORRECTION' : 'UPCOMING'
    form.weekly_off_policy_id = cur?.weekly_off_policy_id || props.currentPolicyId || ''
    // Prefill the SAVED period (date-only), not today's date — the saved
    // assignment is what the admin is editing (spec: policy + Effective From + Up To).
    form.effective_from = dayOnly(cur?.effective_from) || todayStr()
    form.effective_to = dayOnly(cur?.effective_to) || ''
    form.no_end_date = !form.effective_to
    history.value = []
    historyError.value = ''

    loading.value = true
    loadingPolicies.value = true
    loadingHistory.value = true

    const orgId = props.organizationId
    const empId = props.employeeId
    const { $api } = useNuxtApp()

    const tasks = []
    if (orgId) {
        tasks.push(
            weeklyOffStore.fetchPolicies(orgId)
                .catch(e => console.error('[EmployeeWeeklyOffDrawer] policies load failed', e))
                .finally(() => { loadingPolicies.value = false })
        )
    } else {
        loadingPolicies.value = false
    }

    // Always fetch history (needed for overlap close + duplicate detection even
    // when the history panel is hidden); organization_id is required by the API
    // when no x-org-id header is present.
    if (empId) {
        tasks.push(
            $api.get('/weekly-off/assignments', {
                params: { employee_id: empId, organization_id: orgId || undefined },
            })
                .then(({ data }) => {
                    history.value = data?.assignments || []
                })
                .catch((e) => {
                    console.error('[EmployeeWeeklyOffDrawer] history load failed', e)
                    historyError.value = 'Failed to load assignment history'
                    history.value = []
                })
                .finally(() => { loadingHistory.value = false })
        )
    } else {
        loadingHistory.value = false
    }

    await Promise.all(tasks)
    loading.value = false
}

watch(() => props.modelValue, (v) => {
    if (v) loadOnOpen()
})

function validate() {
    const errs = {}
    if (!form.reason) errs.reason = 'Please select a reason'
    if (!form.weekly_off_policy_id) errs.weekly_off_policy_id = 'Please select a weekly off policy'
    if (!form.effective_from) errs.effective_from = 'Effective From is required'
    if (!form.no_end_date) {
        if (!form.effective_to) errs.effective_to = 'Effective Up To is required, or check “No end date yet”'
        else if (form.effective_from && form.effective_to < form.effective_from) {
            errs.effective_to = 'Effective Up To cannot be before Effective From'
        }
    }
    Object.keys(errors).forEach(k => delete errors[k])
    Object.assign(errors, errs)
    return Object.keys(errs).length === 0
}

function findExactDuplicate() {
    const policyId = form.weekly_off_policy_id
    const from = form.effective_from
    const to = form.no_end_date ? '' : form.effective_to
    return history.value.find((h) => {
        if (h.weekly_off_policy_id !== policyId) return false
        if (dayOnly(h.effective_from) !== from) return false
        const hTo = dayOnly(h.effective_to) || ''
        return hTo === to
    })
}

/** Prefer a row covering today; else earliest future row; else JobTab's resolved row. */
function effectiveCurrent() {
    const today = todayStr()
    const covering = history.value.find((h) => {
        const from = dayOnly(h.effective_from)
        const to = dayOnly(h.effective_to)
        if (from && from > today) return false
        if (to && to < today) return false
        return true
    })
    if (covering) return covering
    let earliestFuture = null
    for (const h of history.value) {
        const from = dayOnly(h.effective_from)
        if (from > today && (!earliestFuture || from < dayOnly(earliestFuture.effective_from))) earliestFuture = h
    }
    return earliestFuture || props.currentAssignment || null
}

/** Non-deleted history rows that overlap the new period (date-only, inclusive). */
function historyOverlapping(newFrom, newTo) {
    return history.value.filter((h) => {
        const rowFrom = dayOnly(h.effective_from)
        const rowTo = dayOnly(h.effective_to)
        if (rowTo && rowTo < newFrom) return false // ends before the new period
        if (newTo && rowFrom > newTo) return false // starts after the new period
        return true
    })
}

async function submit() {
    if (!validate() || saving.value) return
    submitError.value = ''

    const dup = findExactDuplicate()
    if (dup) {
        submitError.value = 'This weekly off assignment already exists for the selected dates.'
        return
    }

    saving.value = true
    try {
        const { $api } = useNuxtApp()
        const newFrom = form.effective_from
        const newTo = form.no_end_date ? '' : form.effective_to
        const cur = effectiveCurrent()

        // Same period start as the row being edited: update that row in place
        // (policy and/or end date) — never delete+recreate a saved assignment,
        // so the row's identity and history are preserved.
        if (cur && dayOnly(cur.effective_from) === newFrom) {
            const changes = {}
            if (cur.weekly_off_policy_id !== form.weekly_off_policy_id) {
                changes.weekly_off_policy_id = form.weekly_off_policy_id
            }
            if ((dayOnly(cur.effective_to) || '') !== newTo) {
                changes.effective_to = newTo // '' clears the end date (reopen)
            }
            if (Object.keys(changes).length) {
                await $api.put(`/weekly-off/assignments/${cur.id}`, changes)
            }
            // Extending the end date can swallow later future rows — supersede them.
            const later = history.value.filter((h) =>
                h.id !== cur.id &&
                dayOnly(h.effective_from) > newFrom &&
                (!newTo || dayOnly(h.effective_from) <= newTo))
            for (const row of later) {
                await $api.delete(`/weekly-off/assignments/${row.id}`)
            }
            finishSave()
            return
        }

        // Different period start: close every row the new period overlaps BEFORE
        // creating — rows starting before newFrom are ended the day before (their
        // history is preserved); rows starting on/after newFrom are superseded
        // future rows and are soft-deleted.
        for (const row of historyOverlapping(newFrom, newTo)) {
            const rowFrom = dayOnly(row.effective_from)
            if (rowFrom < newFrom) {
                await $api.put(`/weekly-off/assignments/${row.id}`, { effective_to: addDays(newFrom, -1) })
            } else {
                await $api.delete(`/weekly-off/assignments/${row.id}`)
            }
        }

        await $api.post('/weekly-off/assignments', {
            employee_id: props.employeeId,
            weekly_off_policy_id: form.weekly_off_policy_id,
            effective_from: newFrom,
            ...(newTo ? { effective_to: newTo } : {}),
        })

        finishSave()
    } catch (e) {
        const msg = e?.response?.data?.error || e.message || 'Failed to update weekly off'
        submitError.value = String(msg)
        useToast().error({ title: 'Error', message: String(msg), timeout: 4000 })
    } finally {
        saving.value = false
    }
}

function finishSave() {
    emit('saved')
    open.value = false
    useToast().success({
        title: hasCurrent.value ? 'Weekly Off updated' : 'Weekly Off assigned',
        message: hasCurrent.value ? 'Weekly Off assignment updated' : 'Weekly Off assigned',
    })
}
</script>
