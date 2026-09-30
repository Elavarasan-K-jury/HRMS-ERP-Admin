<template>
    <UiModal v-model="open" title="Shift Rotation" size="lg">
        <template #default>
            <div data-testid="rotate-modal" class="flex flex-col gap-4">
                <template v-if="step === 'form'">
                    <p class="text-sm text-white/60">Rotate employees between the 3 shifts on a weekly schedule.</p>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="block">
                            <span class="text-sm text-white/85 block mb-2">Rotation Start Date <span class="text-rose-400">*</span></span>
                            <input v-model="form.effectiveFrom" data-testid="rotate-date" type="date" :min="todayStr()"
                                class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                            <span v-if="dateError" data-testid="rotate-date-error"
                                class="mt-1 block text-xs text-rose-400">{{ dateError }}</span>
                        </label>

                        <label class="block">
                            <span class="text-sm text-white/85 block mb-2">Frequency</span>
                            <select data-testid="rotate-frequency" value="7" disabled
                                class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white/70 outline-none opacity-70 cursor-not-allowed">
                                <option value="7">Every 7 Days</option>
                            </select>
                        </label>
                    </div>

                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Rotation Shifts <span class="text-rose-400">*</span></p>
                        <div class="grid gap-3 sm:grid-cols-3">
                            <label v-for="(slot, idx) in slots" :key="slot" class="block">
                                <span class="text-xs text-white/55 block mb-1.5">Rotation Shift {{ idx + 1 }}</span>
                                <select :data-testid="`rotate-shift-select-${idx + 1}`" v-model="form[slot]"
                                    class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                                    <option value="">Select shift…</option>
                                    <option v-for="s in activeShifts" :key="s.id" :value="s.id"
                                        :disabled="isSlotDisabled(slot, s.id)">{{ s.name }}</option>
                                </select>
                            </label>
                        </div>

                        <p v-if="trioError" data-testid="rotate-trio-error"
                            class="mt-3 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                            {{ trioError }}
                        </p>

                        <ul v-if="trioValid" class="mt-3 space-y-2">
                            <li v-for="pair in chain" :key="pair.from.id" data-testid="rotate-mapping-row"
                                :data-from-shift="pair.from.id" :data-to-shift="pair.to.id"
                                class="flex items-center gap-3">
                                <span class="text-sm text-white/85 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5">{{ pair.from.name }}</span>
                                <Icon name="lucide:arrow-right" class="text-emerald-300 text-sm" />
                                <span class="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-lg px-3 py-1.5">{{ pair.to.name }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-1">Employees Included</p>
                        <p class="text-xs text-white/50 mb-3">
                            Employees assigned to these 3 shifts as of {{ formatShortDate(form.effectiveFrom) }} will be rotated.
                        </p>
                        <ul v-if="trioValid" class="text-sm">
                            <li v-for="c in counts" :key="c.shift.id" class="flex items-center justify-between py-1">
                                <span class="text-white/75">{{ c.shift.name }}</span>
                                <span class="text-white/90">{{ c.count }} employee{{ c.count === 1 ? '' : 's' }}</span>
                            </li>
                            <li v-for="x in excludedCounts" :key="x.shift.id" data-testid="rotate-excluded-shift"
                                :data-shift-id="x.shift.id"
                                class="flex items-center justify-between py-1 text-white/50">
                                <span>{{ x.shift.name }}</span>
                                <span class="text-xs">{{ x.count }} employee{{ x.count === 1 ? '' : 's' }} · Not included in this rotation</span>
                            </li>
                            <li class="flex items-center justify-between border-t border-white/10 mt-2 pt-2 font-semibold text-white/90">
                                <span>Total</span>
                                <span>{{ totalCount }} employee{{ totalCount === 1 ? '' : 's' }}</span>
                            </li>
                        </ul>
                        <p v-else class="text-xs text-white/50">Select the three rotation shifts to see employee counts.</p>
                        <p v-if="trioValid && hasEmptyGroup" data-testid="rotate-empty-group-note"
                            class="mt-3 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                            {{ emptyGroupNote }}
                        </p>
                    </div>

                    <p class="text-xs text-white/55 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2">
                        Rotation moves each shift group to the next shift every 7 days. Weekly Off assignments will not be changed.
                    </p>

                    <p v-if="noShiftCount" data-testid="rotate-excluded" class="text-xs text-white/45">
                        {{ noShiftCount }} employee{{ noShiftCount === 1 ? '' : 's' }} without a shift {{ noShiftCount === 1 ? 'is' : 'are' }} not included in this rotation.
                    </p>

                    <p v-if="error" data-testid="rotate-error"
                        class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        {{ error }}
                    </p>
                </template>

                <template v-else>
                    <div data-testid="rotate-preview" class="flex flex-col gap-3">
                        <div>
                            <p class="text-sm font-semibold text-white/85">Rotation Preview</p>
                            <p class="text-xs text-white/50 mt-0.5">Effective From: {{ formatShortDate(form.effectiveFrom) }}</p>
                            <p class="text-xs text-white/50">Rotation Cycle: Every 7 Days</p>
                        </div>

                        <div v-for="pair in chain" :key="pair.from.id"
                            class="rounded-xl border border-white/10 overflow-hidden">
                            <p class="px-3 py-2 text-xs uppercase tracking-wide text-white/55 bg-white/5 border-b border-white/10">
                                {{ pair.from.name }} → {{ pair.to.name }}
                            </p>
                            <p v-if="!rowsForPair(pair).length" class="px-3 py-3 text-xs text-white/45">
                                No employees in this group as of {{ formatShortDate(form.effectiveFrom) }}
                            </p>
                            <ul v-else>
                                <li v-for="row in rowsForPair(pair)" :key="row.id" data-testid="rotate-preview-row"
                                    :data-emp-id="row.id" :data-from-shift="row.fromId" :data-to-shift="row.toId"
                                    class="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-b-0">
                                    <span class="text-sm text-white/90">{{ row.name }}</span>
                                    <span class="text-xs text-emerald-300">{{ row.toName }}</span>
                                </li>
                            </ul>
                        </div>

                        <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm flex flex-col gap-1">
                            <div class="flex items-center justify-between">
                                <span class="text-white/60">Total Employees</span>
                                <span class="text-white/90 font-semibold">{{ previewRows.length }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-white/60">Weekly Off</span>
                                <span class="text-sky-400">Unchanged</span>
                            </div>
                        </div>

                        <div class="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-white/85 flex flex-col gap-1">
                            <p>{{ previewRows.length }} employee{{ previewRows.length === 1 ? '' : 's' }} will move to the next shift starting {{ formatShortDate(form.effectiveFrom) }}.</p>
                            <p>Weekly Off assignments will remain unchanged.</p>
                        </div>

                        <p v-if="submitError" data-testid="rotate-submit-error"
                            class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                            {{ submitError }}
                        </p>
                    </div>
                </template>
            </div>
        </template>
        <template #footer>
            <template v-if="step === 'form'">
                <UiButton color="#fff" text="Cancel" size="sm" data-testid="rotate-cancel-btn" @click="open = false" />
                <UiButton color="#4aff7a" text="Preview Rotation" size="sm" data-testid="rotate-preview-btn"
                    :disabled="!canPreview" @click="goPreview" />
            </template>
            <template v-else>
                <UiButton color="#fff" :text="saving ? 'Rotating…' : 'Back'" size="sm" data-testid="rotate-back-btn"
                    :disabled="saving" @click="step = 'form'" />
                <UiButton color="#4aff7a" text="Confirm Rotation" size="sm" data-testid="rotate-confirm-btn"
                    :disabled="saving" @click="confirm" />
            </template>
        </template>
    </UiModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { todayStr, formatShortDate, byStartTime, shiftIdAsOf } from '../../data/shiftRotation'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employees: { type: Array, default: () => [] },
    shifts: { type: Array, default: () => [] },
    assignmentsByEmp: { default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const open = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

const slots = ['shift1', 'shift2', 'shift3']

const step = ref('form')
const error = ref('')
const submitError = ref('')
const saving = ref(false)
const form = reactive({ effectiveFrom: todayStr(), shift1: '', shift2: '', shift3: '' })

const activeShifts = computed(() => props.shifts.filter(s => !s.deleted_at))
const shiftById = computed(() => new Map(activeShifts.value.map(s => [s.id, s])))

/**
 * Three-shift identification (safe defaults, explicit selection):
 * 1) name pattern 1st/2nd/3rd when all three exist,
 * 2) otherwise exactly 3 active shifts (previous behavior),
 * 3) otherwise empty — admin must pick explicitly (never guess from start-time order).
 */
function preselectTrio() {
    const active = activeShifts.value
    const pick = re => active.find(s => re.test(String(s?.name || '').trim()))
    const s1 = pick(/^1st/i)
    const s2 = pick(/^2nd/i)
    const s3 = pick(/^3rd/i)
    if (s1 && s2 && s3 && new Set([s1.id, s2.id, s3.id]).size === 3) {
        return [s1.id, s2.id, s3.id]
    }
    if (active.length === 3) {
        return [...active].sort(byStartTime).map(s => s.id)
    }
    return ['', '', '']
}

const trioShifts = computed(() => slots.map(k => shiftById.value.get(form[k]) || null))
const trioValid = computed(() =>
    slots.every(k => !!form[k]) && new Set(slots.map(k => form[k])).size === 3)

const chain = computed(() => {
    if (!trioValid.value) return null
    const [a, b, c] = trioShifts.value
    return [
        { from: a, to: b },
        { from: b, to: c },
        { from: c, to: a },
    ]
})

const trioError = computed(() => {
    const filled = slots.filter(k => form[k])
    if (filled.length < 3) return ''
    if (new Set(slots.map(k => form[k])).size !== 3) {
        return 'The three rotation shifts must be distinct.'
    }
    return ''
})

function isSlotDisabled(slot, sid) {
    return slots.some(k => k !== slot && form[k] === sid)
}

const dateError = computed(() => {
    if (!form.effectiveFrom) return 'Rotation Start Date is required.'
    if (form.effectiveFrom < todayStr()) return 'Rotation Start Date cannot be in the past.'
    return ''
})

/** Employee's covering shift as of the modal's effective date (server rows first). */
function shiftOf(emp) {
    if (props.assignmentsByEmp && form.effectiveFrom) {
        return shiftIdAsOf(props.assignmentsByEmp, emp?.id, form.effectiveFrom) || ''
    }
    return emp?.shiftId || ''
}

const trioIds = computed(() => (trioValid.value ? slots.map(k => form[k]) : []))

const counts = computed(() => trioShifts.value.map((s, i) => ({
    shift: s,
    count: s ? props.employees.filter(e => shiftOf(e) === s.id).length : 0,
})))

const excludedCounts = computed(() => {
    if (!trioValid.value) return []
    return activeShifts.value
        .filter(s => !trioIds.value.includes(s.id))
        .map(s => ({ shift: s, count: props.employees.filter(e => shiftOf(e) === s.id).length }))
        .filter(x => x.count > 0)
})

const totalCount = computed(() => counts.value.reduce((n, c) => n + c.count, 0))
const hasEmptyGroup = computed(() => trioValid.value && counts.value.some(c => c.count === 0))
const emptyGroupNote = computed(() => {
    const empty = counts.value.filter(c => c.count === 0).map(c => c.shift?.name).filter(Boolean)
    if (!empty.length) return ''
    const list = empty.join(', ')
    return `${list}: no employees as of ${formatShortDate(form.effectiveFrom)} — this group will be skipped.`
})
const noShiftCount = computed(() => props.employees.filter(e => !shiftOf(e)).length)

const canPreview = computed(() =>
    trioValid.value && !dateError.value && totalCount.value > 0 && !saving.value)

const previewRows = computed(() => {
    if (!chain.value) return []
    const rows = []
    for (const pair of chain.value) {
        for (const emp of props.employees) {
            if (shiftOf(emp) !== pair.from.id) continue
            rows.push({
                id: emp.id,
                name: emp.full_name || '—',
                fromId: pair.from.id,
                fromName: pair.from.name,
                toId: pair.to.id,
                toName: pair.to.name,
            })
        }
    }
    return rows
})

function rowsForPair(pair) {
    return previewRows.value.filter(r => r.fromId === pair.from.id)
}

watch(() => props.modelValue, (v) => {
    if (!v) return
    step.value = 'form'
    error.value = ''
    submitError.value = ''
    saving.value = false
    form.effectiveFrom = todayStr()
    const [a, b, c] = preselectTrio()
    form.shift1 = a
    form.shift2 = b
    form.shift3 = c
})

function goPreview() {
    error.value = ''
    submitError.value = ''
    if (!trioValid.value) {
        error.value = 'Select three distinct rotation shifts.'
        return
    }
    if (dateError.value) {
        error.value = dateError.value
        return
    }
    if (totalCount.value === 0) {
        error.value = `No employees are assigned to the selected rotation shifts as of ${formatShortDate(form.effectiveFrom)}.`
        return
    }
    step.value = 'preview'
}

async function confirm() {
    if (saving.value) return
    saving.value = true
    submitError.value = ''
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.post('/shift-assignments/rotate', {
            shift_1_id: form.shift1,
            shift_2_id: form.shift2,
            shift_3_id: form.shift3,
            effective_from: form.effectiveFrom,
        })
        emit('confirm', {
            effectiveFrom: form.effectiveFrom,
            affectedEmployeeCount: data?.affected_employee_count ?? (data?.results?.length || 0),
            employeeIds: (data?.results || []).map(r => r.employee_id),
            groupCounts: data?.group_counts || [],
        })
        open.value = false
    } catch (err) {
        submitError.value = err?.response?.data?.error
            || 'Rotation failed. No assignments were changed.'
    } finally {
        saving.value = false
    }
}
</script>
