<template>
    <UiModal v-model="open" title="Swap Shifts" size="md">
        <template #default>
            <div data-testid="swap-modal" class="flex flex-col gap-4">
                <p v-if="validationError || submitError" data-testid="swap-error"
                    class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                    {{ validationError || submitError }}
                </p>

                <template v-if="step === 'form'">
                    <div v-if="!validationError && employees.length === 2" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div v-for="(emp, i) in employees" :key="emp.id" data-testid="swap-employee-card" :data-emp-id="emp.id"
                            class="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p class="text-[11px] uppercase tracking-wide text-white/40 mb-1">Employee {{ i === 0 ? 'A' : 'B' }}</p>
                            <p class="text-sm font-semibold text-white/90 truncate">{{ emp.full_name }}</p>
                            <p class="text-xs text-white/45 mt-0.5">{{ emp.employee_code || '—' }}</p>
                            <p class="text-xs text-emerald-300/85 mt-2">Current Shift: {{ emp.shiftName || 'No shift' }}</p>
                        </div>
                    </div>

                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Effective From <span class="text-rose-400">*</span></span>
                        <input v-model="form.effectiveFrom" data-testid="swap-date" type="date" :min="todayStr()"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                    </label>

                    <p v-if="dateError" data-testid="swap-date-error" class="text-xs text-rose-400">{{ dateError }}</p>
                </template>

                <template v-else>
                    <div data-testid="swap-preview" class="flex flex-col gap-3">
                        <div>
                            <p class="text-sm font-semibold text-white/85">Swap Preview</p>
                            <p class="text-xs text-white/50 mt-0.5">Effective From: {{ formatShortDate(form.effectiveFrom) }}</p>
                        </div>
                        <div class="rounded-xl border border-white/10 overflow-hidden">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="bg-white/5 text-left text-xs text-white/50">
                                        <th class="px-3 py-2 font-medium">Employee</th>
                                        <th class="px-3 py-2 font-medium">Current Shift</th>
                                        <th class="px-3 py-2 font-medium">New Shift</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in previewRows" :key="row.id" data-testid="swap-preview-row"
                                        :data-emp-id="row.id" :data-to-shift="row.toShiftId" class="border-t border-white/5">
                                        <td class="px-3 py-2 text-white/90">{{ row.name }}</td>
                                        <td class="px-3 py-2 text-white/60">{{ row.fromName }}</td>
                                        <td class="px-3 py-2 text-emerald-300">{{ row.toName }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>
            </div>
        </template>
        <template #footer>
            <template v-if="step === 'form'">
                <UiButton color="#fff" text="Cancel" size="sm" data-testid="swap-cancel-btn" @click="open = false" />
                <UiButton color="#4aff7a" text="Preview Swap" size="sm" data-testid="swap-preview-btn"
                    :disabled="!!validationError" @click="goPreview" />
            </template>
            <template v-else>
                <UiButton color="#fff" text="Back" size="sm" :disabled="saving" @click="step = 'form'" />
                <UiButton color="#4aff7a" text="Confirm Swap" size="sm" data-testid="swap-confirm-btn"
                    :loading="saving" :disabled="saving" @click="confirm" />
            </template>
        </template>
    </UiModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { todayStr, formatShortDate } from '../../data/shiftRotation'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employees: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const open = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

const step = ref('form')
const saving = ref(false)
const submitError = ref('')
const form = reactive({ effectiveFrom: todayStr() })

const validationError = computed(() => {
    const n = props.employees.length
    if (n < 2) return `Swap requires exactly two employees. ${n} selected.`
    if (n > 2) return `Swap requires exactly two employees. ${n} selected.`
    const [a, b] = props.employees
    if (a.id === b.id) return 'Cannot swap an employee with themselves.'
    if (a.shiftId && a.shiftId === b.shiftId) return 'Both employees are on the same shift — there is nothing to swap.'
    return ''
})

const dateError = computed(() => {
    if (step.value !== 'form') return ''
    if (!form.effectiveFrom) return 'Effective From date is required.'
    if (form.effectiveFrom < todayStr()) return 'Effective From cannot be in the past.'
    return ''
})

const previewRows = computed(() => {
    if (props.employees.length !== 2) return []
    const [a, b] = props.employees
    return [
        { id: a.id, name: a.full_name || '—', fromName: a.shiftName || 'No shift', toShiftId: b.shiftId, toName: b.shiftName || 'No shift' },
        { id: b.id, name: b.full_name || '—', fromName: b.shiftName || 'No shift', toShiftId: a.shiftId, toName: a.shiftName || 'No shift' },
    ]
})

watch(() => props.modelValue, (v) => {
    if (!v) return
    step.value = 'form'
    saving.value = false
    submitError.value = ''
    form.effectiveFrom = todayStr()
})

function goPreview() {
    if (validationError.value) return
    if (dateError.value) return
    submitError.value = ''
    step.value = 'preview'
}

async function confirm() {
    if (saving.value) return
    if (validationError.value || props.employees.length !== 2) return
    submitError.value = ''
    const [a, b] = props.employees
    saving.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.post('/shift-assignments/swap', {
            employee_a_id: a.id,
            employee_b_id: b.id,
            effective_from: form.effectiveFrom,
        })
        emit('confirm', {
            employeeIds: [a.id, b.id],
            effectiveFrom: form.effectiveFrom,
            result: data,
        })
        open.value = false
    } catch (err) {
        // Keep the modal open on the preview step: no success, no selection clearing,
        // no local roster mutation — show the actual backend error.
        const d = err?.response?.data
        submitError.value = d?.error
            || d?.details?.[0]?.message
            || 'Failed to swap shifts. No changes were applied.'
        step.value = 'preview'
    } finally {
        saving.value = false
    }
}
</script>
