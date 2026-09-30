<template>
    <UiSidebarModal v-model="open" title="Update Holiday Calendar" width="520px" :opaque="true">
        <template #default>
            <div class="flex flex-col gap-5">
                <!-- Mode Selection -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-3">Action</p>
                    <div class="flex flex-col gap-2.5">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="radio" v-model="mode" value="correction" class="w-4 h-4 accent-emerald-500" />
                            <span class="text-sm text-white/80">Correction of data</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="radio" v-model="mode" value="calendar_change" class="w-4 h-4 accent-emerald-500" />
                            <span class="text-sm text-white/80">Holiday Calendar Change</span>
                        </label>
                    </div>
                </div>

                <!-- Current Holiday Calendar -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-2">Current Holiday Calendar</p>
                    <p class="text-sm text-white/60">{{ currentPolicyName || 'Not assigned' }}</p>
                </div>

                <!-- Holiday Calendar Change fields -->
                <template v-if="mode === 'calendar_change'">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <label class="block">
                            <span class="text-sm text-white/85 block mb-2">New Holiday Calendar <span class="text-rose-400">*</span></span>
                            <select v-model="form.policy_id" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50">
                                <option value="" disabled>Select Holiday Policy</option>
                                <option v-for="p in availablePolicies" :key="p.id" :value="p.id">{{ p.name }}</option>
                            </select>
                        </label>
                        <p v-if="errors.policy_id" class="text-xs text-rose-400 mt-1">{{ errors.policy_id }}</p>
                    </div>
                </template>

                <!-- Correction of Data fields -->
                <template v-if="mode === 'correction'">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <label class="block">
                            <span class="text-sm text-white/85 block mb-2">Effective From <span class="text-rose-400">*</span></span>
                            <input v-model="form.effective_from" type="date" :max="todayStr" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                        </label>
                        <p v-if="errors.effective_from" class="text-xs text-rose-400 mt-1">{{ errors.effective_from }}</p>
                    </div>
                </template>

                <!-- Note -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Note <span class="text-rose-400">*</span></span>
                        <textarea v-model="form.note" rows="3" placeholder="Provide a reason for this change..."
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 resize-none"></textarea>
                    </label>
                    <p v-if="errors.note" class="text-xs text-rose-400 mt-1">{{ errors.note }}</p>
                </div>
            </div>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton
                @click="submit"
                :color="mode === 'correction' ? '#f59e0b' : '#4aff7a'"
                :text="saving ? 'Saving...' : 'Update'"
                :prepend-icon="mode === 'correction' ? 'lucide:alert-triangle' : 'ion:checkmark-circle'"
                :disabled="saving || loading"
                :loading="saving"
            />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useHolidayPolicyStore } from '~/stores/organization/holidayPolicy.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employeeId: { type: String, default: '' },
    organizationId: { type: String, default: '' },
    currentPolicyId: { type: String, default: '' },
    currentPolicyName: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const policyStore = useHolidayPolicyStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const saving = ref(false)
const mode = ref('calendar_change')
const errors = reactive({})

const form = reactive({
    policy_id: '',
    effective_from: '',
    note: '',
})

const todayStr = computed(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
})

const availablePolicies = computed(() => {
    return (policyStore.policies || []).filter(p => p.is_active !== false && p.id !== props.currentPolicyId)
})

watch(() => props.modelValue, async (v) => {
    if (v) {
        loading.value = true
        errors.policy_id = ''
        errors.effective_from = ''
        errors.note = ''
        form.policy_id = ''
        form.effective_from = todayStr.value
        form.note = ''
        mode.value = 'calendar_change'

        try {
            await policyStore.fetchPolicies()
        } catch (e) {
            console.error('[HolidayPolicyDrawer] Failed to load policies:', e)
        } finally {
            loading.value = false
        }
    }
})

function validate() {
    const errs = {}
    if (mode.value === 'calendar_change') {
        if (!form.policy_id) errs.policy_id = 'Please select a holiday policy'
    }
    if (mode.value === 'correction') {
        if (!form.effective_from) errs.effective_from = 'Effective date is required'
    }
    if (!form.note || !form.note.trim()) errs.note = 'Note is required'
    Object.keys(errors).forEach(k => delete errors[k])
    Object.assign(errors, errs)
    return Object.keys(errs).length === 0
}

async function submit() {
    if (!validate() || saving.value) return

    saving.value = true
    try {
        const { $api } = useNuxtApp()

        if (mode.value === 'correction') {
            await $api.post(`/employees/${props.employeeId}/holiday-policy`, {
                organization_id: props.organizationId,
                policy_id: props.currentPolicyId,
                change_type: 'CORRECTION',
                effective_from: form.effective_from,
                note: form.note.trim(),
            })
        } else {
            await $api.post(`/employees/${props.employeeId}/holiday-policy`, {
                organization_id: props.organizationId,
                policy_id: form.policy_id,
                change_type: props.currentPolicyId ? 'CALENDAR_CHANGE' : 'ASSIGNMENT',
                note: form.note.trim(),
            })
        }

        emit('saved')
        open.value = false
    } catch (e) {
        const msg = e?.response?.data?.error || e.message || 'Failed to update holiday policy'
        useToast().error({ title: 'Error', message: String(msg), timeout: 3000 })
    } finally {
        saving.value = false
    }
}
</script>
