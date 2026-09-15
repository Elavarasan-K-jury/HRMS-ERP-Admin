<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-start gap-3">
            <div
                class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Icon name="lucide:users" class="w-6 h-6" />
            </div>
            <div>
                <h3 class="text-lg font-semibold text-white/90">Assignment</h3>
                <p class="text-sm text-white/50 mt-1">
                    Assign this policy to employees or employee batches. The Assignment module is not implemented yet —
                    saving now will persist all configuration from Steps 1–3.
                </p>
            </div>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
                <span class="text-[10px] uppercase tracking-wider text-white/40">Policy</span>
                <span class="text-sm font-semibold text-white/90 truncate">{{ name }}</span>
                <span v-if="description" class="text-xs text-white/50 line-clamp-2">{{ description }}</span>
            </div>

            <div class="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
                <span class="text-[10px] uppercase tracking-wider text-white/40">Duration</span>
                <span class="text-sm font-semibold text-emerald-300">{{ duration_value }} {{ unitLabel }}</span>
                <span v-if="max_duration_value > 0" class="text-xs text-white/50">
                    Max extension: {{ max_duration_value }} {{ extensionUnitLabel }}
                </span>
                <span v-else class="text-xs text-white/40">No extension allowed</span>
            </div>

            <div class="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
                <span class="text-[10px] uppercase tracking-wider text-white/40">Evaluation</span>
                <template v-if="evaluation_required">
                    <span class="text-sm font-semibold text-emerald-300">{{ milestoneCount }} milestone(s)</span>
                    <span class="text-xs text-white/50">
                        {{ autoTriggerSummary }}
                    </span>
                </template>
                <span v-else class="text-sm text-white/70">Not required</span>
            </div>

            <div class="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
                <span class="text-[10px] uppercase tracking-wider text-white/40">Confirmation</span>
                <span v-if="auto_confirm_probation" class="text-sm font-semibold text-emerald-300">Automatic</span>
                <span v-else class="text-sm text-white/70">Manual (HR/Admin)</span>
                <span class="text-xs text-white/50">
                    {{ auto_generate_confirmation_letter ? 'Letter auto-generated' : 'No letter generated' }}
                </span>
            </div>
        </div>

        <!-- Assign note -->
        <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/45 flex items-center gap-2">
            <Icon name="lucide:info" class="w-4 h-4 shrink-0" />
            The Assignment stage is not implemented yet — the wizard is ready to continue here once the Assignment
            module is built.
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProbationPolicyStore } from '@/stores/organization/probationPolicy.store'

const store = useProbationPolicyStore()

const {
    name,
    description,
    duration_value,
    duration_unit,
    max_duration_value,
    max_duration_unit,
    evaluation_required,
    evaluation_milestones,
    auto_confirm_probation,
    auto_generate_confirmation_letter,
} = storeToRefs(store)

const unitLabel = computed(() => ({
    MONTHS: 'month(s)',
    WEEKS: 'week(s)',
    DAYS: 'day(s)',
}[duration_unit.value] || duration_unit.value))

const extensionUnitLabel = computed(() => ({
    MONTHS: 'month(s)',
    WEEKS: 'week(s)',
    DAYS: 'day(s)',
}[max_duration_unit.value] || max_duration_unit.value))

const milestoneCount = computed(() => (evaluation_milestones.value || []).length)

const autoTriggerSummary = computed(() => {
    const auto = (evaluation_milestones.value || []).filter(m => m.automatic_trigger_enabled)
    if (auto.length === (evaluation_milestones.value || []).length) return 'All milestones auto-trigger'
    if (auto.length > 0) return `${auto.length} of ${milestoneCount.value} milestones auto-trigger`
    return 'Manual trigger'
})
</script>