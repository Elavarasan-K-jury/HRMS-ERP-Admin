<template>
    <div class="flex flex-col gap-6">
        <!-- 1. Evaluation Criteria -->
        <section class="flex flex-col gap-2">
            <div class="flex items-center gap-1.5">
                <label class="text-md text-white/80 font-medium">Evaluation Criteria</label>
                <UiInfoTip tip="Choose whether evaluation milestones are required before the probation is confirmed." />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <button type="button" class="rounded-2xl border p-4 text-left transition-all"
                    :class="evaluation_required
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'"
                    @click="evaluation_required = true">
                    <Icon name="lucide:clipboard-check" class="w-5 h-5 mb-2 text-emerald-300" />
                    <span class="font-semibold block">Yes, evaluation required</span>
                    <span class="text-xs text-white/50">Milestones, evaluators and levels will be configured.</span>
                </button>
                <button type="button" class="rounded-2xl border p-4 text-left transition-all"
                    :class="!evaluation_required
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                        : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'"
                    @click="evaluation_required = false">
                    <Icon name="lucide:x-circle" class="w-5 h-5 mb-2 text-emerald-300" />
                    <span class="font-semibold block">No, evaluation not required</span>
                    <span class="text-xs text-white/50">Probation is confirmed purely by duration.</span>
                </button>
            </div>
        </section>

        <!-- 2. Evaluation configuration (only when required) -->
        <template v-if="evaluation_required">
            <section>
                <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div>
                        <h3 class="text-white/90 font-semibold">Configure Milestones</h3>
                        <p class="text-xs text-white/50 mt-0.5">Probation duration:
                            <b class="text-emerald-300">{{ duration_value }} {{ unitLabel }}</b></p>
                    </div>
                </div>

                <!-- Final milestone hint -->
                <div class="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200 mb-4">
                    The <b>Final Milestone</b> represents the final probation evaluation and determines the outcome
                    (Confirm / Terminate / Extend). Configuration is stored for future automation.
                </div>

                <!-- Milestones -->
                <div class="flex flex-col gap-4">
                    <div v-for="(milestone, mIdx) in milestones" :key="mIdx"
                        class="rounded-2xl border border-white/15 bg-white/[.06] p-4">
                        <!-- Milestone header -->
                        <div class="flex items-center justify-between gap-3 mb-3">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                                    :class="milestone.is_final_milestone
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-sky-500/20 text-sky-300'">
                                    {{ milestone.is_final_milestone ? 'Final Milestone' : `Milestone ${milestone.order ?? mIdx + 1}` }}
                                </span>
                                <span v-if="milestone.is_final_milestone" class="text-[10px] text-emerald-300/70">Determines probation outcome (Confirm / Terminate / Extend)</span>
                            </div>
                            <button v-if="!milestone.is_final_milestone" type="button"
                                class="text-red-400/80 hover:text-red-300 text-xs inline-flex items-center gap-1"
                                @click="store.removeMilestone(mIdx)">
                                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> Remove
                            </button>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div class="flex flex-col gap-1.5">
                                <div class="flex items-center gap-1.5">
                                    <label class="text-xs text-white/60">Milestone Name</label>
                                    <UiInfoTip tip="A checkpoint in the evaluation. The Final milestone determines the outcome (Confirm / Terminate / Extend)." />
                                </div>
                                <FormInput color="#fff" v-model="milestone.name" size="sm" placeholder="e.g. 30-day progress check" />
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <div class="flex items-center gap-1.5">
                                    <label class="text-xs text-white/60">Order</label>
                                    <UiInfoTip tip="Sets the sequence in which milestones run. Lower order runs first." />
                                </div>
                                <FormInput color="#fff" v-model.number="milestone.order" type="number" size="sm" min="1" placeholder="1" />
                            </div>
                        </div>

                        <!-- Milestone trigger -->
                        <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 mb-3 flex flex-col gap-2">
                            <div class="flex items-center justify-between gap-2">
                                <div>
                                    <span class="text-xs font-medium text-white/80">Automatically trigger evaluation</span>
                                    <UiInfoTip tip="Schedule this milestone to auto-start N days after the probation begins. Off = manual trigger." />
                                    <p class="text-[10px] text-white/40">Schedule this milestone to trigger automatically.</p>
                                </div>
                                <UiSwitch v-model="milestone.automatic_trigger_enabled" color="#4aff7a" size="sm" />
                            </div>
                            <div v-if="milestone.automatic_trigger_enabled" class="grid grid-cols-2 gap-2 items-end">
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-white/60">Trigger after (days)</label>
                                    <FormInput color="#fff" v-model.number="milestone.trigger_after_days" type="number"
                                        size="sm" min="0" placeholder="e.g. 30" />
                                </div>
                                <p class="text-[10px] text-white/40 pb-1">days after probation starts</p>
                            </div>
                        </div>

                        <!-- Levels -->
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs font-semibold text-white/80 uppercase tracking-wider">Evaluation Levels</span>
                                    <UiInfoTip tip="Each milestone contains one or more levels. All levels must be passed as the evaluation for a milestone moves forward." />
                                </div>
                                <UiButton size="xs" color="#4aff7a" text="Add new level" prepend-icon="lucide:plus"
                                    @click="store.addLevel(milestone)" />
                            </div>

                            <div v-for="(level, lIdx) in milestone.levels" :key="lIdx"
                                class="rounded-xl border border-white/10 bg-black/20 p-3 flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-sky-300">Level {{ level.level_order ?? lIdx + 1 }}</span>
                                    <button v-if="milestone.levels.length > 1" type="button"
                                        class="text-red-400/70 hover:text-red-300 text-xs"
                                        @click="store.removeLevel(milestone, lIdx)">
                                        <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <!-- Completion rule -->
                                <div class="flex items-center justify-between gap-2">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-xs text-white/60">Completion rule</span>
                                        <UiInfoTip tip="All evaluators: the level is complete only when every assigned evaluator submits feedback. Any evaluator: completes as soon as one assigned evaluator submits." />
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button type="button" class="rounded-lg px-2.5 py-1 text-xs border transition"
                                            :class="level.completion_rule === 'ALL'
                                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                                                : 'bg-white/5 text-white/60 border-white/15'"
                                            @click="level.completion_rule = 'ALL'">
                                            All evaluators
                                        </button>
                                        <button type="button" class="rounded-lg px-2.5 py-1 text-xs border transition"
                                            :class="level.completion_rule === 'ANY'
                                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                                                : 'bg-white/5 text-white/60 border-white/15'"
                                            @click="level.completion_rule = 'ANY'">
                                            Any evaluator
                                        </button>
                                    </div>
                                </div>

                                <!-- Evaluators -->
                                <div class="flex flex-col gap-2">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-1.5">
                                            <span class="text-xs text-white/60">Evaluators (Role / Employee)</span>
                                            <UiInfoTip tip="Only these assigned roles or employees can give feedback for this level." />
                                        </div>
                                        <UiButton size="xs" color="#fff" text="Add evaluator" prepend-icon="lucide:user-plus"
                                            @click="store.addEvaluator(level)" />
                                    </div>
                                    <div v-for="(evaluator, eIdx) in level.evaluators" :key="eIdx"
                                        class="grid grid-cols-12 gap-2 items-center">
                                        <div class="col-span-3">
                                            <FormSelect color="#fff" size="sm"
                                                :model-value="typeOf(evaluator.evaluator_type)"
                                                :options="evaluatorTypeOptions"
                                                @update:model-value="onEvaluatorTypeChange(evaluator, $event)" />
                                        </div>
                                        <div class="col-span-8">
                                            <FormSelect color="#fff" size="sm" searchable
                                                :model-value="refOf(evaluator)"
                                                :options="evaluatorOptions(evaluator.evaluator_type)"
                                                placeholder="Select role or employee"
                                                @update:model-value="onEvaluatorSelect(evaluator, $event)" />
                                        </div>
                                        <div class="col-span-1">
                                            <button v-if="level.evaluators.length > 1" type="button"
                                                class="text-red-400/70 hover:text-red-300"
                                                @click="store.removeEvaluator(level, eIdx)">
                                                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Reminder -->
                                <div class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex flex-col gap-2">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-1.5">
                                            <span class="text-xs text-white/70">Send reminder to evaluators</span>
                                            <UiInfoTip tip="Notifies assigned evaluators N days after the evaluation starts if they haven't submitted feedback yet." />
                                        </div>
                                        <UiSwitch v-model="level.reminder_enabled" color="#4aff7a" size="sm" />
                                    </div>
                                    <div v-if="level.reminder_enabled" class="grid grid-cols-2 gap-2 items-end">
                                        <div class="flex flex-col gap-1">
                                            <label class="text-xs text-white/60">Remind after (days)</label>
                                            <FormInput color="#fff" v-model.number="level.reminder_after_days" type="number"
                                                size="sm" min="0" placeholder="e.g. 1" />
                                        </div>
                                        <p class="text-[10px] text-white/40 pb-1">days after evaluation starts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add milestone -->
                <UiButton size="sm" color="#fff" text="Add new milestone" prepend-icon="lucide:calendar-plus"
                    class="mt-4" @click="store.addMilestone()" />
            </section>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProbationPolicyStore } from '@/stores/organization/probationPolicy.store'
