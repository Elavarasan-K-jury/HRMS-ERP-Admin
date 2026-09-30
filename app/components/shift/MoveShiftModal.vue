<template>
    <UiModal v-model="open" title="Move Shift" size="md">
        <template #default>
            <div data-testid="move-modal" class="flex flex-col gap-4">
                <template v-if="step === 'form'">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-1">Selected Employees</p>
                        <p class="text-xs text-white/50 mb-3">{{ employees.length }} employee{{ employees.length === 1 ? '' : 's' }} will be moved to another shift.</p>
                        <ul class="space-y-1.5 max-h-44 overflow-y-auto">
                            <li v-for="emp in employees" :key="emp.id" data-testid="move-employee-row" :data-emp-id="emp.id"
                                class="flex items-center justify-between gap-2 text-xs">
                                <span class="text-white/85 truncate">
                                    {{ emp.full_name }}
                                    <span class="text-white/40">({{ emp.employee_code || '—' }})</span>
                                </span>
                                <span class="text-emerald-300/80 shrink-0">{{ emp.shiftName || 'No shift' }}</span>
                            </li>
                        </ul>
                    </div>

                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Move To <span class="text-rose-400">*</span></span>
                        <select v-model="form.shiftId" data-testid="move-shift-select"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                            <option value="" disabled>Select destination shift</option>
                            <option v-for="s in shifts" :key="s.id" :value="s.id">
                                {{ s.name }}{{ s.timings && s.timings !== 'Flexible' ? ` — ${s.timings}` : '' }}
                            </option>
                        </select>
                    </label>

                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Effective From <span class="text-rose-400">*</span></span>
                        <input v-model="form.effectiveFrom" data-testid="move-date" type="date" :min="todayStr()"
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                    </label>
                </template>

                <template v-else>
                    <div data-testid="move-preview" class="flex flex-col gap-3">
                        <div>
                            <p class="text-sm font-semibold text-white/85">Move Preview</p>
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
                                    <tr v-for="row in previewRows" :key="row.id" data-testid="move-preview-row"
                                        :data-emp-id="row.id" :data-to-shift="form.shiftId" class="border-t border-white/5">
                                        <td class="px-3 py-2 text-white/90">{{ row.name }}</td>
                                        <td class="px-3 py-2 text-white/60">{{ row.fromName }}</td>
                                        <td class="px-3 py-2 text-emerald-300">{{ row.toName }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>

                <p v-if="error" data-testid="move-error"
                    class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                    {{ error }}
                </p>
            </div>
        </template>
        <template #footer>
            <template v-if="step === 'form'">
                <UiButton color="#fff" text="Cancel" size="sm" data-testid="move-cancel-btn" @click="open = false" />
                <UiButton color="#4aff7a" text="Preview Move" size="sm" data-testid="move-preview-btn" @click="goPreview" />
            </template>
            <template v-else>
                <UiButton color="#fff" text="Back" size="sm" :disabled="saving" @click="step = 'form'" />
                <UiButton color="#4aff7a" text="Confirm Move" size="sm" data-testid="move-confirm-btn"
                    :loading="saving" @click="confirm" />
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
    shifts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const open = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

const step = ref('form')
const error = ref('')
const saving = ref(false)
const form = reactive({
    shiftId: '',
    effectiveFrom: todayStr(),
})

const destinationName = computed(() => props.shifts.find(s => s.id === form.shiftId)?.name || '')

const previewRows = computed(() => props.employees.map(emp => ({
    id: emp.id,
    name: emp.full_name || '—',
    fromName: emp.shiftName || 'No shift',
    toName: destinationName.value,
})))

watch(() => props.modelValue, (v) => {
    if (!v) return
    step.value = 'form'
    error.value = ''
    saving.value = false
    form.shiftId = ''
    form.effectiveFrom = todayStr()
})

function goPreview() {
    error.value = ''
    if (!form.shiftId) {
        error.value = 'Select a destination shift to continue.'
        return
    }
    if (!form.effectiveFrom) {
        error.value = 'Effective From date is required.'
        return
    }
    if (form.effectiveFrom < todayStr()) {
        error.value = 'Effective From cannot be in the past.'
        return
    }
    step.value = 'preview'
}

async function confirm() {
    if (saving.value) return
    error.value = ''
    saving.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.post('/shift-assignments/move', {
            employee_ids: props.employees.map(e => e.id),
            destination_shift_id: form.shiftId,
            effective_from: form.effectiveFrom,
        })
        emit('confirm', {
            employeeIds: props.employees.map(e => e.id),
            shiftId: form.shiftId,
            shiftName: destinationName.value,
            effectiveFrom: form.effectiveFrom,
            results: data?.results || [],
        })
        open.value = false
    } catch (err) {
        const d = err?.response?.data
        error.value = d?.error
            || d?.details?.[0]?.message
            || 'Failed to move employees. No changes were applied.'
        step.value = 'preview'
    } finally {
        saving.value = false
    }
}
</script>
