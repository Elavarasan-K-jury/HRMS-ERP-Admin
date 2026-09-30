<template>
    <div class="flex-1 min-w-0 flex flex-col lg:flex-row gap-4" data-testid="ttp-config-screens">
        <!-- ============ MAIN CONFIGURATION ============ -->
        <div class="flex-1 min-w-0 flex flex-col gap-3" data-testid="ttp-config-main">

            <!-- Remote Work: WFH + On-duty + Additional Settings -->
            <template v-if="screen === 'remote'">
                <!-- Work from home -->
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-wfh-card">
                    <div class="flex items-center justify-between gap-4" data-testid="ttp-card-wfh">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Work from home</div>
                            <div class="text-xs text-white/55 mt-1">Employees can request for work from home</div>
                        </div>
                        <span class="flex shrink-0" data-testid="ttp-wfh-switch">
                            <UiSwitch v-model="config.workFromHome" size="sm" data-testid="ttp-switch-wfh" />
                        </span>
                    </div>

                    <div v-if="config.workFromHome"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-wfh-body">
                        <!-- Max days -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span class="text-sm text-white/70">Employees can request for maximum of</span>
                            <input type="number" min="1" v-model.number="config.workFromHomeMaxDays" :disabled="false" data-testid="ttp-wfh-max-days" placeholder="eg: 2" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">day(s) of WFH in a</span>
                            <FormSelect v-model="config.workFromHomeFrequency" :options="adjustmentFrequencies" data-testid="ttp-wfh-frequency" class="shrink-0" style="width: 125px" :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false" :clearable="false" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Prorate (bordered row) -->
                        <div class="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 transition-opacity"
                            :class="config.workFromHomeProrateEnabled ? '' : 'opacity-40'">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomeProrateEnabled"
                                    data-testid="ttp-wfh-prorate" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Prorate based on employee's</span>
                            </label>
                            <FormSelect v-model="config.workFromHomeProrateBasis" :options="['Joining date', 'Probation end date']" data-testid="ttp-wfh-prorate-basis" class="shrink-0" style="width: 180px" :full-width="false" width="180px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.workFromHomeProrateEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Simple toggles -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.workFromHomeHalfDay" data-testid="ttp-wfh-half-day" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Allow half day WFH</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.workFromHomeHourly" data-testid="ttp-wfh-hourly" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Allow hourly WFH</span>
                        </label>

                        <!-- Prior notice -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomePriorNoticeEnabled" data-testid="ttp-wfh-prior-notice" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">WFH request requires</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.workFromHomePriorNoticeDays" :disabled="!config.workFromHomePriorNoticeEnabled" data-testid="ttp-wfh-prior-notice-days" placeholder="eg: 2" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">days of prior notice</span>
                        </div>

                        <!-- Approval threshold -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomeApprovalEnabled" data-testid="ttp-wfh-approval" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Approval mandatory if requests exceed</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.workFromHomeApprovalThreshold" :disabled="!config.workFromHomeApprovalEnabled" data-testid="ttp-wfh-approval-threshold" placeholder="eg: 5" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                            <FormSelect v-model="config.workFromHomeApprovalFrequency" :options="adjustmentFrequencies" data-testid="ttp-wfh-approval-frequency" class="shrink-0" style="width: 125px" :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.workFromHomeApprovalEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Limit -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.workFromHomeLimitEnabled" data-testid="ttp-wfh-limit" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Limit the number of times WFH can be taken</span>
                        </label>

                        <!-- Application window -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomeApplicationWindowEnabled" data-testid="ttp-wfh-application-window" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employee should apply for remote work within</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.workFromHomeApplicationWindowDays" :disabled="!config.workFromHomeApplicationWindowEnabled" data-testid="ttp-wfh-application-window-days" placeholder="eg: 3" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">day(s) of the incident</span>
                        </div>

                        <!-- Past-date cutoff -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomePastDateEnabled" data-testid="ttp-wfh-past-date" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Last date to request for past-dated remote work in a month is</span>
                            </label>
                            
                            <FormSelect v-model="config.workFromHomePastDateCutoff" :options="cutoffDays" data-testid="ttp-wfh-past-date-cutoff" class="shrink-0" style="width: 88px" :full-width="false" width="88px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.workFromHomePastDateEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Allowed days (multi-select) -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.workFromHomeDaysEnabled"
                                    data-testid="ttp-wfh-days-check" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employee can request WFH only on</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.workFromHomeDaysEnabled ? '' : 'opacity-40'">
                                <div class="relative" data-wfh-days-menu>
                                    <button type="button" data-testid="ttp-wfh-days-selector"
                                        :disabled="!config.workFromHomeDaysEnabled"
                                        class="flex items-center gap-2 min-w-[150px] rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/75 hover:border-white/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                        @click.stop="wfhDaysOpen = !wfhDaysOpen">
                                        <span class="flex-1 min-w-0 truncate">{{ config.workFromHomeAllowedDays.length
                                            ? config.workFromHomeAllowedDays.map(d => d.slice(0, 3)).join(', ')
                                            : 'Select days' }}</span>
                                        <Icon name="lucide:chevron-down"
                                            class="w-3.5 h-3.5 shrink-0 opacity-80 transition-transform"
                                            :class="wfhDaysOpen ? 'rotate-180' : ''" />
                                    </button>
                                    <div v-if="wfhDaysOpen"
                                        class="absolute left-0 top-full mt-1 z-40 w-44 rounded-lg border border-white/15 bg-[rgba(20,20,30,0.97)] shadow-2xl overflow-hidden">
                                        <ul class="max-h-52 overflow-y-auto py-1">
                                            <li v-for="d in allRemoteDays" :key="d" data-testid="ttp-wfh-days-option"
                                                :data-day="d"
                                                class="px-3 py-1.5 flex items-center gap-2 text-sm text-white/85 cursor-pointer transition-colors hover:bg-white/5"
                                                @click.stop="toggleWfhDay(d)">
                                                <span class="flex-1">{{ d }}</span>
                                                <Icon v-if="config.workFromHomeAllowedDays.includes(d)"
                                                    name="lucide:check" class="w-3.5 h-3.5 text-emerald-300" />
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- On-duty -->
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-onduty-card">
                    <div class="flex items-center justify-between gap-4" data-testid="ttp-card-onduty">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">On-duty</div>
                            <div class="text-xs text-white/55 mt-1">Employees can request for remote work</div>
                        </div>
                        <span class="flex shrink-0" data-testid="ttp-onduty-switch">
                            <UiSwitch v-model="config.onDuty" size="sm" data-testid="ttp-switch-onduty" />
                        </span>
                    </div>

                    <div v-if="config.onDuty"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-onduty-body">
                        <!-- Max days -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.onDutyMaxDaysEnabled" data-testid="ttp-onduty-max-days" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees can request for maximum of</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.onDutyMaxDays" :disabled="!config.onDutyMaxDaysEnabled" data-testid="ttp-onduty-max-days-value" placeholder="eg: 2" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">day(s) of remote work in a</span>
                            <FormSelect v-model="config.onDutyFrequency" :options="adjustmentFrequencies" data-testid="ttp-onduty-frequency" class="shrink-0" style="width: 125px" :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.onDutyMaxDaysEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Simple toggles -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.onDutyHalfDay" data-testid="ttp-onduty-half-day" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Allow half day On Duty</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.onDutyHourly" data-testid="ttp-onduty-hourly" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Allow hourly remote work</span>
                        </label>

                        <!-- Prior notice -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.onDutyPriorNoticeEnabled" data-testid="ttp-onduty-prior-notice" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">On Duty request requires</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.onDutyPriorNoticeDays" :disabled="!config.onDutyPriorNoticeEnabled" data-testid="ttp-onduty-prior-notice-days" placeholder="eg: 2" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">days of prior notice</span>
                        </div>

                        <!-- Approval threshold -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.onDutyApprovalEnabled" data-testid="ttp-onduty-approval" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Approval mandatory if requests exceed</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.onDutyApprovalThreshold" :disabled="!config.onDutyApprovalEnabled" data-testid="ttp-onduty-approval-threshold" placeholder="eg: 5" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                            <FormSelect v-model="config.onDutyApprovalFrequency" :options="adjustmentFrequencies" data-testid="ttp-onduty-approval-frequency" class="shrink-0" style="width: 125px" :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.onDutyApprovalEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Limit -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.onDutyLimitEnabled" data-testid="ttp-onduty-limit" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Limit the number of times remote work can be taken</span>
                        </label>

                        <!-- Application window -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.onDutyApplicationWindowEnabled" data-testid="ttp-onduty-application-window" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employee should apply for remote work within</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.onDutyApplicationWindowDays" :disabled="!config.onDutyApplicationWindowEnabled" data-testid="ttp-onduty-application-window-days" placeholder="eg: 3" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">day(s) of the incident</span>
                        </div>

                        <!-- Past-date cutoff -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.onDutyPastDateEnabled" data-testid="ttp-onduty-past-date" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Last date to request for past-dated remote work in a month is</span>
                            </label>
                            
                            <FormSelect v-model="config.onDutyPastDateCutoff" :options="cutoffDays" data-testid="ttp-onduty-past-date-cutoff" class="shrink-0" style="width: 88px" :full-width="false" width="88px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.onDutyPastDateEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Reason required -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.onDutyReasonRequired" data-testid="ttp-onduty-reason" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees are required to select a reason for going On-Duty</span>
                        </label>
                    </div>
                </div>

                <!-- Additional Settings (depends on Work from home) -->
                <div class="rounded-xl border border-white/10 bg-white/5 transition-opacity"
                    :class="config.workFromHome ? '' : 'opacity-40 pointer-events-none'"
                    data-testid="ttp-remote-additional-settings">
                    <button type="button" data-testid="ttp-remote-additional-toggle" :aria-expanded="config.remoteAdditionalSettingsExpanded"
                        class="w-full px-4 py-3 flex items-center justify-between gap-4 text-left"
                        @click="config.workFromHome && (config.remoteAdditionalSettingsExpanded = !config.remoteAdditionalSettingsExpanded)">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Additional Settings</div>
                            <div class="text-xs text-white/55 mt-1">Attachment, restrictions and more</div>
                        </div>
                        <Icon name="lucide:chevron-down" class="w-4 h-4 shrink-0 text-white/60 transition-transform"
                            :class="config.remoteAdditionalSettingsExpanded ? 'rotate-180' : ''" />
                    </button>

                    <div v-if="config.remoteAdditionalSettingsExpanded && config.workFromHome"
                        class="border-t border-white/10 px-4 py-2.5 flex flex-col gap-2.5"
                        data-testid="ttp-remote-additional-body">
                        <!-- Restriction -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.remoteAdditionalRestrictionEnabled" data-testid="ttp-remote-additional-restriction" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees cannot request remote work on</span>
                            </label>
                            
                            <FormSelect v-model="config.remoteAdditionalRestrictionType" :options="['Holidays & Weekly Offs', 'Holidays Only', 'Weekly Offs Only']" data-testid="ttp-remote-additional-restriction-type" class="shrink-0" style="width: 230px" :full-width="false" width="230px" size="sm" rounded="lg" :searchable="false" :clearable="false" :disabled="!config.remoteAdditionalRestrictionEnabled" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Attachment -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.remoteAdditionalAttachmentRequired"
                                data-testid="ttp-remote-additional-attachment" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Attachment is mandatory while requesting for remote work</span>
                        </label>

                        <!-- Advance limit -->
                                                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.remoteAdditionalAdvanceLimitEnabled" data-testid="ttp-remote-additional-advance" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Remote work requests cannot be made more than</span>
                            </label>
                            
                            <input type="number" min="1" v-model.number="config.remoteAdditionalAdvanceLimitDays" :disabled="!config.remoteAdditionalAdvanceLimitEnabled" data-testid="ttp-remote-additional-advance-days" placeholder="eg: 5" class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">days in advance</span>
                        </div>

                        <!-- Clock in/out -->
                        <div class="flex flex-col gap-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.remoteAdditionalClockInOutEnabled"
                                    data-testid="ttp-remote-additional-clock" class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees can clock-in/out during remote work</span>
                            </label>
                            <div class="pl-6 text-xs text-white/45">If no punch is registered by employees during remote
                                work, they will be marked absent</div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Regularise: entry toggles — only Attendance adjustment expands -->
            <template v-else-if="screen === 'regularise'">
                <!-- Attendance adjustment (expandable) -->
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-aa-card">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Attendance adjustment</div>
                            <div class="text-xs text-white/55 mt-1">Employees can edit their logged time entries</div>
                        </div>
                        <UiSwitch v-model="config.attendanceAdjustmentEnabled" size="sm" data-testid="ttp-aa-switch" />
                    </div>

                    <div v-if="config.attendanceAdjustmentEnabled"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-aa-body">
                        <!-- Employees can -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span class="text-sm text-white/70">Employees can</span>
                            <FormSelect v-model="config.attendanceAdjustmentMode" :options="adjustmentModes"
                                data-testid="ttp-aa-mode-select" class="shrink-0" style="width: 160px"
                                :full-width="false" width="160px" size="sm"
                                rounded="lg" :searchable="false" :clearable="false" color="#fff"
                                placeholder="Select" />
                        </div>

                        <!-- Employees can adjust attendance logs (frequency) -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5" data-testid="ttp-aa-freq-row">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.attendanceAdjustmentFrequencyEnabled"
                                    data-testid="ttp-aa-freq-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span
                                    class="text-sm text-white/80 group-hover:text-white transition-colors">Employees can
                                    adjust attendance logs</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.attendanceAdjustmentFrequencyEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.attendanceAdjustmentTimes"
                                    :disabled="!config.attendanceAdjustmentFrequencyEnabled"
                                    data-testid="ttp-aa-times" placeholder="e.g. 2"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                                <FormSelect v-model="config.attendanceAdjustmentFrequency"
                                    :options="adjustmentFrequencies" data-testid="ttp-aa-frequency"
                                    class="shrink-0" style="width: 125px"
                                    :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false"
                                    :clearable="false" :disabled="!config.attendanceAdjustmentFrequencyEnabled"
                                    color="#fff" placeholder="Select" />
                            </div>
                        </div>

                        <!-- Let employees adjust up to N days after incident -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5" data-testid="ttp-aa-days-row">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.adjustmentDaysAfterIncidentEnabled"
                                    data-testid="ttp-aa-days-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span
                                    class="text-sm text-white/80 group-hover:text-white transition-colors">Let employees
                                    adjust up to</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.adjustmentDaysAfterIncidentEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.adjustmentDaysAfterIncident"
                                    :disabled="!config.adjustmentDaysAfterIncidentEnabled"
                                    data-testid="ttp-aa-days-input" placeholder="e.g. 10"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">days after incident</span>
                            </div>
                        </div>

                        <!-- Last date to adjust for past dates -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5" data-testid="ttp-aa-cutoff-row">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.pastDateCutoffEnabled"
                                    data-testid="ttp-aa-cutoff-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span
                                    class="text-sm text-white/80 group-hover:text-white transition-colors">Last date to
                                    adjust for past dates in a month is</span>
                            </label>
                            <div class="flex flex-wrap items-center pl-6 sm:pl-0 transition-opacity"
                                :class="config.pastDateCutoffEnabled ? '' : 'opacity-40'">
                                <FormSelect v-model="config.pastDateCutoffDay" :options="cutoffDays"
                                    data-testid="ttp-aa-cutoff" class="shrink-0" style="width: 88px"
                                    :full-width="false" width="88px" size="sm"
                                    rounded="lg" :searchable="false" :clearable="false"
                                    :disabled="!config.pastDateCutoffEnabled" color="#fff" placeholder="Select" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Attendance regularisation (expandable) -->
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-reg-card">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Attendance regularisation</div>
                            <div class="text-xs text-white/55 mt-1">Employees can raise a request to remove their
                                penalties</div>
                        </div>
                        <UiSwitch v-model="config.attendanceRegularisationEnabled" size="sm" data-testid="ttp-reg-switch" />
                    </div>

                    <div v-if="config.attendanceRegularisationEnabled"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-reg-body">
                        <!-- A. Regularise attendance logs -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.attendanceRegularisationFrequencyEnabled"
                                    data-testid="ttp-reg-logs-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees can regularise attendance logs</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.attendanceRegularisationFrequencyEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.attendanceRegularisationTimes"
                                    :disabled="!config.attendanceRegularisationFrequencyEnabled"
                                    data-testid="ttp-reg-logs-times" placeholder="eg: 2"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                                <FormSelect v-model="config.attendanceRegularisationFrequency"
                                    :options="adjustmentFrequencies" data-testid="ttp-reg-logs-frequency"
                                    class="shrink-0" style="width: 125px" :full-width="false" width="125px"
                                    size="sm" rounded="lg" :searchable="false" :clearable="false"
                                    :disabled="!config.attendanceRegularisationFrequencyEnabled" color="#fff"
                                    placeholder="Select" />
                            </div>
                        </div>

                        <!-- B. Days after incident -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.attendanceRegularisationDaysAfterIncidentEnabled"
                                    data-testid="ttp-reg-days-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Let employees regularise upto</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.attendanceRegularisationDaysAfterIncidentEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.attendanceRegularisationDaysAfterIncident"
                                    :disabled="!config.attendanceRegularisationDaysAfterIncidentEnabled"
                                    data-testid="ttp-reg-days-input" placeholder="eg: 10"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">days after incident</span>
                            </div>
                        </div>

                        <!-- C. Past-date cutoff -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.attendanceRegularisationPastDateCutoffEnabled"
                                    data-testid="ttp-reg-cutoff-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Last date to regularise for past dates in a month is</span>
                            </label>
                            <div class="flex flex-wrap items-center pl-6 sm:pl-0 transition-opacity"
                                :class="config.attendanceRegularisationPastDateCutoffEnabled ? '' : 'opacity-40'">
                                <FormSelect v-model="config.attendanceRegularisationPastDateCutoff" :options="cutoffDays"
                                    data-testid="ttp-reg-cutoff" class="shrink-0" style="width: 88px"
                                    :full-width="false" width="88px" size="sm" rounded="lg" :searchable="false"
                                    :clearable="false" :disabled="!config.attendanceRegularisationPastDateCutoffEnabled"
                                    color="#fff" placeholder="Select" />
                            </div>
                        </div>

                        <!-- D. Reason requirement -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.attendanceRegularisationReasonRequired"
                                data-testid="ttp-reg-reason-check"
                                class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employee is required to choose a reason for regularisation</span>
                        </label>
                    </div>
                </div>

                <!-- Partial day (expandable) -->
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-partial-card">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Partial day</div>
                            <div class="text-xs text-white/55 mt-1">Employees can request permission for coming late,
                                leaving early or any time during the shift hours</div>
                        </div>
                        <UiSwitch v-model="config.partialDayEnabled" size="sm" data-testid="ttp-partial-switch" />
                    </div>

                    <div v-if="config.partialDayEnabled"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-partial-body">
                        <!-- Set limits based on -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span class="text-sm text-white/70">Set limits based on:</span>
                            <FormSelect v-model="config.partialDayLimitMode" :options="partialLimitModes"
                                data-testid="ttp-partial-limit-mode" class="shrink-0"
                                style="width: 330px; max-width: 100%" :full-width="false" width="330px" size="sm"
                                rounded="lg" :searchable="false" :clearable="false" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Total allowance row (mode-dependent wording) -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span class="text-sm text-white/70">Partial day is allowed for total</span>
                            <template v-if="config.partialDayLimitMode === 'Minutes And Times'">
                                <input type="number" min="1" v-model.number="config.partialDayDuration"
                                    data-testid="ttp-partial-duration" placeholder="eg: 2"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">minutes and</span>
                                <input type="number" min="1" v-model.number="config.partialDayTimes"
                                    data-testid="ttp-partial-times" placeholder="eg: 5"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                            </template>
                            <template v-else>
                                <input type="number" min="1" v-model.number="config.partialDayDuration"
                                    data-testid="ttp-partial-duration"
                                    :placeholder="config.partialDayLimitMode === 'Times' ? 'eg: 5' : 'eg: 2'"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">{{ config.partialDayLimitMode === 'Times' ? 'times' : 'minutes' }} in a</span>
                            </template>
                            <FormSelect v-model="config.partialDayPeriod" :options="adjustmentFrequencies"
                                data-testid="ttp-partial-period" class="shrink-0" style="width: 140px"
                                :full-width="false" width="140px" size="sm" rounded="lg" :searchable="false"
                                :clearable="false" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Per-request limits -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.partialDayLateEnabled"
                                    data-testid="ttp-partial-late-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Late arrival of maximum</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.partialDayLateEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.partialDayLateValue"
                                    :disabled="!config.partialDayLateEnabled"
                                    data-testid="ttp-partial-late-input"
                                    :placeholder="config.partialDayLimitMode === 'Times' ? 'eg: 5' : 'eg: 120'"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">{{ partialLimitUnit() }} is allowed per request</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.partialDayEarlyEnabled"
                                    data-testid="ttp-partial-early-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Early departure of maximum</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.partialDayEarlyEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.partialDayEarlyValue"
                                    :disabled="!config.partialDayEarlyEnabled"
                                    data-testid="ttp-partial-early-input"
                                    :placeholder="config.partialDayLimitMode === 'Times' ? 'eg: 5' : 'eg: 120'"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">{{ partialLimitUnit() }} is allowed per request</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.partialDayAbsenceEnabled"
                                    data-testid="ttp-partial-absence-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">During the shift, absence of</span>
                            </label>
                            <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                :class="config.partialDayAbsenceEnabled ? '' : 'opacity-40'">
                                <input type="number" min="1" v-model.number="config.partialDayAbsenceValue"
                                    :disabled="!config.partialDayAbsenceEnabled"
                                    data-testid="ttp-partial-absence-input"
                                    :placeholder="config.partialDayLimitMode === 'Times' ? 'eg: 5' : 'eg: 120'"
                                    class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/70 whitespace-nowrap">{{ partialLimitUnit() }} is allowed per request</span>
                            </div>
                        </div>

                        <!-- Request options -->
                        <div class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.partialDayCommentRequired"
                                    data-testid="ttp-partial-comment-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Comment is mandatory when raising request</span>
                            </label>

                            <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" v-model="config.partialDayAdvanceEnabled"
                                        data-testid="ttp-partial-advance-check"
                                        class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                    <span class="text-sm text-white/80 group-hover:text-white transition-colors">Requests can be made only</span>
                                </label>
                                <div class="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 transition-opacity"
                                    :class="config.partialDayAdvanceEnabled ? '' : 'opacity-40'">
                                    <input type="number" min="1" v-model.number="config.partialDayAdvanceDays"
                                        :disabled="!config.partialDayAdvanceEnabled"
                                        data-testid="ttp-partial-advance-input" placeholder="eg: 5"
                                        class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                                    <span class="text-sm text-white/70 whitespace-nowrap">days in advance</span>
                                </div>
                            </div>

                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" v-model="config.partialDayPastDatedAllowed"
                                    data-testid="ttp-partial-past-check"
                                    class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                                <span class="text-sm text-white/80 group-hover:text-white transition-colors">Allow past dated requests</span>
                            </label>
                        </div>
                    </div>
                </div>
                <!-- Mandatory approval (only visible while Attendance adjustment is enabled) -->
                <div v-if="config.attendanceAdjustmentEnabled"
                    class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2.5"
                    data-testid="ttp-approval-card">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Mandatory approval</div>
                            <div class="text-xs text-white/55 mt-1">Set up approval chain for regularisation,
                                adjustment &amp; partial day</div>
                        </div>
                        <UiSwitch v-model="config.mandatoryApprovalEnabled" size="sm" data-testid="ttp-approval-switch" />
                    </div>

                    <div v-if="config.mandatoryApprovalEnabled"
                        class="border-t border-white/10 pt-2.5 flex flex-col gap-2.5" data-testid="ttp-approval-body">
                        <!-- Approval threshold -->
                        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span class="text-sm text-white/70">Approval mandatory if requests exceed</span>
                            <input type="number" min="0" v-model.number="config.mandatoryApprovalThreshold"
                                data-testid="ttp-approval-threshold"
                                class="w-16 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/70 whitespace-nowrap">times in a</span>
                            <FormSelect v-model="config.mandatoryApprovalFrequency" :options="adjustmentFrequencies"
                                data-testid="ttp-approval-frequency" class="shrink-0" style="width: 125px"
                                :full-width="false" width="125px" size="sm" rounded="lg" :searchable="false"
                                :clearable="false" color="#fff" placeholder="Select" />
                        </div>

                        <!-- Approval levels -->
                        <div v-for="level in config.mandatoryApprovalLevels" :key="level.id"
                            class="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 flex flex-col gap-2.5"
                            data-testid="ttp-approval-level" :data-level-id="level.id">
                            <div class="flex items-center gap-2.5" :data-testid="`ttp-approval-level-${level.id}`">
                                <span class="text-[11px] font-bold uppercase tracking-wide text-emerald-300">LEVEL
                                    {{ config.mandatoryApprovalLevels.indexOf(level) + 1 }}</span>
                                <span class="text-xs text-white/60">Approval</span>
                            </div>

                            <div class="text-xs text-white/60">Assignees</div>

                            <!-- Chips -->
                            <div v-if="level.assignees.length" class="flex flex-wrap items-center gap-1.5">
                                <span v-for="a in level.assignees" :key="a" data-testid="ttp-approval-assignee-chip"
                                    class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 pl-1 pr-1.5 py-0.5 text-xs text-white/85">
                                    <span
                                        class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-200">{{ assigneeInitials(a) }}</span>
                                    {{ a }}
                                    <button type="button" data-testid="ttp-approval-assignee-remove"
                                        class="text-white/50 hover:text-white transition-colors"
                                        @click.stop="removeAssignee(level, a)">
                                        <Icon name="lucide:x" class="w-3 h-3" />
                                    </button>
                                </span>
                            </div>

                            <!-- Multi-select trigger + menu -->
                            <div class="relative" data-assignee-menu>
                                <button type="button" data-testid="ttp-approval-assignee-selector"
                                    class="w-full flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/40 hover:border-white/25 hover:text-white/60 transition-colors text-left"
                                    @click.stop="toggleAssigneeMenu(level.id)">
                                    <span>Role / Employee</span>
                                    <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 opacity-80" />
                                </button>
                                <div v-if="openAssigneeMenuId === level.id"
                                    class="absolute left-0 right-0 top-full mt-1 z-40 rounded-lg border border-white/15 bg-[rgba(20,20,30,0.97)] shadow-2xl overflow-hidden">
                                    <ul class="max-h-52 overflow-y-auto py-1">
                                        <li v-for="opt in approvalAssigneeOptions" :key="opt.label"
                                            data-testid="ttp-approval-assignee-option" :data-assignee="opt.label"
                                            class="px-3 py-2 flex items-center gap-2 text-sm text-white/85 cursor-pointer transition-colors hover:bg-white/5"
                                            :class="level.assignees.includes(opt.label) ? 'bg-white/5' : ''"
                                            @click.stop="toggleAssignee(level, opt.label)">
                                            <span
                                                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                                                :class="opt.type === 'role' ? 'bg-sky-500/20 text-sky-200' : 'bg-emerald-500/20 text-emerald-200'">{{ assigneeInitials(opt.label) }}</span>
                                            <span class="flex-1 min-w-0 truncate">{{ opt.label }}</span>
                                            <span class="text-[10px] uppercase tracking-wide text-white/35">{{ opt.type === 'role' ? 'Role' : 'Employee' }}</span>
                                            <Icon v-if="level.assignees.includes(opt.label)" name="lucide:check"
                                                class="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Add level -->
                        <button type="button" data-testid="ttp-approval-add-level"
                            class="self-start flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                            @click="addApprovalLevel">
                            <span>+ Add New Level</span>
                        </button>

                        <!-- Additional options -->
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.mandatoryApprovalAutoApproveMissing"
                                data-testid="ttp-approval-auto-approve"
                                class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Auto-approve if
                                approver is missing</span>
                        </label>

                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="config.mandatoryApprovalDailyDigest"
                                data-testid="ttp-approval-daily-digest"
                                class="w-4 h-4 shrink-0 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Do not email
                                approvers for every request</span>
                        </label>
                        <div class="pl-6 text-xs text-white/45">They will view these requests as part of the daily email
                            digest.</div>
                    </div>
                </div>
            </template>

            <!-- Web Clock-in: one card with toggle + divider + checkbox options -->
            <template v-else>
                <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 flex flex-col gap-3"
                    data-testid="ttp-card-web">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-white/90">Web clock-in</div>
                            <div class="text-xs text-white/55 mt-1">Employees can log in through the web portal and mark
                                their attendance</div>
                        </div>
                        <UiSwitch v-model="config.webClockIn" size="sm" data-testid="ttp-switch-web" />
                    </div>

                    <div class="border-t border-white/10 pt-3 flex flex-col gap-2.5 transition-opacity"
                        :class="config.webClockIn ? '' : 'opacity-40'" data-testid="ttp-web-options">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" v-model="config.firstClockInCommentRequired"
                                :disabled="!config.webClockIn" data-testid="ttp-check-comment"
                                class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Comment is
                                mandatory at the time of first clock-in</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" v-model="config.ipRestrictionEnabled" :disabled="!config.webClockIn"
                                data-testid="ttp-check-ip"
                                class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                            <span class="text-sm text-white/80 group-hover:text-white transition-colors">Enable IP
                                restriction</span>
                        </label>
                    </div>
                </div>

                <!-- Allowed IP networks: dedicated section below the Web Clock-in options -->
                <AttendanceIpNetworkSelector v-if="config.ipRestrictionEnabled"
                    v-model="config.selectedIpNetworkIds" class="transition-opacity"
                    :class="config.webClockIn ? '' : 'opacity-40'" />
            </template>
        </div>

        <!-- ============ INFORMATIONAL PANEL (contextual, compact) ============ -->
        <aside
            class="w-full lg:w-[280px] xl:w-[300px] shrink-0 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 text-left self-start"
            data-testid="ttp-info-panel">
            <template v-if="screen === 'remote'">
                <div>
                    <h4 class="text-sm font-semibold text-white/90">Remote Work</h4>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        Remote work is when an employee works from places like home, client location, etc. instead of
                        office.
                    </p>
                </div>
                <div class="border-t border-white/10 pt-3">
                    <h5 class="text-xs font-semibold text-white/80">Are additional settings applicable to both work
                        from home &amp; On-duty?</h5>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        Yes. Any additional settings you configure apply to both work from home and On-duty requests.
                    </p>
                </div>
                <div class="border-t border-white/10 pt-3">
                    <h5 class="text-xs font-semibold text-white/80">Advance remote-work requests</h5>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        Employees can submit remote-work requests in advance for planned days away from the office.
                    </p>
                </div>
            </template>

            <template v-else-if="screen === 'regularise'">
                <div>
                    <h4 class="text-sm font-semibold text-white/90">Regularisation</h4>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        Regularisation lets employees request corrections to their attendance records — such as missed
                        or incorrect logs — according to your organization's policy.
                    </p>
                </div>
                <div class="border-t border-white/10 pt-3">
                    <h5 class="text-xs font-semibold text-white/80">How does it work?</h5>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        Employees submit requests from their attendance records, and administrators review them before
                        any penalty or log change is applied.
                    </p>
                </div>
            </template>

            <template v-else>
                <div>
                    <h4 class="text-sm font-semibold text-white/90">Web clock-in</h4>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        This is useful for organizations without biometric devices, and for employees who need to mark
                        attendance through the web portal.
                    </p>
                </div>
                <div class="border-t border-white/10 pt-3">
                    <h5 class="text-xs font-semibold text-white/80">What are IP restrictions?</h5>
                    <p class="text-xs text-white/55 mt-1.5 leading-relaxed">
                        When IP restrictions are enabled for Web clock-in, employees can mark attendance through the
                        web portal only when they are connected from an allowed IP network.
                    </p>
                </div>
            </template>
        </aside>
    </div>