import { useAuthStore } from '@/stores/shared/auth.store'

const store = useProbationPolicyStore()
const authStore = useAuthStore()

const {
    evaluation_required,
    evaluation_milestones,
    duration_value,
    duration_unit,
} = storeToRefs(store)

const milestones = evaluation_milestones

const unitLabel = computed(() => ({
    MONTHS: 'month(s)',
    WEEKS: 'week(s)',
    DAYS: 'day(s)',
}[duration_unit.value] || duration_unit.value))

const { $api } = useNuxtApp()

const roles = ref([])
const employees = ref([])
const sourceLoading = ref(false)

const evaluatorTypeOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'ROLE', label: 'Role' },
]

const evaluatorOptions = (type) =>
    type === 'ROLE'
        ? roles.value.map(r => ({ value: r.id, label: r.name }))
        : employees.value.map(e => ({ value: e.id, label: e.full_name || e.first_name + ' ' + (e.last_name || '') }))

const onEvaluatorTypeChange = (evaluator, opt) => {
    evaluator.evaluator_type = opt?.value ?? opt ?? ''
    evaluator.evaluator_ref_id = ''
    evaluator.evaluator_name = ''
}

const onEvaluatorSelect = (evaluator, opt) => {
    const o = opt?.value != null ? opt : opt
    evaluator.evaluator_ref_id = o?.value ?? o ?? ''
    evaluator.evaluator_name = o?.label ?? ''
}

const typeOf = (type) =>
    evaluatorTypeOptions.find(o => o.value === type) ||
    (type ? { value: type, label: type } : null)

const refOf = (evaluator) => {
    if (!evaluator.evaluator_ref_id) return null
    const match = evaluatorOptions(evaluator.evaluator_type).find(o => String(o.value) === String(evaluator.evaluator_ref_id))
    if (match) return match
    return { value: evaluator.evaluator_ref_id, label: evaluator.evaluator_name || evaluator.evaluator_ref_id }
}

const loadSources = async () => {
    sourceLoading.value = true
    try {
        const org = authStore.organization
        const [rRes, eRes] = await Promise.allSettled([
            $api.get('/admin/roles', { params: { organization_id: org, limit: 100 } }),
            $api.get('/employees/all', { params: { organization_id: org } }),
        ])
        if (rRes.status === 'fulfilled') roles.value = rRes.value.data?.roles || []
        if (eRes.status === 'fulfilled') employees.value = eRes.value.data?.employees || []
    } catch (err) {
        console.error('[ProbationPolicyStep2] loadSources', err)
    } finally {
        sourceLoading.value = false
    }
}

onMounted(loadSources)
</script>