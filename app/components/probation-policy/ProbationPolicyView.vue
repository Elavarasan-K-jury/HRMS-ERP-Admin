<template>
    <UiModal v-model="visible" title="Probation Policy Details" size="lg">
        <template #default>
            <div class="space-y-6 text-white/90 animate-fade-in">

                <!-- Title -->
                <div>
                    <h2 class="text-2xl font-bold tracking-wide flex items-center gap-2">
                        <Icon name="lucide:hourglass" class="w-6 h-6 text-green-400" />
                        {{ policy?.name || 'Probation Policy' }}
                    </h2>
                    <p v-if="policy?.description" class="text-white/50 text-sm mt-1">
                        {{ policy.description }}
                    </p>
                </div>

                <!-- GRID -->
                <div class="grid grid-cols-2 gap-4">

                    <PolicyItem label="Probation Duration" icon="lucide:hourglass">
                        {{ formatDuration(policy?.duration_value, policy?.duration_unit) }}
                    </PolicyItem>

                    <PolicyItem label="Applied Categories" icon="lucide:layers">
                        <div v-if="(policy?.employee_categories || []).length" class="flex flex-wrap gap-1">
                            <span v-for="c in policy.employee_categories" :key="c.id"
                                class="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/80">
                                {{ c.name }}
                            </span>
                        </div>
                        <span v-else class="text-white/50">None selected</span>
                    </PolicyItem>

                    <PolicyItem label="End Date" icon="lucide:calendar-check">
                        <span :class="policy?.end_date_after_completion ? 'text-green-400' : 'text-amber-400'">
                            {{ policy?.end_date_after_completion
                                ? 'Day after duration completes (joining date + duration)'
                                : 'Last day of duration (joining date + duration − 1 day)' }}
                        </span>
                    </PolicyItem>

                    <PolicyItem label="Max Extension" icon="lucide:trending-up">
                        {{ policy?.max_duration_value && policy.max_duration_value > 0
                            ? formatDuration(policy.max_duration_value, policy.max_duration_unit)
                            : 'None' }}
                    </PolicyItem>

                    <PolicyItem label="Status" icon="lucide:activity">
                        <span :class="policy?.is_active ? 'text-green-400' : 'text-red-400'">
                            {{ policy?.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </PolicyItem>

                    <PolicyItem label="Created" icon="lucide:calendar-plus">
                        {{ formatDate(policy?.created_at) }}
                    </PolicyItem>

                    <PolicyItem label="Last Updated" icon="lucide:calendar-clock">
                        {{ formatDate(policy?.updated_at) }}
                    </PolicyItem>
                </div>

                <!-- 🔎 Evaluation configuration -->
                <div v-if="policy?.evaluation_required" class="rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <Icon name="lucide:clipboard-check" class="w-5 h-5 text-emerald-300" />
                        <h3 class="text-base font-semibold text-white/90">Evaluation</h3>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Required</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <PolicyItem label="Auto trigger process" icon="lucide:zap">
                            <span :class="hasAutoTrigger ? 'text-emerald-300' : 'text-white/40'">
                                {{ hasAutoTrigger ? `${autoTriggerCount} milestone(s) auto-trigger` : 'Manual trigger' }}
                            </span>
                        </PolicyItem>
                        <PolicyItem label="Share feedback with employee" icon="lucide:share-2">
                            <span :class="policy?.share_feedback_with_employee ? 'text-emerald-300' : 'text-white/40'">
                                {{ policy?.share_feedback_with_employee ? 'Enabled' : 'Disabled' }}
                            </span>
                        </PolicyItem>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div v-for="(m, mIdx) in policy?.evaluation_milestones || []" :key="mIdx"
                            class="rounded-lg border border-white/10 bg-black/20 p-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-semibold text-white/90 flex items-center gap-2">
                                    {{ m.name || `Milestone ${mIdx + 1}` }}
                                    <span v-if="m.is_final_milestone"
                                        class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                        Final
                                    </span>
                                </span>
                                <span class="text-xs text-white/50">
                                    {{ m.automatic_trigger_enabled ? `auto after ${m.trigger_after_days} day(s)` : 'manual trigger' }}
                                </span>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <div v-for="(level, lIdx) in m.levels || []" :key="lIdx" class="text-xs text-white/70">
                                    <span class="text-sky-300 font-semibold">Level {{ level.level_order ?? lIdx + 1 }}</span>
                                    — {{ level.completion_rule === 'ANY' ? 'Any evaluator' : 'All evaluators' }}
                                    {{ (level.evaluators || []).length ? ` · ${level.evaluators.length} evaluator(s)` : '' }}
                                    <span v-if="level.reminder_enabled" class="text-white/40"> · reminder after {{ level.reminder_after_days }} day(s)</span>
                                    <span class="text-white/40">
                                        · {{ (level.evaluators || []).map(e => e.evaluator_name || e.evaluator_ref_id).join(', ') }}
                                    </span>
                                </div>
                                <div v-if="m.feedback_form_enabled" class="text-xs text-amber-300/90">
                                    <Icon name="lucide:file-text" class="w-3 h-3 inline mr-1" />
                                    Feedback form will be attached to this milestone
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 flex items-center gap-2">
                    <Icon name="lucide:clipboard-x" class="w-4 h-4 text-white/40" />
                    Evaluation not required — probation is confirmed by duration.
                </div>

                <!-- 🔎 Confirmation configuration -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <Icon name="lucide:badge-check" class="w-5 h-5 text-emerald-300" />
                        <h3 class="text-base font-semibold text-white/90">Confirmation</h3>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <PolicyItem label="Confirm automatically" icon="lucide:check-check">
                            <span :class="policy?.auto_confirm_probation ? 'text-emerald-300' : 'text-white/40'">
                                {{ policy?.auto_confirm_probation ? 'Enabled' : 'Manual (HR/Admin)' }}
                            </span>
                        </PolicyItem>
                        <PolicyItem label="Auto-generate letter" icon="lucide:file-text">
                            <span :class="policy?.auto_generate_confirmation_letter ? 'text-emerald-300' : 'text-white/40'">
                                {{ policy?.auto_generate_confirmation_letter ? 'Enabled' : 'Disabled' }}
                            </span>
                        </PolicyItem>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <UiButton @click="visible = false" color="#4aff7a" text="Close" prepend-icon="lucide:check" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed } from 'vue'
import PolicyItem from '../policies/item.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    policy: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const autoTriggerCount = computed(() =>
    (props.policy?.evaluation_milestones || []).filter(m => m.automatic_trigger_enabled).length
)
const hasAutoTrigger = computed(() => autoTriggerCount.value > 0)

function formatDuration(value, unit) {
    const label = {
        MONTHS: 'month(s)',
        WEEKS: 'week(s)',
        DAYS: 'day(s)'
    }[unit] || unit
    return `${value ?? '—'} ${label}`
}

function formatDate(d) {
    if (!d) return '—'
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}
</script>
