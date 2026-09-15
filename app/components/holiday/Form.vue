<template>
    <div class="space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label class="label">Holiday Name</label>
                <input v-model="name" type="text" placeholder="e.g. Independence Day" class="input" />
            </div>

            <div>
                <label class="label">Date</label>
                <input v-model="date" type="date" class="input" />
            </div>
        </div>

        <!-- Type / Region -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label class="label">Type</label>
                <select v-model="type" class="input bg-transparent">
                    <option value="PUBLIC">Public</option>
                    <option value="RESTRICTED">Restricted</option>
                    <option value="OPTIONAL">Optional</option>
                    <option value="WEEK_OFF">Week Off</option>
                    <option value="COMPANY_EVENT">Company Event</option>
                </select>
            </div>

            <div>
                <label class="label">Region (optional)</label>
                <input v-model="region" type="text" placeholder="e.g. Karnataka, PAN India" class="input" />
            </div>
        </div>

        <!-- Policy -->
        <div>
            <label class="label">Policy ID (optional)</label>
            <input v-model="policy_id" type="text" placeholder="Link to Holiday Policy" class="input" />
            <p class="text-[11px] text-white/50 mt-1">
                Later you can replace this with a dropdown of holiday policies.
            </p>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHolidayStore } from '@/stores/organization/holiday.store'

const holidayStore = useHolidayStore()
const { name, date, type, region, policy_id } = storeToRefs(holidayStore);
</script>

<style scoped>
.label {
    @apply block text-xs font-semibold text-white/70 mb-1 uppercase tracking-wide;
}

.input {
    @apply w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent;
}
</style>