</template>

<script setup>
const props = defineProps({
    screen: { type: String, default: 'remote' }, // 'remote' | 'web' | 'regularise'
    config: { type: Object, required: true },    // local in-memory configuration state
})

// Attendance adjustment option sets (local UI-only values)
const adjustmentModes = ['add missing logs', 'add/edit all logs']
const adjustmentFrequencies = ['Week', 'Month', 'Quarter', 'Half Year', 'Year']

const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}
const cutoffDays = Array.from({ length: 31 }, (_, i) => ordinal(i + 1))

// Remote Work — WFH allowed-days multi-select (local UI-only)
const allRemoteDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const wfhDaysOpen = ref(false)
const toggleWfhDay = (d) => {
    const arr = props.config.workFromHomeAllowedDays
    const i = arr.indexOf(d)
    if (i >= 0) arr.splice(i, 1)
    else arr.push(d)
}
const closeWfhDaysMenu = (e) => {
    if (!e.target.closest?.('[data-wfh-days-menu]')) wfhDaysOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', closeWfhDaysMenu))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeWfhDaysMenu))
// WFH OFF -> immediately collapse Additional Settings (values kept in memory)
watch(() => props.config.workFromHome, (v) => {
    if (!v) props.config.remoteAdditionalSettingsExpanded = false
})

// Mandatory approval — local mock assignee options (roles + employees, UI-only)
const approvalAssigneeOptions = [
    { type: 'role', label: 'Reporting Manager' },
    { type: 'role', label: 'HR Manager' },
    { type: 'role', label: 'Department Head' },
    { type: 'role', label: 'HR Admin' },
    { type: 'role', label: 'Finance Manager' },
    { type: 'employee', label: 'Adithi' },
    { type: 'employee', label: 'Sanjay' },
    { type: 'employee', label: 'Priya' },
    { type: 'employee', label: 'Rahul' },
    { type: 'employee', label: 'Arun' },
]
const assigneeInitials = (label) => label.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

const openAssigneeMenuId = ref(null)
const toggleAssigneeMenu = (id) => {
    openAssigneeMenuId.value = openAssigneeMenuId.value === id ? null : id
}
const closeAssigneeMenus = (e) => {
    if (!e.target.closest?.('[data-assignee-menu]')) openAssigneeMenuId.value = null
}
onMounted(() => document.addEventListener('mousedown', closeAssigneeMenus))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeAssigneeMenus))

const toggleAssignee = (level, label) => {
    const i = level.assignees.indexOf(label)
    if (i >= 0) level.assignees.splice(i, 1)
    else level.assignees.push(label)
}
const removeAssignee = (level, label) => {
    const i = level.assignees.indexOf(label)
    if (i >= 0) level.assignees.splice(i, 1)
}
const addApprovalLevel = () => {
    const levels = props.config.mandatoryApprovalLevels
    const nextId = Math.max(0, ...levels.map(l => l.id)) + 1
    levels.push({ id: nextId, assignees: [] })
}

// Partial day option sets (local UI-only values)
const partialLimitModes = ['Minutes', 'Times', 'Minutes And Times']
const partialLimitUnit = () => (props.config.partialDayLimitMode === 'Times' ? 'times' : 'minutes')
</script>
