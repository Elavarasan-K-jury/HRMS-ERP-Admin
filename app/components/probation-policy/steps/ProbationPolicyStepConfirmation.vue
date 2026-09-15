<template>
    <div class="flex flex-col gap-6">
        <div>
            <h3 class="text-lg font-semibold text-white/90">Confirm & Notify Employees</h3>
            <p class="text-sm text-white/50 mt-1">Enable automatic probation confirmation and share confirmation letters with employees.</p>
        </div>

        <!-- Confirm automatically -->
        <section class="rounded-2xl border border-white/15 bg-white/[.05] p-4 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm font-medium text-white/85">Confirm employee probation automatically</span>
                        <UiInfoTip tip="Auto-confirms the employee when the probation period completes. The automation itself is implemented in a later phase — only the configuration is saved now." />
                    </div>
                    <p class="text-xs text-white/45">The employee's probation can end automatically at the completion of the probation period.</p>
                </div>
                <UiSwitch v-model="auto_confirm_probation" color="#4aff7a" />
            </div>
            <div v-if="auto_confirm_probation"
                class="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
                When the probation period completes, the system will automatically confirm the employee. The automatic
                confirmation process and any resulting extensions/terminations will be implemented in a later phase —
                only the configuration is saved now.
            </div>
        </section>

        <!-- Auto-generate letter -->
        <section class="rounded-2xl border border-white/15 bg-white/[.05] p-4 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm font-medium text-white/85">Auto-generate and issue letter to the employee</span>
                        <UiInfoTip tip="Generates and issues a confirmation letter at the end of probation. Letter generation is a separate feature to be implemented later — only the configuration is saved now." />
                    </div>
                    <p class="text-xs text-white/45">Generate a confirmation letter automatically and share it with the employee.</p>
                </div>
                <UiSwitch v-model="auto_generate_confirmation_letter" color="#4aff7a" />
            </div>
            <div v-if="auto_generate_confirmation_letter"
                class="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
                A confirmation letter will be generated and issued at the end of the probation. Letter generation is a
                separate feature to be implemented later — only the configuration is saved now.
            </div>
        </section>

        <!-- Manual fallback note -->
        <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
            If neither option is enabled, probation confirmation will be handled manually by HR / Admin. Nothing is
            forced — proceed freely with both options off.
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useProbationPolicyStore } from '@/stores/organization/probationPolicy.store'

const store = useProbationPolicyStore()
const { auto_confirm_probation, auto_generate_confirmation_letter } = storeToRefs(store)
</script>