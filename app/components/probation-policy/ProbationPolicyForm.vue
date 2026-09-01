<template>
    <div class="flex flex-col gap-4">
        <!-- Stepper -->
        <div class="rounded-xl border border-white/10 bg-black/10 px-4 pt-4 pb-3">
            <div class="flex items-start">
                <template v-for="(meta, i) in stepMeta" :key="meta.title">
                    <div class="flex flex-col items-center gap-1.5 min-w-0 w-16 shrink-0">
                        <button type="button"
                            class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                            :class="circleState(i)"
                            :disabled="!isReachable(i) && !isVisited(i)"
                            @click="goToStep(i + 1)">
                            <Icon v-if="isCompleted(i) && !isActive(i)" name="lucide:check" class="w-4 h-4" />
                            <span v-else>{{ i + 1 }}</span>
                        </button>
                        <button type="button" :disabled="!isReachable(i) && !isVisited(i)"
                            @click="goToStep(i + 1)"
                            class="w-full text-center transition-colors">
                            <span class="block text-[11px] font-semibold truncate" :class="labelState(i)">
                                {{ meta.title }}
                            </span>
                            <span class="block text-[9px] text-white/35 truncate leading-tight uppercase tracking-wide">{{ meta.subtitle }}</span>
                        </button>
                    </div>
                    <div v-if="i < stepMeta.length - 1"
                        class="relative flex-1 rounded-full bg-white/10 mt-3.5 mx-1 h-[3px] overflow-hidden">
                        <div class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600/90 to-emerald-300 transition-all duration-500 ease-out"
                            :style="{ width: segmentComplete(i) ? '100%' : '0%' }"></div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Step content -->
        <div class="p-4 rounded-xl border border-white/10 bg-white/[.03] backdrop-blur-sm">
            <div class="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span
                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-400/30">
                        <Icon :name="stepMeta[wizard_step - 1]?.icon" class="w-4 h-4 text-emerald-300" />
                    </span>
                    <div class="min-w-0">
                        <h4 class="text-sm font-semibold text-white/90 leading-tight">{{ stepMeta[wizard_step - 1]?.title }}</h4>
                        <p class="text-xs text-white/45 mt-0.5">{{ stepDescription(wizard_step) }}</p>
                    </div>
                </div>
                <span class="shrink-0 text-[11px] font-semibold text-white/40 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    Step {{ wizard_step }} / {{ total_steps }}
                </span>
            </div>
            <div class="min-h-[260px]">
                <ProbationPolicyStepDetails v-if="wizard_step === 1" />
                <ProbationPolicyStepEvaluation v-else-if="wizard_step === 2" />
                <ProbationPolicyStepConfirmation v-else-if="wizard_step === 3" />
                <ProbationPolicyStepAssignment v-else />
            </div>
        </div>

        <!-- Footer navigation -->
        <div class="flex items-center justify-between gap-3">
            <UiButton color="#fff" text="Back" prepend-icon="lucide:arrow-left" :disabled="wizard_step === 1"
                @click="store.prevStep()" />
            <div class="flex items-center gap-2">
                <UiButton color="#fff" text="Cancel" prepend-icon="lucide:x" @click="$emit('cancel')" />
                <template v-if="wizard_step < total_steps">
                    <UiButton color="#4aff7a" text="Next" append-icon="lucide:arrow-right" @click="goNext" />
                </template>
                <template v-else>
                    <UiButton color="#4aff7a" :text="saving ? 'Saving...' : 'Save Policy'" prepend-icon="lucide:save"
                        :disabled="saving" @click="$emit('save')" />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useProbationPolicyStore } from '@/stores/probationPolicy.store'
import ProbationPolicyStepDetails from './steps/ProbationPolicyStepDetails.vue'
import ProbationPolicyStepEvaluation from './steps/ProbationPolicyStepEvaluation.vue'
import ProbationPolicyStepConfirmation from './steps/ProbationPolicyStepConfirmation.vue'
import ProbationPolicyStepAssignment from './steps/ProbationPolicyStepAssignment.vue'

