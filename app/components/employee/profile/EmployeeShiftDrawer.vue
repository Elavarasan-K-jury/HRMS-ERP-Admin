<template>
    <UiSidebarModal v-model="open" :title="hasCurrent ? 'Update Shift' : 'Assign Shift'" width="560px" :opaque="true">
        <template #default>
            <div class="flex flex-col gap-5">
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-2">New Shift Details</p>
                    <p class="text-xs text-white/50 mb-4">Update or assign the employee's shift for attendance.</p>

                    <label class="block mb-4">
                        <span class="text-sm text-white/85 block mb-2">Why is the shift type being changed for the employee? <span class="text-rose-400">*</span></span>
                        <select v-model="form.reason"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                            <option value="" disabled>Select reason</option>
                            <option value="CORRECTION">Correction of Shift timings</option>
                            <option value="UPCOMING">Assigning upcoming Shift timings</option>
                        </select>
                        <p v-if="errors.reason" class="text-xs text-rose-400 mt-1">{{ errors.reason }}</p>
                    </label>

                    <label class="block mb-4">
                        <span class="text-sm text-white/85 block mb-2">Choose shift to assign <span class="text-rose-400">*</span></span>
                        <select v-model="form.shift_id"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                            <option value="" disabled>{{ loadingShifts ? 'Loading shifts…' : 'Select any shift to assign' }}</option>
                            <option v-for="s in shiftOptions" :key="s.id" :value="s.id">
                                {{ s.name }}{{ s.timings ? ` — ${s.timings}` : '' }}
                            </option>
                        </select>
                        <p v-if="errors.shift_id" class="text-xs text-rose-400 mt-1">{{ errors.shift_id }}</p>
                        <p v-if="!loadingShifts && shiftOptions.length === 0" class="text-xs text-white/40 mt-1">
                            No shifts found for this organization.
                        </p>
                    </label>

                    <label class="block mb-3">
                        <span class="text-sm text-white/85 block mb-2">Effective From <span class="text-rose-400">*</span></span>
                        <input v-model="form.valid_from" type="date"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                        <p v-if="errors.valid_from" class="text-xs text-rose-400 mt-1">{{ errors.valid_from }}</p>
                    </label>

                    <label class="block mb-3">
                        <span class="text-sm text-white/85 block mb-2">Effective Up To</span>
                        <input v-model="form.valid_to" type="date" :disabled="form.no_end_date"
                            :min="form.valid_from || undefined"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark] disabled:opacity-40" />
                        <p v-if="errors.valid_to" class="text-xs text-rose-400 mt-1">{{ errors.valid_to }}</p>
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
                    <p class="text-sm font-semibold text-white/85 mb-3">Shift Assignment History</p>
                    <div v-if="loadingHistory" class="space-y-2">
                        <div v-for="i in 3" :key="i" class="h-14 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                    <div v-else-if="historyError" class="text-xs text-rose-400">{{ historyError }}</div>
                    <div v-else-if="!history.length" class="text-sm text-white/45">
                        No shift assignment history yet.
                    </div>
                    <ul v-else class="space-y-2">
                        <li v-for="h in history" :key="h.id"
                            class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                    <p class="text-sm text-white/90 truncate">{{ h.shift?.name || currentShiftLabel(h) }}</p>
                                    <p class="text-xs text-white/50 mt-0.5">
                                        {{ formatDateOnly(h.valid_from) }} →
                                        {{ h.valid_to ? formatDateOnly(h.valid_to) : 'No end date' }}
                                    </p>
                                </div>
                                <span class="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                                    :class="statusMeta(h).cls">
                                    {{ statusMeta(h).label }}
                                </span>
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
                :text="saving ? 'Saving…' : (hasCurrent ? 'Update Shift' : 'Assign Shift')"
                prepend-icon="ion:checkmark-circle"
                :disabled="saving || loading || loadingShifts"
                :loading="saving"
            />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useShiftStore } from '~/stores/organization/shift.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employeeId: { type: String, default: '' },
    organizationId: { type: String, default: '' },
    currentShiftId: { type: String, default: '' },
    currentShiftName: { type: String, default: '' },
    /** Current active assignment (for overlap close + duplicate detection) */
    currentAssignment: { type: Object, default: null },
    /** Hide history when opened from Assignments page (default keeps Employee Profile behavior) */
    showHistory: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const shiftStore = useShiftStore()
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const loading = ref(false)
const loadingShifts = ref(false)
const loadingHistory = ref(false)
const saving = ref(false)
const history = ref([])
const historyError = ref('')
const submitError = ref('')
const errors = reactive({})

