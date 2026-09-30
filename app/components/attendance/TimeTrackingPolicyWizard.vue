<template>
    <UiModal v-model="open" :show-header="false" :show-footer="false"
        :width="completed ? '1160px' : '560px'" max-height="88vh">
        <!-- ============ WIZARD MODE ============ -->
        <div v-if="!completed" class="flex flex-col items-center text-center gap-5" data-testid="ttp-wizard">
            <!-- Header: back | centered title | close -->
            <div class="w-full flex items-center justify-between">
                <button v-if="step > 1" type="button" data-testid="ttp-wizard-back" aria-label="Back"
                    class="p-2 -ml-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    @click="goBack">
                    <Icon name="ion:arrow-back" class="w-5 h-5" />
                </button>
                <span v-else class="w-9 h-9" aria-hidden="true"></span>

                <h2 data-testid="ttp-wizard-title" class="text-base md:text-lg font-semibold">
                    Get started with attendance capture
                </h2>

                <button type="button" data-testid="ttp-wizard-close" aria-label="Close"
                    class="p-2 -mr-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    @click="open = false">
                    <Icon name="lucide:x" class="w-5 h-5" />
                </button>
            </div>

            <!-- Progress indicator (path-aware: 2 for bio-metric path, 3 for web path) -->
            <div data-testid="ttp-wizard-progress" role="progressbar" class="flex gap-1.5 w-44">
                <span v-for="i in totalSteps" :key="i" class="h-1.5 flex-1 rounded-full transition-colors"
                    :class="i <= step ? 'bg-[#4aff7a]' : 'bg-white/15'" />
            </div>

            <!-- Contextual icon -->
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 flex items-center justify-center">
                <Icon :name="stepIcon" class="w-8 h-8 text-emerald-300" />
            </div>

            <!-- Question + supporting text -->
            <div class="flex flex-col gap-2">
                <h3 data-testid="ttp-wizard-question" class="text-lg md:text-xl font-semibold">{{ question }}</h3>
                <p v-if="support" data-testid="ttp-wizard-support" class="text-sm text-white/55 max-w-md">{{ support }}</p>
            </div>

            <!-- Step body -->
            <div class="w-full">
                <!-- Yes / No choices (bio-metric step + remote work step) -->
                <div v-if="isChoiceStep" class="flex justify-center gap-3">
                    <button type="button" data-testid="ttp-wizard-option-yes"
                        class="min-w-[7.5rem] px-6 py-3 rounded-xl border text-sm font-semibold transition-colors"
                        :class="choiceValue === true ? selectedChoiceClass : idleChoiceClass"
                        @click="setChoice(true)">
                        Yes
                    </button>
                    <button type="button" data-testid="ttp-wizard-option-no"
                        class="min-w-[7.5rem] px-6 py-3 rounded-xl border text-sm font-semibold transition-colors"
                        :class="choiceValue === false ? selectedChoiceClass : idleChoiceClass"
                        @click="setChoice(false)">
                        No
                    </button>
                </div>

                <!-- Capture method: Web card only -->
                <div v-else class="max-w-md mx-auto">
                    <button type="button" data-testid="ttp-wizard-card-web"
                        class="w-full text-left rounded-xl border p-4 flex items-center gap-3 transition-colors"
                        :class="captureMethod === 'WEB' ? selectedChoiceClass : idleChoiceClass"
                        @click="captureMethod = 'WEB'">
                        <span class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Icon name="ion:globe-outline" class="w-5 h-5 text-emerald-300" />
                        </span>
                        <span class="flex-1 min-w-0">
                            <span class="block text-sm font-semibold">Web</span>
                            <span class="block text-xs text-white/55 mt-0.5">Useful when you have employees working in office location.</span>
                        </span>
                        <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                            :class="captureMethod === 'WEB' ? 'border-emerald-400 bg-emerald-400 text-[#0b0f14]' : 'border-white/25'">
                            <Icon v-if="captureMethod === 'WEB'" name="ion:checkmark" class="w-3.5 h-3.5" />
                        </span>
                    </button>
                </div>
            </div>

            <!-- Continue (explicit — selection alone never auto-advances) -->
            <UiButton data-testid="ttp-wizard-continue" color="#4aff7a" text="Continue"
                class="min-w-[9rem]" :disabled="!canContinue" @click="goNext" />
        </div>

        <!-- ============ CONFIGURATION SHELL ============ -->
        <div v-else class="flex flex-col gap-4 sm:min-h-[720px]" data-testid="ttp-wizard-shell">
            <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                    <h2 data-testid="ttp-wizard-title" class="text-base md:text-lg font-semibold">
                        Time Tracking Policy Configuration
                    </h2>
                    <label class="block text-xs text-white/55 mt-2" for="ttp-policy-name">Name this time tracking
                        policy</label>
                    <input id="ttp-policy-name" v-model="policyName" type="text"
                        data-testid="ttp-config-name" placeholder="e.g. General Capture Scheme"
                        class="mt-1 w-full max-w-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                </div>
                <button type="button" data-testid="ttp-wizard-close" aria-label="Close"
                    class="p-2 -mr-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    @click="open = false">
                    <Icon name="lucide:x" class="w-5 h-5" />
                </button>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 min-h-[280px]">
                <!-- Derived sidebar: captureMethod + remoteWork -> items -->
                <aside data-testid="ttp-config-sidebar"
                    class="sm:w-[190px] shrink-0 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
                    <button v-for="(item, i) in configItems" :key="item" type="button"
                        data-testid="ttp-config-item" :data-item="item"
                        class="flex items-center gap-2 px-3 py-2.5 rounded-lg border-l-2 text-sm font-medium text-left whitespace-nowrap transition-colors"
                        :class="i === activeItem
                            ? 'bg-emerald-500/15 border-l-emerald-400 text-white'
                            : 'border-l-transparent text-white/60 hover:bg-white/5 hover:text-white'"
                        @click="activeItem = i">
                        <Icon name="ion:settings-outline" class="w-4 h-4 shrink-0"
                            :class="i === activeItem ? 'text-emerald-300' : 'text-white/40'" />
                        {{ item }}
                    </button>
                </aside>

                <!-- Real configuration screens (Remote Work / Web Clock-in) -->
                <AttendanceTimeTrackingConfigScreens v-if="isConfigItem" :screen="activeScreen" :config="config" />

                <!-- Placeholder (Bio-metric — future phases) -->
                <div v-else data-testid="ttp-config-content"
                    class="flex-1 rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col items-center justify-center gap-2 text-center min-h-[220px]">
                    <Icon name="ion:construct-outline" class="w-8 h-8 text-emerald-300/80" />
                    <h3 class="text-base font-semibold">{{ configItems[activeItem] }}</h3>
                    <p class="text-sm text-white/55" data-testid="ttp-config-placeholder">
                        Configuration will be implemented in the next phase.
                    </p>
                </div>
            </div>

            <!-- Footer actions (configuration screens only) -->
            <div v-if="isConfigItem" class="flex justify-end gap-3 pt-3 border-t border-white/10 mt-auto">
                <UiButton data-testid="ttp-config-discard" color="#fff" text="Discard Changes" size="sm"
                    @click="discardConfig" />
                <UiButton data-testid="ttp-config-save" color="#4aff7a" text="Save" size="sm" @click="saveConfig" />
            </div>
        </div>
    </UiModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const toast = useToast()