defineProps({
    saving: Boolean,
})
defineEmits(['save', 'cancel'])

const store = useProbationPolicyStore()
const { wizard_step, total_steps } = storeToRefs(store)

const stepMeta = [
    { title: 'Details', subtitle: 'Basic information', icon: 'lucide:file-text' },
    { title: 'Evaluation', subtitle: 'Milestones & levels', icon: 'lucide:clipboard-check' },
    { title: 'Confirmation', subtitle: 'Automation', icon: 'lucide:badge-check' },
    { title: 'Assignment', subtitle: 'Employees', icon: 'lucide:users' },
]

const isActive = (i) => wizard_step.value === i + 1
const isCompleted = (i) => store.completed_steps.includes(i + 1)
const isVisited = (i) => i + 1 <= wizard_step.value

/* The connector between step n and n+1 fills when step n is complete */
const segmentComplete = (i) => isCompleted(i)

const circleState = (i) => {
    if (isActive(i)) return 'bg-emerald-500/15 text-emerald-300 border-emerald-400 shadow-[0_0_14px_rgba(74,255,122,.25)] ring-2 ring-emerald-400/20'
    if (isCompleted(i)) return 'bg-emerald-300 text-emerald-950 border-emerald-300 shadow-[0_0_14px_rgba(74,255,122,.45)]'
    if (isReachable(i)) return 'bg-white/5 text-white/60 border-white/20 hover:border-white/40 hover:text-white/90'
    return 'bg-white/[.02] text-white/25 border-white/10 cursor-not-allowed'
}

const labelState = (i) => {
    if (isActive(i)) return 'text-white'
    if (isCompleted(i)) return 'text-emerald-300'
    if (isReachable(i)) return 'text-white/60 hover:text-white/90'
    return 'text-white/25'
}

const stepDescription = (step) => {
    const desc = {
        1: 'Set the policy name, duration and the employee categories it applies to.',
        2: 'Configure evaluation criteria, milestones, evaluators and levels.',
        3: 'Enable automatic confirmation and confirmation letters.',
        4: 'Review the configured policy before saving. Assignment options will be added later.',
    }
    return desc[step] || ''
}

/* A step is reachable when every previous step has been explicitly completed */
const isReachable = (i) => {
    for (let s = 0; s < i; s++) {
        if (!store.completed_steps.includes(s + 1)) return false
    }
    return true
}

const validateStep = (step) => {
    if (step === 1) {
        if (!store.name || !String(store.name).trim()) {
            useToast().error({ title: 'Error!', message: 'Policy name is required' })
            return false
        }
        if (!store.duration_value || Number(store.duration_value) <= 0) {
            useToast().error({ title: 'Error!', message: 'Probation duration must be positive' })
            return false
        }
        return true
    }
    if (step === 2) {
        if (!store.evaluation_required) return true
        if (!store.evaluation_milestones.length) {
            useToast().error({ title: 'Error!', message: 'At least one evaluation milestone is required' })
            return false
        }
        for (const m of store.evaluation_milestones) {
            if (!m.name || !String(m.name).trim()) {
                useToast().error({ title: 'Error!', message: 'Every milestone needs a name' })
                return false
            }
            if (!(m.levels || []).length) {
                useToast().error({ title: 'Error!', message: `Milestone "${m.name}" needs at least one level` })
                return false
            }
            for (const l of m.levels || []) {
                for (const ev of l.evaluators || []) {
                    if (!ev.evaluator_ref_id) {
                        useToast().error({ title: 'Error!', message: `Select a role/employee for every evaluator in milestone "${m.name}"` })
                        return false
                    }
                }
            }
        }
        return true
    }
    return true
}

const goToStep = (step) => {
    if (step === wizard_step.value) return
    if (step < wizard_step.value) {
        store.setStep(step)
        return
    }
    /* Forward jump only when all previous steps are explicitly completed */
    if (isReachable(step - 1)) {
        store.setStep(step)
    }
}

const goNext = () => {
    if (!validateStep(wizard_step.value)) return
    store.completeStep(wizard_step.value)
    store.nextStep()
}
</script>