const hasCurrent = computed(() => !!props.currentAssignment || !!props.currentShiftId)

const form = reactive({
    reason: '',
    shift_id: '',
    valid_from: '',
    valid_to: '',
    no_end_date: true,
})

const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const dayOnly = (iso) => {
    if (!iso) return ''
    return String(iso).slice(0, 10)
}

// Prefill snapshot: Effective From is prefilled as max(today, assignment start), so we
// remember what the user was shown and only send valid_from to PUT when they change it.
// (An untouched prefill must never re-date — and therefore truncate — existing history.)
const initialValidFrom = ref('')

const shiftOptions = computed(() => {
    return (shiftStore.shifts || []).map(s => ({
        id: s.id,
        name: s.name,
        timings: s.timings && s.timings !== 'Flexible' ? s.timings : '',
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
    const from = dayOnly(row.valid_from)
    const to = dayOnly(row.valid_to)
    if (from && from > today) {
        return { label: 'Upcoming', cls: 'border-sky-400/40 text-sky-300 bg-sky-400/10' }
    }
    if (to && to < today) {
        return { label: 'Past', cls: 'border-white/20 text-white/50 bg-white/5' }
    }
    return { label: 'Current', cls: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' }
}

const currentShiftLabel = (row) => {
    if (props.currentAssignment?.id && row?.id === props.currentAssignment.id && props.currentShiftName) {
        return props.currentShiftName === 'Assigned' ? 'Shift' : props.currentShiftName
    }
    const fromStore = shiftStore.shifts?.find(s => s.id === row?.shift_id)
    return fromStore?.name || 'Shift'
}

async function loadOnOpen() {
    if (!props.modelValue) return
    submitError.value = ''
    Object.keys(errors).forEach(k => delete errors[k])
    form.reason = props.currentAssignment ? 'CORRECTION' : 'UPCOMING'
    form.shift_id = props.currentAssignment?.shift_id || props.currentShiftId || ''
    // Prefill from the selected assignment:
    //  - Effective From = max(today, assignment start) — future assignments keep their
    //    actual future start, past dates are never prefilled/submitted.
    //  - Effective Up To / No end date reflect the assignment's real end.
    const curFrom = dayOnly(props.currentAssignment?.valid_from)
    const curTo = dayOnly(props.currentAssignment?.valid_to)
    form.valid_from = curFrom && curFrom > todayStr() ? curFrom : todayStr()
    form.valid_to = curTo
    form.no_end_date = !curTo
    initialValidFrom.value = form.valid_from
    history.value = []
    historyError.value = ''

    loading.value = true
    loadingShifts.value = true
    loadingHistory.value = true

    const orgId = props.organizationId
    const empId = props.employeeId
    const { $api } = useNuxtApp()

    const tasks = []
    if (orgId) {
        tasks.push(
            shiftStore.fetchShifts(orgId)
                .catch(e => console.error('[EmployeeShiftDrawer] shifts load failed', e))
                .finally(() => { loadingShifts.value = false })
        )
    } else {
        loadingShifts.value = false
    }

    if (empId && props.showHistory) {
        tasks.push(
            $api.get('/shift-assignments', { params: { employee_id: empId } })
                .then(async ({ data }) => {
                    const rows = data?.assignments || []
                    const need = rows.filter(r => !r.shift?.name)
                    if (need.length) {
                        await Promise.all(need.map(async (r) => {
                            try {
                                const { data: s } = await $api.get(`/shifts/${r.shift_id}`)
                                r.shift = s
                            } catch { /* keep row without name */ }
                        }))
                    }
                    history.value = rows
                })
                .catch((e) => {
                    console.error('[EmployeeShiftDrawer] history load failed', e)
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
    if (!form.shift_id) errs.shift_id = 'Please select a shift'
    if (!form.valid_from) errs.valid_from = 'Effective From is required'
    if (!form.no_end_date) {
        if (!form.valid_to) errs.valid_to = 'Effective Up To is required, or check “No end date yet”'
        else if (form.valid_from && form.valid_to < form.valid_from) {
            errs.valid_to = 'Effective Up To cannot be before Effective From'
        }
    }
    Object.keys(errors).forEach(k => delete errors[k])
    Object.assign(errors, errs)
    return Object.keys(errs).length === 0
}

function findExactDuplicate() {
    const shiftId = form.shift_id
    const from = form.valid_from
    const to = form.no_end_date ? '' : form.valid_to
    return history.value.find((h) => {
        if (h.shift_id !== shiftId) return false
        if (dayOnly(h.valid_from) !== from) return false
        const hTo = dayOnly(h.valid_to) || ''
        return hTo === to
    })
}

/** Prefer a Current row from history; fall back to JobTab's active assignment. */
function effectiveCurrent() {
    const today = todayStr()
    const fromHistory = history.value.find((h) => {
        const from = dayOnly(h.valid_from)
        const to = dayOnly(h.valid_to)
        if (from && from > today) return false
        if (to && to < today) return false
        return true
    })
    return fromHistory || props.currentAssignment || null
}

async function submit() {
    if (!validate() || saving.value) return
    submitError.value = ''

    const dup = findExactDuplicate()
    if (dup) {
        submitError.value = 'This shift assignment already exists for the selected dates.'
        return
    }

    saving.value = true
    try {
        const { $api } = useNuxtApp()
        const cur = effectiveCurrent()

        if (cur && cur.shift_id === form.shift_id) {
            // CASE 1: same shift -> date-only update on the existing row (PUT).
            // valid_to: null explicitly clears the end date (open-ended).
            // valid_from is only sent when the user changed it from the prefill, so an
            // untouched prefill never re-dates (and truncates) existing history.
            const payload = form.no_end_date
                ? { valid_to: null }
                : { valid_to: form.valid_to }
            if (form.valid_from !== initialValidFrom.value) {
                payload.valid_from = form.valid_from
            }
            await $api.put(`/shift-assignments/${cur.id}`, payload)
        } else if (cur) {
            // CASE 2: destination shift differs -> atomic backend change operation
            // (single transaction: close covering at D-1, create new assignment at D,
            // or update a row that starts exactly on D in place).
            await $api.post('/shift-assignments/change', {
                employee_id: props.employeeId,
                shift_id: form.shift_id,
                effective_from: form.valid_from,
                valid_to: form.no_end_date ? '' : form.valid_to,
            })
        } else {
            // CASE 3: no existing assignment -> fresh assignment, existing POST behavior.
            await $api.post('/shift-assignments', {
                employee_id: props.employeeId,
                shift_id: form.shift_id,
                valid_from: form.valid_from,
                ...(form.no_end_date ? {} : { valid_to: form.valid_to }),
            })
        }

        finishSave()
    } catch (e) {
        const msg = e?.response?.data?.error || e.message || 'Failed to update shift'
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
        title: hasCurrent.value ? 'Shift updated' : 'Shift assigned',
        message: hasCurrent.value ? 'Shift assignment updated' : 'Shift assigned',
    })
}
</script>