const props = defineProps({
    modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

// ---- temporary in-memory wizard state (never persisted, never sent anywhere) ----
const step = ref(1)
const bioMetric = ref(null)      // true | false | null
const captureMethod = ref(null)  // 'WEB' | null
const remoteWork = ref(null)     // true | false | null
const completed = ref(false)
const activeItem = ref(0)

// ---- temporary in-memory configuration state (local only, no persistence) ----
const defaultConfig = () => ({
    workFromHome: false,
    onDuty: false,

    // Remote Work — WFH body (local, UI-only)
    workFromHomeMaxDays: '',
    workFromHomeFrequency: 'Week',
    workFromHomeProrateEnabled: false,
    workFromHomeProrateBasis: 'Joining date',
    workFromHomeHalfDay: false,
    workFromHomeHourly: false,
    workFromHomePriorNoticeEnabled: false,
    workFromHomePriorNoticeDays: '',
    workFromHomeApprovalEnabled: false,
    workFromHomeApprovalThreshold: '',
    workFromHomeApprovalFrequency: 'Week',
    workFromHomeLimitEnabled: false,
    workFromHomeApplicationWindowEnabled: false,
    workFromHomeApplicationWindowDays: '',
    workFromHomePastDateEnabled: false,
    workFromHomePastDateCutoff: '10th',
    workFromHomeDaysEnabled: false,
    workFromHomeAllowedDays: [],

    // Remote Work — On-duty body (local, UI-only)
    onDutyMaxDaysEnabled: false,
    onDutyMaxDays: '',
    onDutyFrequency: 'Week',
    onDutyHalfDay: false,
    onDutyHourly: false,
    onDutyPriorNoticeEnabled: false,
    onDutyPriorNoticeDays: '',
    onDutyApprovalEnabled: false,
    onDutyApprovalThreshold: '',
    onDutyApprovalFrequency: 'Week',
    onDutyLimitEnabled: false,
    onDutyApplicationWindowEnabled: false,
    onDutyApplicationWindowDays: '',
    onDutyPastDateEnabled: false,
    onDutyPastDateCutoff: '10th',
    onDutyReasonRequired: false,

    // Remote Work — Additional Settings (depends on Work from home, local, UI-only)
    remoteAdditionalSettingsExpanded: false,
    remoteAdditionalRestrictionEnabled: false,
    remoteAdditionalRestrictionType: 'Holidays & Weekly Offs',
    remoteAdditionalAttachmentRequired: false,
    remoteAdditionalAdvanceLimitEnabled: false,
    remoteAdditionalAdvanceLimitDays: '',
    remoteAdditionalClockInOutEnabled: false,
    webClockIn: true, // Web capture method was chosen in the wizard
    firstClockInCommentRequired: false,
    ipRestrictionEnabled: false,
    selectedIpNetworkIds: [], // selected Organization IP network IDs (local, UI-only)

    // Regularise — local, UI-only configuration state (no persistence)
    attendanceAdjustmentEnabled: false,
    attendanceAdjustmentMode: 'add/edit all logs',
    attendanceAdjustmentFrequencyEnabled: false,
    attendanceAdjustmentTimes: '',
    attendanceAdjustmentFrequency: 'Week',
    adjustmentDaysAfterIncidentEnabled: false,
    adjustmentDaysAfterIncident: '',
    pastDateCutoffEnabled: false,
    pastDateCutoffDay: '10th',
    attendanceRegularisationEnabled: false,
    attendanceRegularisationMode: 'add/edit all logs',
    attendanceRegularisationFrequencyEnabled: false,
    attendanceRegularisationTimes: '',
    attendanceRegularisationFrequency: 'Week',
    attendanceRegularisationDaysAfterIncidentEnabled: false,
    attendanceRegularisationDaysAfterIncident: '',
    attendanceRegularisationPastDateCutoffEnabled: false,
    attendanceRegularisationPastDateCutoff: '10th',
    attendanceRegularisationReasonRequired: false,

    // Regularise — Partial Day (local, UI-only)
    partialDayEnabled: false,
    partialDayLimitMode: 'Minutes',
    partialDayDuration: '',
    partialDayTimes: '',
    partialDayPeriod: '',
    partialDayLateEnabled: false,
    partialDayLateValue: '',
    partialDayEarlyEnabled: false,
    partialDayEarlyValue: '',
    partialDayAbsenceEnabled: false,
    partialDayAbsenceValue: '',
    partialDayCommentRequired: false,
    partialDayAdvanceEnabled: false,
    partialDayAdvanceDays: '',
    partialDayPastDatedAllowed: false,

    // Regularise — Mandatory Approval (local, UI-only; visible only while
    // attendanceAdjustmentEnabled is true)
    mandatoryApprovalEnabled: false,
    mandatoryApprovalThreshold: 0,
    mandatoryApprovalFrequency: 'Week',
    mandatoryApprovalLevels: [{ id: 1, assignees: [] }],
    mandatoryApprovalAutoApproveMissing: false,
    mandatoryApprovalDailyDigest: false,
})
const config = reactive(defaultConfig())
const policyName = ref('')

const resetConfig = () => {
    Object.assign(config, defaultConfig())
    policyName.value = ''
}

const resetState = () => {
    step.value = 1
    bioMetric.value = null
    captureMethod.value = null
    remoteWork.value = null
    completed.value = false
    activeItem.value = 0
    resetConfig()
}

// Reset whenever the wizard is closed (X, backdrop click, or parent close)
watch(() => props.modelValue, (v) => { if (!v) resetState() })

const selectedChoiceClass = 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
const idleChoiceClass = 'border-white/15 text-white/80 hover:bg-white/5 hover:border-white/25'

// ---- derived step ----
const stepType = computed(() => {
    if (step.value === 1) return 'bio' // bio-metric question
    if (bioMetric.value === false) return step.value === 2 ? 'capture' : 'remote'
    return 'remote' // remote-work question (both paths)
})

const choiceValue = computed(() => (step.value === 1 ? bioMetric.value : remoteWork.value))

const question = computed(() => {
    if (stepType.value === 'capture') return 'How do you capture attendance?'
    if (stepType.value === 'remote') return 'Do your employees work remotely?'
    return 'Do you capture attendance via bio-metric devices?'
})
// 'bio' and 'remote' steps are both Yes/No choice steps; 'capture' renders the Web card
const isChoiceStep = computed(() => stepType.value !== 'capture')

const support = computed(() => {
    if (stepType.value === 'capture') return ''
    if (stepType.value === 'remote') {
        return 'Remote work is when an employee works from places like home, client location, etc. instead of office.'
    }
    return 'Attendance will be captured through bio-metric devices set at your location.'
})

const stepIcon = computed(() => {
    if (stepType.value === 'capture') return 'ion:globe-outline'
    if (stepType.value === 'remote') return 'ion:location-outline'
    return 'ion:finger-print'
})

// Progress reflects the actual path: bio-metric = 2 steps, web = 3 steps
const totalSteps = computed(() => (bioMetric.value === true ? 2 : 3))

const canContinue = computed(() => {
    if (stepType.value === 'capture') return captureMethod.value === 'WEB'
    return choiceValue.value !== null
})

const setChoice = (value) => {
    if (step.value === 1) {
        bioMetric.value = value
        if (value === true) captureMethod.value = null // branch switch: discard Web-specific state
    } else {
        remoteWork.value = value
    }
}

const goNext = () => {
    if (!canContinue.value) return
    if (stepType.value === 'capture') { step.value = 3; return }
    if (stepType.value === 'bio') { step.value = 2; return }
    completed.value = true
    activeItem.value = 0
}

const goBack = () => {
    if (step.value > 1) step.value -= 1
}

// ---- temporary configuration sidebar (derived, single implementation) ----
const configItems = computed(() => {
    const items = []
    if (remoteWork.value === true) items.push('Remote Work')
    items.push(bioMetric.value === true ? 'Bio-metric' : 'Web Clock-in')
    items.push('Regularisation')
    return items
})

// ---- configuration screens (this phase) vs placeholders (future phases) ----
const activeScreen = computed(() => {
    const item = configItems.value[activeItem.value]
    if (item === 'Remote Work') return 'remote'
    if (item === 'Web Clock-in') return 'web'
    if (item === 'Regularisation') return 'regularise'
    return null
})
const isConfigItem = computed(() => activeScreen.value !== null)

// UI-only Save: no API, no persistence — clearly communicated via toast
const saveConfig = () => {
    toast.info({
        title: 'Coming Soon',
        message: 'Policy saving will be implemented in a future phase.',
        timeout: 3000,
    })
}

// Discard: reset temporary configuration changes (listing/mock data untouched)
const discardConfig = () => {
    resetConfig()
}
</script>
